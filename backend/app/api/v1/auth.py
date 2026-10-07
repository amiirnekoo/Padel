from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from backend.app.models.base import get_db_session
from backend.app.models.user import User
from backend.app.services.otp_service import OTPService
from backend.app.core.security import create_access_token, verify_password, get_password_hash

import uuid
from datetime import datetime
from backend.app.api.deps import get_current_user_id

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    phone_number: str
    email: Optional[str] = None
    password: str
    full_name: str
    preferred_sport: Optional[str] = "PADEL"  # PADEL, TENNIS, BOTH
    dominant_hand: Optional[str] = "RIGHT"    # RIGHT, LEFT

class UserLoginRequest(BaseModel):
    username: str  # phone_number or email
    password: str

class OTPRequest(BaseModel):
    phone_number: str

class OTPVerify(BaseModel):
    phone_number: str
    code: str

class OperatorLogin(BaseModel):
    phone_number: str
    password: str

@router.post("/register")
async def register_user(payload: RegisterRequest, db: AsyncSession = Depends(get_db_session)):
    # Standardize phone number (strip whitespace, ensure proper length)
    phone = payload.phone_number.strip().replace(" ", "")
    
    # Check if already registered
    stmt = select(User).where(or_(User.phone_number == phone, (User.email == payload.email) if payload.email else False))
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user and existing_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حساب کاربری با این شماره همراه یا ایمیل قبلاً ایجاد شده است. لطفاً وارد شوید."
        )

    if existing_user:
        # Existing unauthenticated/placeholder user, update details
        existing_user.full_name = payload.full_name
        existing_user.email = payload.email
        existing_user.password_hash = get_password_hash(payload.password)
        existing_user.preferred_sport = payload.preferred_sport or "PADEL"
        existing_user.dominant_hand = payload.dominant_hand or "RIGHT"
        user = existing_user
    else:
        user = User(
            phone_number=phone,
            email=payload.email,
            full_name=payload.full_name,
            password_hash=get_password_hash(payload.password),
            role="PLAYER",
            preferred_sport=payload.preferred_sport or "PADEL",
            dominant_hand=payload.dominant_hand or "RIGHT",
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "phone_number": user.phone_number,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
        "preferred_sport": user.preferred_sport,
        "dominant_hand": user.dominant_hand,
        "club_id": user.club_id
    }

@router.post("/login")
async def user_login(payload: UserLoginRequest, db: AsyncSession = Depends(get_db_session)):
    identifier = payload.username.strip()
    stmt = select(User).where(or_(User.phone_number == identifier, User.email == identifier))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نام کاربری (شماره تماس / ایمیل) یا رمز عبور اشتباه است."
        )

    token = create_access_token(subject=user.id, role=user.role, club_id=user.club_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "phone_number": user.phone_number,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name or "ورزشکار",
        "preferred_sport": user.preferred_sport,
        "dominant_hand": user.dominant_hand,
        "club_id": user.club_id
    }

from backend.app.core.config import settings
from backend.app.core.sms import get_sms_provider, DisabledSmsProvider

def is_sms_available() -> bool:
    """بررسی فعال بودن درگاه پیامک واقعی در محیط جاری."""
    provider = get_sms_provider(
        provider_type=settings.SMS_PROVIDER,
        is_production=(settings.ENVIRONMENT.lower() == "production")
    )
    return not isinstance(provider, DisabledSmsProvider)

@router.post("/otp/request")
async def request_otp(payload: OTPRequest):
    if not is_sms_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="سامانه ارسال پیامک در محیط عملیاتی غیرفعال است. ورود تنها از طریق کلمه عبور امکان‌پذیر است."
        )

    code = OTPService.generate_otp(payload.phone_number)
    provider = get_sms_provider(settings.SMS_PROVIDER, is_production=False)
    await provider.send_pattern_sms(
        receptor=payload.phone_number,
        template="rally-otp",
        tokens={"token": code}
    )

    response_data = {
        "message": "کد تأیید با موفقیت ارسال شد",
        "expires_in_seconds": 120,
    }
    # کد آزمایشی هرگز در محیط پروداکشن نباید افشا یا فعال شود
    if settings.ALLOW_DEV_AUTH_BYPASS and settings.ENVIRONMENT.lower() != "production":
        response_data["dev_code"] = code
    return response_data

@router.post("/otp/verify")
async def verify_otp(payload: OTPVerify, db: AsyncSession = Depends(get_db_session)):
    if not is_sms_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ورود پیامکی در این نسخه غیرفعال است. لطفاً از طریق کلمه عبور وارد شوید."
        )

    # کدهای تست هرگز در پروداکشن معتبر نیستند
    allow_test_code = (
        settings.ALLOW_DEV_AUTH_BYPASS
        and settings.ENVIRONMENT.lower() != "production"
        and payload.code == "12345"
    )
    is_valid = OTPService.verify_otp(payload.phone_number, payload.code)
    if not is_valid and not allow_test_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="کد تأیید نامعتبر است یا منقضی شده است")

    stmt = select(User).where(User.phone_number == payload.phone_number)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        user = User(phone_number=payload.phone_number, role="PLAYER")
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "phone_number": user.phone_number,
        "role": user.role,
        "full_name": user.full_name or "ورزشکار",
        "club_id": user.club_id
    }

@router.post("/operator/login")
async def operator_login(payload: OperatorLogin, db: AsyncSession = Depends(get_db_session)):
    stmt = select(User).where(User.phone_number == payload.phone_number)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="شماره موبایل یا کلمه عبور نادرست است")

    if user.role not in ["CLUB_OPERATOR", "CLUB_ADMIN"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز برای پنل باجه")

    token = create_access_token(subject=user.id, role=user.role, club_id=user.club_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "club_id": user.club_id
    }


class RoleUpgradeRequestPayload(BaseModel):
    requested_role: str  # COACH, CLUB_OPERATOR, CLUB_MANAGER
    full_name: str
    phone_number: str
    national_code: Optional[str] = None
    organization_name: Optional[str] = None
    experience_years: Optional[int] = 0
    license_number: Optional[str] = None
    description: Optional[str] = None


class ProfileUpdatePayload(BaseModel):
    full_name: Optional[str] = None
    preferred_sport: Optional[str] = None
    dominant_hand: Optional[str] = None
    skill_level: Optional[str] = None
    city: Optional[str] = None
    emergency_phone: Optional[str] = None


from backend.app.services.role_upgrade_service import RoleUpgradeService


@router.post("/role-upgrade-request")
async def submit_role_upgrade_request(
    payload: RoleUpgradeRequestPayload,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """ثبت درخواست رسمی ارتقای نقش کاربری به مربی یا مدیریت باشگاه"""
    if payload.requested_role not in ["COACH", "CLUB_OPERATOR", "CLUB_MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نقش درخواستی نامعتبر است. تنها نقش‌های مربی (COACH) یا باشگاه‌دار (CLUB_OPERATOR) مجاز می‌باشند."
        )

    record = RoleUpgradeService.create_request(
        user_id=current_user_id,
        requested_role=payload.requested_role,
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        national_code=payload.national_code,
        organization_name=payload.organization_name,
        experience_years=payload.experience_years,
        license_number=payload.license_number,
        description=payload.description
    )

    return {
        "success": True,
        "tracking_id": record["tracking_id"],
        "status": "PENDING_REVIEW",
        "message": "درخواست ارتقای سطح کاربری شما با موفقیت در سامانه ثبت گردید و پس از ارزیابی مدارک توسط کارشناسان رالی فعال خواهد شد."
    }



@router.get("/me")
async def get_current_user_profile(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """واکشی شناسنامه و مشخصات کاربر جاری"""
    stmt = select(User).where(User.id == current_user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        return {
            "id": current_user_id,
            "full_name": "ورزشکار رالی",
            "phone_number": "09120000000",
            "role": "PLAYER",
            "preferred_sport": "PADEL",
            "dominant_hand": "RIGHT",
            "skill_level": "INTERMEDIATE",
            "city": "تهران",
            "ranking_points": 1250,
            "tier": "SILVER"
        }

    return {
        "id": user.id,
        "full_name": user.full_name or "ورزشکار رالی",
        "phone_number": user.phone_number,
        "email": user.email,
        "role": user.role,
        "preferred_sport": user.preferred_sport or "PADEL",
        "dominant_hand": user.dominant_hand or "RIGHT",
        "skill_level": user.skill_level or "BEGINNER",
        "city": user.city or "تهران",
        "emergency_phone": user.emergency_phone,
        "ranking_points": 1420,
        "tier": "GOLD",
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@router.put("/profile")
async def update_user_profile(
    payload: ProfileUpdatePayload,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """به‌روزرسانی شناسنامه ورزشی و مشخصات کاربر"""
    stmt = select(User).where(User.id == current_user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد.")

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.preferred_sport is not None:
        user.preferred_sport = payload.preferred_sport
    if payload.dominant_hand is not None:
        user.dominant_hand = payload.dominant_hand
    if payload.skill_level is not None:
        user.skill_level = payload.skill_level
    if payload.city is not None:
        user.city = payload.city
    if payload.emergency_phone is not None:
        user.emergency_phone = payload.emergency_phone

    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "message": "شناسنامه ورزشی با موفقیت به‌روزرسانی شد.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "role": user.role,
            "preferred_sport": user.preferred_sport,
            "dominant_hand": user.dominant_hand,
            "skill_level": user.skill_level,
            "city": user.city,
            "emergency_phone": user.emergency_phone
        }
    }


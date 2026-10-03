from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from backend.app.models.base import get_db_session
from backend.app.models.user import User
from backend.app.services.otp_service import OTPService
from backend.app.core.security import create_access_token, verify_password, get_password_hash

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

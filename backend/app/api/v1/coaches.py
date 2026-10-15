from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.models.base import get_db_session
from backend.app.models.coach import CoachBookingRequest, CoachProfile
from backend.app.models.user import User

router = APIRouter(prefix="/coaches", tags=["Coaches"])


class CoachStatusUpdateRequest(BaseModel):
    is_verified: bool = Field(..., description="وضعیت تایید صلاحیت مربی")


class CreateCoachBookingRequest(BaseModel):
    student_name: str = Field(..., description="نام و نام خانوادگی متقاضی")
    student_phone: str = Field(..., description="شماره تماس متقاضی")
    requested_date: str = Field(..., description="زمان و مکان پیشنهادی جلسه")
    skill_level: str = Field("BEGINNER", description="سطح مهارت")
    training_goal: Optional[str] = Field(None, description="هدف از دوره یا جلسه")
    club_name: Optional[str] = Field(None, description="نام باشگاه انتخابی")
    user_id: Optional[str] = Field(None, description="شناسه کاربر لاگین شده")


class UpdateCoachRequestStatus(BaseModel):
    status: str = Field(..., description="وضعیت جدید: ACCEPTED, DECLINED, COMPLETED, CANCELLED")


@router.post("/{coach_id}/requests")
async def create_coach_request(
    coach_id: str,
    payload: CreateCoachBookingRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """ثبت رسمی درخواست هماهنگی و آموزش با مربی در سیستم"""
    request_obj = CoachBookingRequest(
        coach_id=coach_id,
        user_id=payload.user_id,
        student_name=payload.student_name,
        student_phone=payload.student_phone,
        requested_date=payload.requested_date,
        skill_level=payload.skill_level,
        training_goal=payload.training_goal,
        club_name=payload.club_name,
        status="PENDING"
    )
    db.add(request_obj)
    await db.commit()
    await db.refresh(request_obj)
    return {
        "success": True,
        "message": "درخواست جلسه با مربی با موفقیت ثبت شد و در کارتابل مربی قرار گرفت.",
        "request": {
            "id": request_obj.id,
            "coach_id": request_obj.coach_id,
            "student_name": request_obj.student_name,
            "student_phone": request_obj.student_phone,
            "requested_date": request_obj.requested_date,
            "skill_level": request_obj.skill_level,
            "training_goal": request_obj.training_goal,
            "club_name": request_obj.club_name,
            "status": request_obj.status,
            "created_at": request_obj.created_at.isoformat() if request_obj.created_at else None
        }
    }


@router.get("/{coach_id}/requests")
async def get_coach_requests(
    coach_id: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db_session)
):
    """دریافت کلیه درخواست‌های ارسالی به این مربی جهت نمایش در پرتال مربی"""
    stmt = select(CoachBookingRequest).where(CoachBookingRequest.coach_id == coach_id)
    if status_filter:
        stmt = stmt.where(CoachBookingRequest.status == status_filter)
    stmt = stmt.order_by(desc(CoachBookingRequest.created_at))
    res = await db.execute(stmt)
    records = res.scalars().all()
    return [
        {
            "id": r.id,
            "coach_id": r.coach_id,
            "student_name": r.student_name,
            "student_phone": r.student_phone,
            "requested_date": r.requested_date,
            "skill_level": r.skill_level,
            "training_goal": r.training_goal,
            "club_name": r.club_name,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in records
    ]


@router.patch("/requests/{request_id}")
async def update_coach_request_status(
    request_id: str,
    payload: UpdateCoachRequestStatus,
    db: AsyncSession = Depends(get_db_session)
):
    """تغییر وضعیت درخواست جلسه توسط مربی (پذیرش، رد، اتمام)"""
    stmt = select(CoachBookingRequest).where(CoachBookingRequest.id == request_id)
    res = await db.execute(stmt)
    req_item = res.scalar_one_or_none()
    if not req_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="درخواست مورد نظر یافت نشد.")

    req_item.status = payload.status
    await db.commit()
    await db.refresh(req_item)
    return {
        "success": True,
        "message": f"وضعیت درخواست با موفقیت به {payload.status} تغییر یافت.",
        "request": {
            "id": req_item.id,
            "status": req_item.status
        }
    }


DEFAULT_COACHES = [
    {
        "id": "coach-1",
        "name": "کاوه آریا",
        "title": "مربی رسمی سطح ۲ فدراسیون جهانی پدل (FIP)",
        "sport": "PADEL",
        "experienceYears": 7,
        "certificate": "مدرک بین‌المللی FIP و عضو سابق تیم ملی تنیس",
        "rating": 4.95,
        "sessionsCount": 640,
        "city": "تهران",
        "clubs": ["مجموعه پدل FGB انقلاب", "باشگاه پدل لفور"],
        "levels": ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
        "hourlyRate": 950000,
        "avatarUrl": "/images/rally_coach.jpg",
        "bio": "تمرکز ویژه بر بازیکنان مبتدی و متوسط جهت آموزش پایه، ضربات دیوار شیشه‌ای (Bandeja و Vibora) و بازی جایگیری اصولی در زمین.",
        "bookingType": "APPROVAL_REQUIRED",
        "specialties": ["اصلاح تکنیک والیه", "بازی با دیواره‌های شیشه‌ای", "آمادگی مسابقاتی"]
    },
    {
        "id": "coach-2",
        "name": "سارا رهنما",
        "title": "مربی تخصصی پدل بانوان و رده‌های پایه",
        "sport": "PADEL",
        "experienceYears": 5,
        "certificate": "مدرک ملی مربیگری و کارشناس ارشد فیزیولوژی ورزشی",
        "rating": 4.9,
        "sessionsCount": 420,
        "city": "تهران",
        "clubs": ["مجموعه پدل FGB انقلاب", "باشگاه پدل ویوا"],
        "levels": ["BEGINNER", "INTERMEDIATE"],
        "hourlyRate": 850000,
        "avatarUrl": "/images/rally_coach.jpg",
        "bio": "طراحی جلسات با رویکرد ارگونومی، ایجاد آمادگی بدنی هوازی و یادگیری سریع قوانین پدل برای کسانی که نخستین بار راکت به دست می‌گیرند.",
        "bookingType": "INSTANT",
        "specialties": ["مبتدیان بدون سابقه قبلی", "تاکتیک بازی دونفره", "تقویت سرویس"]
    }
]


@router.get("/public")
async def list_public_coaches(
    sport: Optional[str] = None,
    level: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session)
):
    """لیست عمومی مربیان تاییدشده جهت نمایش در صفحه مربیان رالی"""
    stmt = (
        select(CoachProfile, User)
        .join(User, CoachProfile.user_id == User.id)
        .where(CoachProfile.is_verified == True)
    )
    if sport and sport != "ALL":
        stmt = stmt.where(CoachProfile.sport_types.contains(sport))
    res = await db.execute(stmt)
    rows = res.all()

    if not rows:
        filtered = DEFAULT_COACHES
        if sport and sport != "ALL":
            filtered = [c for c in filtered if c["sport"] == sport]
        if level and level != "ALL":
            filtered = [c for c in filtered if level in c["levels"]]
        return filtered

    items = []
    for profile, user in rows:
        items.append({
            "id": profile.id,
            "name": user.full_name or "مربی رسمی رالی",
            "title": f"مربی رسمی {profile.sport_types}",
            "sport": profile.sport_types,
            "experienceYears": 3,
            "certificate": profile.certification_id,
            "rating": 4.9,
            "sessionsCount": 50,
            "city": user.city or "تهران",
            "clubs": ["مجموعه پدل FGB انقلاب", "باشگاه پدل لفور"],
            "levels": ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            "hourlyRate": profile.hourly_rate,
            "avatarUrl": "/images/rally_coach.jpg",
            "bio": profile.bio or "مربی رسمی و دارای کارت مربیگری فدراسیون",
            "bookingType": "APPROVAL_REQUIRED",
            "specialties": ["آموزش تکنیک پایه", "بازی با شیشه", "تاکتیک مسابقه"]
        })
    return items


@router.get("/admin/all")
async def list_admin_coaches(
    db: AsyncSession = Depends(get_db_session)
):
    """لیست کلیه مربیان (تاییدشده و در انتظار) برای پنل مدیریت ادمین"""
    stmt = select(CoachProfile, User).join(User, CoachProfile.user_id == User.id)
    res = await db.execute(stmt)
    rows = res.all()

    coaches_list = []
    for profile, user in rows:
        coaches_list.append({
            "id": profile.id,
            "user_id": user.id,
            "name": user.full_name or "نامشخص",
            "phone_number": user.phone_number,
            "title": f"مربی {profile.sport_types}",
            "certification_id": profile.certification_id,
            "sport_types": profile.sport_types,
            "bio": profile.bio,
            "hourly_rate": profile.hourly_rate,
            "is_verified": profile.is_verified,
            "avatarUrl": "/images/rally_coach.jpg",
            "created_at": profile.created_at.isoformat() if profile.created_at else None
        })
    return coaches_list


@router.post("/admin/{coach_id}/status")
async def update_admin_coach_status(
    coach_id: str,
    payload: CoachStatusUpdateRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """تغییر و ذخیره قطعی وضعیت تایید صلاحیت مربی توسط ادمین"""
    stmt = select(CoachProfile).where(CoachProfile.id == coach_id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="مربی یافت نشد.")
    profile.is_verified = payload.is_verified
    await db.commit()
    await db.refresh(profile)
    return {
        "success": True,
        "coach_id": profile.id,
        "is_verified": profile.is_verified
    }

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.models.base import get_db_session
from backend.app.models.coach import CoachBookingRequest

router = APIRouter(prefix="/coaches", tags=["Coaches"])


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

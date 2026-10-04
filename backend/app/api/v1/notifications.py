from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.core.database import get_db
from backend.app.services.notification_service import NotificationService
from backend.app.models.booking import Booking
from backend.app.models.slot import TimeSlot
from backend.app.models.club import Club, Court
from backend.app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications & SMS Telemetry"])

@router.get("/logs")
async def get_logs(
    recipient: str | None = Query(None, description="فیلتر بر اساس شماره همراه گیرنده"),
    event_type: str | None = Query(None, description="فیلتر بر اساس کد رویداد پیامکی"),
    limit: int = Query(50, ge=1, le=100, description="حداکثر تعداد ردیف‌ها"),
    db: AsyncSession = Depends(get_db)
):
    """دریافت دایرکتوری و سوابق پیامک‌های خدماتی ارسال‌شده توسط پلتفرم همراه با شناسه مخابراتی و وضعیت تحویل."""
    logs = await NotificationService.get_notification_logs(
        db,
        recipient=recipient,
        event_type=event_type,
        limit=limit
    )
    return [
        {
            "id": l.id,
            "recipient": l.recipient,
            "event_type": l.event_type,
            "template_name": l.template_name,
            "provider": l.provider,
            "tokens": l.tokens_json,
            "status": l.status,
            "message_id": l.message_id,
            "error_message": l.error_message,
            "created_at": l.created_at.isoformat() if l.created_at else None
        }
        for l in logs
    ]

@router.post("/send-reminder/{booking_id}")
async def trigger_booking_reminder(booking_id: str, db: AsyncSession = Depends(get_db)):
    """ارسال فوری پیامک یادآوری سانس به شماره همراه بازیکن."""
    stmt = (
        select(Booking)
        .where(Booking.id == booking_id)
        .options(
            selectinload(Booking.timeslot).selectinload(TimeSlot.court).selectinload(Court.club)
        )
    )
    res = await db.execute(stmt)
    booking = res.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="رزرو مورد نظر یافت نشد")

    user_stmt = select(User).where(User.id == booking.user_id)
    user_res = await db.execute(user_stmt)
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="اطلاعات بازیکن یافت نشد")

    slot = booking.timeslot
    court = slot.court
    club = court.club

    log = await NotificationService.send_booking_reminder(
        db=db,
        booking=booking,
        club_name=club.name,
        slot_time=slot.start_time.strftime("%H:%M"),
        recipient_phone=user.phone_number
    )
    return {
        "success": True,
        "message": f"پیامک یادآوری به {user.phone_number} ارسال شد",
        "notification_id": log.id,
        "status": log.status
    }

from pydantic import BaseModel, Field
from datetime import date as dt_date, time as dt_time
from backend.app.services.waitlist_service import WaitlistService
from backend.app.api.deps import get_current_user_id

class WaitlistPayload(BaseModel):
    court_id: str = Field(..., description="شناسه کورت")
    slot_date: dt_date = Field(..., description="تاریخ سانس")
    start_time: str = Field(..., description="ساعت شروع به فرمت HH:MM")

@router.post("/waitlist/join")
async def join_waitlist(
    payload: WaitlistPayload,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """عضویت در لیست انتظار یک سانس مشخص جهت دریافت اعلان درون‌پرتال به محض آزادسازی"""
    try:
        parts = [int(p) for p in payload.start_time.split(":")]
        st = dt_time(parts[0], parts[1])
    except Exception:
        raise HTTPException(status_code=400, detail="فرمت ساعت شروع نامعتبر است (الگوی صحیح: 18:30)")

    entry = await WaitlistService.join_waitlist(
        db=db,
        user_id=user_id,
        court_id=payload.court_id,
        slot_date=payload.slot_date,
        start_time=st
    )
    return {
        "success": True,
        "message": "عضویت شما در لیست انتظار سانس با موفقیت ثبت شد. به محض آزادسازی، اعلان در پرتال نمایش داده خواهد شد.",
        "waitlist_id": entry.id,
        "status": entry.status
    }

@router.post("/waitlist/leave")
async def leave_waitlist(
    payload: WaitlistPayload,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """لغو عضویت از لیست انتظار سانس"""
    try:
        parts = [int(p) for p in payload.start_time.split(":")]
        st = dt_time(parts[0], parts[1])
    except Exception:
        raise HTTPException(status_code=400, detail="فرمت ساعت شروع نامعتبر است")

    res = await WaitlistService.leave_waitlist(
        db=db,
        user_id=user_id,
        court_id=payload.court_id,
        slot_date=payload.slot_date,
        start_time=st
    )
    return {"success": res, "message": "عضویت در لیست انتظار با موفقیت لغو شد." if res else "عضویت فعالی یافت نشد."}

@router.get("/in-app/my")
async def get_my_in_app_notifications(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """دریافت اعلان‌های پایدار و ماندگار کاربر در پرتال"""
    notifs = await WaitlistService.get_user_notifications(db=db, user_id=user_id)
    return notifs

@router.post("/in-app/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """علامت‌گذاری اعلان به عنوان خوانده شده"""
    res = await WaitlistService.mark_as_read(db=db, notification_id=notification_id, user_id=user_id)
    return {"success": res}

@router.get("/waitlist/check-slot/{slot_id}")
async def check_waitlist_slot(
    slot_id: str,
    db: AsyncSession = Depends(get_db)
):
    """بررسی زنده و لحظه‌ای موجودی سانس هنگام کلیک بازیکن روی اعلان آزادسازی"""
    availability = await WaitlistService.verify_slot_availability(db=db, slot_id=slot_id)
    return availability

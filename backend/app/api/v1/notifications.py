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

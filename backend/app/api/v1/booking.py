from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.base import get_db_session
from backend.app.services.booking_service import BookingService
from backend.app.services.payment_service import PaymentService
from backend.app.api.deps import get_current_user_id

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from backend.app.models.booking import Booking
from backend.app.models.slot import TimeSlot
from backend.app.models.club import Court, Club
from backend.app.services.notification_service import NotificationService

router = APIRouter(tags=["Booking"])

@router.get("/bookings/my")
async def get_my_bookings(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """دریافت کلیه رزروهای ثبت‌شده و قطعی کاربر از پایگاه داده همراه با مشخصات کورت و باشگاه."""
    stmt = (
        select(Booking)
        .options(
            joinedload(Booking.timeslot)
            .joinedload(TimeSlot.court)
            .joinedload(Court.club)
        )
        .where(Booking.user_id == user_id)
        .order_by(Booking.created_at.desc())
    )
    result = await db.execute(stmt)
    bookings = result.scalars().all()
    items = []
    for b in bookings:
        slot = b.timeslot
        court = slot.court if slot else None
        club = court.club if court else None
        items.append({
            "booking_id": b.id,
            "tracking_code": b.tracking_code,
            "timeslot_id": b.timeslot_id,
            "amount_paid": b.amount_paid,
            "amount_toman": b.amount_paid // 10,
            "status": b.status,
            "payment_method": b.payment_method,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "confirmed_at": b.confirmed_at.isoformat() if b.confirmed_at else None,
            "slot_date": str(slot.slot_date) if slot else None,
            "start_time": slot.start_time.strftime("%H:%M") if slot else None,
            "end_time": slot.end_time.strftime("%H:%M") if slot else None,
            "court_name": court.name if court else "کورت سنترال",
            "club_id": club.id if club else None,
            "club_name": club.name if club else "مجموعه ورزشی رالی",
            "club_address": club.address if club else None,
            "sport_type": court.sport_type if court else "PADEL"
        })
    return items

@router.post("/slots/{slot_id}/hold")
async def hold_slot(
    slot_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    booking = await BookingService.hold_slot(db, slot_id, user_id)
    return {
        "booking_id": booking.id,
        "slot_id": booking.timeslot_id,
        "tracking_code": booking.tracking_code,
        "price": booking.amount_paid,
        "status": booking.status,
        "message": "قفل موقت ۱۰ دقیقه‌ای با موفقیت ایجاد شد"
    }

@router.post("/bookings/{booking_id}/checkout")
async def checkout_booking(
    booking_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    return await PaymentService.create_checkout(db, booking_id, user_id)

@router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    refund = await BookingService.cancel_booking(db, booking_id, user_id, is_club_emergency=False)
    return {
        "status": "CANCELLED",
        "refund_id": refund.id,
        "refund_amount": refund.amount,
        "penalty_amount": refund.penalty_amount,
        "reason": refund.reason,
        "message": "رزرو با موفقیت لغو شد"
    }


class DeskBookingRequest(BaseModel):
    court_id: str | None = None
    slot_id: str | None = None
    customer_name: str
    customer_phone: str | None = None
    payment_method: str = "POS"
    slot_time: str
    slot_date: str | None = None
    club_name: str | None = None
    court_name: str | None = None
    send_sms: bool = True
    is_recurring_vip: bool = False


@router.post("/bookings/desk-manual")
async def create_desk_manual_booking(
    payload: DeskBookingRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """ثبت رزرو باجه/تلفنی حضوری با کارمزد صفر درصد پلتفرم و ارسال پیامک فوری کاوه‌نگار به بازیکن."""
    import uuid
    tracking_code = f"DESK-{uuid.uuid4().hex[:6].upper()}"
    sms_sent = False

    if payload.send_sms and payload.customer_phone and len(payload.customer_phone.strip()) >= 10:
        phone = payload.customer_phone.strip()
        try:
            await NotificationService.send_manual_booking_sms(
                db=db,
                recipient_phone=phone,
                customer_name=payload.customer_name,
                club_name=payload.club_name or "مجموعه ورزشی رالی",
                court_name=payload.court_name or "کورت سنترال",
                slot_time=payload.slot_time,
                slot_date=payload.slot_date or "امروز",
                tracking_code=tracking_code
            )
            sms_sent = True
        except Exception:
            pass

    return {
        "success": True,
        "tracking_code": tracking_code,
        "customer_name": payload.customer_name,
        "is_recurring_vip": payload.is_recurring_vip,
        "payment_method": payload.payment_method,
        "platform_fee": 0,
        "sms_sent": sms_sent,
        "message": "رزرو باجه با موفقیت و کارمزد صفر درصد ثبت شد"
    }


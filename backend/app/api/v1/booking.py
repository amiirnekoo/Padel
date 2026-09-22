from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.base import get_db_session
from backend.app.services.booking_service import BookingService
from backend.app.services.payment_service import PaymentService
from backend.app.api.deps import get_current_user_id

router = APIRouter(tags=["Booking"])

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

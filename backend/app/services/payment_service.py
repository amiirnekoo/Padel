import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.datetime_utils import utc_now
from backend.app.models.booking import Booking
from backend.app.models.payment import PaymentAttempt
from backend.app.models.slot import TimeSlot
from backend.app.models.refund import Refund
from backend.app.models.user import User
from backend.app.models.club import Club, Court
from backend.app.services.notification_service import NotificationService
from backend.app.core.config import settings

class PaymentService:
    @staticmethod
    async def create_checkout(db: AsyncSession, booking_id: str, user_id: str) -> dict:
        stmt = select(Booking).where(Booking.id == booking_id)
        result = await db.execute(stmt)
        booking = result.scalar_one_or_none()

        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="سفارش رزرو یافت نشد")

        if booking.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="عدم دسترسی به این سفارش")

        if booking.status != "PENDING_PAYMENT":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="این سفارش در وضعیت معتبر برای پرداخت نیست")

        # Verify hold expiration
        slot_stmt = select(TimeSlot).where(TimeSlot.id == booking.timeslot_id)
        slot_res = await db.execute(slot_stmt)
        slot = slot_res.scalar_one()

        if slot.status != "HOLD" or (slot.hold_expires_at and slot.hold_expires_at < utc_now()):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="مهلت پرداخت ۱۰ دقیقه‌ای این سانس منقضی شده است")

        if settings.ENVIRONMENT == "production" and settings.PAYMENT_GATEWAY_PROVIDER in ["MOCK", "SIMULATOR", ""]:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="درگاه پرداخت الکترونیک شاپرک در محیط پروداکشن فعال نیست و شبیه‌ساز پرداخت مسدود است"
            )

        # Generate unique idempotency key
        idempotency_key = f"PAY-{uuid.uuid4()}"
        gateway_token = f"SHP-{uuid.uuid4()}"

        attempt = PaymentAttempt(
            booking_id=booking.id,
            idempotency_key=idempotency_key,
            gateway_name="SHAPARAK_SIMULATOR",
            amount=booking.amount_paid,
            gateway_token=gateway_token,
            status="INITIATED"
        )
        db.add(attempt)
        await db.commit()
        await db.refresh(attempt)

        # In production this redirects to PSP URL. In sandbox/API:
        return {
            "payment_url": f"https://gateway.shaparak.ir/pay/{gateway_token}",
            "gateway_token": gateway_token,
            "idempotency_key": idempotency_key,
            "amount": booking.amount_paid
        }

    @staticmethod
    async def process_callback(db: AsyncSession, gateway_token: str, ref_id: str, success: bool = True) -> dict:
        # Load payment attempt
        stmt = (
            select(PaymentAttempt)
            .where(PaymentAttempt.gateway_token == gateway_token)
            .with_for_update()
        )
        result = await db.execute(stmt)
        attempt = result.scalar_one_or_none()

        if not attempt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="تلاش پرداخت یافت نشد")

        if settings.ENVIRONMENT == "production" and attempt.gateway_name == "SHAPARAK_SIMULATOR":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="کال‌بک شبیه‌ساز پرداخت در محیط پروداکشن پذیرفته نمی‌شود"
            )

        # Idempotency check: If already processed, return current state
        if attempt.status in ["SUCCESSFUL", "REVERSED", "FAILED"]:
            return {
                "status": attempt.status,
                "message": "این تراکنش قبلاً پردازش شده است"
            }

        # Load booking and slot
        booking_stmt = select(Booking).where(Booking.id == attempt.booking_id).with_for_update()
        booking_res = await db.execute(booking_stmt)
        booking = booking_res.scalar_one()

        slot_stmt = select(TimeSlot).where(TimeSlot.id == booking.timeslot_id).with_for_update()
        slot_res = await db.execute(slot_stmt)
        slot = slot_res.scalar_one()

        now = utc_now()

        if not success:
            attempt.status = "FAILED"
            attempt.verified_at = now
            await db.commit()
            return {"status": "FAILED", "message": "پرداخت توسط کاربر لغو شد یا در بانک ناموفق بود"}

        # CRITICAL VALIDATION: Check hold expiration (Late Callback handling)
        if not slot.hold_expires_at or now >= slot.hold_expires_at:
            # Late Callback: Money was deducted but 10-minute hold has expired!
            # Reject booking and initiate 100% bank reversal
            attempt.status = "REVERSED"
            attempt.ref_id = ref_id
            attempt.verified_at = now

            booking.status = "EXPIRED"

            # Create 100% Refund record
            refund = Refund(
                booking_id=booking.id,
                amount=attempt.amount,
                penalty_amount=0,
                reason="LATE_CALLBACK",
                status="COMPLETED",
                reversal_ref_id=f"REV-{ref_id}"
            )
            db.add(refund)

            # Slot is released to AVAILABLE if it was still on HOLD
            if slot.status == "HOLD":
                slot.status = "AVAILABLE"
                slot.held_by_user_id = None
                slot.hold_expires_at = None

            await db.commit()
            return {
                "status": "REVERSED_EXPIRED",
                "message": "پرداخت پس از مهلت ۱۰ دقیقه انجام شد؛ سانس واگذار نشد و کل وجه به کارت مبدأ برگشت داده شد."
            }

        # Happy Path: Payment valid & within 10-minute window
        attempt.status = "SUCCESSFUL"
        attempt.ref_id = ref_id
        attempt.verified_at = now

        booking.status = "CONFIRMED"
        booking.confirmed_at = now

        slot.status = "BOOKED"
        slot.hold_expires_at = None

        await db.commit()

        # Send instant confirmation SMS to player and alert to club operator
        try:
            user_stmt = select(User).where(User.id == booking.user_id)
            user_res = await db.execute(user_stmt)
            user = user_res.scalar_one_or_none()

            court_stmt = select(Court).where(Court.id == slot.court_id)
            court_res = await db.execute(court_stmt)
            court = court_res.scalar_one_or_none()

            if court:
                club_stmt = select(Club).where(Club.id == court.club_id)
                club_res = await db.execute(club_stmt)
                club = club_res.scalar_one_or_none()
            else:
                club = None

            if user and court and club:
                # 1. Player SMS
                await NotificationService.send_booking_confirmation(
                    db=db,
                    booking=booking,
                    slot=slot,
                    court=court,
                    club=club,
                    recipient_phone=user.phone_number
                )
                # 2. Operator Alert SMS
                op_phone = club.phone or "09120000000"
                await NotificationService.send_operator_booking_alert(
                    db=db,
                    booking=booking,
                    slot=slot,
                    court=court,
                    player_name=user.full_name,
                    player_phone=user.phone_number,
                    operator_phone=op_phone
                )
        except Exception:
            # Notifications must not break transaction response
            pass

        return {
            "status": "CONFIRMED",
            "tracking_code": booking.tracking_code,
            "ref_id": ref_id,
            "message": "رزرو شما با موفقیت قطعی شد"
        }

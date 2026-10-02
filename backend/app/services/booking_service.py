import uuid
import random
import string
from datetime import datetime, date, time, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_, and_
from backend.app.core.config import settings
from backend.app.core.datetime_utils import utc_now
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.club import Court, Club
from backend.app.models.refund import Refund
from backend.app.models.user import User
from backend.app.services.wallet_service import WalletService
from backend.app.services.notification_service import NotificationService

class BookingService:
    @staticmethod
    def generate_tracking_code() -> str:
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"PAD-{random_str}"

    @staticmethod
    async def hold_slot(db: AsyncSession, slot_id: str, user_id: str) -> Booking:
        # Check slot exists and get price
        stmt = select(TimeSlot).where(TimeSlot.id == slot_id)
        result = await db.execute(stmt)
        slot = result.scalar_one_or_none()

        if not slot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="سانس مورد نظر یافت نشد")

        now = utc_now()
        hold_expires = now + timedelta(minutes=settings.HOLD_EXPIRATION_MINUTES)

        # Atomic conditional transition: Only updates if slot is AVAILABLE or has an expired HOLD
        update_stmt = (
            update(TimeSlot)
            .where(
                TimeSlot.id == slot_id,
                or_(
                    TimeSlot.status == "AVAILABLE",
                    and_(TimeSlot.status == "HOLD", TimeSlot.hold_expires_at < now)
                )
            )
            .values(
                status="HOLD",
                held_by_user_id=user_id,
                hold_expires_at=hold_expires
            )
        )
        update_res = await db.execute(update_stmt)
        if update_res.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="این سانس هم‌اکنون در حال رزرو توسط کاربر دیگری یا مسدود است"
            )

        # Create booking record for the winner
        tracking_code = BookingService.generate_tracking_code()
        booking = Booking(
            user_id=user_id,
            timeslot_id=slot.id,
            amount_paid=slot.price,
            tracking_code=tracking_code,
            status="PENDING_PAYMENT"
        )
        db.add(booking)
        try:
            await db.commit()
        except Exception:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="این سانس هم‌اکنون در حال رزرو توسط کاربر دیگری یا مسدود است"
            )
        return booking

    @staticmethod
    async def get_club_calendar(db: AsyncSession, club_id: str, slot_date: date) -> dict:
        stmt = (
            select(Court)
            .where(Court.club_id == club_id, Court.is_active == True)
        )
        courts_result = await db.execute(stmt)
        courts = courts_result.scalars().all()

        now = utc_now()
        calendar_data = []

        for court in courts:
            slots_stmt = (
                select(TimeSlot)
                .where(TimeSlot.court_id == court.id, TimeSlot.slot_date == slot_date)
                .order_by(TimeSlot.start_time)
            )
            slots_result = await db.execute(slots_stmt)
            slots = slots_result.scalars().all()

            if not slots and slot_date >= date.today():
                default_hours = [
                    (time(8, 0), time(9, 30), 1600000),
                    (time(9, 30), time(11, 0), 1800000),
                    (time(11, 0), time(12, 30), 1800000),
                    (time(16, 30), time(18, 0), 2200000),
                    (time(18, 0), time(19, 30), 2400000),
                    (time(19, 30), time(21, 0), 2400000),
                    (time(21, 0), time(22, 30), 2200000),
                ]
                new_slots = []
                for idx, (st, et, price) in enumerate(default_hours):
                    s_id = f"slot-{court.id}-{slot_date.strftime('%Y%m%d')}-{idx}"
                    s = TimeSlot(
                        id=s_id,
                        court_id=court.id,
                        slot_date=slot_date,
                        start_time=st,
                        end_time=et,
                        price=price,
                        status="AVAILABLE"
                    )
                    db.add(s)
                    new_slots.append(s)
                try:
                    await db.commit()
                    slots = new_slots
                except Exception:
                    await db.rollback()
                    slots_result = await db.execute(slots_stmt)
                    slots = slots_result.scalars().all()

            court_slots = []
            for slot in slots:
                display_status = slot.status
                # In-memory lazy check for calendar display
                if slot.status == "HOLD" and slot.hold_expires_at and slot.hold_expires_at < now:
                    display_status = "AVAILABLE"

                court_slots.append({
                    "slot_id": slot.id,
                    "start_time": slot.start_time.strftime("%H:%M"),
                    "end_time": slot.end_time.strftime("%H:%M"),
                    "price": slot.price,
                    "status": display_status,
                    "hold_expires_at": slot.hold_expires_at.isoformat() if slot.hold_expires_at else None
                })

            calendar_data.append({
                "court_id": court.id,
                "court_name": court.name,
                "sport_type": court.sport_type,
                "is_indoor": court.is_indoor,
                "slots": court_slots
            })

        return {
            "club_id": club_id,
            "date": str(slot_date),
            "courts": calendar_data
        }

    @staticmethod
    async def cancel_booking(db: AsyncSession, booking_id: str, user_id: str, is_club_emergency: bool = False) -> Refund:
        stmt = (
            select(Booking)
            .where(Booking.id == booking_id)
            .with_for_update()
        )
        result = await db.execute(stmt)
        booking = result.scalar_one_or_none()

        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="رزرو یافت نشد")

        if not is_club_emergency and booking.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="دسترسی غیرمجاز برای لغو این رزرو")

        if booking.status != "CONFIRMED":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="صرفاً رزروهای قطعی پرداخت‌شده قابل لغو هستند")

        # Load slot to verify timing
        slot_stmt = select(TimeSlot).where(TimeSlot.id == booking.timeslot_id).with_for_update()
        slot_res = await db.execute(slot_stmt)
        slot = slot_res.scalar_one()

        slot_datetime = datetime.combine(slot.slot_date, slot.start_time)
        now = utc_now()
        hours_to_slot = (slot_datetime - now).total_seconds() / 3600.0

        if is_club_emergency:
            refund_amount = booking.amount_paid
            penalty_amount = 0
            reason = "CLUB_EMERGENCY"
            booking.status = "CANCELLED_BY_CLUB"
        elif hours_to_slot >= settings.CANCELLATION_DEADLINE_HOURS:
            penalty_amount = int(booking.amount_paid * (settings.CANCELLATION_PENALTY_PERCENT / 100.0))
            refund_amount = booking.amount_paid - penalty_amount
            reason = "USER_CANCELLATION_OVER_24H"
            booking.status = "CANCELLED_BY_USER"
        else:
            # Under 24h: non-refundable
            refund_amount = 0
            penalty_amount = booking.amount_paid
            reason = "USER_CANCELLATION_SUB_24H"
            booking.status = "CANCELLED_BY_USER"

        booking.cancelled_at = now
        slot.status = "AVAILABLE"
        slot.held_by_user_id = None
        slot.hold_expires_at = None

        refund = Refund(
            booking_id=booking.id,
            amount=refund_amount,
            penalty_amount=penalty_amount,
            reason=reason,
            status="COMPLETED" if refund_amount > 0 else "COMPLETED"
        )
        db.add(refund)
        await db.commit()
        await db.refresh(refund)

        # Wire to user wallet and send notification if refund amount is positive
        if refund_amount > 0:
            wallet = await WalletService.refund_to_wallet(
                db=db,
                user_id=booking.user_id,
                booking_id=booking.id,
                refund_amount=refund_amount,
                description=f"استرداد وجه لغو رزرو با کد پیگیری {booking.tracking_code}"
            )
            try:
                user_stmt = select(User).where(User.id == booking.user_id)
                user_res = await db.execute(user_stmt)
                user = user_res.scalar_one_or_none()
                if user:
                    await NotificationService.send_cancellation_refund_notice(
                        db=db,
                        tracking_code=booking.tracking_code,
                        refund_toman=refund_amount // 10,
                        current_balance_toman=wallet.balance // 10,
                        recipient_phone=user.phone_number
                    )
            except Exception:
                pass

        return refund

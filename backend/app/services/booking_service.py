from datetime import datetime
from typing import Tuple, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.base import ensure_utc
from backend.app.models.enums import SlotStatus, BookingStatus, RefundStatus, PaymentAttemptStatus
from backend.app.models.booking import Booking
from backend.app.models.slot import Slot
from backend.app.models.payment_attempt import PaymentAttempt
from backend.app.models.refund import Refund
from backend.app.services.slot_service import InvalidOperationError


class BookingService:
    @staticmethod
    async def cancel_by_user(
        session: AsyncSession,
        booking_id: str,
        user_id: str,
        now: datetime,
        release_slot_if_unrefundable: bool = True,
    ) -> Tuple[Booking, Slot, List[Refund]]:
        """
        User cancellation:
        - If Time_To_Slot >= 24h (1440 mins): 90% refund to source, 10% penalty retained, slot -> AVAILABLE.
        - If Time_To_Slot < 24h: non-refundable. If release_slot_if_unrefundable is True, slot -> AVAILABLE without refund.
        """
        stmt_b = select(Booking).where(Booking.id == booking_id).with_for_update()
        booking = (await session.execute(stmt_b)).scalar_one_or_none()
        if not booking:
            raise InvalidOperationError("سفارش رزرو یافت نشد.")

        if booking.host_user_id != user_id:
            raise InvalidOperationError("تنها رزروکننده اصلی مجاز به ثبت لغو است.")

        if booking.status != BookingStatus.CONFIRMED:
            raise InvalidOperationError(f"سفارش در وضعیت {booking.status} قابل لغو نیست.")

        stmt_s = select(Slot).where(Slot.id == booking.slot_id).with_for_update()
        slot = (await session.execute(stmt_s)).scalar_one()

        time_to_slot_mins = (ensure_utc(slot.start_time) - ensure_utc(now)).total_seconds() / 60.0
        is_refundable = time_to_slot_mins >= 1440.0

        refunds: List[Refund] = []
        booking.status = BookingStatus.CANCELLED_BY_USER

        if is_refundable:
            # 90% refund to source, 10% penalty to club
            stmt_payments = select(PaymentAttempt).where(
                PaymentAttempt.booking_id == booking.id,
                PaymentAttempt.status == PaymentAttemptStatus.VERIFIED_SUCCESS,
            )
            payments = (await session.execute(stmt_payments)).scalars().all()
            for p in payments:
                refund_amount = int(p.amount * 0.90)
                refund = Refund(
                    payment_attempt_id=p.id,
                    booking_id=booking.id,
                    user_id=p.user_id,
                    amount=refund_amount,
                    reason="PERMITTED_USER_CANCEL_90_PERCENT_TO_SOURCE",
                    status=RefundStatus.INITIATED,
                )
                session.add(refund)
                refunds.append(refund)

            slot.status = SlotStatus.AVAILABLE
            slot.booking_id = None
        else:
            # Sub-24h: non-refundable
            if release_slot_if_unrefundable:
                slot.status = SlotStatus.AVAILABLE
                slot.booking_id = None

        await session.flush()
        return booking, slot, refunds

    @staticmethod
    async def cancel_by_club(
        session: AsyncSession,
        booking_id: str,
        reason: str,
    ) -> Tuple[Booking, Slot, List[Refund]]:
        """
        Emergency cancellation by club (technical failure, power outage, etc.).
        100% refund to source for all players with 0 penalty.
        """
        stmt_b = select(Booking).where(Booking.id == booking_id).with_for_update()
        booking = (await session.execute(stmt_b)).scalar_one_or_none()
        if not booking:
            raise InvalidOperationError("سفارش رزرو یافت نشد.")

        stmt_s = select(Slot).where(Slot.id == booking.slot_id).with_for_update()
        slot = (await session.execute(stmt_s)).scalar_one()

        booking.status = BookingStatus.CANCELLED_BY_CLUB
        slot.status = SlotStatus.CANCELLED_BY_CLUB

        stmt_payments = select(PaymentAttempt).where(
            PaymentAttempt.booking_id == booking.id,
            PaymentAttempt.status == PaymentAttemptStatus.VERIFIED_SUCCESS,
        )
        payments = (await session.execute(stmt_payments)).scalars().all()
        refunds: List[Refund] = []

        for p in payments:
            refund = Refund(
                payment_attempt_id=p.id,
                booking_id=booking.id,
                user_id=p.user_id,
                amount=p.amount,
                reason=f"CLUB_CANCELLATION_100_PERCENT_TO_SOURCE: {reason}",
                status=RefundStatus.INITIATED,
            )
            session.add(refund)
            refunds.append(refund)

        await session.flush()
        return booking, slot, refunds

    @staticmethod
    async def mark_no_show(
        session: AsyncSession,
        booking_id: str,
    ) -> Tuple[Booking, Slot]:
        """Operator marks players as NO_SHOW. No refund issued."""
        stmt_b = select(Booking).where(Booking.id == booking_id).with_for_update()
        booking = (await session.execute(stmt_b)).scalar_one_or_none()
        if not booking:
            raise InvalidOperationError("سفارش رزرو یافت نشد.")

        stmt_s = select(Slot).where(Slot.id == booking.slot_id).with_for_update()
        slot = (await session.execute(stmt_s)).scalar_one()

        booking.status = BookingStatus.NO_SHOW
        slot.status = SlotStatus.NO_SHOW

        await session.flush()
        return booking, slot

    @staticmethod
    async def mark_completed(
        session: AsyncSession,
        booking_id: str,
    ) -> Tuple[Booking, Slot]:
        """System scheduler marks game as completed after slot end time."""
        stmt_b = select(Booking).where(Booking.id == booking_id).with_for_update()
        booking = (await session.execute(stmt_b)).scalar_one_or_none()
        if not booking:
            raise InvalidOperationError("سفارش رزرو یافت نشد.")

        stmt_s = select(Slot).where(Slot.id == booking.slot_id).with_for_update()
        slot = (await session.execute(stmt_s)).scalar_one()

        booking.status = BookingStatus.COMPLETED
        slot.status = SlotStatus.COMPLETED

        await session.flush()
        return booking, slot

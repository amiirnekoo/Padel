from datetime import datetime, timedelta
from typing import Tuple
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.base import ensure_utc
from backend.app.models.enums import SlotStatus, BookingStatus, PaymentType, PaymentAttemptStatus, RefundStatus
from backend.app.models.slot import Slot
from backend.app.models.booking import Booking
from backend.app.models.payment_attempt import PaymentAttempt
from backend.app.models.refund import Refund


class SlotConflictError(Exception):
    """Raised when slot cannot be acquired due to status conflict or active hold."""
    pass


class SlotExpiredError(Exception):
    """Raised when hold has logically expired before transaction finalization."""
    pass


class InvalidOperationError(Exception):
    """Raised when domain guard condition is violated."""
    pass


class SlotService:
    @staticmethod
    async def acquire_single_hold(
        session: AsyncSession,
        slot_id: str,
        host_user_id: str,
        now: datetime,
    ) -> Tuple[Slot, Booking]:
        """
        Atomically transition Slot from AVAILABLE to HOLD_SINGLE.
        Uses atomic conditional update where status == AVAILABLE.
        Window: 10 minutes from hold_started_at.
        """
        slot = await session.get(Slot, slot_id)
        if not slot:
            raise SlotConflictError("سانس مورد نظر یافت نشد.")

        if slot.status != SlotStatus.AVAILABLE:
            raise SlotConflictError(f"سانس در وضعیت {slot.status} قرار دارد و قابل رزرو نیست.")

        hold_duration = timedelta(minutes=10)
        expires_at = now + hold_duration

        booking = Booking(
            slot_id=slot.id,
            host_user_id=host_user_id,
            payment_type=PaymentType.SINGLE_PAYER,
            total_amount=slot.price,
            paid_amount=0,
            status=BookingStatus.PENDING_PAYMENT,
            expires_at=expires_at,
        )
        session.add(booking)
        await session.flush()

        # Atomic conditional update
        stmt_atomic = (
            update(Slot)
            .where(Slot.id == slot_id, Slot.status == SlotStatus.AVAILABLE)
            .values(
                status=SlotStatus.HOLD_SINGLE,
                hold_started_at=now,
                expires_at=expires_at,
                booking_id=booking.id,
            )
        )
        res = await session.execute(stmt_atomic)
        if res.rowcount == 0:
            raise SlotConflictError("سانس توسط کاربر دیگری رزرو شده است.")

        await session.refresh(slot)
        return slot, booking

    @staticmethod
    async def acquire_split_hold(
        session: AsyncSession,
        slot_id: str,
        host_user_id: str,
        now: datetime,
    ) -> Tuple[Slot, Booking]:
        """
        Atomically transition Slot from AVAILABLE to HOLD_SPLIT BEFORE 1st share payment.
        Guard: Time_To_Slot >= 120 minutes (2 hours).
        Window: 15 minutes from hold_started_at.
        """
        slot = await session.get(Slot, slot_id)
        if not slot:
            raise SlotConflictError("سانس مورد نظر یافت نشد.")

        if slot.status != SlotStatus.AVAILABLE:
            raise SlotConflictError(f"سانس در وضعیت {slot.status} قرار دارد و قابل رزرو دنگی نیست.")

        # Guard: At least 2 hours prior to slot start time
        if (ensure_utc(slot.start_time) - ensure_utc(now)).total_seconds() < 120 * 60:
            raise InvalidOperationError("پرداخت دنگی در فاصله زمانی کمتر از ۲ ساعت تا بازی مجاز نیست.")

        hold_duration = timedelta(minutes=15)
        expires_at = now + hold_duration

        booking = Booking(
            slot_id=slot.id,
            host_user_id=host_user_id,
            payment_type=PaymentType.SPLIT_PAYMENT,
            total_amount=slot.price,
            paid_amount=0,
            status=BookingStatus.PENDING_PAYMENT,
            expires_at=expires_at,
        )
        session.add(booking)
        await session.flush()

        # Atomic conditional update
        stmt_atomic = (
            update(Slot)
            .where(Slot.id == slot_id, Slot.status == SlotStatus.AVAILABLE)
            .values(
                status=SlotStatus.HOLD_SPLIT,
                hold_started_at=now,
                expires_at=expires_at,
                booking_id=booking.id,
            )
        )
        res = await session.execute(stmt_atomic)
        if res.rowcount == 0:
            raise SlotConflictError("سانس توسط کاربر دیگری رزرو شده است.")

        await session.refresh(slot)
        return slot, booking

    @staticmethod
    async def block_slot_by_operator(
        session: AsyncSession,
        slot_id: str,
        operator_user_id: str,
    ) -> Slot:
        """Metasadi baaje: Manually block an AVAILABLE slot."""
        slot = await session.get(Slot, slot_id)
        if not slot:
            raise SlotConflictError("سانس مورد نظر یافت نشد.")

        stmt_atomic = (
            update(Slot)
            .where(Slot.id == slot_id, Slot.status == SlotStatus.AVAILABLE)
            .values(
                status=SlotStatus.BLOCKED,
                blocked_by_user_id=operator_user_id,
            )
        )
        res = await session.execute(stmt_atomic)
        if res.rowcount == 0:
            raise SlotConflictError("تنها سانس‌های آزاد قابل مسدودسازی توسط متصدی هستند.")

        await session.refresh(slot)
        return slot

    @staticmethod
    async def unblock_slot_by_operator(
        session: AsyncSession,
        slot_id: str,
    ) -> Slot:
        """Metasadi baaje: Unblock a BLOCKED slot to AVAILABLE."""
        slot = await session.get(Slot, slot_id)
        if not slot:
            raise SlotConflictError("سانس مورد نظر یافت نشد.")

        stmt_atomic = (
            update(Slot)
            .where(Slot.id == slot_id, Slot.status == SlotStatus.BLOCKED)
            .values(
                status=SlotStatus.AVAILABLE,
                blocked_by_user_id=None,
            )
        )
        res = await session.execute(stmt_atomic)
        if res.rowcount == 0:
            raise SlotConflictError("تنها سانس‌های مسدودشده قابل آزادسازی هستند.")

        await session.refresh(slot)
        return slot

    @staticmethod
    async def finalize_atomic_booking(
        session: AsyncSession,
        slot_id: str,
        booking_id: str,
        now: datetime,
    ) -> Tuple[Slot, Booking]:
        """
        Final atomic transition to BOOKED.
        Strict condition: slot.status in [HOLD_SINGLE, HOLD_SPLIT] AND now < expires_at AND paid == total.
        If now >= expires_at, raises SlotExpiredError and refuses transition to BOOKED.
        """
        slot = await session.get(Slot, slot_id)
        booking = await session.get(Booking, booking_id)

        if not slot or not booking:
            raise InvalidOperationError("سانس یا سفارش رزرو یافت نشد.")

        if slot.status not in (SlotStatus.HOLD_SINGLE, SlotStatus.HOLD_SPLIT):
            raise SlotConflictError(f"سانس در وضعیت {slot.status} است و قابل نهایی‌سازی نیست.")

        # ATOMIC TIME GUARD: now < expires_at
        if slot.expires_at and ensure_utc(now) >= ensure_utc(slot.expires_at):
            raise SlotExpiredError("مهلت زمانی قفل موقت به پایان رسیده است؛ سانس قابل ارتقا به BOOKED نیست.")

        # ATOMIC TOTAL GUARD: paid_amount == total_amount
        if booking.paid_amount < booking.total_amount:
            raise InvalidOperationError(
                f"مبلغ پرداختی ({booking.paid_amount}) با مبلغ کل ({booking.total_amount}) برابر نیست."
            )

        # Atomic transition
        stmt_atomic = (
            update(Slot)
            .where(
                Slot.id == slot_id,
                Slot.status.in_([SlotStatus.HOLD_SINGLE, SlotStatus.HOLD_SPLIT]),
                Slot.expires_at > ensure_utc(now),
            )
            .values(status=SlotStatus.BOOKED)
        )
        res = await session.execute(stmt_atomic)
        if res.rowcount == 0:
            raise SlotExpiredError("انقضای قفل موقت مانع نهایی‌سازی رزرو گردید.")

        booking.status = BookingStatus.CONFIRMED
        await session.refresh(slot)
        await session.flush()
        return slot, booking

    @staticmethod
    async def handle_hold_expiration_cleanup(
        session: AsyncSession,
        slot_id: str,
        now: datetime,
    ) -> Tuple[Slot, Booking]:
        """
        Cleanup job: releases expired hold back to AVAILABLE and triggers refunds to source for any paid shares.
        """
        slot = await session.get(Slot, slot_id)
        if not slot or slot.status not in (SlotStatus.HOLD_SINGLE, SlotStatus.HOLD_SPLIT):
            return slot, None

        if slot.expires_at and ensure_utc(now) < ensure_utc(slot.expires_at):
            # Not yet expired
            return slot, None

        booking = None
        if slot.booking_id:
            booking = await session.get(Booking, slot.booking_id)
            if booking:
                booking.status = BookingStatus.EXPIRED

                # Refund any verified payments to source
                stmt_payments = select(PaymentAttempt).where(
                    PaymentAttempt.booking_id == booking.id,
                    PaymentAttempt.status == PaymentAttemptStatus.VERIFIED_SUCCESS,
                )
                payments = (await session.execute(stmt_payments)).scalars().all()
                for p in payments:
                    refund = Refund(
                        payment_attempt_id=p.id,
                        booking_id=booking.id,
                        user_id=p.user_id,
                        amount=p.amount,
                        reason="SPLIT_OR_HOLD_EXPIRATION_REFUND_TO_SOURCE",
                        status=RefundStatus.INITIATED,
                    )
                    session.add(refund)

        # Release slot atomically
        stmt_atomic = (
            update(Slot)
            .where(
                Slot.id == slot_id,
                Slot.status.in_([SlotStatus.HOLD_SINGLE, SlotStatus.HOLD_SPLIT]),
            )
            .values(
                status=SlotStatus.AVAILABLE,
                booking_id=None,
                hold_started_at=None,
                expires_at=None,
            )
        )
        await session.execute(stmt_atomic)
        await session.refresh(slot)
        await session.flush()
        return slot, booking

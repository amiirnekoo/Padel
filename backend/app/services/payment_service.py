from datetime import datetime
from typing import Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.base import ensure_utc
from backend.app.models.enums import PaymentAttemptStatus, SlotStatus, BookingStatus, RefundStatus
from backend.app.models.payment_attempt import PaymentAttempt
from backend.app.models.booking import Booking
from backend.app.models.slot import Slot
from backend.app.models.refund import Refund
from backend.app.services.slot_service import SlotService, InvalidOperationError


class PaymentService:
    @staticmethod
    async def create_payment_attempt(
        session: AsyncSession,
        booking_id: str,
        user_id: str,
        amount: int,
        share_index: int,
        idempotency_key: str,
    ) -> PaymentAttempt:
        """Create a new payment attempt with strict unique idempotency key."""
        stmt = select(PaymentAttempt).where(PaymentAttempt.idempotency_key == idempotency_key)
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if existing:
            return existing

        attempt = PaymentAttempt(
            booking_id=booking_id,
            user_id=user_id,
            amount=amount,
            share_index=share_index,
            status=PaymentAttemptStatus.INITIATED,
            idempotency_key=idempotency_key,
        )
        session.add(attempt)
        await session.flush()
        return attempt

    @staticmethod
    async def mark_redirected_to_gateway(
        session: AsyncSession,
        payment_attempt_id: str,
        authority: str,
    ) -> PaymentAttempt:
        """Record external PSP authority before redirecting player."""
        stmt = select(PaymentAttempt).where(PaymentAttempt.id == payment_attempt_id).with_for_update()
        attempt = (await session.execute(stmt)).scalar_one_or_none()
        if not attempt:
            raise InvalidOperationError("تلاش پرداخت یافت نشد.")

        attempt.status = PaymentAttemptStatus.GATEWAY_REDIRECTED
        attempt.authority = authority
        await session.flush()
        return attempt

    @staticmethod
    async def process_verified_callback(
        session: AsyncSession,
        payment_attempt_id: str,
        gateway_reference: str,
        now: datetime,
    ) -> Tuple[PaymentAttempt, Booking, Slot]:
        """
        Processes verified gateway callback.
        Trust Boundary: Called ONLY by internal PaymentService after verifying signature and inquiry.
        Idempotency: Re-entrant; if already verified, returns existing state.
        Late Callback Guard: If now >= expires_at, sets LATE_SUCCESS_FLAGGED and initiates 100% refund to source.
        """
        stmt_attempt = select(PaymentAttempt).where(PaymentAttempt.id == payment_attempt_id).with_for_update()
        attempt = (await session.execute(stmt_attempt)).scalar_one_or_none()
        if not attempt:
            raise InvalidOperationError("تلاش پرداخت یافت نشد.")

        if attempt.status == PaymentAttemptStatus.VERIFIED_SUCCESS:
            # Idempotent response
            stmt_b = select(Booking).where(Booking.id == attempt.booking_id)
            booking = (await session.execute(stmt_b)).scalar_one()
            stmt_s = select(Slot).where(Slot.id == booking.slot_id)
            slot = (await session.execute(stmt_s)).scalar_one()
            return attempt, booking, slot

        stmt_b = select(Booking).where(Booking.id == attempt.booking_id).with_for_update()
        booking = (await session.execute(stmt_b)).scalar_one()

        stmt_s = select(Slot).where(Slot.id == booking.slot_id).with_for_update()
        slot = (await session.execute(stmt_s)).scalar_one()

        # Check late callback condition: now >= expires_at
        is_late = slot.expires_at is not None and ensure_utc(now) >= ensure_utc(slot.expires_at)

        if is_late:
            attempt.status = PaymentAttemptStatus.LATE_SUCCESS_FLAGGED
            attempt.gateway_reference = gateway_reference
            attempt.verified_at = now

            # Issue 100% refund record to source
            refund = Refund(
                payment_attempt_id=attempt.id,
                booking_id=booking.id,
                user_id=attempt.user_id,
                amount=attempt.amount,
                reason="LATE_CALLBACK_100_PERCENT_REFUND_TO_SOURCE",
                status=RefundStatus.INITIATED,
            )
            session.add(refund)

            # Slot is released if not already released
            if slot.status in (SlotStatus.HOLD_SINGLE, SlotStatus.HOLD_SPLIT):
                slot.status = SlotStatus.AVAILABLE
                slot.booking_id = None
                slot.hold_started_at = None
                slot.expires_at = None
                booking.status = BookingStatus.EXPIRED

            await session.flush()
            return attempt, booking, slot

        # In-time callback: verify success
        attempt.status = PaymentAttemptStatus.VERIFIED_SUCCESS
        attempt.gateway_reference = gateway_reference
        attempt.verified_at = now

        booking.paid_amount += attempt.amount

        # Check if booking is 100% paid
        if booking.paid_amount >= booking.total_amount:
            await SlotService.finalize_atomic_booking(session, slot.id, booking.id, now)

        await session.flush()
        return attempt, booking, slot

    @staticmethod
    async def process_gateway_failure(
        session: AsyncSession,
        payment_attempt_id: str,
    ) -> PaymentAttempt:
        """Handle bank error or user abandonment in gateway."""
        stmt = select(PaymentAttempt).where(PaymentAttempt.id == payment_attempt_id).with_for_update()
        attempt = (await session.execute(stmt)).scalar_one_or_none()
        if not attempt:
            raise InvalidOperationError("تلاش پرداخت یافت نشد.")

        attempt.status = PaymentAttemptStatus.FAILED_GATEWAY

        # If share 1 of split or single hold failed, release slot immediately
        stmt_b = select(Booking).where(Booking.id == attempt.booking_id).with_for_update()
        booking = (await session.execute(stmt_b)).scalar_one()

        if booking.paid_amount == 0:
            stmt_s = select(Slot).where(Slot.id == booking.slot_id).with_for_update()
            slot = (await session.execute(stmt_s)).scalar_one()
            if slot.status in (SlotStatus.HOLD_SINGLE, SlotStatus.HOLD_SPLIT):
                slot.status = SlotStatus.AVAILABLE
                slot.booking_id = None
                slot.hold_started_at = None
                slot.expires_at = None
            booking.status = BookingStatus.EXPIRED

        await session.flush()
        return attempt

import pytest
from datetime import datetime, timedelta
from sqlalchemy import select
from backend.app.models.enums import SlotStatus, BookingStatus, PaymentAttemptStatus, RefundStatus
from backend.app.models.slot import Slot
from backend.app.models.booking import Booking
from backend.app.models.payment_attempt import PaymentAttempt
from backend.app.models.refund import Refund
from backend.app.services.slot_service import SlotService, SlotConflictError, InvalidOperationError
from backend.app.services.booking_service import BookingService
from backend.app.services.payment_service import PaymentService


@pytest.mark.asyncio
async def test_operator_block_and_unblock(async_session, now_utc):
    """Test operator blocking an AVAILABLE slot and then unblocking it."""
    slot = Slot(
        id="slot-operator-1",
        court_id="court-1",
        start_time=now_utc + timedelta(hours=4),
        end_time=now_utc + timedelta(hours=5, minutes=30),
        price=20000000,
        status=SlotStatus.AVAILABLE,
    )
    async_session.add(slot)
    await async_session.commit()

    # Block slot
    slot = await SlotService.block_slot_by_operator(async_session, "slot-operator-1", "operator-user-1")
    assert slot.status == SlotStatus.BLOCKED
    assert slot.blocked_by_user_id == "operator-user-1"

    # Player cannot acquire hold on blocked slot
    with pytest.raises(SlotConflictError):
        await SlotService.acquire_single_hold(async_session, "slot-operator-1", "player-1", now_utc)

    # Unblock slot
    slot = await SlotService.unblock_slot_by_operator(async_session, "slot-operator-1")
    assert slot.status == SlotStatus.AVAILABLE
    assert slot.blocked_by_user_id is None


@pytest.mark.asyncio
async def test_no_show_and_completion_lifecycle(async_session, now_utc):
    """Test marking booking as NO_SHOW and COMPLETED."""
    slot_no_show = Slot(
        id="slot-noshow",
        court_id="court-1",
        start_time=now_utc - timedelta(minutes=30),
        end_time=now_utc + timedelta(hours=1),
        price=20000000,
        status=SlotStatus.BOOKED,
    )
    booking_no_show = Booking(
        id="booking-noshow",
        slot_id="slot-noshow",
        host_user_id="user-noshow",
        total_amount=20000000,
        paid_amount=20000000,
        status=BookingStatus.CONFIRMED,
    )
    async_session.add_all([slot_no_show, booking_no_show])
    await async_session.commit()

    b, s = await BookingService.mark_no_show(async_session, "booking-noshow")
    assert b.status == BookingStatus.NO_SHOW
    assert s.status == SlotStatus.NO_SHOW

    # Completion
    slot_comp = Slot(
        id="slot-comp",
        court_id="court-1",
        start_time=now_utc - timedelta(hours=2),
        end_time=now_utc - timedelta(minutes=30),
        price=20000000,
        status=SlotStatus.BOOKED,
    )
    booking_comp = Booking(
        id="booking-comp",
        slot_id="slot-comp",
        host_user_id="user-comp",
        total_amount=20000000,
        paid_amount=20000000,
        status=BookingStatus.CONFIRMED,
    )
    async_session.add_all([slot_comp, booking_comp])
    await async_session.commit()

    b2, s2 = await BookingService.mark_completed(async_session, "booking-comp")
    assert b2.status == BookingStatus.COMPLETED
    assert s2.status == SlotStatus.COMPLETED


@pytest.mark.asyncio
async def test_sub_24h_cancellation_is_non_refundable(async_session, now_utc):
    """Sub-24h cancellation does not issue refunds."""
    slot = Slot(
        id="slot-sub-24h",
        court_id="court-1",
        start_time=now_utc + timedelta(hours=10),  # 10h < 24h
        end_time=now_utc + timedelta(hours=11, minutes=30),
        price=20000000,
        status=SlotStatus.BOOKED,
    )
    booking = Booking(
        id="booking-sub-24h",
        slot_id="slot-sub-24h",
        host_user_id="user-sub-24h",
        total_amount=20000000,
        paid_amount=20000000,
        status=BookingStatus.CONFIRMED,
    )
    attempt = PaymentAttempt(
        id="attempt-sub-24h",
        booking_id="booking-sub-24h",
        user_id="user-sub-24h",
        amount=20000000,
        status=PaymentAttemptStatus.VERIFIED_SUCCESS,
        idempotency_key="idemp-sub-24h",
    )
    async_session.add_all([slot, booking, attempt])
    await async_session.commit()

    b, s, refunds = await BookingService.cancel_by_user(
        async_session, "booking-sub-24h", "user-sub-24h", now_utc, release_slot_if_unrefundable=True
    )
    assert b.status == BookingStatus.CANCELLED_BY_USER
    assert s.status == SlotStatus.AVAILABLE  # Slot was freed for others
    assert len(refunds) == 0  # Zero refunds issued!


@pytest.mark.asyncio
async def test_hold_expiration_cleanup_job(async_session, now_utc):
    """Cleanup job releases expired hold and refunds partial payments."""
    slot = Slot(
        id="slot-cleanup",
        court_id="court-1",
        start_time=now_utc + timedelta(hours=4),
        end_time=now_utc + timedelta(hours=5, minutes=30),
        price=20000000,
        status=SlotStatus.HOLD_SPLIT,
        booking_id="booking-cleanup",
        hold_started_at=now_utc - timedelta(minutes=20),
        expires_at=now_utc - timedelta(minutes=5),  # expired 5 minutes ago
    )
    booking = Booking(
        id="booking-cleanup",
        slot_id="slot-cleanup",
        host_user_id="user-cleanup",
        total_amount=20000000,
        paid_amount=5000000,
        status=BookingStatus.PENDING_PAYMENT,
        expires_at=now_utc - timedelta(minutes=5),
    )
    attempt_1 = PaymentAttempt(
        id="attempt-cleanup-1",
        booking_id="booking-cleanup",
        user_id="user-cleanup",
        amount=5000000,
        share_index=1,
        status=PaymentAttemptStatus.VERIFIED_SUCCESS,
        idempotency_key="idemp-cleanup-1",
    )
    async_session.add_all([slot, booking, attempt_1])
    await async_session.commit()

    # Run cleanup
    s, b = await SlotService.handle_hold_expiration_cleanup(async_session, "slot-cleanup", now_utc)
    assert s.status == SlotStatus.AVAILABLE
    assert b.status == BookingStatus.EXPIRED

    # Check that the 1 paid share was refunded to source
    stmt_ref = select(Refund).where(Refund.payment_attempt_id == "attempt-cleanup-1")
    refund = (await async_session.execute(stmt_ref)).scalar_one_or_none()
    assert refund is not None
    assert refund.amount == 5000000
    assert refund.status == RefundStatus.INITIATED

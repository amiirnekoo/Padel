import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from backend.app.models.enums import SlotStatus, BookingStatus, PaymentAttemptStatus, RefundStatus, WalletCreditStatus
from backend.app.models.slot import Slot
from backend.app.models.booking import Booking
from backend.app.models.payment_attempt import PaymentAttempt
from backend.app.models.refund import Refund
from backend.app.services.slot_service import SlotService, SlotConflictError, SlotExpiredError, InvalidOperationError
from backend.app.services.payment_service import PaymentService
from backend.app.services.booking_service import BookingService
from backend.app.services.refund_service import RefundService


@pytest.mark.asyncio
async def test_single_payer_atomic_hold_and_booking(async_session, now_utc):
    """Test standard single payer flow: AVAILABLE -> HOLD_SINGLE -> BOOKED."""
    slot = Slot(
        id="slot-1",
        court_id="court-1",
        start_time=now_utc + timedelta(hours=5),
        end_time=now_utc + timedelta(hours=6, minutes=30),
        price=20000000,
        status=SlotStatus.AVAILABLE,
    )
    async_session.add(slot)
    await async_session.commit()

    # 1. Acquire HOLD_SINGLE
    slot, booking = await SlotService.acquire_single_hold(async_session, "slot-1", "user-1", now_utc)
    assert slot.status == SlotStatus.HOLD_SINGLE
    assert slot.expires_at == now_utc + timedelta(minutes=10)
    assert booking.status == BookingStatus.PENDING_PAYMENT
    assert booking.paid_amount == 0

    # 2. Competing user cannot acquire
    with pytest.raises(SlotConflictError):
        await SlotService.acquire_single_hold(async_session, "slot-1", "user-2", now_utc)

    # 3. Create payment attempt & redirect
    attempt = await PaymentService.create_payment_attempt(
        async_session, booking.id, "user-1", 20000000, 1, "idemp-single-1"
    )
    attempt = await PaymentService.mark_redirected_to_gateway(async_session, attempt.id, "AUTH-123")
    assert attempt.status == PaymentAttemptStatus.GATEWAY_REDIRECTED

    # 4. In-time callback (at minute 5) -> VERIFIED_SUCCESS -> BOOKED
    callback_time = now_utc + timedelta(minutes=5)
    attempt, booking, slot = await PaymentService.process_verified_callback(
        async_session, attempt.id, "BANK-REF-999", callback_time
    )
    assert attempt.status == PaymentAttemptStatus.VERIFIED_SUCCESS
    assert booking.status == BookingStatus.CONFIRMED
    assert slot.status == SlotStatus.BOOKED


@pytest.mark.asyncio
async def test_split_payment_atomic_hold_before_first_share(async_session, now_utc):
    """
    Critical Rule 1: Split payment selection ATOMICALLY transitions Slot to HOLD_SPLIT
    before redirecting to 1st share gateway. 15-minute window starts at hold_started_at.
    """
    slot = Slot(
        id="slot-split-1",
        court_id="court-1",
        start_time=now_utc + timedelta(hours=3),  # >= 2h
        end_time=now_utc + timedelta(hours=4, minutes=30),
        price=20000000,
        status=SlotStatus.AVAILABLE,
    )
    async_session.add(slot)
    await async_session.commit()

    # 1. Host chooses split payment -> Slot atomically becomes HOLD_SPLIT
    slot, booking = await SlotService.acquire_split_hold(async_session, "slot-split-1", "host-user", now_utc)
    assert slot.status == SlotStatus.HOLD_SPLIT
    assert slot.expires_at == now_utc + timedelta(minutes=15)
    assert booking.status == BookingStatus.PENDING_PAYMENT

    # 2. Competitor cannot take slot while host is in gateway
    with pytest.raises(SlotConflictError):
        await SlotService.acquire_single_hold(async_session, "slot-split-1", "other-user", now_utc)

    # 3. Share 1 payment succeeds
    attempt_1 = await PaymentService.create_payment_attempt(
        async_session, booking.id, "host-user", 5000000, 1, "idemp-split-1"
    )
    attempt_1, booking, slot = await PaymentService.process_verified_callback(
        async_session, attempt_1.id, "REF-SHARE-1", now_utc + timedelta(minutes=2)
    )
    assert attempt_1.status == PaymentAttemptStatus.VERIFIED_SUCCESS
    assert booking.paid_amount == 5000000
    assert slot.status == SlotStatus.HOLD_SPLIT  # Still HOLD_SPLIT until 4 shares paid

    # 4. Shares 2 and 3 paid
    for i in (2, 3):
        att = await PaymentService.create_payment_attempt(
            async_session, booking.id, f"guest-{i}", 5000000, i, f"idemp-split-{i}"
        )
        await PaymentService.process_verified_callback(
            async_session, att.id, f"REF-SHARE-{i}", now_utc + timedelta(minutes=5 + i)
        )

    # 5. Share 4 paid before expires_at -> Atomic transition to BOOKED
    att_4 = await PaymentService.create_payment_attempt(
        async_session, booking.id, "guest-4", 5000000, 4, "idemp-split-4"
    )
    att_4, booking, slot = await PaymentService.process_verified_callback(
        async_session, att_4.id, "REF-SHARE-4", now_utc + timedelta(minutes=12)
    )
    assert booking.paid_amount == 20000000
    assert booking.status == BookingStatus.CONFIRMED
    assert slot.status == SlotStatus.BOOKED


@pytest.mark.asyncio
async def test_late_callback_refuses_booking_and_refunds_100_percent(async_session, now_utc):
    """
    Critical Rule 2: If now >= expires_at, slot CANNOT transition to BOOKED.
    PaymentAttempt is flagged as LATE_SUCCESS_FLAGGED and 100% refund is created.
    """
    slot = Slot(
        id="slot-late-1",
        court_id="court-1",
        start_time=now_utc + timedelta(hours=5),
        end_time=now_utc + timedelta(hours=6, minutes=30),
        price=20000000,
        status=SlotStatus.AVAILABLE,
    )
    async_session.add(slot)
    await async_session.commit()

    slot, booking = await SlotService.acquire_single_hold(async_session, "slot-late-1", "user-1", now_utc)
    attempt = await PaymentService.create_payment_attempt(
        async_session, booking.id, "user-1", 20000000, 1, "idemp-late-1"
    )

    # Callback arrives at minute 11 (expires_at was minute 10)
    late_time = now_utc + timedelta(minutes=11)
    attempt, booking, slot = await PaymentService.process_verified_callback(
        async_session, attempt.id, "LATE-BANK-REF", late_time
    )

    assert attempt.status == PaymentAttemptStatus.LATE_SUCCESS_FLAGGED
    assert slot.status == SlotStatus.AVAILABLE  # Slot released to public
    assert booking.status == BookingStatus.EXPIRED  # Booking not confirmed

    # Verify 100% refund record created
    stmt_ref = select(Refund).where(Refund.payment_attempt_id == attempt.id)
    refund = (await async_session.execute(stmt_ref)).scalar_one_or_none()
    assert refund is not None
    assert refund.amount == 20000000
    assert refund.status == RefundStatus.INITIATED


@pytest.mark.asyncio
async def test_cancellation_rules_and_refund_decoupling(async_session, now_utc):
    """
    Critical Rule 3: Decouple refund to source from wallet store credit.
    - User cancel >= 24h: 90% refund to source, 10% penalty.
    - User cancel < 24h: non-refundable.
    - Club cancel: 100% refund to source.
    - Explicit opt-in converts refund to store credit.
    """
    # Create confirmed booking 30h in future
    slot_future = Slot(
        id="slot-future",
        court_id="court-1",
        start_time=now_utc + timedelta(hours=30),
        end_time=now_utc + timedelta(hours=31, minutes=30),
        price=20000000,
        status=SlotStatus.BOOKED,
    )
    booking_future = Booking(
        id="booking-future",
        slot_id="slot-future",
        host_user_id="user-cancel-1",
        total_amount=20000000,
        paid_amount=20000000,
        status=BookingStatus.CONFIRMED,
    )
    attempt = PaymentAttempt(
        id="attempt-future",
        booking_id="booking-future",
        user_id="user-cancel-1",
        amount=20000000,
        status=PaymentAttemptStatus.VERIFIED_SUCCESS,
        idempotency_key="idemp-future-cancel",
    )
    async_session.add_all([slot_future, booking_future, attempt])
    await async_session.commit()

    # Cancel at >= 24h: 90% refund (18,000,000 Rials), slot becomes AVAILABLE
    booking, slot, refunds = await BookingService.cancel_by_user(
        async_session, "booking-future", "user-cancel-1", now_utc
    )
    assert booking.status == BookingStatus.CANCELLED_BY_USER
    assert slot.status == SlotStatus.AVAILABLE
    assert len(refunds) == 1
    assert refunds[0].amount == 18000000
    assert refunds[0].status == RefundStatus.INITIATED

    # Explicit opt-in converts refund to internal store credit
    credit = await RefundService.opt_in_convert_to_store_credit(
        async_session, refunds[0].id, "user-cancel-1", now_utc
    )
    assert credit.amount == 18000000
    assert credit.status == WalletCreditStatus.CREDITED
    assert credit.opt_in_confirmed_at == now_utc
    assert refunds[0].status == RefundStatus.SUCCEEDED


@pytest.mark.asyncio
async def test_club_emergency_cancellation_100_percent_refund(async_session, now_utc):
    """Club emergency cancellation issues 100% refund without penalties."""
    slot = Slot(
        id="slot-club-cancel",
        court_id="court-1",
        start_time=now_utc + timedelta(hours=2),
        end_time=now_utc + timedelta(hours=3, minutes=30),
        price=20000000,
        status=SlotStatus.BOOKED,
    )
    booking = Booking(
        id="booking-club-cancel",
        slot_id="slot-club-cancel",
        host_user_id="user-club-cancel",
        total_amount=20000000,
        paid_amount=20000000,
        status=BookingStatus.CONFIRMED,
    )
    attempt = PaymentAttempt(
        id="attempt-club-cancel",
        booking_id="booking-club-cancel",
        user_id="user-club-cancel",
        amount=20000000,
        status=PaymentAttemptStatus.VERIFIED_SUCCESS,
        idempotency_key="idemp-club-cancel",
    )
    async_session.add_all([slot, booking, attempt])
    await async_session.commit()

    b, s, refunds = await BookingService.cancel_by_club(
        async_session, "booking-club-cancel", "قطع برق مجموعه ورزشی"
    )
    assert b.status == BookingStatus.CANCELLED_BY_CLUB
    assert s.status == SlotStatus.CANCELLED_BY_CLUB
    assert len(refunds) == 1
    assert refunds[0].amount == 20000000
    assert refunds[0].status == RefundStatus.INITIATED

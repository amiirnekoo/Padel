import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy import select
from backend.app.services.booking_service import BookingService
from backend.app.services.payment_service import PaymentService
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.payment import PaymentAttempt
from backend.app.models.refund import Refund

@pytest.mark.asyncio
async def test_booking_flow_happy_path(db_session, seed_data):
    """
    T011 [US1]: Happy path test for atomic hold -> PSP checkout -> PSP callback -> CONFIRMED booking.
    """
    user = seed_data["user"]
    slot = seed_data["slot"]

    # 1. User holds slot
    booking = await BookingService.hold_slot(db_session, slot.id, user.id)
    assert booking.status == "PENDING_PAYMENT"
    assert booking.tracking_code.startswith("PAD-")
    assert booking.amount_paid == 2000000

    # Verify slot is on HOLD
    res = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    current_slot = res.scalar_one()
    assert current_slot.status == "HOLD"
    assert current_slot.held_by_user_id == user.id

    # 2. Initiate PSP checkout
    checkout_data = await PaymentService.create_checkout(db_session, booking.id, user.id)
    assert "payment_url" in checkout_data
    assert "gateway_token" in checkout_data
    gateway_token = checkout_data["gateway_token"]

    # 3. Simulate successful PSP callback within 10-minute hold window
    callback_res = await PaymentService.process_callback(
        db_session,
        gateway_token=gateway_token,
        ref_id="SHP-REF-998877",
        success=True
    )
    assert callback_res["status"] == "CONFIRMED"
    assert callback_res["tracking_code"] == booking.tracking_code

    # 4. Verify DB state
    res_b = await db_session.execute(select(Booking).where(Booking.id == booking.id))
    confirmed_booking = res_b.scalar_one()
    assert confirmed_booking.status == "CONFIRMED"
    assert confirmed_booking.confirmed_at is not None

    res_s = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    booked_slot = res_s.scalar_one()
    assert booked_slot.status == "BOOKED"
    assert booked_slot.hold_expires_at is None

@pytest.mark.asyncio
async def test_booking_flow_late_callback_bank_reversal(db_session, seed_data):
    """
    T011 [US1]: Strict Late Callback test.
    If PSP callback arrives after 10-minute hold expiration:
    1. Booking must be refused (status EXPIRED).
    2. Automatic 100% bank reversal must be initiated (PaymentAttempt status REVERSED).
    3. 100% Refund record created with reason LATE_CALLBACK.
    4. Slot released to AVAILABLE.
    """
    user = seed_data["user"]
    slot = seed_data["slot"]

    # 1. Hold slot
    booking = await BookingService.hold_slot(db_session, slot.id, user.id)

    # 2. Initiate checkout
    checkout_data = await PaymentService.create_checkout(db_session, booking.id, user.id)
    gateway_token = checkout_data["gateway_token"]

    # 3. Simulate passage of time (> 10 minutes) by backdating hold_expires_at
    res = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    s = res.scalar_one()
    s.hold_expires_at = datetime.utcnow() - timedelta(minutes=1)
    await db_session.commit()

    # 4. Callback arrives late!
    callback_res = await PaymentService.process_callback(
        db_session,
        gateway_token=gateway_token,
        ref_id="SHP-REF-LATE-123",
        success=True
    )

    # Must be reversed, not booked
    assert callback_res["status"] == "REVERSED_EXPIRED"

    # Verify booking status is EXPIRED
    res_b = await db_session.execute(select(Booking).where(Booking.id == booking.id))
    b = res_b.scalar_one()
    assert b.status == "EXPIRED"

    # Verify payment attempt is REVERSED
    res_p = await db_session.execute(select(PaymentAttempt).where(PaymentAttempt.gateway_token == gateway_token))
    p = res_p.scalar_one()
    assert p.status == "REVERSED"
    assert p.ref_id == "SHP-REF-LATE-123"

    # Verify 100% refund record
    res_r = await db_session.execute(select(Refund).where(Refund.booking_id == booking.id))
    refund = res_r.scalar_one()
    assert refund.amount == 2000000
    assert refund.penalty_amount == 0
    assert refund.reason == "LATE_CALLBACK"
    assert refund.status == "COMPLETED"

    # Verify slot is AVAILABLE
    res_s = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    released_slot = res_s.scalar_one()
    assert released_slot.status == "AVAILABLE"
    assert released_slot.held_by_user_id is None

@pytest.mark.asyncio
async def test_booking_flow_idempotent_callback(db_session, seed_data):
    """
    T011 [US1]: Webhook idempotency test.
    Calling callback multiple times with same token does not create duplicate refunds or errors.
    """
    user = seed_data["user"]
    slot = seed_data["slot"]

    booking = await BookingService.hold_slot(db_session, slot.id, user.id)
    checkout_data = await PaymentService.create_checkout(db_session, booking.id, user.id)
    token = checkout_data["gateway_token"]

    # First call
    first_res = await PaymentService.process_callback(db_session, token, "REF-111", True)
    assert first_res["status"] == "CONFIRMED"

    # Duplicate call
    dup_res = await PaymentService.process_callback(db_session, token, "REF-111", True)
    assert dup_res["status"] == "SUCCESSFUL"
    assert "قبلاً پردازش شده" in dup_res["message"]

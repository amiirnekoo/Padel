import pytest
from datetime import date, time, datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.wallet import Wallet
from backend.app.models.notification import NotificationLog
from backend.app.services.booking_service import BookingService
from backend.app.services.payment_service import PaymentService
from backend.app.services.wallet_service import WalletService

@pytest.mark.asyncio
async def test_payment_callback_triggers_sms_notifications(db_session: AsyncSession, seed_data):
    user = seed_data["user"]
    slot = seed_data["slot"]

    # 1. User holds slot
    booking = await BookingService.hold_slot(db_session, slot.id, user.id)

    # 2. Checkout created
    checkout = await PaymentService.create_checkout(db_session, booking.id, user.id)
    gateway_token = checkout["gateway_token"]

    # 3. Gateway callback processed with success
    callback_res = await PaymentService.process_callback(
        db_session,
        gateway_token=gateway_token,
        ref_id="SHP-TX-998877",
        success=True
    )
    assert callback_res["status"] == "CONFIRMED"

    # 4. Assert Notification logs created for player confirmation and operator alert
    logs_stmt = select(NotificationLog).order_by(NotificationLog.created_at)
    res = await db_session.execute(logs_stmt)
    logs = res.scalars().all()

    event_types = [log.event_type for log in logs]
    assert "BOOKING_CONFIRMATION_PLAYER" in event_types
    assert "BOOKING_ALERT_OPERATOR" in event_types

@pytest.mark.asyncio
async def test_cancellation_refunds_to_wallet_and_sends_sms(db_session: AsyncSession, seed_data):
    user = seed_data["user"]
    court = seed_data["court"]

    # Create slot 3 days in the future
    future_date = date.today() + timedelta(days=3)
    future_slot = TimeSlot(
        court_id=court.id,
        slot_date=future_date,
        start_time=time(14, 0),
        end_time=time(15, 30),
        price=1000000,
        status="AVAILABLE"
    )
    db_session.add(future_slot)
    await db_session.commit()
    await db_session.refresh(future_slot)

    # Hold and simulate confirmed payment
    booking = await BookingService.hold_slot(db_session, future_slot.id, user.id)
    booking.status = "CONFIRMED"
    booking.confirmed_at = datetime.utcnow()
    future_slot.status = "BOOKED"
    future_slot.hold_expires_at = None
    await db_session.commit()

    # Cancel booking (> 24 hours) -> 90% refund expected (900,000 IRR)
    refund = await BookingService.cancel_booking(db_session, booking.id, user.id)
    assert refund.amount == 900000
    assert refund.penalty_amount == 100000

    # Verify wallet was credited
    wallet_stmt = select(Wallet).where(Wallet.user_id == user.id)
    w_res = await db_session.execute(wallet_stmt)
    wallet = w_res.scalar_one_or_none()
    assert wallet is not None
    assert wallet.balance == 900000

    # Verify notification log
    logs_stmt = select(NotificationLog).where(NotificationLog.event_type == "BOOKING_CANCELLATION_REFUND")
    res = await db_session.execute(logs_stmt)
    refund_logs = res.scalars().all()
    assert len(refund_logs) >= 1
    assert refund_logs[0].recipient == user.phone_number

@pytest.mark.asyncio
async def test_wallet_pay_held_booking_atomic(db_session: AsyncSession, seed_data):
    user = seed_data["user"]
    slot = seed_data["slot"]

    # Pre-fund user wallet with 3,000,000
    await WalletService.top_up_wallet(db_session, user.id, 3000000, reference_id="INIT-123")

    # User holds slot (2,000,000)
    booking = await BookingService.hold_slot(db_session, slot.id, user.id)
    assert booking.status == "PENDING_PAYMENT"

    # User pays using wallet
    updated_booking = await WalletService.pay_booking_with_wallet(
        db_session,
        user_id=user.id,
        slot_id=slot.id,
        booking_id=booking.id
    )

    assert updated_booking.id == booking.id
    assert updated_booking.status == "CONFIRMED"
    assert updated_booking.payment_method == "WALLET"

    # Check slot is booked
    await db_session.refresh(slot)
    assert slot.status == "BOOKED"

    # Check remaining wallet balance: 3,000,000 - 2,000,000 = 1,000,000
    wallet = await WalletService.get_or_create_wallet(db_session, user.id)
    assert wallet.balance == 1000000

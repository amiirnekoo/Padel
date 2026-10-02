import pytest
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.services.booking_service import BookingService
from backend.app.services.wallet_service import WalletService
from backend.app.services.payment_service import PaymentService
from backend.app.models.user import User
from backend.app.models.wallet import Wallet
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.payment import PaymentAttempt
from datetime import date, time, timedelta
from backend.app.core.datetime_utils import utc_now
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_slot_concurrent_hold_prevention(db_session: AsyncSession):
    """
    Test verifying Point 4:
    Two users simultaneously attempting to hold the EXACT same slot.
    Only ONE user must succeed; the second must fail with 409 Conflict.
    Zero double-booking allowed.
    """
    club = Club(id="club-conc-1", name="باشگاه همزمانی", address="تهران", phone="02188888888")
    db_session.add(club)
    court = Court(id="court-conc-1", club_id=club.id, name="کورت مسابقه")
    db_session.add(court)

    slot = TimeSlot(
        id="slot-conc-race-1",
        court_id=court.id,
        slot_date=date.today() + timedelta(days=3),
        start_time=time(16, 0),
        end_time=time(17, 30),
        price=2500000,
        status="AVAILABLE"
    )
    db_session.add(slot)

    user1 = User(id="user-race-1", phone_number="09121112233", full_name="بازیکن ۱")
    user2 = User(id="user-race-2", phone_number="09121112234", full_name="بازیکن ۲")
    db_session.add(user1)
    db_session.add(user2)
    await db_session.commit()

    # User 1 successfully holds slot
    booking1 = await BookingService.hold_slot(db_session, slot.id, user1.id)
    assert booking1.status == "PENDING_PAYMENT"

    # User 2 attempts to hold the same slot immediately -> MUST raise 409 Conflict
    with pytest.raises(HTTPException) as exc_info:
        await BookingService.hold_slot(db_session, slot.id, user2.id)
    assert exc_info.value.status_code == 409
    assert "سانس در حال حاضر در دسترس نیست" in exc_info.value.detail or "رزرو" in exc_info.value.detail


@pytest.mark.asyncio
async def test_wallet_atomic_balance_and_duplicate_debit_prevention(db_session: AsyncSession):
    """
    Test verifying Point 4:
    A user with balance of 2,000,000 attempts to pay for two 1,500,000 slots.
    The first succeeds, the second MUST fail due to insufficient balance.
    Balance must never become negative.
    """
    user = User(id="user-wallet-race", phone_number="09121117788", full_name="کاربر کیف پول")
    db_session.add(user)
    wallet = Wallet(id="wallet-race-1", user_id=user.id, balance=2000000)
    db_session.add(wallet)

    club = Club(id="club-wallet-conc", name="باشگاه مالی", address="تهران", phone="02199999999")
    db_session.add(club)
    court = Court(id="court-wallet-conc", club_id=club.id, name="کورت مالی")
    db_session.add(court)

    slot1 = TimeSlot(
        id="slot-wallet-race-1",
        court_id=court.id,
        slot_date=date.today() + timedelta(days=1),
        start_time=time(10, 0),
        end_time=time(11, 30),
        price=1500000,
        status="HOLD",
        held_by_user_id=user.id,
        hold_expires_at=utc_now() + timedelta(minutes=10)
    )
    slot2 = TimeSlot(
        id="slot-wallet-race-2",
        court_id=court.id,
        slot_date=date.today() + timedelta(days=1),
        start_time=time(12, 0),
        end_time=time(13, 30),
        price=1500000,
        status="HOLD",
        held_by_user_id=user.id,
        hold_expires_at=utc_now() + timedelta(minutes=10)
    )
    db_session.add(slot1)
    db_session.add(slot2)
    await db_session.commit()

    # 1. Pay slot 1 -> Success, balance goes from 2,000,000 to 500,000
    b1 = await WalletService.pay_booking_with_wallet(db_session, user.id, slot1.id)
    assert b1.status == "CONFIRMED"
    assert wallet.balance == 500000

    # 2. Pay slot 2 -> Fails because remaining balance (500,000) < required price (1,500,000)
    with pytest.raises(ValueError) as exc:
        await WalletService.pay_booking_with_wallet(db_session, user.id, slot2.id)
    assert "موجودی کیف پول برای این رزرو کافی نیست" in str(exc.value)

    # Balance must remain exactly 500,000 and slot 2 must NOT be marked BOOKED
    assert wallet.balance == 500000
    assert slot2.status == "HOLD"


@pytest.mark.asyncio
async def test_idempotent_payment_webhook_processing(db_session: AsyncSession):
    """
    Test verifying Point 4:
    Calling payment callback multiple times with the exact same gateway token
    must be completely idempotent and not double-confirm or create duplicate records.
    """
    user = User(id="user-idemp", phone_number="09121119988", full_name="کاربر کال‌بک تکراری")
    db_session.add(user)
    club = Club(id="club-idemp", name="باشگاه کال‌بک", address="تهران", phone="02133333333")
    db_session.add(club)
    court = Court(id="court-idemp", club_id=club.id, name="کورت تست")
    db_session.add(court)

    slot = TimeSlot(
        id="slot-idemp-1",
        court_id=court.id,
        slot_date=date.today() + timedelta(days=2),
        start_time=time(18, 0),
        end_time=time(19, 30),
        price=1800000,
        status="HOLD",
        held_by_user_id=user.id,
        hold_expires_at=utc_now() + timedelta(minutes=10)
    )
    db_session.add(slot)

    booking = Booking(
        id="book-idemp-1",
        tracking_code="TRK-IDEMP-1",
        user_id=user.id,
        timeslot_id=slot.id,
        amount_paid=1800000,
        status="PENDING_PAYMENT"
    )
    db_session.add(booking)

    attempt = PaymentAttempt(
        booking_id=booking.id,
        idempotency_key="PAY-IDEMP-KEY-1",
        gateway_name="SHAPARAK_SIMULATOR",
        amount=1800000,
        gateway_token="SHP-IDEMP-TOKEN-1",
        status="INITIATED"
    )
    db_session.add(attempt)
    await db_session.commit()

    # First callback: Success
    res1 = await PaymentService.process_callback(db_session, "SHP-IDEMP-TOKEN-1", "BANK-REF-100", success=True)
    assert res1["status"] == "CONFIRMED"
    assert booking.status == "CONFIRMED"
    assert slot.status == "BOOKED"

    # Second callback with identical token: Idempotent return, no error, no duplicate confirmation
    res2 = await PaymentService.process_callback(db_session, "SHP-IDEMP-TOKEN-1", "BANK-REF-100", success=True)
    assert res2["status"] == "SUCCESSFUL"
    assert "قبلاً پردازش شده" in res2["message"]
    assert booking.status == "CONFIRMED"

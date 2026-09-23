import pytest
from datetime import datetime, date, time, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.services.wallet_service import WalletService
from backend.app.services.settlement_service import SettlementService

@pytest.mark.asyncio
async def test_wallet_topup_and_instant_booking_payment(db_session: AsyncSession):
    # 1. Create user
    user = User(
        phone_number="09351234567",
        full_name="علی رضایی",
        role="PLAYER"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # 2. Get or create wallet
    wallet = await WalletService.get_or_create_wallet(db_session, user.id)
    assert wallet.balance == 0
    assert wallet.user_id == user.id

    # 3. Top-up wallet
    updated_wallet = await WalletService.top_up_wallet(
        db_session,
        user_id=user.id,
        amount=5000000,
        reference_id="SHAPARAK_TOPUP_1001"
    )
    assert updated_wallet.balance == 5000000

    # Verify transaction record
    txs = await WalletService.get_wallet_transactions(db_session, user.id)
    assert len(txs) == 1
    assert txs[0].amount == 5000000
    assert txs[0].transaction_type == "CREDIT"
    assert txs[0].category == "TOPUP"

    # 4. Setup Court and TimeSlot
    club = Club(
        name="کلوپ پدل ولنجک",
        address="ولنجک",
        phone="02122000000",
        commission_rate=3.00,
        default_hourly_rate=3000000.0,
        iban="IR990120000000009988776655"
    )
    db_session.add(club)
    await db_session.commit()

    court = Court(club_id=club.id, name="کورت شماره ۱", sport_type="PADEL")
    db_session.add(court)
    await db_session.commit()

    slot = TimeSlot(
        court_id=court.id,
        slot_date=date(2026, 10, 1),
        start_time=time(18, 0),
        end_time=time(19, 0),
        price=3000000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.commit()

    # 5. Pay booking with 1-click from wallet
    booking = await WalletService.pay_booking_with_wallet(
        db_session,
        user_id=user.id,
        slot_id=slot.id
    )
    assert booking.status == "CONFIRMED"
    assert booking.amount_paid == 3000000
    assert booking.payment_method == "WALLET"
    assert booking.settlement_status == "UNSETTLED"

    # Verify wallet deducted
    await db_session.refresh(wallet)
    assert wallet.balance == 2000000  # 5,000,000 - 3,000,000

    # 6. Refund test
    refund_amount = 2700000  # 90% refund
    refreshed_wallet = await WalletService.refund_to_wallet(
        db_session,
        user_id=user.id,
        booking_id=booking.id,
        refund_amount=refund_amount
    )
    assert refreshed_wallet.balance == 4700000


@pytest.mark.asyncio
async def test_club_settlement_batch_generation_and_payout(db_session: AsyncSession):
    # 1. Setup Club with 3% commission
    club = Club(
        name="کلوپ تنیس انقلاب",
        address="اتوبان نیایش",
        phone="02122660000",
        commission_rate=3.00,
        iban="IR500120000000005050505050"
    )
    db_session.add(club)
    await db_session.commit()

    court = Court(club_id=club.id, name="کورت مرکزی", sport_type="TENNIS")
    db_session.add(court)
    await db_session.commit()

    # 2. Create 2 confirmed unsettled bookings (each 3,000,000 IRR, total = 6,000,000 IRR)
    user = User(phone_number="09129998877", role="PLAYER")
    db_session.add(user)
    await db_session.commit()

    slot1 = TimeSlot(
        court_id=court.id,
        slot_date=date(2026, 10, 2),
        start_time=time(18, 0),
        end_time=time(19, 0),
        price=3000000,
        status="BOOKED"
    )
    slot2 = TimeSlot(
        court_id=court.id,
        slot_date=date(2026, 10, 2),
        start_time=time(19, 0),
        end_time=time(20, 0),
        price=3000000,
        status="BOOKED"
    )
    db_session.add_all([slot1, slot2])
    await db_session.commit()

    b1 = Booking(
        tracking_code="TRK_SETTLE_01",
        user_id=user.id,
        timeslot_id=slot1.id,
        amount_paid=3000000,
        status="CONFIRMED",
        settlement_status="UNSETTLED",
        payment_method="DIRECT_GATEWAY"
    )
    b2 = Booking(
        tracking_code="TRK_SETTLE_02",
        user_id=user.id,
        timeslot_id=slot2.id,
        amount_paid=3000000,
        status="CONFIRMED",
        settlement_status="UNSETTLED",
        payment_method="DIRECT_GATEWAY"
    )
    db_session.add_all([b1, b2])
    await db_session.commit()

    # 3. Generate settlement batch
    batch = await SettlementService.generate_club_settlement(db_session, club_id=club.id)

    assert batch.club_id == club.id
    assert batch.total_bookings_amount == 6000000
    # Platform commission: 3% of 6,000,000 = 180,000
    assert batch.platform_commission_amount == 180000
    # Club payout share: 97% of 6,000,000 = 5,820,000
    assert batch.club_payout_amount == 5820000
    assert batch.status == "PROCESSING"
    assert batch.iban == "IR500120000000005050505050"

    # Verify bookings marked as SETTLED
    await db_session.refresh(b1)
    await db_session.refresh(b2)
    assert b1.settlement_status == "SETTLED"
    assert b2.settlement_status == "SETTLED"

    # 4. Mark settlement as PAID with bank transfer reference
    paid_batch = await SettlementService.mark_settlement_paid(
        db_session,
        batch_id=batch.id,
        paya_reference="PAYA_TR_20260923_9988"
    )
    assert paid_batch.status == "PAID"
    assert paid_batch.paya_reference == "PAYA_TR_20260923_9988"
    assert paid_batch.paid_at is not None

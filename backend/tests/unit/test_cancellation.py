import pytest
from datetime import datetime, timedelta, date, time
from fastapi import HTTPException
from sqlalchemy import select
from backend.app.services.booking_service import BookingService
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.refund import Refund

@pytest.mark.asyncio
async def test_cancellation_over_24h_refunds_90_percent(db_session, seed_data):
    """
    T028 [US4]: Player cancels >= 24h before slot start time.
    Rule: 90% refund, 10% penalty, slot released to AVAILABLE.
    """
    user = seed_data["user"]
    court = seed_data["court"]

    # Create slot starting 48 hours from now
    future_date = date.today() + timedelta(days=2)
    slot = TimeSlot(
        court_id=court.id,
        slot_date=future_date,
        start_time=time(18, 0),
        end_time=time(19, 30),
        price=1000000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.commit()

    # Create confirmed booking
    booking = await BookingService.hold_slot(db_session, slot.id, user.id)
    booking.status = "CONFIRMED"
    slot.status = "BOOKED"
    slot.hold_expires_at = None
    await db_session.commit()

    # Cancel booking
    refund = await BookingService.cancel_booking(db_session, booking.id, user.id, is_club_emergency=False)

    assert refund.amount == 900000
    assert refund.penalty_amount == 100000
    assert refund.reason == "USER_CANCELLATION_OVER_24H"

    # Verify booking status
    res_b = await db_session.execute(select(Booking).where(Booking.id == booking.id))
    b = res_b.scalar_one()
    assert b.status == "CANCELLED_BY_USER"
    assert b.cancelled_at is not None

    # Verify slot is AVAILABLE
    res_s = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    s = res_s.scalar_one()
    assert s.status == "AVAILABLE"

@pytest.mark.asyncio
async def test_cancellation_sub_24h_non_refundable(db_session, seed_data):
    """
    T028 [US4]: Player cancels < 24h before slot start time.
    Rule: 0% refund, 100% penalty, slot released to AVAILABLE.
    """
    user = seed_data["user"]
    court = seed_data["court"]

    # Create slot starting in 4 hours
    today = date.today()
    slot_time = (datetime.utcnow() + timedelta(hours=4)).time()
    slot = TimeSlot(
        court_id=court.id,
        slot_date=today,
        start_time=slot_time,
        end_time=time(23, 59),
        price=1000000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.commit()

    # Create confirmed booking
    booking = await BookingService.hold_slot(db_session, slot.id, user.id)
    booking.status = "CONFIRMED"
    slot.status = "BOOKED"
    slot.hold_expires_at = None
    await db_session.commit()

    # Cancel booking
    refund = await BookingService.cancel_booking(db_session, booking.id, user.id, is_club_emergency=False)

    assert refund.amount == 0
    assert refund.penalty_amount == 1000000
    assert refund.reason == "USER_CANCELLATION_SUB_24H"

    # Verify slot is released to AVAILABLE
    res_s = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    s = res_s.scalar_one()
    assert s.status == "AVAILABLE"

@pytest.mark.asyncio
async def test_club_emergency_cancellation_100_percent_refund(db_session, seed_data):
    """
    T028 [US4]: Club operator cancels slot due to weather/maintenance emergency.
    Rule: 100% refund, 0% penalty, reason CLUB_EMERGENCY.
    """
    user = seed_data["user"]
    court = seed_data["court"]

    today = date.today()
    slot = TimeSlot(
        court_id=court.id,
        slot_date=today,
        start_time=time(20, 0),
        end_time=time(21, 30),
        price=1500000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.commit()

    booking = await BookingService.hold_slot(db_session, slot.id, user.id)
    booking.status = "CONFIRMED"
    slot.status = "BOOKED"
    slot.hold_expires_at = None
    await db_session.commit()

    # Club cancels
    refund = await BookingService.cancel_booking(db_session, booking.id, user_id=None, is_club_emergency=True)

    assert refund.amount == 1500000
    assert refund.penalty_amount == 0
    assert refund.reason == "CLUB_EMERGENCY"

    res_b = await db_session.execute(select(Booking).where(Booking.id == booking.id))
    b = res_b.scalar_one()
    assert b.status == "CANCELLED_BY_CLUB"

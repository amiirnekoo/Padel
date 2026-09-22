import pytest
from datetime import datetime, timedelta, date
from sqlalchemy import select
from backend.app.services.booking_service import BookingService
from backend.app.services.cleanup_worker import cleanup_expired_holds
from backend.app.models.slot import TimeSlot
from backend.app.models.user import User

@pytest.mark.asyncio
async def test_lazy_expiration_in_calendar(db_session, seed_data):
    """
    T024 [US3]: A slot with an expired hold is dynamically shown as AVAILABLE in get_club_calendar.
    """
    slot = seed_data["slot"]
    user = seed_data["user"]
    club = seed_data["club"]

    # Hold the slot
    await BookingService.hold_slot(db_session, slot.id, user.id)

    # Manually expire the hold
    res = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    s = res.scalar_one()
    s.hold_expires_at = datetime.utcnow() - timedelta(seconds=10)
    await db_session.commit()

    # Query calendar
    calendar = await BookingService.get_club_calendar(db_session, club.id, date.today())
    court_slots = calendar["courts"][0]["slots"]
    target_slot = next(item for item in court_slots if item["slot_id"] == slot.id)

    assert target_slot["status"] == "AVAILABLE"

@pytest.mark.asyncio
async def test_lazy_expiration_on_new_hold(db_session, seed_data):
    """
    T024 [US3]: When a stale hold exists, a new user can immediately acquire the slot via lazy release.
    """
    slot = seed_data["slot"]
    user = seed_data["user"]

    # First user holds slot
    await BookingService.hold_slot(db_session, slot.id, user.id)

    # Manually expire the hold
    res = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    s = res.scalar_one()
    s.hold_expires_at = datetime.utcnow() - timedelta(minutes=5)
    await db_session.commit()

    # Create second user
    user2 = User(id="user-2", phone_number="09123333333", full_name="سارا بازیکن")
    db_session.add(user2)
    await db_session.commit()

    # Second user requests hold -> Should succeed via lazy expiration
    booking2 = await BookingService.hold_slot(db_session, slot.id, user2.id)
    assert booking2.user_id == user2.id
    assert booking2.status == "PENDING_PAYMENT"

    # Verify slot is held by user2
    res_s = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    updated_slot = res_s.scalar_one()
    assert updated_slot.status == "HOLD"
    assert updated_slot.held_by_user_id == user2.id

@pytest.mark.asyncio
async def test_cleanup_worker_resets_expired_holds(session_factory, seed_data):
    """
    T024 [US3]: Background worker cleans up expired holds in batch.
    """
    slot = seed_data["slot"]
    user = seed_data["user"]

    async with session_factory() as session:
        await BookingService.hold_slot(session, slot.id, user.id)
        res = await session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
        s = res.scalar_one()
        s.hold_expires_at = datetime.utcnow() - timedelta(minutes=15)
        await session.commit()

    # Run cleanup worker
    cleaned_count = await cleanup_expired_holds(session_factory)
    assert cleaned_count >= 1

    # Verify slot is AVAILABLE in DB
    async with session_factory() as session:
        res = await session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
        s = res.scalar_one()
        assert s.status == "AVAILABLE"
        assert s.held_by_user_id is None
        assert s.hold_expires_at is None

import asyncio
import pytest
from fastapi import HTTPException
from backend.app.services.booking_service import BookingService
from backend.app.models.user import User

@pytest.mark.asyncio
async def test_slot_concurrency_zero_double_booking(session_factory, seed_data):
    """
    T010 [US1]: Stress test verifying that when 10 concurrent users attempt
    to hold the exact same AVAILABLE slot, exactly 1 succeeds and 9 receive HTTP 409 Conflict.
    Zero double-booking rate guaranteed.
    """
    slot = seed_data["slot"]

    # Create 10 distinct users in the database
    user_ids = [f"player-{i}" for i in range(1, 11)]
    async with session_factory() as session:
        for uid in user_ids:
            session.add(User(id=uid, phone_number=f"091200000{uid.split('-')[1].zfill(2)}", full_name=f"Player {uid}"))
        await session.commit()

    successes = []
    conflicts = []
    errors = []

    async def attempt_hold(user_id: str):
        async with session_factory() as session:
            try:
                booking = await BookingService.hold_slot(session, slot.id, user_id)
                successes.append((user_id, booking))
            except HTTPException as e:
                if e.status_code == 409:
                    conflicts.append((user_id, e.detail))
                else:
                    errors.append((user_id, e))
            except Exception as e:
                errors.append((user_id, e))

    # Execute all 10 hold requests concurrently
    tasks = [attempt_hold(uid) for uid in user_ids]
    await asyncio.gather(*tasks)

    # Invariants:
    # 1. Exactly 1 user acquired the hold
    assert len(successes) == 1, f"Expected exactly 1 success, got {len(successes)}: {successes}. Errors: {errors}"
    # 2. Exactly 9 users got 409 Conflict
    assert len(conflicts) == 9, f"Expected 9 conflicts, got {len(conflicts)}: {conflicts}"
    # 3. No other errors occurred
    assert len(errors) == 0, f"Unexpected errors occurred: {errors}"

    # 4. Verify DB state for slot
    async with session_factory() as session:
        from backend.app.models.slot import TimeSlot
        from sqlalchemy import select
        res = await session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
        updated_slot = res.scalar_one()

        winning_user_id = successes[0][0]
        assert updated_slot.status == "HOLD"
        assert updated_slot.held_by_user_id == winning_user_id
        assert updated_slot.hold_expires_at is not None

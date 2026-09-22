import pytest
from datetime import date, time
from fastapi import HTTPException
from sqlalchemy import select
from backend.app.services.operator_service import OperatorService
from backend.app.services.booking_service import BookingService
from backend.app.models.slot import TimeSlot

@pytest.mark.asyncio
async def test_tournament_slot_allocation(db_session, seed_data):
    """
    T032 [US5]: Operator allocates multiple consecutive slots to a tournament (TOURNAMENT_HOLD).
    Regular players are prevented from holding them.
    """
    court = seed_data["court"]
    operator = seed_data["operator"]
    user = seed_data["user"]

    slot1 = TimeSlot(
        court_id=court.id,
        slot_date=date.today(),
        start_time=time(10, 0),
        end_time=time(11, 30),
        price=1200000,
        status="AVAILABLE"
    )
    slot2 = TimeSlot(
        court_id=court.id,
        slot_date=date.today(),
        start_time=time(11, 30),
        end_time=time(13, 0),
        price=1200000,
        status="AVAILABLE"
    )
    db_session.add_all([slot1, slot2])
    await db_session.commit()

    # Operator allocates slots to tournament
    updated = await OperatorService.allocate_tournament_slots(
        db_session, [slot1.id, slot2.id], operator.club_id
    )
    assert len(updated) == 2
    assert all(s.status == "TOURNAMENT_HOLD" for s in updated)

    # Regular player attempts to hold tournament slot -> 409 Conflict
    with pytest.raises(HTTPException) as exc_info:
        await BookingService.hold_slot(db_session, slot1.id, user.id)
    assert exc_info.value.status_code == 409

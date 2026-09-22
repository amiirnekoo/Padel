import pytest
from fastapi import HTTPException
from sqlalchemy import select
from backend.app.services.operator_service import OperatorService
from backend.app.services.booking_service import BookingService
from backend.app.models.slot import TimeSlot

@pytest.mark.asyncio
async def test_operator_block_and_unblock_cycle(db_session, seed_data):
    """
    T020 [US2]: Operator blocks an available slot; online users cannot hold it;
    operator unblocks it; online users can now hold it.
    """
    slot = seed_data["slot"]
    operator = seed_data["operator"]
    user = seed_data["user"]

    # 1. Operator blocks slot for walk-in / phone reservation
    blocked_slot = await OperatorService.block_slot(db_session, slot.id, operator.club_id)
    assert blocked_slot.status == "BLOCKED"

    # 2. Player attempts to hold blocked slot -> Expect HTTP 409 Conflict
    with pytest.raises(HTTPException) as exc_info:
        await BookingService.hold_slot(db_session, slot.id, user.id)
    assert exc_info.value.status_code == 409

    # 3. Operator unblocks the slot
    unblocked_slot = await OperatorService.unblock_slot(db_session, slot.id, operator.club_id)
    assert unblocked_slot.status == "AVAILABLE"

    # 4. Player attempts to hold now-available slot -> Success
    booking = await BookingService.hold_slot(db_session, slot.id, user.id)
    assert booking.status == "PENDING_PAYMENT"

@pytest.mark.asyncio
async def test_operator_cannot_block_booked_slot(db_session, seed_data):
    """
    T020 [US2]: Operator attempts to block an already BOOKED slot -> Expect HTTP 409 Conflict.
    """
    slot = seed_data["slot"]
    operator = seed_data["operator"]

    # Set slot status to BOOKED
    res = await db_session.execute(select(TimeSlot).where(TimeSlot.id == slot.id))
    s = res.scalar_one()
    s.status = "BOOKED"
    await db_session.commit()

    # Operator tries to block
    with pytest.raises(HTTPException) as exc_info:
        await OperatorService.block_slot(db_session, slot.id, operator.club_id)
    assert exc_info.value.status_code == 409
    assert "قبلاً آنلاین رزرو شده" in exc_info.value.detail

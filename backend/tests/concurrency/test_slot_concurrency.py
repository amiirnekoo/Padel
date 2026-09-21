import asyncio
import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from backend.app.models.base import Base
from backend.app.models.club import Club
from backend.app.models.court import Court
from backend.app.models.slot import Slot
from backend.app.models.enums import SlotStatus
from backend.app.services.slot_service import SlotService, SlotConflictError


@pytest.mark.asyncio
async def test_concurrent_slot_hold_race_condition(tmp_path):
    """
    Simulate 10 concurrent players attempting to acquire the SAME slot.
    Guarantees that exactly 1 player succeeds and 9 players fail with SlotConflictError.
    Zero-Overbooking Invariant is verified under concurrency!
    """
    now = datetime(2026, 9, 21, 12, 0, 0, tzinfo=timezone.utc)
    db_file = tmp_path / "test_concurrency.db"
    engine = create_async_engine(f"sqlite+aiosqlite:///{db_file}", echo=False)
    async with engine.begin() as conn:
        await conn.execute(text("PRAGMA journal_mode=WAL"))
        await conn.execute(text("PRAGMA busy_timeout=10000"))
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    # Setup club, court, and available slot
    async with session_factory() as session:
        club = Club(id="club-c", name="باشگاه تست هم‌روندی", phone="02199999999")
        court = Court(id="court-c", club_id="club-c", name="زمین مرکزی")
        slot = Slot(
            id="slot-race-1",
            court_id="court-c",
            start_time=now + timedelta(hours=3),
            end_time=now + timedelta(hours=4, minutes=30),
            price=20000000,
            status=SlotStatus.AVAILABLE,
        )
        session.add_all([club, court, slot])
        await session.commit()

    successes = []
    conflicts = []

    async def try_acquire(user_index: int):
        async with session_factory() as session:
            try:
                s, b = await SlotService.acquire_single_hold(
                    session, "slot-race-1", f"player-{user_index}", now
                )
                await session.commit()
                successes.append(user_index)
            except SlotConflictError:
                conflicts.append(user_index)

    # Launch 10 simultaneous acquisition attempts
    tasks = [try_acquire(i) for i in range(10)]
    await asyncio.gather(*tasks)

    # Exactly 1 success, 9 conflicts
    assert len(successes) == 1, f"Expected exactly 1 success, but got {len(successes)}"
    assert len(conflicts) == 9, f"Expected 9 conflicts, but got {len(conflicts)}"

    # Check slot final state in DB
    async with session_factory() as session:
        final_slot = (await session.get(Slot, "slot-race-1"))
        assert final_slot.status == SlotStatus.HOLD_SINGLE
        assert final_slot.booking_id is not None

    await engine.dispose()

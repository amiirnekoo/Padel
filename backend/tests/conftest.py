import asyncio
from datetime import date, time, datetime, timedelta
import pytest
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.app.models import Base, Club, Court, TimeSlot, User, Booking, PaymentAttempt, Refund

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def test_engine():
    import os
    import uuid
    db_file = f"test_{uuid.uuid4().hex[:8]}.db"
    engine = create_async_engine(
        f"sqlite+aiosqlite:///{db_file}",
        connect_args={"check_same_thread": False, "timeout": 30},
        echo=False
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass

@pytest.fixture
def session_factory(test_engine):
    return async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)

@pytest.fixture
async def db_session(session_factory):
    async with session_factory() as session:
        yield session

@pytest.fixture
async def seed_data(db_session: AsyncSession):
    club = Club(id="club-1", name="باشگاه انقلاب پدل", address="تهران، خیابان سئول", phone="02122000000")
    db_session.add(club)

    court = Court(id="court-1", club_id="club-1", name="کورت سنترال", sport_type="PADEL")
    db_session.add(court)

    user = User(id="user-1", phone_number="09121111111", full_name="علی بازیکن")
    db_session.add(user)

    operator = User(id="op-1", phone_number="09122222222", full_name="متصدی باجه", role="CLUB_OPERATOR", club_id="club-1")
    db_session.add(operator)

    slot = TimeSlot(
        id="slot-1",
        court_id="court-1",
        slot_date=date.today(),
        start_time=time(18, 0),
        end_time=time(19, 30),
        price=2000000,
        status="AVAILABLE"
    )
    db_session.add(slot)

    await db_session.commit()
    return {"club": club, "court": court, "user": user, "operator": operator, "slot": slot}

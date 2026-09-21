import pytest
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from backend.app.models.base import Base
from backend.app.models.club import Club
from backend.app.models.court import Court


@pytest.fixture
def now_utc():
    return datetime(2026, 9, 21, 12, 0, 0, tzinfo=timezone.utc)


@pytest.fixture
async def async_session():
    # SQLite async in-memory database
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with session_factory() as session:
        # Seed initial Club and Court
        club = Club(id="club-1", name="پدل کلاب تهران", phone="02188888888")
        court = Court(id="court-1", club_id="club-1", name="زمین شماره ۱")
        session.add(club)
        session.add(court)
        await session.commit()
        yield session

    await engine.dispose()

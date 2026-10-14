import pytest
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.app.models.base import Base
from backend.app.models.user import User
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.matchmaking import MatchmakingGame, MatchResult
from backend.app.services.player_profile_service import PlayerProfileService

@pytest.fixture
async def async_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    session_factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    
    await engine.dispose()

@pytest.mark.asyncio
async def test_get_player_profile_metrics(async_session: AsyncSession):
    # ساخت کاربر با مشخصات و ریتینگ
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        phone_number="09121112233",
        full_name="امیرحسین نکوزاده",
        role="PLAYER",
        city="تهران",
        dominant_hand="RIGHT",
        preferred_side="RIGHT",
        racket_name="NOX AT10 Genius 18K",
        elo_rating=1600,
        matches_played=20,
        matches_won=15,
        skill_level="B-"
    )
    async_session.add(user)
    await async_session.commit()

    profile = await PlayerProfileService.get_player_profile(async_session, user_id)
    assert profile is not None
    assert profile["id"] == user_id
    assert profile["full_name"] == "امیرحسین نکوزاده"
    assert profile["city"] == "تهران"
    assert profile["elo_rating"] == 1600
    assert profile["skill_tier"] == "B-"
    assert profile["matches_played"] == 20
    assert profile["matches_won"] == 15
    assert profile["win_rate"] == 75.0
    assert profile["dominant_hand"] == "RIGHT"
    assert profile["preferred_side"] == "RIGHT"
    assert profile["racket_name"] == "NOX AT10 Genius 18K"
    assert len(profile["badges"]) >= 2  # حداقل دو بج باید کسب کرده باشد

@pytest.mark.asyncio
async def test_player_match_history_log(async_session: AsyncSession):
    # ساخت ۴ بازیکن، کلوپ، کورت و بازی تکمیل شده
    p1 = User(id="u1", phone_number="09120000001", full_name="بازیکن اول", elo_rating=1300, matches_played=1, matches_won=1)
    p2 = User(id="u2", phone_number="09120000002", full_name="بازیکن دوم", elo_rating=1250, matches_played=1, matches_won=1)
    p3 = User(id="u3", phone_number="09120000003", full_name="بازیکن سوم", elo_rating=1200, matches_played=1, matches_won=0)
    p4 = User(id="u4", phone_number="09120000004", full_name="بازیکن چهارم", elo_rating=1180, matches_played=1, matches_won=0)
    
    import datetime
    club = Club(id="c1", name="باشگاه پدل FGB انقلاب", address="مجموعه انقلاب", city="تهران", phone="02122000000")
    court = Court(id="crt1", club_id="c1", name="کورت سنترال ۱")
    ts = TimeSlot(
        id="ts1",
        court_id="crt1",
        slot_date=datetime.date(2026, 10, 14),
        start_time=datetime.time(18, 0),
        end_time=datetime.time(19, 30),
        price=1600000
    )
    
    async_session.add_all([p1, p2, p3, p4, club, court, ts])
    await async_session.commit()

    game = MatchmakingGame(
        id="game-101",
        club_id="c1",
        court_id="crt1",
        timeslot_id="ts1",
        title="بازی رقابتی آدینه",
        skill_level="C+",
        total_price=1600000,
        price_per_player=400000,
        status="COMPLETED",
        team_a_right_user_id="u1",
        team_a_left_user_id="u2",
        team_b_right_user_id="u3",
        team_b_left_user_id="u4"
    )
    async_session.add(game)
    await async_session.commit()

    # نتیجه مسابقه: برد تیم A با نتیجه ۶-۳، ۶-۴
    result = MatchResult(
        id="res-101",
        game_id="game-101",
        team_a_set1=6, team_b_set1=3,
        team_a_set2=6, team_b_set2=4,
        winning_team="TEAM_A",
        team_a_rating_change=16,
        team_b_rating_change=-16,
        submitted_by_user_id="u1"
    )
    async_session.add(result)
    await async_session.commit()

    # بررسی پروفایل بازیکن برنده (u1)
    profile_u1 = await PlayerProfileService.get_player_profile(async_session, "u1")
    assert len(profile_u1["recent_matches"]) == 1
    match_item = profile_u1["recent_matches"][0]
    assert match_item["game_id"] == "game-101"
    assert match_item["club_name"] == "باشگاه پدل FGB انقلاب"
    assert match_item["court_name"] == "کورت سنترال ۱"
    assert match_item["won"] is True
    assert match_item["rating_change"] == 16
    assert match_item["partner_name"] == "بازیکن دوم"
    assert "بازیکن سوم" in match_item["opponents"]
    assert match_item["score_summary"] == "6-3, 6-4"

    # بررسی پروفایل بازیکن بازنده (u3)
    profile_u3 = await PlayerProfileService.get_player_profile(async_session, "u3")
    assert len(profile_u3["recent_matches"]) == 1
    match_item_u3 = profile_u3["recent_matches"][0]
    assert match_item_u3["won"] is False
    assert match_item_u3["rating_change"] == -16
    assert match_item_u3["partner_name"] == "بازیکن چهارم"

@pytest.mark.asyncio
async def test_update_player_sports_profile(async_session: AsyncSession):
    user = User(id="u-edit", phone_number="09129998877", full_name="رضا صادقی", role="PLAYER")
    async_session.add(user)
    await async_session.commit()

    updated = await PlayerProfileService.update_sports_profile(
        async_session,
        user_id="u-edit",
        dominant_hand="LEFT",
        preferred_side="LEFT",
        racket_name="Bullpadel Vertex 04",
        city="شیراز"
    )
    assert updated["dominant_hand"] == "LEFT"
    assert updated["preferred_side"] == "LEFT"
    assert updated["racket_name"] == "Bullpadel Vertex 04"
    assert updated["city"] == "شیراز"

    # بررسی مجدد از دیتابیس
    recheck = await PlayerProfileService.get_player_profile(async_session, "u-edit")
    assert recheck["dominant_hand"] == "LEFT"
    assert recheck["preferred_side"] == "LEFT"
    assert recheck["racket_name"] == "Bullpadel Vertex 04"

@pytest.mark.asyncio
async def test_player_profile_api(async_session: AsyncSession):
    from httpx import AsyncClient, ASGITransport
    from backend.app.main import app
    from backend.app.core.database import get_db

    async def override_get_db():
        yield async_session

    app.dependency_overrides[get_db] = override_get_db

    user = User(
        id="u-api-test",
        phone_number="09123334455",
        full_name="کیوان پدلیست",
        role="PLAYER",
        city="اصفهان",
        elo_rating=1420
    )
    async_session.add(user)
    await async_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/players/u-api-test/profile")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["data"]["full_name"] == "کیوان پدلیست"
        assert data["data"]["elo_rating"] == 1420
        assert data["data"]["city"] == "اصفهان"

    app.dependency_overrides.clear()

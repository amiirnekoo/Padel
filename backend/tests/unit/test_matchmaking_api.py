import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date, time
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.main import app
from backend.app.models.club import Club, Court
from backend.app.models.user import User
from backend.app.models.slot import TimeSlot
from backend.app.models.base import get_db_session

@pytest.mark.asyncio
async def test_court_and_matchmaking_api_flow(db_session: AsyncSession):
    # Override database dependency for FastAPI client
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db

    # 1. Setup seed club, court, slot, and user
    club = Club(id="club-api-1", name="کلوپ پدل زعفرانیه", address="زعفرانیه", phone="02122003344")
    db_session.add(club)
    await db_session.commit()

    court = Court(id="court-api-1", club_id=club.id, name="کورت مرکزی", sport_type="PADEL", hourly_rate=2400000)
    db_session.add(court)
    await db_session.commit()

    slot = TimeSlot(
        id="slot-api-1",
        court_id=court.id,
        slot_date=date.today(),
        start_time=time(17, 0),
        end_time=time(18, 30),
        price=2400000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.commit()

    user = User(id="user-api-1", phone_number="09129998877", full_name="سروش رالی", role="PLAYER")
    db_session.add(user)
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Add another court to club
        court_payload = {
            "name": "کورت شماره ۲ پانورامیک",
            "sport_type": "PADEL",
            "surface_type": "چمن مصنوعی آبی موندو",
            "is_indoor": False,
            "has_lighting": True,
            "hourly_rate": 2800000,
            "image_url": "/images/courts/court_panoramic.jpg"
        }
        res_court = await client.post(f"/api/v1/venues/{club.id}/courts", json=court_payload)
        assert res_court.status_code == 200
        assert res_court.json()["success"] is True

        # 3. Create matchmaking game
        mm_payload = {
            "club_id": club.id,
            "court_id": court.id,
            "timeslot_id": slot.id,
            "skill_level": "D+",
            "creator_id": user.id,
            "creator_position": "TEAM_A_RIGHT",
            "title": "بازی پدل بعدازظهر سطح D+",
            "gender_category": "OPEN"
        }
        res_mm = await client.post("/api/v1/matchmaking/create", json=mm_payload)
        assert res_mm.status_code == 200
        data = res_mm.json()
        assert data["success"] is True
        game_id = data["game_id"]
        assert data["price_per_player"] == 600000  # 2,400,000 / 4

        # 4. List matchmaking games
        res_list = await client.get("/api/v1/matchmaking?status=OPEN")
        assert res_list.status_code == 200
        games = res_list.json()
        assert len(games) >= 1
        target_game = next(g for g in games if g["id"] == game_id)
        assert target_game["skill_level"] == "D+"
        assert target_game["positions"]["team_a_right"]["user_name"] == "سروش رالی"
        assert target_game["positions"]["team_a_left"]["user_id"] is None

    app.dependency_overrides.clear()

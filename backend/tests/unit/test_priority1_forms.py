import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.models.base import Base, engine, async_session_factory
from backend.app.models.club import Club, ClubReview
from backend.app.models.coach import CoachProfile, CoachBookingRequest
from backend.app.models.tournament import Tournament, TournamentRegistration

@pytest_asyncio.fixture(autouse=True)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

@pytest.mark.asyncio
async def test_coach_booking_request_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Player submits coaching request
        payload = {
            "student_name": "سروش پارسا",
            "student_phone": "09121119988",
            "requested_date": "فردا عصر (باشگاه پدل انقلاب)",
            "skill_level": "INTERMEDIATE",
            "training_goal": "اصلاح والیه و ضربه باندخا",
            "club_name": "مجموعه پدل انقلاب"
        }
        res = await ac.post("/api/v1/coaches/coach-1/requests", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["success"] is True
        request_id = data["request"]["id"]
        assert data["request"]["student_name"] == "سروش پارسا"
        assert data["request"]["status"] == "PENDING"

        # 2. Coach views incoming requests
        res_list = await ac.get("/api/v1/coaches/coach-1/requests")
        assert res_list.status_code == 200
        reqs = res_list.json()
        assert any(r["id"] == request_id for r in reqs)

        # 3. Coach accepts the request
        res_patch = await ac.patch(f"/api/v1/coaches/requests/{request_id}", json={"status": "ACCEPTED"})
        assert res_patch.status_code == 200
        assert res_patch.json()["request"]["status"] == "ACCEPTED"

@pytest.mark.asyncio
async def test_tournament_registration_flow():
    import uuid
    uid = uuid.uuid4().hex[:6]
    tourn_id = f"tourn-test-{uid}"
    tourn_slug = f"tehran-spring-cup-{uid}"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # First ensure a test tournament exists
        async with async_session_factory() as session:
            from datetime import date
            t = Tournament(
                id=tourn_id,
                title="جام پدل بهاره تهران",
                slug=tourn_slug,
                cover_image="/images/rally_tournament.jpg",
                venue_name="مجموعه انقلاب",
                start_date=date.today(),
                end_date=date.today(),
                max_teams=16,
                registered_teams_count=2
            )
            session.add(t)
            await session.commit()

        # Register team
        reg_payload = {
            "team_name": "تیم ستارگان پدل",
            "partner_name": "کیانوش افشار",
            "contact_phone": "09123334455"
        }
        res = await ac.post(f"/api/v1/tournaments/{tourn_id}/register", json=reg_payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["success"] is True
        assert data["registration"]["team_name"] == "تیم ستارگان پدل"
        assert data["registered_teams_count"] == 3

        # List registrations for the tournament
        res_list = await ac.get(f"/api/v1/tournaments/{tourn_id}/registrations")
        assert res_list.status_code == 200
        registrations = res_list.json()
        assert any(r["team_name"] == "تیم ستارگان پدل" for r in registrations)

@pytest.mark.asyncio
async def test_club_reviews_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        club_id = "club-enghelab"
        # 1. Post a new review
        review_payload = {
            "user_name": "حمیدرضا باقری",
            "rating": 4.8,
            "turf_score": 5.0,
            "light_score": 4.5,
            "amenities_score": 5.0,
            "comment": "کیفیت زمین عالی و رفتار پرسنل بسیار محترمانه بود."
        }
        res = await ac.post(f"/api/v1/venues/{club_id}/reviews", json=review_payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["success"] is True
        review_id = data["review"]["id"]
        assert data["review"]["user_name"] == "حمیدرضا باقری"

        # 2. Get reviews for the club
        res_get = await ac.get(f"/api/v1/venues/{club_id}/reviews")
        assert res_get.status_code == 200
        reviews = res_get.json()
        assert any(r["id"] == review_id for r in reviews)

        # 3. Like the review
        res_like = await ac.post(f"/api/v1/venues/reviews/{review_id}/like")
        assert res_like.status_code == 200
        assert res_like.json()["likes_count"] >= 1

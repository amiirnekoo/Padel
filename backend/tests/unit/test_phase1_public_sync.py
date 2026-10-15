import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.models.base import Base, engine, async_session_factory
from backend.app.models.user import User
from backend.app.models.coach import CoachProfile
import uuid

@pytest_asyncio.fixture(autouse=True)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

@pytest.mark.asyncio
async def test_public_coaches_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/coaches/public")
        assert res.status_code == 200, res.text
        data = res.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        coach = data[0]
        assert "id" in coach
        assert "name" in coach
        assert "hourlyRate" in coach
        assert "sport" in coach

@pytest.mark.asyncio
async def test_admin_coaches_approval_flow():
    # 1. Create a coach in DB
    uid = uuid.uuid4().hex[:6]
    coach_user_id = f"coach-user-{uid}"
    async with async_session_factory() as session:
        user = User(
            id=coach_user_id,
            phone_number=f"0912{uid}88",
            full_name=f"مربی تستی {uid}",
            role="COACH"
        )
        session.add(user)
        await session.flush()
        profile = CoachProfile(
            id=f"c-{uid}",
            user_id=coach_user_id,
            certification_id="FIP-TEST-100",
            sport_types="PADEL",
            bio="مربی رسمی تستی",
            hourly_rate=1200000,
            is_verified=False
        )
        session.add(profile)
        await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Check admin list
        res_admin = await ac.get("/api/v1/coaches/admin/all")
        assert res_admin.status_code == 200
        coaches_list = res_admin.json()
        target = next((c for c in coaches_list if c["id"] == f"c-{uid}"), None)
        assert target is not None
        assert target["is_verified"] is False

        # Approve coach
        res_approve = await ac.post(f"/api/v1/coaches/admin/c-{uid}/status", json={"is_verified": True})
        assert res_approve.status_code == 200
        assert res_approve.json()["is_verified"] is True

        # Now verify appears in public list
        res_public = await ac.get("/api/v1/coaches/public")
        assert res_public.status_code == 200
        public_coaches = res_public.json()
        assert any(c["id"] == f"c-{uid}" for c in public_coaches)

@pytest.mark.asyncio
async def test_public_content_and_rankings_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Articles
        res_articles = await ac.get("/api/v1/content/articles")
        assert res_articles.status_code == 200
        assert isinstance(res_articles.json(), list)

        # 2. Rankings
        res_rankings = await ac.get("/api/v1/content/rankings?category=MEN_PRO")
        assert res_rankings.status_code == 200
        assert isinstance(res_rankings.json(), list)

        # 3. Tournaments
        res_tourn = await ac.get("/api/v1/tournaments/public")
        assert res_tourn.status_code == 200
        assert isinstance(res_tourn.json(), list)

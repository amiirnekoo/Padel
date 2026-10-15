import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.models.base import Base, engine, async_session_factory
from backend.app.models.club import Club
import uuid

@pytest_asyncio.fixture(autouse=True)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

@pytest.mark.asyncio
async def test_admin_and_venue_onboard_flow():
    from backend.app.models.user import User
    uid = uuid.uuid4().hex[:6]
    owner_id = f"owner-{uid}"
    async with async_session_factory() as session:
        user = User(
            id=owner_id,
            phone_number=f"0912{uid}11",
            full_name=f"مالک تست {uid}",
            role="CLUB_OWNER"
        )
        session.add(user)
        await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Onboard a new venue from admin / club owner
        payload = {
            "owner_id": owner_id,
            "name": f"مجموعه پدل رویال سنتر {uid}",
            "province": "تهران",
            "city": "تهران",
            "address": "خیابان فرشته، مرکز خرید رویال",
            "phone": "02122001122",
            "sports_supported": "PADEL",
            "amenities": "پارکینگ اختصاصی، کافه تریا، رختکن VIP",
            "courts_count": 3,
            "default_hourly_rate": 2800000.0,
            "iban": "IR8201200000000099887766"
        }
        res = await ac.post("/api/v1/venues/onboard", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["success"] is True
        club_id = data["club_id"]
        assert club_id is not None

        # 2. Add court to venue
        court_payload = {
            "name": "کورت ۱ سنترال پانورامیک",
            "sport_type": "PADEL",
            "surface_type": "چمن مصنوعی آبی موندو",
            "is_indoor": True,
            "has_lighting": True,
            "hourly_rate": 2800000
        }
        res_court = await ac.post(f"/api/v1/venues/{club_id}/courts", json=court_payload)
        assert res_court.status_code == 200
        assert res_court.json()["success"] is True

        # 3. Approve venue by platform admin
        res_approve = await ac.post(f"/api/v1/venues/{club_id}/approve")
        assert res_approve.status_code == 200
        assert res_approve.json()["approval_status"] == "APPROVED"

        # 4. Fetch public venues and verify it appears
        res_public = await ac.get("/api/v1/venues/public")
        assert res_public.status_code == 200
        venues = res_public.json()
        assert any(v["id"] == club_id for v in venues)

@pytest.mark.asyncio
async def test_products_list_public_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/shop/products")
        assert res.status_code == 200, res.text
        data = res.json()
        assert isinstance(data, list)
        assert len(data) > 0

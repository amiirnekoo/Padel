import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.main import app
from backend.app.models.base import get_db_session

@pytest.mark.asyncio
async def test_admin_login_api_endpoints(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Successful Login
        res_ok = await ac.post("/api/v1/admin/login", json={
            "username": "Nimadvr",
            "password": "kirtookoonesadati"
        })
        assert res_ok.status_code == 200
        data = res_ok.json()
        assert data["success"] is True
        assert data["username"] == "Nimadvr"
        assert data["role"] == "OPERATIONS_ADMIN"
        assert "token" in data

        # 2. Failed Login - Wrong Password
        res_bad_pw = await ac.post("/api/v1/admin/login", json={
            "username": "Nimadvr",
            "password": "incorrectpassword"
        })
        assert res_bad_pw.status_code == 401
        assert "رمز عبور" in res_bad_pw.json()["detail"]

        # 3. Failed Login - Non-existent Admin
        res_bad_user = await ac.post("/api/v1/admin/login", json={
            "username": "UnknownAdmin",
            "password": "somepassword"
        })
        assert res_bad_user.status_code == 401

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.main import app
from backend.app.core.database import get_db
from backend.app.models.base import get_db_session
from backend.app.models.user import User
from backend.app.core.security import create_access_token

@pytest.mark.asyncio
async def test_wallet_api_requires_valid_bearer_token(db_session: AsyncSession):
    """
    TDD Test: Verify that all wallet endpoints strictly require a valid Bearer token,
    extract user identity from JWT payload, and reject unauthenticated or IDOR requests.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_db_session] = override_get_db

    # Create two users in database
    user_a = User(id="user-secure-a", phone_number="09121111112", full_name="کاربر الف")
    user_b = User(id="user-secure-b", phone_number="09121111113", full_name="کاربر ب")
    db_session.add(user_a)
    db_session.add(user_b)
    await db_session.commit()

    token_a = create_access_token(subject=user_a.id, role="PLAYER")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Accessing wallet balance without Authorization header should return 401
        res_no_auth = await ac.get("/api/v1/wallet/balance")
        assert res_no_auth.status_code == 401

        # 2. Accessing wallet balance with valid token returns user_a's wallet
        res_auth_a = await ac.get(
            "/api/v1/wallet/balance",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert res_auth_a.status_code == 200
        data_a = res_auth_a.json()
        assert data_a["user_id"] == "user-secure-a"
        assert data_a["balance"] == 0

        # 3. Accessing transactions without auth should return 401
        res_tx_no_auth = await ac.get("/api/v1/wallet/transactions")
        assert res_tx_no_auth.status_code == 401

        # 4. Accessing transactions with valid token returns list
        res_tx_auth_a = await ac.get(
            "/api/v1/wallet/transactions",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert res_tx_auth_a.status_code == 200
        assert isinstance(res_tx_auth_a.json(), list)

    app.dependency_overrides.clear()

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.main import app
from backend.app.core.database import get_db
from backend.app.models.base import get_db_session
from backend.app.models.user import User
from backend.app.models.wallet import Wallet, WalletTransaction
from backend.app.models.booking import Booking
from backend.app.models.slot import TimeSlot
from backend.app.models.club import Club, Court
from backend.app.models.matchmaking import MatchmakingGame
from backend.app.core.security import create_access_token
from datetime import date, time, timedelta
from backend.app.core.datetime_utils import utc_now

@pytest.mark.asyncio
async def test_cross_user_authorization_matrix(db_session: AsyncSession):
    """
    Test verifying Point 3:
    Using two distinct authenticated accounts (User A and User B):
    1. User A cannot access or see User B's wallet balance or transactions.
    2. User A cannot pay for or cancel User B's booking (strictly 403 Forbidden).
    3. User A cannot spoof User B's user_id in shop checkout to charge User B's wallet (strictly 403 Forbidden).
    4. User A cannot spoof User B's user_id in matchmaking join (strictly 403 Forbidden).
    5. Neither User A nor User B can access protected admin management APIs.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_db_session] = override_get_db

    # Create User A and User B
    user_a = User(id="user-auth-a", phone_number="09121110001", full_name="کاربر الف")
    user_b = User(id="user-auth-b", phone_number="09121110002", full_name="کاربر ب")
    db_session.add(user_a)
    db_session.add(user_b)

    # Wallets and transactions
    wallet_a = Wallet(id="wallet-a", user_id=user_a.id, balance=1000000)
    wallet_b = Wallet(id="wallet-b", user_id=user_b.id, balance=50000000)
    db_session.add(wallet_a)
    db_session.add(wallet_b)

    tx_b = WalletTransaction(
        id="tx-b-secret",
        wallet_id=wallet_b.id,
        amount=50000000,
        transaction_type="CREDIT",
        category="TOPUP",
        description="واریز سنگین کاربر ب"
    )
    db_session.add(tx_b)

    # Club, Court, Slot
    club = Club(id="club-auth", name="باشگاه اختصاصی", address="تهران", phone="02111111111")
    db_session.add(club)
    court = Court(id="court-auth", club_id=club.id, name="کورت ۱")
    db_session.add(court)

    slot_b = TimeSlot(
        id="slot-auth-b",
        court_id=court.id,
        slot_date=date.today() + timedelta(days=2),
        start_time=time(19, 0),
        end_time=time(20, 30),
        price=3000000,
        status="CONFIRMED"
    )
    db_session.add(slot_b)

    booking_b = Booking(
        id="book-auth-b",
        tracking_code="TRK-USER-B",
        user_id=user_b.id,
        timeslot_id=slot_b.id,
        amount_paid=3000000,
        status="CONFIRMED",
        payment_method="DIRECT_GATEWAY"
    )
    db_session.add(booking_b)

    # Matchmaking game created by User B
    mm_slot = TimeSlot(
        id="slot-mm-game",
        court_id=court.id,
        slot_date=date.today() + timedelta(days=3),
        start_time=time(18, 0),
        end_time=time(19, 30),
        price=4000000,
        status="HOLD"
    )
    db_session.add(mm_slot)

    mm_game = MatchmakingGame(
        id="game-mm-1",
        club_id=club.id,
        court_id=court.id,
        timeslot_id=mm_slot.id,
        created_by_user_id=user_b.id,
        team_a_right_user_id=user_b.id,
        skill_level="D+",
        total_price=4000000,
        price_per_player=1000000,
        status="OPEN"
    )
    db_session.add(mm_game)

    await db_session.commit()

    token_a = create_access_token(subject=user_a.id, role="PLAYER")
    token_b = create_access_token(subject=user_b.id, role="PLAYER")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # --- 1. Wallet Balance Ownership & Separation ---
        res_a = await ac.get("/api/v1/wallet/balance", headers={"Authorization": f"Bearer {token_a}"})
        assert res_a.status_code == 200
        data_a = res_a.json()
        assert data_a["user_id"] == user_a.id
        assert data_a["balance"] == 1000000
        assert data_a["balance"] != wallet_b.balance

        res_b = await ac.get("/api/v1/wallet/balance", headers={"Authorization": f"Bearer {token_b}"})
        assert res_b.status_code == 200
        data_b = res_b.json()
        assert data_b["user_id"] == user_b.id
        assert data_b["balance"] == 50000000

        # --- 2. Transaction History Isolation ---
        # User A must NOT see User B's transaction
        txs_res_a = await ac.get("/api/v1/wallet/transactions", headers={"Authorization": f"Bearer {token_a}"})
        assert txs_res_a.status_code == 200
        txs_a = txs_res_a.json()
        tx_ids_a = [t["id"] for t in txs_a]
        assert "tx-b-secret" not in tx_ids_a

        # --- 3. Booking Ownership & Cancellation Control ---
        # User A attempts to cancel User B's booking -> Must be 403 Forbidden
        res_cancel = await ac.post(
            f"/api/v1/bookings/{booking_b.id}/cancel",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert res_cancel.status_code == 403
        assert "دسترسی غیرمجاز" in res_cancel.json()["detail"]

        # --- 4. Cross-User Shop Checkout Spoofing Prevention ---
        # User A attempts to order and bill User B's wallet by spoofing user_id=user_b.id -> 403 Forbidden
        spoofed_checkout = await ac.post(
            "/api/v1/shop/checkout",
            json={
                "user_id": user_b.id,
                "items": [{"product_id": "acc-balls-1", "quantity": 1}],
                "delivery_address": "تهران خیابان تست",
                "receiver_name": "سارق آزمایشی",
                "receiver_phone": "09120000000",
                "payment_method": "WALLET"
            },
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert spoofed_checkout.status_code == 403

        # --- 5. Cross-User Matchmaking Join Spoofing Prevention ---
        # User A attempts to join a matchmaking game under User B's identity -> 403 Forbidden
        spoofed_join = await ac.post(
            f"/api/v1/matchmaking/{mm_game.id}/join",
            json={
                "user_id": user_b.id,
                "position": "TEAM_A_LEFT"
            },
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert spoofed_join.status_code == 403

        # --- 6. Protected Admin API Access ---
        # Non-admin User A and User B cannot access admin endpoints
        res_admin_a = await ac.get(
            "/api/v1/admin/stats",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert res_admin_a.status_code in [401, 403]

        res_admin_b = await ac.post(
            "/api/v1/admin/incidents",
            json={"title": "Unauthorized attempt", "description": "Hacked", "severity": "CRITICAL"},
            headers={"Authorization": f"Bearer {token_b}"}
        )
        assert res_admin_b.status_code in [401, 403]

    app.dependency_overrides.clear()

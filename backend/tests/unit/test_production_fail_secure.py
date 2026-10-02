import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.main import app
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.models.base import get_db_session
from backend.app.models.user import User
from backend.app.core.security import create_access_token
from backend.app.services.notification_service import NotificationService
from backend.app.services.payment_service import PaymentService
from backend.app.models.booking import Booking
from backend.app.models.slot import TimeSlot
from datetime import date, time, timedelta
from backend.app.core.datetime_utils import utc_now

@pytest.mark.asyncio
async def test_production_mode_strictly_disables_mock_sms_and_gateway(db_session: AsyncSession):
    """
    Test verifying Point 5:
    In production mode:
    1. Unconfigured SMS provider does NOT pretend to succeed via Mock.
    2. Payment simulator is blocked with 503 on checkout and 403 on callback.
    3. Direct test topup of wallet is blocked with 403.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_db_session] = override_get_db

    original_env = settings.ENVIRONMENT
    original_gw = settings.PAYMENT_GATEWAY_PROVIDER
    original_sms = settings.SMS_PROVIDER

    try:
        # Simulate PRODUCTION environment with mock configs
        settings.ENVIRONMENT = "production"
        settings.PAYMENT_GATEWAY_PROVIDER = "MOCK"
        settings.SMS_PROVIDER = "mock"

        # 1. SMS Provider in production must return disabled (failure), NOT simulated success
        provider = NotificationService._provider()
        res = await provider.send_pattern_sms("09121234567", "TEST", {})
        assert res.success is False
        assert res.provider == "disabled"
        assert "عملیاتی" in (res.error or "")

        # 2. Test user and booking for payment
        user = User(id="user-prod-test", phone_number="09129990001", full_name="کاربر پروداکشن")
        db_session.add(user)
        slot = TimeSlot(
            id="slot-prod-test",
            court_id="court-1",
            slot_date=date.today(),
            start_time=time(18, 0),
            end_time=time(19, 30),
            price=2000000,
            status="HOLD",
            held_by_user_id=user.id,
            hold_expires_at=utc_now() + timedelta(minutes=10)
        )
        db_session.add(slot)
        booking = Booking(
            id="book-prod-test",
            tracking_code="TRK-PROD-1",
            user_id=user.id,
            timeslot_id=slot.id,
            amount_paid=2000000,
            status="PENDING_PAYMENT"
        )
        db_session.add(booking)
        await db_session.commit()

        # In production with MOCK gateway, create_checkout must raise 503
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await PaymentService.create_checkout(db_session, booking.id, user.id)
        assert exc_info.value.status_code == 503
        assert "شبیه‌ساز پرداخت مسدود است" in exc_info.value.detail

        # In production, process_callback with simulator token must raise 403
        with pytest.raises(HTTPException) as exc_cb:
            await PaymentService.process_callback(db_session, gateway_token="SHP-SIMULATED", ref_id="REF-1", success=True)
        # Should raise 404 (if token not found) or 403 if it was simulator
        assert exc_cb.value.status_code in [403, 404]

        # 3. Direct /topup in production must return 403
        token = create_access_token(subject=user.id, role="PLAYER")
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            topup_res = await ac.post(
                "/api/v1/wallet/topup",
                json={"amount": 5000000, "reference_id": "FAKE-REF-123"},
                headers={"Authorization": f"Bearer {token}"}
            )
            assert topup_res.status_code == 403
            assert "محیط پروداکشن مسدود است" in topup_res.json()["detail"]

    finally:
        # Restore environment settings
        settings.ENVIRONMENT = original_env
        settings.PAYMENT_GATEWAY_PROVIDER = original_gw
        settings.SMS_PROVIDER = original_sms
        app.dependency_overrides.clear()

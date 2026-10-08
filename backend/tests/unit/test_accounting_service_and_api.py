import pytest
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.main import app
from backend.app.models.base import get_db_session
from backend.app.models.user import User
from backend.app.models.club import Club
from backend.app.models.coach import CoachProfile
from backend.app.core.security import create_access_token
from backend.app.services.accounting_service import AccountingService


@pytest.fixture
async def accounting_setup(db_session: AsyncSession):
    # Club 1 (Lafour)
    club_1 = Club(
        id="club-lavoor-test",
        name="پدل کلاب نیاوران (لفور)",
        city="تهران",
        address="نیاوران",
        phone="02122223333",
        commission_rate=3.0,
        default_hourly_rate=3000000,
        sports_supported="PADEL",
    )
    # Club 2 (Enghelab)
    club_2 = Club(
        id="club-enghelab-test",
        name="پدل انقلاب",
        city="تهران",
        address="سئول",
        phone="02188889999",
        commission_rate=3.0,
        default_hourly_rate=3000000,
        sports_supported="PADEL",
    )
    # Coach 1
    coach_user_1 = User(id="usr-coach-1", phone_number="09121114455", full_name="مربی اول", role="COACH")
    coach_profile_1 = CoachProfile(id="coach-prof-1", user_id="usr-coach-1", certification_id="FIP-LEVEL1", hourly_rate=1500000)

    # Coach 2
    coach_user_2 = User(id="usr-coach-2", phone_number="09121114466", full_name="مربی دوم", role="COACH")
    coach_profile_2 = CoachProfile(id="coach-prof-2", user_id="usr-coach-2", certification_id="FIP-LEVEL2", hourly_rate=2000000)

    # Club Manager User
    manager_user = User(id="usr-manager-1", phone_number="09121114477", full_name="مدیر باشگاه لفور", role="CLUB_OWNER")

    db_session.add_all([club_1, club_2, coach_user_1, coach_profile_1, coach_user_2, coach_profile_2, manager_user])
    await db_session.commit()

    token_manager = create_access_token(subject=manager_user.id, role="CLUB_OWNER")
    token_coach_1 = create_access_token(subject=coach_user_1.id, role="COACH")
    token_coach_2 = create_access_token(subject=coach_user_2.id, role="COACH")

    return {
        "club_1_id": club_1.id,
        "club_2_id": club_2.id,
        "coach_1_id": coach_profile_1.id,
        "coach_2_id": coach_profile_2.id,
        "token_manager": token_manager,
        "token_coach_1": token_coach_1,
        "token_coach_2": token_coach_2,
    }


@pytest.mark.asyncio
async def test_club_accounting_service_crud_and_summary(db_session: AsyncSession, accounting_setup):
    club_id = accounting_setup["club_1_id"]

    # ۱. ثبت درآمد آنلاین رزرو
    tx_income_1 = await AccountingService.create_transaction(
        session=db_session,
        tenant_type="CLUB",
        tenant_id=club_id,
        transaction_type="INCOME",
        category="COURT_BOOKING_ONLINE",
        title="رزرو آنلاین کورت VIP ۱",
        amount=2800000,
        payment_method="ONLINE",
        reference_id="BK-1001",
        contact_name="امیر نکوزاده",
    )
    assert tx_income_1.id is not None
    assert tx_income_1.amount == 2800000

    # ۲. ثبت درآمد باجه حضوری
    tx_income_2 = await AccountingService.create_transaction(
        session=db_session,
        tenant_type="CLUB",
        tenant_id=club_id,
        transaction_type="INCOME",
        category="COURT_BOOKING_MANUAL",
        title="رزرو باجه کورت ۲",
        amount=2200000,
        payment_method="POS",
        reference_id="REC-9002",
        contact_name="مشتری باجه",
    )
    assert tx_income_2.id is not None

    # ۳. ثبت درآمد بوفه و کافه
    await AccountingService.create_transaction(
        session=db_session,
        tenant_type="CLUB",
        tenant_id=club_id,
        transaction_type="INCOME",
        category="BUFFET_CAFE",
        title="فروش نوشیدنی و پروتئین‌بار",
        amount=450000,
        payment_method="POS",
    )

    # ۴. ثبت هزینه قبوض برق و تعمیرات
    tx_exp_1 = await AccountingService.create_transaction(
        session=db_session,
        tenant_type="CLUB",
        tenant_id=club_id,
        transaction_type="EXPENSE",
        category="UTILITIES",
        title="قبض برق پروژکتورهای کورت",
        amount=1200000,
        payment_method="CARD_TO_CARD",
    )
    assert tx_exp_1.id is not None

    tx_exp_2 = await AccountingService.create_transaction(
        session=db_session,
        tenant_type="CLUB",
        tenant_id=club_id,
        transaction_type="EXPENSE",
        category="MAINTENANCE",
        title="برس‌کشی و شارژ سیلیس چمن WPT",
        amount=800000,
        payment_method="CASH",
    )

    # ۵. استعلام خلاصه P&L
    summary = await AccountingService.calculate_summary(
        session=db_session,
        tenant_type="CLUB",
        tenant_id=club_id,
    )

    # درآمد کل: ۲۸۰۰۰۰۰ + ۲۲۰۰۰۰۰ + ۴۵۰۰۰۰ = ۵۴۵۰۰۰۰
    assert summary["total_income"] == 5450000
    # هزینه کل: ۱۲۰۰۰۰۰ + ۸۰۰۰۰۰ = ۲۰۰۰۰۰۰
    assert summary["total_expense"] == 2000000
    # سود خالص: ۵۴۵۰۰۰۰ - ۲۰۰۰۰۰۰ = ۳۴۵۰۰۰۰
    assert summary["net_profit"] == 3450000
    assert summary["transactions_count"] == 5


@pytest.mark.asyncio
async def test_multi_tenant_isolation(db_session: AsyncSession, accounting_setup):
    club_1_id = accounting_setup["club_1_id"]
    club_2_id = accounting_setup["club_2_id"]

    # ثبت درآمد برای باشگاه ۱
    await AccountingService.create_transaction(
        session=db_session,
        tenant_type="CLUB",
        tenant_id=club_1_id,
        transaction_type="INCOME",
        category="COURT_BOOKING_ONLINE",
        title="درآمد اختصاصی باشگاه ۱",
        amount=5000000,
        payment_method="ONLINE",
    )

    # ثبت درآمد برای باشگاه ۲
    await AccountingService.create_transaction(
        session=db_session,
        tenant_type="CLUB",
        tenant_id=club_2_id,
        transaction_type="INCOME",
        category="COURT_BOOKING_ONLINE",
        title="درآمد اختصاصی باشگاه ۲",
        amount=3000000,
        payment_method="ONLINE",
    )

    summary_1 = await AccountingService.calculate_summary(db_session, "CLUB", club_1_id)
    summary_2 = await AccountingService.calculate_summary(db_session, "CLUB", club_2_id)

    assert summary_1["total_income"] == 5000000
    assert summary_2["total_income"] == 3000000

    ledger_1 = await AccountingService.get_ledger(db_session, "CLUB", club_1_id)
    assert len(ledger_1) == 1
    assert ledger_1[0].tenant_id == club_1_id


@pytest.mark.asyncio
async def test_coach_accounting_flow(db_session: AsyncSession, accounting_setup):
    coach_id = accounting_setup["coach_1_id"]

    # درآمد تدریس خصوصی
    await AccountingService.create_transaction(
        session=db_session,
        tenant_type="COACH",
        tenant_id=coach_id,
        transaction_type="INCOME",
        category="PRIVATE_CLASS",
        title="جلسه خصوصی با آقای صادقی",
        amount=1500000,
        payment_method="CARD_TO_CARD",
        contact_name="محمدرضا صادقی",
    )

    # درآمد پکیج ۱۰ جلسه‌ای
    await AccountingService.create_transaction(
        session=db_session,
        tenant_type="COACH",
        tenant_id=coach_id,
        transaction_type="INCOME",
        category="PACKAGE_TUITION",
        title="شهریه پکیج مسترکلاس",
        amount=13500000,
        payment_method="ONLINE",
        contact_name="نگین مرادی",
    )

    # هزینه اجاره کورت
    await AccountingService.create_transaction(
        session=db_session,
        tenant_type="COACH",
        tenant_id=coach_id,
        transaction_type="EXPENSE",
        category="COURT_RENTAL_FEE",
        title="سهم اجاره کورت لفور",
        amount=1000000,
        payment_method="POS",
    )

    # هزینه خرید توپ تمرینی
    await AccountingService.create_transaction(
        session=db_session,
        tenant_type="COACH",
        tenant_id=coach_id,
        transaction_type="EXPENSE",
        category="EQUIPMENT_BALLS",
        title="خرید ۲ تیوب توپ هد پرو",
        amount=900000,
        payment_method="CASH",
    )

    summary = await AccountingService.calculate_summary(db_session, "COACH", coach_id)

    # درآمد کل: ۱۵۰۰۰۰۰ + ۱۳۵۰۰۰۰۰ = ۱۵۰۰۰۰۰۰
    assert summary["total_income"] == 15000000
    # هزینه کل: ۱۰۰۰۰۰۰ + ۹۰۰۰۰۰ = ۱۹۰۰۰۰۰
    assert summary["total_expense"] == 1900000
    # سود خالص: ۱۵۰۰۰۰۰۰ - ۱۹۰۰۰۰۰ = ۱۳۱۰۰۰۰۰
    assert summary["net_profit"] == 13100000


@pytest.mark.asyncio
async def test_accounting_rest_api_endpoints(db_session: AsyncSession, accounting_setup):
    async def override_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_db
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            club_id = accounting_setup["club_1_id"]
            token = accounting_setup["token_manager"]

            # ۱. ثبت تراکنش از طریق API
            payload = {
                "transaction_type": "INCOME",
                "category": "BUFFET_CAFE",
                "title": "فروش بوفه عصرگاهی",
                "amount": 350000,
                "payment_method": "POS",
                "contact_name": "سارا ک.",
            }
            resp = await client.post(
                f"/api/v1/accounting/club/{club_id}/transactions",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
            assert resp.status_code == 201
            data = resp.json()
            assert data["amount"] == 350000
            tx_id = data["id"]

            # ۲. دریافت لیست تراکنش‌ها
            list_resp = await client.get(
                f"/api/v1/accounting/club/{club_id}/transactions",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert list_resp.status_code == 200
            items = list_resp.json()
            assert len(items) >= 1

            # ۳. دریافت خلاصه مالی P&L
            sum_resp = await client.get(
                f"/api/v1/accounting/club/{club_id}/summary",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert sum_resp.status_code == 200
            summary_data = sum_resp.json()
            assert summary_data["total_income"] >= 350000

            # ۴. حذف تراکنش دستی
            del_resp = await client.delete(
                f"/api/v1/accounting/club/{club_id}/transactions/{tx_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert del_resp.status_code == 200
    finally:
        app.dependency_overrides.pop(get_db_session, None)


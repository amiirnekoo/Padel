import pytest
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.models.club import Club, Court
from backend.app.services.venue_service import VenueService
from backend.app.services.crm_service import CrmService

@pytest.mark.asyncio
async def test_venue_onboarding_creates_pending_club_and_courts(db_session: AsyncSession):
    # 1. Create a user who wants to register a venue
    user = User(
        phone_number="09171112233",
        full_name="حمید شیرازی",
        role="PLAYER",
        city="شیراز",
        province="فارس"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # 2. Onboard venue
    venue_payload = {
        "name": "مجموعه پدل و تنیس شیراز اسپرت",
        "province": "فارس",
        "city": "شیراز",
        "address": "بلوار چمران، خیابان نیایش، جنب مجموعه ورزشی",
        "phone": "07136280000",
        "sports_supported": "PADEL,TENNIS",
        "amenities": "پارکینگ، کافه، رختکن، پرو شاپ، نور شب استاندارد",
        "courts_count": 3,
        "default_hourly_rate": 3500000.0,
        "iban": "IR120120000000001234567890",
        "description": "بزرگترین و مجهزترین کلوپ پدل و تنیس جنوب کشور"
    }

    club = await VenueService.register_venue(db_session, owner_id=user.id, data=venue_payload)

    assert club.id is not None
    assert club.name == "مجموعه پدل و تنیس شیراز اسپرت"
    assert club.city == "شیراز"
    assert club.province == "فارس"
    assert club.approval_status == "PENDING_APPROVAL"
    assert float(club.default_hourly_rate) == 3500000.0
    assert club.manager_id == user.id

    # Verify user role upgraded to CLUB_MANAGER
    await db_session.refresh(user)
    assert user.role == "CLUB_MANAGER"
    assert user.club_id == club.id

    # Verify courts created automatically
    courts = await VenueService.get_club_courts(db_session, club.id)
    assert len(courts) == 3
    assert courts[0].sport_type in ["PADEL", "TENNIS"]

    # 3. Test approval by platform admin
    approved_club = await VenueService.approve_venue(db_session, club.id)
    assert approved_club.approval_status == "APPROVED"
    assert approved_club.is_active is True


@pytest.mark.asyncio
async def test_customer_crm_directory_and_profiling(db_session: AsyncSession):
    # 1. Setup multiple customer personas
    owner = User(
        phone_number="09121110001",
        full_name="مهندس علوی",
        role="CLUB_MANAGER",
        city="تهران",
        province="تهران",
        tags="VENUE_OWNER,VIP"
    )
    player = User(
        phone_number="09121110002",
        full_name="سارا کریمی",
        role="PLAYER",
        city="اصفهان",
        province="اصفهان",
        tags="ACTIVE_BOOKER"
    )
    db_session.add_all([owner, player])
    await db_session.commit()

    # 2. Fetch CRM customers directory
    customers = await CrmService.get_customers_directory(db_session)
    assert len(customers) >= 2

    # Check finding player
    player_entry = next((c for c in customers if c["phone_number"] == "09121110002"), None)
    assert player_entry is not None
    assert player_entry["city"] == "اصفهان"
    assert player_entry["role"] == "PLAYER"

    # 3. Update CRM notes and KYC status
    updated = await CrmService.update_customer_crm_profile(
        db_session,
        user_id=player.id,
        notes="مشتری بسیار وفادار؛ تقاضای رزرو هفتگی ثابت دارد.",
        kyc_status="VERIFIED",
        tags=["VIP", "TOURNAMENT_PLAYER"]
    )
    assert updated.kyc_status == "VERIFIED"
    assert "VIP" in updated.tags

    # 4. Fetch Platform KPIs
    kpis = await CrmService.get_platform_kpis(db_session)
    assert kpis["total_customers"] >= 2
    assert "تهران" in kpis["cities_distribution"]

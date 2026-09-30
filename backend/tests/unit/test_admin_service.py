import pytest
from datetime import datetime, date, time
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.user import User
from backend.app.models.wallet import Wallet
from backend.app.services.matchmaking_service import MatchmakingService
from backend.app.services.admin_service import AdminService

@pytest.mark.asyncio
async def test_create_and_resolve_incident(db_session):
    service = AdminService(db_session)
    
    incident = await service.create_incident_report(
        title="شکستگی شیشه انتهای کورت شماره ۲ باشگاه انقلاب",
        severity="CRITICAL",
        category="COURT",
        description="در اثر برخورد شدید شیشه انتهای زمین شماره ۲ ترک خورده و سانس‌های امروز لغو شد.",
        reporter_name="مهدی حسینی (ادمین شیفت)"
    )
    
    assert incident.id is not None
    assert incident.title == "شکستگی شیشه انتهای کورت شماره ۲ باشگاه انقلاب"
    assert incident.severity == "CRITICAL"
    assert incident.is_resolved is False

    # Get incidents
    incidents = await service.get_incidents()
    assert len(incidents) >= 1
    assert any(i.id == incident.id for i in incidents)

    # Resolve incident
    resolved = await service.resolve_incident(incident.id, "شیشه کورت با شیشه سکوریت جدید تعویض شد و کورت عملیاتی است.")
    assert resolved.is_resolved is True
    assert "تعویض شد" in resolved.resolution_notes

@pytest.mark.asyncio
async def test_admin_dashboard_stats(db_session):
    service = AdminService(db_session)
    stats = await service.get_admin_dashboard_stats()
    
    assert "total_clubs" in stats
    assert "total_courts" in stats
    assert "active_matches" in stats
    assert "open_incidents_count" in stats

@pytest.mark.asyncio
async def test_emergency_cancel_match_with_refund(db_session):
    admin_service = AdminService(db_session)

    # 1. Create club, court, slot, and user
    club = Club(name="باشگاه پیام تهران", address="سیدخندان", phone="02188888888")
    db_session.add(club)
    await db_session.flush()

    court = Court(club_id=club.id, name="کورت شماره ۱", sport_type="PADEL", surface_type="PANORAMIC", hourly_rate=1200000)
    db_session.add(court)
    await db_session.flush()

    slot = TimeSlot(
        court_id=court.id,
        slot_date=date(2026, 10, 15),
        start_time=time(18, 0),
        end_time=time(19, 30),
        price=1800000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.flush()

    user = User(full_name="علی رضایی", phone_number="09121111111", role="PLAYER")
    db_session.add(user)
    await db_session.flush()

    wallet = Wallet(user_id=user.id, balance=2000000)
    db_session.add(wallet)
    await db_session.flush()

    # 2. Create matchmaking game & user joins
    game = await MatchmakingService.create_game(
        db=db_session,
        club_id=club.id,
        court_id=court.id,
        timeslot_id=slot.id,
        creator_id=user.id,
        skill_level="D+",
        gender_category="OPEN",
        creator_position="TEAM_A_RIGHT"
    )
    assert game.price_per_player == 450000

    # User's wallet balance after join should be reduced
    await db_session.refresh(wallet)
    assert wallet.balance == 2000000 - 450000

    # 3. Operations admin performs emergency cancellation
    cancelled_game = await admin_service.emergency_cancel_match(
        game_id=game.id,
        reason="نقص فنی نورافکن زمین در شیفت شب",
        admin_name="ادمین عملیاتی"
    )

    assert cancelled_game.status == "CANCELLED"

    # User's wallet balance should be refunded 100%
    await db_session.refresh(wallet)
    assert wallet.balance == 2000000

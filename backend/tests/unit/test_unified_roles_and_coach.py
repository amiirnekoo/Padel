import pytest
from datetime import datetime, date, time
from sqlalchemy import select
from backend.app.models.user import User
from backend.app.models.coach import CoachProfile
from backend.app.models.trainee import CoachTrainee
from backend.app.models.slot import TimeSlot
from backend.app.services.coach_service import CoachService
from backend.app.services.booking_service import BookingService
from backend.app.services.club_service import ClubService

@pytest.mark.asyncio
async def test_unified_player_can_book_court_and_train_with_coach(db_session, seed_data):
    """
    TDD Test 1: Unified Athlete / Player / Trainee.
    A single User with role='PLAYER' can both:
    1. Reserve and hold an online court slot.
    2. Connect as a trainee under a coach with a training package.
    """
    user = seed_data["user"]
    slot = seed_data["slot"]

    # 1. User reserves a court slot
    booking = await BookingService.hold_slot(db_session, slot.id, user.id)
    assert booking.status == "PENDING_PAYMENT"
    assert booking.user_id == user.id

    # 2. Create a Coach user
    coach_user = User(
        id="coach-1",
        phone_number="09127778899",
        full_name="حمیدرضا مربی پدل",
        role="COACH"
    )
    db_session.add(coach_user)
    await db_session.commit()

    # 3. Create coach profile
    coach_profile = await CoachService.register_coach_profile(
        db_session,
        user_id=coach_user.id,
        certification_id="PADEL-CERT-A-102",
        sport_types="PADEL",
        bio="مربی رسمی فدراسیون با سابقه ۱۰ سال آموزش تخصصی پدل",
        hourly_rate=1500000
    )
    assert coach_profile.certification_id == "PADEL-CERT-A-102"
    assert coach_profile.hourly_rate == 1500000

    # 4. Connect unified player as trainee
    connection = await CoachService.connect_trainee(
        db_session,
        coach_id=coach_user.id,
        trainee_id=user.id,
        package_type="MONTHLY_8",
        total_sessions=8
    )
    assert connection.coach_id == coach_user.id
    assert connection.trainee_id == user.id
    assert connection.status == "ACTIVE"
    assert connection.total_sessions == 8
    assert connection.completed_sessions == 0

@pytest.mark.asyncio
async def test_coach_records_session_and_updates_remaining_count(db_session):
    """
    TDD Test 2: Training session tracking.
    When a coach records a completed session, completed_sessions increments
    and status transitions to COMPLETED when remaining reaches 0.
    """
    coach = User(id="coach-2", phone_number="09124445566", full_name="سارا مربی تنیس", role="COACH")
    trainee = User(id="player-2", phone_number="09125556677", full_name="آرمان شاگرد", role="PLAYER")
    db_session.add_all([coach, trainee])
    await db_session.commit()

    conn = await CoachService.connect_trainee(
        db_session,
        coach_id=coach.id,
        trainee_id=trainee.id,
        package_type="SINGLE_SESSION",
        total_sessions=1
    )

    # Record completed session
    updated_conn = await CoachService.record_training_session(db_session, conn.id)
    assert updated_conn.completed_sessions == 1
    assert updated_conn.status == "COMPLETED"

@pytest.mark.asyncio
async def test_club_analytics_and_venue_overview(db_session, seed_data):
    """
    TDD Test 3: Club Manager venue analytics.
    Calculates total courts, available slots, and occupied slots for the venue.
    """
    club = seed_data["club"]
    court = seed_data["court"]

    # Query analytics
    analytics = await ClubService.get_club_analytics(db_session, club.id, date.today())
    assert analytics["club_name"] == club.name
    assert analytics["total_courts"] == 1
    assert analytics["total_slots"] >= 1
    assert "available_slots" in analytics
    assert "booked_slots" in analytics

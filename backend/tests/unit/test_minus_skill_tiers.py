import pytest
from datetime import date, time
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.user import User
from backend.app.services.matchmaking_service import MatchmakingService
from backend.app.services.elo_service import EloRatingService

def test_minus_skill_tier_mapping():
    """
    آزمون نگاشت ریتینگ عددی به سطوح ماینس (D-, C-, B-, A-) و سایر سطوح.
    """
    # سطوح رده D
    assert EloRatingService.get_skill_tier(700) == "D-"
    assert EloRatingService.get_skill_tier(900) == "D"
    assert EloRatingService.get_skill_tier(1050) == "D+"

    # سطوح رده C
    assert EloRatingService.get_skill_tier(1150) == "C-"
    assert EloRatingService.get_skill_tier(1250) == "C"
    assert EloRatingService.get_skill_tier(1550) == "C+"

    # سطوح رده B
    assert EloRatingService.get_skill_tier(1620) == "B-"
    assert EloRatingService.get_skill_tier(1720) == "B"
    assert EloRatingService.get_skill_tier(1820) == "B+"

    # سطوح رده A
    assert EloRatingService.get_skill_tier(1950) == "A-"
    assert EloRatingService.get_skill_tier(2100) == "A"
    assert EloRatingService.get_skill_tier(2300) == "A+"

@pytest.mark.asyncio
async def test_minus_level_lock_in_matchmaking(db_session: AsyncSession):
    """
    آزمون قفل سطح مهارتی برای مچ با سطح ماینس (مثلا C-) و جلوگیری از ورود سطح نامتناسب.
    """
    club = Club(id="club-minus-1", name="باشگاه پدل پاسارگاد", address="سعادت‌آباد", phone="02122220000")
    db_session.add(club)
    await db_session.commit()

    court = Court(id="court-minus-1", club_id=club.id, name="کورت ۱", sport_type="PADEL", hourly_rate=2000000)
    db_session.add(court)
    await db_session.commit()

    slot = TimeSlot(
        id="slot-minus-1",
        court_id=court.id,
        slot_date=date.today(),
        start_time=time(19, 0),
        end_time=time(20, 30),
        price=2000000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.commit()

    # کاربر سطح C- با ریتینگ ۱۱۸۰
    user_c_minus = User(id="u-c-minus", phone_number="09121112233", full_name="بازیکن سطح متوسط ورودی", elo_rating=1180)
    # کاربر سطح پیشرفته B با ریتینگ ۱۷۰۰
    user_b = User(id="u-b", phone_number="09129998877", full_name="بازیکن سطح بالا", elo_rating=1700)

    db_session.add_all([user_c_minus, user_b])
    await db_session.commit()

    # ایجاد بازی مچ‌میکینگ با سطح C- و قفل سطح فعال
    game = await MatchmakingService.create_game(
        db=db_session,
        club_id=club.id,
        court_id=court.id,
        timeslot_id=slot.id,
        skill_level="C-",
        creator_id=user_c_minus.id,
        creator_position="TEAM_A_RIGHT",
        title="بازی متوازن سطح C- پدل",
        level_lock=True
    )

    assert game.skill_level == "C-"
    assert game.level_lock is True
    assert game.min_elo is not None
    assert game.max_elo is not None

    # بازیکن سطح B به دلیل عدم تطابق با بازه C- باید با خطای رد سطح مواجه شود
    with pytest.raises(ValueError, match="سطح ریتینگ شما"):
        await MatchmakingService.join_game(
            db=db_session,
            game_id=game.id,
            user_id=user_b.id,
            position="TEAM_A_LEFT"
        )

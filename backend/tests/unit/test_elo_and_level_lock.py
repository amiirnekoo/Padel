import pytest
from datetime import date, time
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.user import User
from backend.app.models.matchmaking import MatchmakingGame
from backend.app.services.matchmaking_service import MatchmakingService
from backend.app.services.elo_service import EloRatingService

@pytest.mark.asyncio
async def test_doubles_elo_math():
    """
    آزمون اعتبارسنجی فرمول ریاضی ریتینگ Elo دابلز در پدل.
    بررسی Zero-Sum بودن، ضریب تفاضل ست و افزایش بیشتر ریتینگ در صورت برد تیم ضعیف‌تر.
    """
    # سناریو ۱: دو تیم با ریتینگ برابر (هر دو بازیکن ۱۲۰۰)
    team_a = [1200, 1200]
    team_b = [1200, 1200]
    
    # برد ۲-۰ در ست‌های متوالی
    change_a, change_b = EloRatingService.calculate_doubles_elo(
        team_a_ratings=team_a,
        team_b_ratings=team_b,
        team_a_won=True,
        set_scores=[(6, 4), (6, 3)]
    )
    assert change_a > 0
    assert change_b == -change_a
    assert change_a == 18  # K=32 * 1.15 * 0.5 = 18.4 -> 18

    # سناریو ۲: برد ۲-۱ (سه ست سخت) در مقایسه با ۲-۰
    change_a_3sets, _ = EloRatingService.calculate_doubles_elo(
        team_a_ratings=team_a,
        team_b_ratings=team_b,
        team_a_won=True,
        set_scores=[(6, 4), (4, 6), (7, 5)]
    )
    assert change_a_3sets < change_a  # برد ۲-۱ پاداش کمتری نسبت به ۲-۰ مقتدرانه دارد

    # سناریو ۳: برد تیم ضعیف‌تر (آندرداگ) مقابل تیم قوی‌تر
    underdog_team = [1000, 1000]
    favorite_team = [1400, 1400]
    upset_change, _ = EloRatingService.calculate_doubles_elo(
        team_a_ratings=underdog_team,
        team_b_ratings=favorite_team,
        team_a_won=True,
        set_scores=[(6, 4), (6, 4)]
    )
    assert upset_change > change_a  # غافلگیری امتیاز به مراتب بالاتری تولید می‌کند

@pytest.mark.asyncio
async def test_record_match_result_and_user_rating_update(db_session: AsyncSession):
    """
    آزمون ثبت نتیجه مسابقه و اعمال زنده تغییرات ریتینگ Elo روی هر ۴ بازیکن.
    """
    # ۱. ایجاد موجودیت‌های پایه
    club = Club(id="club-elo-1", name="پدل کلاب ونک", address="میدان ونک", phone="02188880000")
    db_session.add(club)
    await db_session.commit()

    court = Court(id="court-elo-1", club_id=club.id, name="کورت شماره ۱", sport_type="PADEL", hourly_rate=2000000)
    db_session.add(court)
    await db_session.commit()

    slot = TimeSlot(
        id="slot-elo-1",
        court_id=court.id,
        slot_date=date.today(),
        start_time=time(18, 0),
        end_time=time(19, 30),
        price=2000000,
        status="BOOKED"
    )
    db_session.add(slot)
    await db_session.commit()

    # ۴ بازیکن با ریتینگ‌های مشخص
    p1 = User(id="p1", phone_number="09121110001", full_name="بازیکن A1", elo_rating=1200, matches_played=0, matches_won=0)
    p2 = User(id="p2", phone_number="09121110002", full_name="بازیکن A2", elo_rating=1200, matches_played=0, matches_won=0)
    p3 = User(id="p3", phone_number="09121110003", full_name="بازیکن B1", elo_rating=1200, matches_played=0, matches_won=0)
    p4 = User(id="p4", phone_number="09121110004", full_name="بازیکن B2", elo_rating=1200, matches_played=0, matches_won=0)
    db_session.add_all([p1, p2, p3, p4])
    await db_session.commit()

    # بازی تایید شده ۴ نفره
    game = MatchmakingGame(
        id="game-elo-1",
        club_id=club.id,
        court_id=court.id,
        timeslot_id=slot.id,
        title="مسابقه رنکینگی پدل رالی",
        skill_level="C",
        total_price=2000000,
        price_per_player=500000,
        status="CONFIRMED",
        team_a_right_user_id=p1.id,
        team_a_left_user_id=p2.id,
        team_b_right_user_id=p3.id,
        team_b_left_user_id=p4.id
    )
    db_session.add(game)
    await db_session.commit()

    # ثبت نتیجه مسابقه: برد تیم A با نتیجه ۶-۳ و ۶-۴
    result = await EloRatingService.record_match_result(
        db=db_session,
        game_id=game.id,
        set_scores=[(6, 3), (6, 4)],
        submitted_by_user_id=p1.id
    )

    assert result["winning_team"] == "TEAM_A"
    assert result["team_a_rating_change"] > 0
    assert result["team_b_rating_change"] < 0
    assert result["status"] == "COMPLETED"

    # بررسی آپدیت وضعیت بازیکنان در دیتابیس
    await db_session.refresh(p1)
    await db_session.refresh(p2)
    await db_session.refresh(p3)
    await db_session.refresh(p4)

    assert p1.elo_rating > 1200
    assert p1.matches_played == 1
    assert p1.matches_won == 1

    assert p2.elo_rating > 1200
    assert p2.matches_played == 1
    assert p2.matches_won == 1

    assert p3.elo_rating < 1200
    assert p3.matches_played == 1
    assert p3.matches_won == 0

    assert p4.elo_rating < 1200
    assert p4.matches_played == 1
    assert p4.matches_won == 0

@pytest.mark.asyncio
async def test_matchmaking_level_lock_protection(db_session: AsyncSession):
    """
    آزمون قفل هوشمند سطح مهارتی در بازی‌های مچ‌میکینگ (Playtomic Level Lock).
    جلوگیری از ورود بازیکنی که ریتینگ آن خارج از محدوده مجاز سطح بازی است.
    """
    club = Club(id="club-lock-1", name="پدل کلاب انقلاب", address="اتوبان نیایش", phone="02126210000")
    db_session.add(club)
    court = Court(id="court-lock-1", club_id=club.id, name="کورت VIP", sport_type="PADEL", hourly_rate=2000000)
    db_session.add(court)
    slot = TimeSlot(
        id="slot-lock-1",
        court_id=court.id,
        slot_date=date.today(),
        start_time=time(20, 0),
        end_time=time(21, 30),
        price=2000000,
        status="AVAILABLE"
    )
    db_session.add(slot)

    # کاربر سازنده بازی در سطح C (ریتینگ ۱۲۵۰)
    creator = User(id="u-creator", phone_number="09120001111", full_name="سازنده مچ", elo_rating=1250)
    # کاربر نامناسب (سطح حرفه‌ای A با ریتینگ ۱۹۰۰)
    pro_player = User(id="u-pro", phone_number="09120002222", full_name="بازیکن حرفه‌ای", elo_rating=1900)
    # کاربر مناسب (سطح C با ریتینگ ۱۳۰۰)
    matching_player = User(id="u-match", phone_number="09120003333", full_name="بازیکن هم‌سطح", elo_rating=1300)

    db_session.add_all([creator, pro_player, matching_player])
    await db_session.commit()

    # ایجاد بازی مچ‌میکینگ با قفل سطح فعال برای سطح C (بازه ریتینگ ۱۱۵۰ الی ۱۴۵۰)
    game = await MatchmakingService.create_game(
        db=db_session,
        club_id=club.id,
        court_id=court.id,
        timeslot_id=slot.id,
        skill_level="C",
        creator_id=creator.id,
        creator_position="TEAM_A_RIGHT",
        title="بازی متوازن سطح C با قفل مهارتی",
        level_lock=True
    )
    assert game.level_lock is True

    # تلاش بازیکن نامناسب (حرفه‌ای) برای ورود باید با خطا مواجه شود
    with pytest.raises(ValueError, match="سطح ریتینگ شما"):
        await MatchmakingService.join_game(
            db=db_session,
            game_id=game.id,
            user_id=pro_player.id,
            position="TEAM_A_LEFT"
        )

    # ورود بازیکن هم‌سطح باید موفق باشد
    updated_game = await MatchmakingService.join_game(
        db=db_session,
        game_id=game.id,
        user_id=matching_player.id,
        position="TEAM_A_LEFT"
    )
    assert updated_game.team_a_left_user_id == matching_player.id

@pytest.mark.asyncio
async def test_elo_and_leaderboard_api(db_session: AsyncSession):
    """آزمون یکپارچه API روت‌های لیدربورد Elo و ارسال نتیجه مسابقه."""
    from httpx import AsyncClient, ASGITransport
    from backend.app.main import app
    from backend.app.models.base import get_db_session

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db

    # کاربر نمونه با ریتینگ
    u = User(id="u-lead-1", phone_number="09127776655", full_name="آرتین قهرمان", elo_rating=1550, matches_played=10, matches_won=8)
    db_session.add(u)
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/matchmaking/elo-leaderboard")
        assert res.status_code == 200
        board = res.json()
        assert len(board) >= 1
        top_player = next(p for p in board if p["user_id"] == u.id)
        assert top_player["full_name"] == "آرتین قهرمان"
        assert top_player["elo_rating"] == 1550
        assert top_player["skill_tier"] == "C+"

    app.dependency_overrides.clear()


import pytest
from datetime import date, time, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models.club import Club, Court
from backend.app.models.user import User
from backend.app.models.slot import TimeSlot
from backend.app.models.wallet import Wallet
from backend.app.services.venue_service import VenueService
from backend.app.services.matchmaking_service import MatchmakingService
from backend.app.services.wallet_service import WalletService

@pytest.mark.asyncio
async def test_owner_adds_court_with_pricing_and_image(db_session: AsyncSession):
    """
    Test 1: Club owner registers a new court with custom pricing, image, and lighting.
    """
    club = Club(
        name="باشگاه پدل پالادیوم",
        address="تهران، زعفرانیه",
        phone="02122001122",
        commission_rate=3.00,
        default_hourly_rate=2500000.0
    )
    db_session.add(club)
    await db_session.commit()
    await db_session.refresh(club)

    court_data = {
        "name": "کورت ۱ پانورامیک شیشه‌ای",
        "sport_type": "PADEL",
        "surface_type": "چمن مصنوعی آبی موندو",
        "is_indoor": False,
        "has_lighting": True,
        "hourly_rate": 2800000,
        "image_url": "/images/courts/padel_panoramic_blue.jpg"
    }

    court = await VenueService.add_court_to_club(db_session, club_id=club.id, court_data=court_data)
    assert court.id is not None
    assert court.name == "کورت ۱ پانورامیک شیشه‌ای"
    assert court.hourly_rate == 2800000
    assert court.has_lighting is True
    assert court.image_url == "/images/courts/padel_panoramic_blue.jpg"

@pytest.mark.asyncio
async def test_create_and_join_4player_padel_matchmaking(db_session: AsyncSession):
    """
    Test 2: Matchmaking game creation (Level D+) for 4 players (2 right, 2 left).
    Players join specific court positions, payment is split 4-ways, and match auto-confirms when full.
    """
    # 1. Setup Club, Court and TimeSlot
    club = Club(name="باشگاه پدل اسپین", address="تهران، نیاوران", phone="02122889900")
    db_session.add(club)
    await db_session.commit()

    court = Court(club_id=club.id, name="کورت VIP", sport_type="PADEL", hourly_rate=2000000)
    db_session.add(court)
    await db_session.commit()

    slot = TimeSlot(
        court_id=court.id,
        slot_date=date.today(),
        start_time=time(19, 0),
        end_time=time(20, 30),
        price=2000000,
        status="AVAILABLE"
    )
    db_session.add(slot)
    await db_session.commit()

    # 2. Setup 4 players with wallet balances
    players = []
    for i in range(1, 5):
        p = User(id=f"match-player-{i}", phone_number=f"0912000000{i}", full_name=f"بازیکن شماره {i}", role="PLAYER")
        db_session.add(p)
        await db_session.commit()
        await WalletService.top_up_wallet(db_session, user_id=p.id, amount=1000000)
        players.append(p)

    # 3. Create a Matchmaking Game with Level D+
    game = await MatchmakingService.create_game(
        db_session,
        club_id=club.id,
        court_id=court.id,
        timeslot_id=slot.id,
        skill_level="D+",
        creator_id=players[0].id,
        creator_position="TEAM_A_RIGHT",
        title="بازی پدل آزاد آخر هفته - سطح D+"
    )

    assert game.id is not None
    assert game.skill_level == "D+"
    assert game.price_per_player == 500000  # 2,000,000 / 4
    assert game.team_a_right_user_id == players[0].id
    assert game.filled_slots_count == 1
    assert game.status == "OPEN"

    # 4. Player 2 joins Team A Left
    game = await MatchmakingService.join_game(
        db_session,
        game_id=game.id,
        user_id=players[1].id,
        position="TEAM_A_LEFT"
    )
    assert game.team_a_left_user_id == players[1].id
    assert game.filled_slots_count == 2
    assert game.status == "OPEN"

    # 5. Player 3 joins Team B Right
    game = await MatchmakingService.join_game(
        db_session,
        game_id=game.id,
        user_id=players[2].id,
        position="TEAM_B_RIGHT"
    )
    assert game.team_b_right_user_id == players[2].id
    assert game.filled_slots_count == 3
    assert game.status == "OPEN"

    # 6. Player 4 joins Team B Left -> Match becomes FULL & CONFIRMED!
    game = await MatchmakingService.join_game(
        db_session,
        game_id=game.id,
        user_id=players[3].id,
        position="TEAM_B_LEFT"
    )
    assert game.team_b_left_user_id == players[3].id
    assert game.filled_slots_count == 4
    assert game.status == "CONFIRMED"

    # Slot should now transition to BOOKED
    await db_session.refresh(slot)
    assert slot.status == "BOOKED"

import pytest
from app.services.americano_service import AmericanoService, AmericanoTournamentState

def test_create_8_player_americano_tournament():
    players = [
        "آرتین قهرمان", "سهراب محمدی", "امیرحسین نکوزاده", "کیان رضایی",
        "بردیا تهرانی", "پویا کریمی", "نیما یوسفی", "فرهاد شمس"
    ]
    tour = AmericanoService.create_tournament(
        title="تورنمنت آخر هفته آمریکانو رالی",
        players=players,
        points_per_match=32,
        club_name="باشگاه پدل انقلاب"
    )
    
    assert tour.title == "تورنمنت آخر هفته آمریکانو رالی"
    assert len(tour.players) == 8
    assert len(tour.rounds) == 7  # 7 rounds for 8 players
    assert tour.points_per_match == 32
    assert len(tour.leaderboard) == 8
    
    # Check each round has 2 matches (2 courts for 8 players)
    for r in tour.rounds:
        assert len(r.matches) == 2
        court_nums = [m.court_number for m in r.matches]
        assert court_nums == [1, 2]
        
    # Check that in Round 1, all 8 players are participating
    r1_players = []
    for m in tour.rounds[0].matches:
        r1_players.extend(m.team_a)
        r1_players.extend(m.team_b)
    assert set(r1_players) == set(players)


def test_record_scores_and_update_leaderboard():
    players = [
        "آرتین", "سهراب", "امیرحسین", "کیان",
        "بردیا", "پویا", "نیما", "فرهاد"
    ]
    tour = AmericanoService.create_tournament(
        title="تست آمریکانو",
        players=players,
        points_per_match=32
    )
    
    # Record Round 1 scores
    # Match 1: (P0, P1) vs (P2, P3) -> 20 - 12
    # Match 2: (P4, P5) vs (P6, P7) -> 18 - 14
    round_1_scores = [
        {"court_number": 1, "score_a": 20, "score_b": 12},
        {"court_number": 2, "score_a": 18, "score_b": 14}
    ]
    
    updated = AmericanoService.record_round_scores(
        tournament_id=tour.id,
        round_index=1,
        match_scores=round_1_scores
    )
    
    assert updated.rounds[0].is_completed is True
    assert updated.current_round_index == 2
    
    # Leaderboard checks
    lb = {p.player_name: p for p in updated.leaderboard}
    
    # Players in Team A match 1: آرتین & سهراب -> 20 pts
    assert lb["آرتین"].total_points == 20
    assert lb["سهراب"].total_points == 20
    assert lb["آرتین"].point_difference == 8  # 20 - 12
    assert lb["آرتین"].matches_won == 1
    
    # Players in Team B match 1: امیرحسین & کیان -> 12 pts
    assert lb["امیرحسین"].total_points == 12
    assert lb["امیرحسین"].point_difference == -8  # 12 - 20
    assert lb["امیرحسین"].matches_won == 0
    
    # Highest ranked should have 20 points
    assert updated.leaderboard[0].total_points == 20
    assert updated.leaderboard[0].rank == 1


def test_validation_invalid_player_count():
    with pytest.raises(ValueError):
        AmericanoService.create_tournament(
            title="تست نامعتبر",
            players=["تنها"]
        )


def test_americano_api_endpoints():
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)
    
    # 1. Generate tournament
    payload = {
        "title": "تورنمنت تست API",
        "players": ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"],
        "points_per_match": 32,
        "club_name": "کلوپ رالی"
    }
    res = client.post("/api/v1/americano/generate", json=payload)
    assert res.status_code == 201
    data = res.json()
    tour_id = data["id"]
    assert data["title"] == "تورنمنت تست API"
    assert len(data["rounds"]) == 7

    # 2. Get tournament
    res_get = client.get(f"/api/v1/americano/{tour_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == tour_id

    # 3. Record Round 1 score
    score_payload = {
        "round_index": 1,
        "scores": [
            {"court_number": 1, "score_a": 20, "score_b": 12},
            {"court_number": 2, "score_a": 16, "score_b": 16}
        ]
    }
    res_score = client.post(f"/api/v1/americano/{tour_id}/round-score", json=score_payload)
    assert res_score.status_code == 200
    updated_data = res_score.json()
    assert updated_data["current_round_index"] == 2
    assert updated_data["rounds"][0]["is_completed"] is True


import uuid
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class AmericanoMatch(BaseModel):
    match_id: str = Field(default_factory=lambda: f"m-{uuid.uuid4().hex[:8]}")
    court_number: int
    team_a: List[str]
    team_b: List[str]
    score_a: Optional[int] = None
    score_b: Optional[int] = None
    is_completed: bool = False


class AmericanoRound(BaseModel):
    round_index: int
    round_name: str
    matches: List[AmericanoMatch]
    is_completed: bool = False


class AmericanoPlayerStanding(BaseModel):
    rank: int = 1
    player_name: str
    matches_played: int = 0
    matches_won: int = 0
    total_points: int = 0
    points_conceded: int = 0
    point_difference: int = 0
    win_rate: float = 0.0


class AmericanoTournamentState(BaseModel):
    id: str = Field(default_factory=lambda: f"amr-{uuid.uuid4().hex[:8]}")
    title: str
    club_name: str = "باشگاه پدل رالی"
    total_players: int = 8
    points_per_match: int = 32
    players: List[str]
    rounds: List[AmericanoRound]
    current_round_index: int = 1
    is_finished: bool = False
    leaderboard: List[AmericanoPlayerStanding] = []


# In-memory store for active tournaments
_TOURNAMENTS: Dict[str, AmericanoTournamentState] = {}

# Canonical 8-player Whist/Americano Schedule (7 rounds, 2 courts per round)
# Indices 0 to 7 mapping to players
SCHED_8 = [
    [((0, 1), (2, 3)), ((4, 5), (6, 7))],
    [((0, 2), (5, 7)), ((1, 3), (4, 6))],
    [((0, 3), (4, 7)), ((1, 2), (5, 6))],
    [((0, 4), (1, 5)), ((2, 7), (3, 6))],
    [((0, 5), (2, 6)), ((1, 7), (3, 4))],
    [((0, 6), (1, 4)), ((2, 5), (3, 7))],
    [((0, 7), (3, 5)), ((1, 6), (2, 4))]
]

# 4-player Americano Schedule (3 rounds, 1 court)
SCHED_4 = [
    [((0, 1), (2, 3))],
    [((0, 2), (1, 3))],
    [((0, 3), (1, 2))]
]


class AmericanoService:
    @staticmethod
    def create_tournament(
        title: str,
        players: List[str],
        points_per_match: int = 32,
        club_name: str = "باشگاه پدل رالی"
    ) -> AmericanoTournamentState:
        if len(players) < 4:
            raise ValueError("تعداد بازیکنان برای تورنمنت آمریکانو باید حداقل ۴ نفر باشد.")

        # Normalize players list (pad with guest players if needed to reach 8 or 4)
        target_count = 8 if len(players) > 4 else 4
        padded_players = list(players[:target_count])
        while len(padded_players) < target_count:
            padded_players.append(f"بازیکن میهمان {len(padded_players) + 1}")

        schedule_template = SCHED_8 if target_count == 8 else SCHED_4
        generated_rounds: List[AmericanoRound] = []

        for r_idx, round_matches in enumerate(schedule_template):
            matches_list: List[AmericanoMatch] = []
            for court_idx, ((t1_a, t1_b), (t2_a, t2_b)) in enumerate(round_matches):
                matches_list.append(
                    AmericanoMatch(
                        court_number=court_idx + 1,
                        team_a=[padded_players[t1_a], padded_players[t1_b]],
                        team_b=[padded_players[t2_a], padded_players[t2_b]],
                        score_a=None,
                        score_b=None,
                        is_completed=False,
                    )
                )
            generated_rounds.append(
                AmericanoRound(
                    round_index=r_idx + 1,
                    round_name=f"راند {r_idx + 1}",
                    matches=matches_list,
                    is_completed=False,
                )
            )

        initial_leaderboard = [
            AmericanoPlayerStanding(
                rank=i + 1,
                player_name=name,
                matches_played=0,
                matches_won=0,
                total_points=0,
                points_conceded=0,
                point_difference=0,
                win_rate=0.0
            )
            for i, name in enumerate(padded_players)
        ]

        state = AmericanoTournamentState(
            title=title,
            club_name=club_name,
            total_players=target_count,
            points_per_match=points_per_match,
            players=padded_players,
            rounds=generated_rounds,
            current_round_index=1,
            is_finished=False,
            leaderboard=initial_leaderboard
        )

        _TOURNAMENTS[state.id] = state
        return state

    @staticmethod
    def get_tournament(tournament_id: str) -> Optional[AmericanoTournamentState]:
        return _TOURNAMENTS.get(tournament_id)

    @staticmethod
    def record_round_scores(
        tournament_id: str,
        round_index: int,
        match_scores: List[Dict[str, Any]]
    ) -> AmericanoTournamentState:
        state = _TOURNAMENTS.get(tournament_id)
        if not state:
            raise KeyError(f"تورنمنت با شناسه {tournament_id} یافت نشد.")

        target_round = None
        for r in state.rounds:
            if r.round_index == round_index:
                target_round = r
                break

        if not target_round:
            raise ValueError(f"راند شماره {round_index} وجود ندارد.")

        # Map match scores
        score_by_court = {item["court_number"]: (int(item["score_a"]), int(item["score_b"])) for item in match_scores}

        for match in target_round.matches:
            if match.court_number in score_by_court:
                sa, sb = score_by_court[match.court_number]
                match.score_a = sa
                match.score_b = sb
                match.is_completed = True

        target_round.is_completed = all(m.is_completed for m in target_round.matches)

        # Advance current round index if appropriate
        if target_round.is_completed and state.current_round_index == round_index:
            if round_index < len(state.rounds):
                state.current_round_index = round_index + 1
            else:
                state.is_finished = True

        # Recompute leaderboard
        AmericanoService._recalculate_leaderboard(state)
        return state

    @staticmethod
    def _recalculate_leaderboard(state: AmericanoTournamentState) -> None:
        stats: Dict[str, Dict[str, Any]] = {
            p: {
                "matches_played": 0,
                "matches_won": 0,
                "total_points": 0,
                "points_conceded": 0,
            }
            for p in state.players
        }

        for r in state.rounds:
            for m in r.matches:
                if m.is_completed and m.score_a is not None and m.score_b is not None:
                    sa, sb = m.score_a, m.score_b
                    # Team A
                    for p in m.team_a:
                        stats[p]["matches_played"] += 1
                        stats[p]["total_points"] += sa
                        stats[p]["points_conceded"] += sb
                        if sa > sb:
                            stats[p]["matches_won"] += 1
                    # Team B
                    for p in m.team_b:
                        stats[p]["matches_played"] += 1
                        stats[p]["total_points"] += sb
                        stats[p]["points_conceded"] += sa
                        if sb > sa:
                            stats[p]["matches_won"] += 1

        leaderboard_items: List[AmericanoPlayerStanding] = []
        for name, data in stats.items():
            mp = data["matches_played"]
            mw = data["matches_won"]
            tp = data["total_points"]
            pc = data["points_conceded"]
            pd = tp - pc
            wr = round((mw / mp) * 100, 1) if mp > 0 else 0.0

            leaderboard_items.append(
                AmericanoPlayerStanding(
                    rank=1,
                    player_name=name,
                    matches_played=mp,
                    matches_won=mw,
                    total_points=tp,
                    points_conceded=pc,
                    point_difference=pd,
                    win_rate=wr
                )
            )

        # Sort: total_points desc, point_difference desc, matches_won desc
        leaderboard_items.sort(
            key=lambda x: (x.total_points, x.point_difference, x.matches_won),
            reverse=True
        )

        for rank_idx, item in enumerate(leaderboard_items):
            item.rank = rank_idx + 1

        state.leaderboard = leaderboard_items

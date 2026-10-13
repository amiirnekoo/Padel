import uuid
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base
from backend.app.core.datetime_utils import utc_now

class MatchmakingGame(Base):
    __tablename__ = "matchmaking_games"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id: Mapped[str] = mapped_column(String(36), ForeignKey("clubs.id"), nullable=False, index=True)
    court_id: Mapped[str] = mapped_column(String(36), ForeignKey("courts.id"), nullable=False, index=True)
    timeslot_id: Mapped[str] = mapped_column(String(36), ForeignKey("time_slots.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False, default="بازی آزاد پدل ۴ نفره")
    skill_level: Mapped[str] = mapped_column(String(10), nullable=False, default="D+")  # D, D+, C, C+, B, A
    gender_category: Mapped[str] = mapped_column(String(20), nullable=False, default="OPEN")  # OPEN, MALE, FEMALE
    total_price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    price_per_player: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="OPEN", index=True)  # OPEN, CONFIRMED, COMPLETED, CANCELLED
    created_by_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # Smart Level Lock (Playtomic level locking)
    level_lock: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    min_elo: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_elo: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # 4 Players (Doubles: Team A Right/Left, Team B Right/Left)
    team_a_right_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    team_a_left_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    team_b_right_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    team_b_left_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    # Relationships
    club = relationship("Club")
    court = relationship("Court")
    timeslot = relationship("TimeSlot")
    match_result = relationship("MatchResult", back_populates="game", uselist=False)

    @property
    def filled_slots_count(self) -> int:
        count = 0
        if self.team_a_right_user_id:
            count += 1
        if self.team_a_left_user_id:
            count += 1
        if self.team_b_right_user_id:
            count += 1
        if self.team_b_left_user_id:
            count += 1
        return count


class MatchResult(Base):
    __tablename__ = "match_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id: Mapped[str] = mapped_column(String(36), ForeignKey("matchmaking_games.id"), nullable=False, unique=True, index=True)
    
    # Set Scores
    team_a_set1: Mapped[int] = mapped_column(Integer, nullable=False)
    team_b_set1: Mapped[int] = mapped_column(Integer, nullable=False)
    team_a_set2: Mapped[int] = mapped_column(Integer, nullable=False)
    team_b_set2: Mapped[int] = mapped_column(Integer, nullable=False)
    team_a_set3: Mapped[int | None] = mapped_column(Integer, nullable=True)
    team_b_set3: Mapped[int | None] = mapped_column(Integer, nullable=True)

    winning_team: Mapped[str] = mapped_column(String(10), nullable=False)  # TEAM_A or TEAM_B
    team_a_rating_change: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. +18
    team_b_rating_change: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. -18

    submitted_by_user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    confirmed_by_opponent: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    game = relationship("MatchmakingGame", back_populates="match_result")

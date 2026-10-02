import uuid
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, ForeignKey
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
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="OPEN", index=True)  # OPEN, CONFIRMED, CANCELLED
    created_by_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

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

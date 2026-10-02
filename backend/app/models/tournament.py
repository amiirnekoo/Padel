import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Integer, BigInteger, Boolean, DateTime, Date, Text, Float
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import Base
from backend.app.core.datetime_utils import utc_now


class Tournament(Base):
    __tablename__ = "tournaments"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    subtitle: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    cover_image: Mapped[str] = mapped_column(String(500), nullable=False)
    sport_type: Mapped[str] = mapped_column(String(20), default="PADEL")  # PADEL, TENNIS
    tournament_format: Mapped[str] = mapped_column(String(50), default="KING_OF_COURT")  # KING_OF_COURT, RULO_ADINEH, LEAGUE_MELE_MOJ, OPEN_KNOCKOUT
    gender: Mapped[str] = mapped_column(String(20), default="MEN")  # MEN, WOMEN, MIXED
    level: Mapped[str] = mapped_column(String(30), default="OPEN")  # AMATEUR, INTERMEDIATE, ADVANCED, PRO, OPEN
    status: Mapped[str] = mapped_column(String(30), default="REGISTRATION_OPEN")  # REGISTRATION_OPEN, REGISTRATION_CLOSED, IN_PROGRESS, COMPLETED, CANCELLED

    venue_name: Mapped[str] = mapped_column(String(150), nullable=False)
    venue_address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    entry_fee: Mapped[int] = mapped_column(BigInteger, default=0)
    prize_pool: Mapped[str] = mapped_column(String(100), default="بدون جایزه نقدی")
    max_teams: Mapped[int] = mapped_column(Integer, default=16)
    registered_teams_count: Mapped[int] = mapped_column(Integer, default=0)
    rules_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)


class PlayerRanking(Base):
    __tablename__ = "player_rankings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="MEN_PRO")  # MEN_PRO, WOMEN_PRO, MEN_AMATEUR, WOMEN_AMATEUR
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    points: Mapped[int] = mapped_column(Integer, default=0)
    tournaments_played: Mapped[int] = mapped_column(Integer, default=0)
    matches_won: Mapped[int] = mapped_column(Integer, default=0)
    matches_lost: Mapped[int] = mapped_column(Integer, default=0)
    win_rate: Mapped[float] = mapped_column(Float, default=0.0)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

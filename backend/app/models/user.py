import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone_number: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="PLAYER")  # PLAYER, COACH, CLUB_OPERATOR, CLUB_MANAGER, ADMIN
    password_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    club_id: Mapped[str] = mapped_column(String(36), nullable=True)  # for CLUB_OPERATOR / CLUB_MANAGER
    preferred_sport: Mapped[str | None] = mapped_column(String(20), nullable=True, default="PADEL")  # PADEL, TENNIS, BOTH
    dominant_hand: Mapped[str | None] = mapped_column(String(20), nullable=True, default="RIGHT")  # RIGHT, LEFT
    skill_level: Mapped[str | None] = mapped_column(String(20), nullable=True, default="BEGINNER")  # BEGINNER, INTERMEDIATE, ADVANCED, PRO
    emergency_phone: Mapped[str | None] = mapped_column(String(15), nullable=True)
    city: Mapped[str | None] = mapped_column(String(50), nullable=True, default="تهران")
    province: Mapped[str | None] = mapped_column(String(50), nullable=True, default="تهران")
    tags: Mapped[str | None] = mapped_column(String(255), nullable=True, default="NEW_LEAD")
    kyc_status: Mapped[str] = mapped_column(String(20), nullable=False, default="UNVERIFIED")  # UNVERIFIED, PENDING, VERIFIED
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    coach_profile: Mapped["CoachProfile | None"] = relationship("CoachProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    training_connections: Mapped[list["CoachTrainee"]] = relationship("CoachTrainee", back_populates="trainee", foreign_keys="CoachTrainee.trainee_id")

import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, BigInteger, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class CoachProfile(Base):
    __tablename__ = "coaches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    certification_id: Mapped[str] = mapped_column(String(50), nullable=False)
    sport_types: Mapped[str] = mapped_column(String(100), nullable=False, default="PADEL")  # PADEL, TENNIS
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    hourly_rate: Mapped[int] = mapped_column(BigInteger, nullable=False, default=1000000)  # in Tomans
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="coach_profile")
    trainee_connections: Mapped[list["CoachTrainee"]] = relationship("CoachTrainee", back_populates="coach", cascade="all, delete-orphan")

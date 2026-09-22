import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class CoachTrainee(Base):
    __tablename__ = "coach_trainees"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coach_id: Mapped[str] = mapped_column(String(36), ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False, index=True)
    trainee_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ACTIVE")  # PENDING, ACTIVE, COMPLETED, CANCELLED
    package_type: Mapped[str] = mapped_column(String(50), nullable=False, default="SINGLE_SESSION")  # SINGLE_SESSION, MONTHLY_8, MONTHLY_12
    total_sessions: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    completed_sessions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    coach: Mapped["CoachProfile"] = relationship("CoachProfile", back_populates="trainee_connections")
    trainee: Mapped["User"] = relationship("User", back_populates="training_connections")

import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    city: Mapped[str] = mapped_column(String(50), nullable=False, default="تهران")
    address: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    commission_rate: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=3.00)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    courts: Mapped[list["Court"]] = relationship("Court", back_populates="club", cascade="all, delete-orphan")


class Court(Base):
    __tablename__ = "courts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id: Mapped[str] = mapped_column(String(36), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    sport_type: Mapped[str] = mapped_column(String(20), nullable=False, default="PADEL")  # PADEL, TENNIS
    surface_type: Mapped[str] = mapped_column(String(50), nullable=True)
    is_indoor: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    club: Mapped["Club"] = relationship("Club", back_populates="courts")
    slots: Mapped[list["TimeSlot"]] = relationship("TimeSlot", back_populates="court", cascade="all, delete-orphan")

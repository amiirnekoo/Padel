import uuid
from datetime import datetime, date, time
from sqlalchemy import String, Integer, BigInteger, Date, Time, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    court_id: Mapped[str] = mapped_column(String(36), ForeignKey("courts.id", ondelete="CASCADE"), nullable=False, index=True)
    slot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)  # in Tomans / Rials
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="AVAILABLE", index=True)  # AVAILABLE, HOLD, BOOKED, BLOCKED, TOURNAMENT
    hold_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    held_by_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    court: Mapped["Court"] = relationship("Court", back_populates="slots")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="timeslot")

    __table_args__ = (
        UniqueConstraint("court_id", "slot_date", "start_time", name="uq_court_date_start_time"),
    )

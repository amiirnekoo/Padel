import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin, UTCDateTime
from backend.app.models.enums import SlotStatus

if TYPE_CHECKING:
    from backend.app.models.court import Court
    from backend.app.models.booking import Booking


class Slot(Base, TimestampMixin):
    __tablename__ = "slots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    court_id: Mapped[str] = mapped_column(String(36), ForeignKey("courts.id"), nullable=False, index=True)
    start_time: Mapped[datetime] = mapped_column(UTCDateTime, nullable=False, index=True)
    end_time: Mapped[datetime] = mapped_column(UTCDateTime, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # Price in Rials
    status: Mapped[SlotStatus] = mapped_column(
        SQLEnum(SlotStatus), default=SlotStatus.AVAILABLE, nullable=False, index=True
    )
    hold_started_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True, index=True)
    booking_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    blocked_by_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    court: Mapped["Court"] = relationship("Court", back_populates="slots")
    booking: Mapped["Booking | None"] = relationship(
        "Booking",
        primaryjoin="Slot.id == Booking.slot_id",
        foreign_keys="Booking.slot_id",
        back_populates="slot",
        uselist=False,
    )

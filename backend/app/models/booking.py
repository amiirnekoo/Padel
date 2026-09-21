import uuid
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin, UTCDateTime
from backend.app.models.enums import BookingStatus, PaymentType

if TYPE_CHECKING:
    from backend.app.models.slot import Slot
    from backend.app.models.payment_attempt import PaymentAttempt
    from backend.app.models.refund import Refund


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slot_id: Mapped[str] = mapped_column(String(36), ForeignKey("slots.id"), nullable=False, index=True)
    host_user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    payment_type: Mapped[PaymentType] = mapped_column(SQLEnum(PaymentType), default=PaymentType.SINGLE_PAYER, nullable=False)
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    paid_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        SQLEnum(BookingStatus), default=BookingStatus.NEW, nullable=False, index=True
    )
    expires_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)

    slot: Mapped["Slot"] = relationship("Slot", back_populates="booking", foreign_keys=[slot_id])
    payment_attempts: Mapped[List["PaymentAttempt"]] = relationship("PaymentAttempt", back_populates="booking")
    refunds: Mapped[List["Refund"]] = relationship("Refund", back_populates="booking")

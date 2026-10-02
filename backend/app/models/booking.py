import uuid
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base
from backend.app.core.datetime_utils import utc_now

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    timeslot_id: Mapped[str] = mapped_column(String(36), ForeignKey("time_slots.id"), nullable=False, index=True)
    amount_paid: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="PENDING_PAYMENT", index=True)  # PENDING_PAYMENT, CONFIRMED, CANCELLED_BY_USER, CANCELLED_BY_CLUB, EXPIRED
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False, default="DIRECT_GATEWAY")  # DIRECT_GATEWAY, WALLET
    settlement_status: Mapped[str] = mapped_column(String(20), nullable=False, default="UNSETTLED")  # UNSETTLED, SETTLED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    timeslot: Mapped["TimeSlot"] = relationship("TimeSlot", back_populates="bookings")
    payment_attempts: Mapped[list["PaymentAttempt"]] = relationship("PaymentAttempt", back_populates="booking", cascade="all, delete-orphan")
    refund: Mapped["Refund"] = relationship("Refund", back_populates="booking", uselist=False)

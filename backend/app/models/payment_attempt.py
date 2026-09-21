import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin, UTCDateTime
from backend.app.models.enums import PaymentAttemptStatus

if TYPE_CHECKING:
    from backend.app.models.booking import Booking
    from backend.app.models.refund import Refund


class PaymentAttempt(Base, TimestampMixin):
    __tablename__ = "payment_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    share_index: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # 1 for single, or 1..4 for split
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[PaymentAttemptStatus] = mapped_column(
        SQLEnum(PaymentAttemptStatus), default=PaymentAttemptStatus.INITIATED, nullable=False, index=True
    )
    authority: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    gateway_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="payment_attempts")
    refund: Mapped["Refund | None"] = relationship("Refund", back_populates="payment_attempt", uselist=False)

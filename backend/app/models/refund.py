import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin
from backend.app.models.enums import RefundStatus

if TYPE_CHECKING:
    from backend.app.models.booking import Booking
    from backend.app.models.payment_attempt import PaymentAttempt


class Refund(Base, TimestampMixin):
    __tablename__ = "refunds"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    payment_attempt_id: Mapped[str] = mapped_column(String(36), ForeignKey("payment_attempts.id"), unique=True, nullable=False, index=True)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[RefundStatus] = mapped_column(
        SQLEnum(RefundStatus), default=RefundStatus.INITIATED, nullable=False, index=True
    )
    gateway_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(255), nullable=True)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="refunds")
    payment_attempt: Mapped["PaymentAttempt"] = relationship("PaymentAttempt", back_populates="refund")

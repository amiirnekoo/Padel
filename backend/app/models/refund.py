import uuid
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base
from backend.app.core.datetime_utils import utc_now

class Refund(Base):
    __tablename__ = "refunds"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)  # Net refunded amount
    penalty_amount: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    reason: Mapped[str] = mapped_column(String(50), nullable=False)  # USER_CANCELLATION_OVER_24H, CLUB_EMERGENCY, LATE_CALLBACK
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="COMPLETED")  # PENDING, COMPLETED, FAILED
    reversal_ref_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="refund")

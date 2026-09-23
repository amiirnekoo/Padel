import uuid
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class SettlementBatch(Base):
    __tablename__ = "settlement_batches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    club_id: Mapped[str] = mapped_column(String(36), ForeignKey("clubs.id"), nullable=False, index=True)
    start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    total_bookings_amount: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    platform_commission_amount: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    club_payout_amount: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="PROCESSING")  # PROCESSING, PAID, CANCELLED
    iban: Mapped[str | None] = mapped_column(String(34), nullable=True)
    paya_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    items: Mapped[list["SettlementItem"]] = relationship("SettlementItem", back_populates="batch", cascade="all, delete-orphan")


class SettlementItem(Base):
    __tablename__ = "settlement_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_id: Mapped[str] = mapped_column(String(36), ForeignKey("settlement_batches.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id"), nullable=False)
    booking_amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    club_share: Mapped[int] = mapped_column(BigInteger, nullable=False)
    commission_amount: Mapped[int] = mapped_column(BigInteger, nullable=False)

    batch: Mapped["SettlementBatch"] = relationship("SettlementBatch", back_populates="items")

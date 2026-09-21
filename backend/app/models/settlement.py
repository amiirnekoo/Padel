import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import Base, TimestampMixin, UTCDateTime
from backend.app.models.enums import SettlementStatus


class Settlement(Base, TimestampMixin):
    __tablename__ = "settlements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id: Mapped[str] = mapped_column(String(36), ForeignKey("clubs.id"), nullable=False, index=True)
    period_start: Mapped[datetime] = mapped_column(UTCDateTime, nullable=False)
    period_end: Mapped[datetime] = mapped_column(UTCDateTime, nullable=False)
    gross_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    commission_rate: Mapped[Decimal] = mapped_column(Numeric(4, 2), nullable=False)
    platform_commission: Mapped[int] = mapped_column(Integer, nullable=False)
    gateway_fee: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    net_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[SettlementStatus] = mapped_column(
        SQLEnum(SettlementStatus), default=SettlementStatus.PENDING_PERIOD, nullable=False, index=True
    )
    dispute_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payout_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)

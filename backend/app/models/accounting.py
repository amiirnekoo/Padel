import uuid
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, Text, Index
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import Base
from backend.app.core.datetime_utils import utc_now


class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # CLUB, COACH
    tenant_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)     # club_id or coach_id
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # INCOME, EXPENSE
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)  # in Tomans
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False, default="ONLINE")  # ONLINE, POS, CASH, CARD_TO_CARD, WALLET
    reference_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    transaction_date: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    __table_args__ = (
        Index("idx_tenant_type_id_date", "tenant_type", "tenant_id", "transaction_date"),
    )

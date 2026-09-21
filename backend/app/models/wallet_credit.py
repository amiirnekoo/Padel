import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import Base, TimestampMixin, UTCDateTime
from backend.app.models.enums import WalletCreditStatus


class WalletCredit(Base, TimestampMixin):
    __tablename__ = "wallet_credits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    booking_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[WalletCreditStatus] = mapped_column(
        SQLEnum(WalletCreditStatus), default=WalletCreditStatus.OPT_IN_PENDING, nullable=False, index=True
    )
    opt_in_confirmed_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)

import uuid
from typing import List, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.court import Court


class Club(Base, TimestampMixin):
    __tablename__ = "clubs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    city: Mapped[str] = mapped_column(String(100), default="Tehran", nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    sheba_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    commission_rate: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=Decimal("3.00"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    courts: Mapped[List["Court"]] = relationship("Court", back_populates="club", cascade="all, delete-orphan")

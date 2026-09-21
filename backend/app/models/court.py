import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.club import Club
    from backend.app.models.slot import Slot


class Court(Base, TimestampMixin):
    __tablename__ = "courts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id: Mapped[str] = mapped_column(String(36), ForeignKey("clubs.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_indoor: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    club: Mapped["Club"] = relationship("Club", back_populates="courts")
    slots: Mapped[List["Slot"]] = relationship("Slot", back_populates="court", cascade="all, delete-orphan")

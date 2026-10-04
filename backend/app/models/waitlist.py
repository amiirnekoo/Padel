import uuid
from datetime import datetime, date, time
from sqlalchemy import String, Date, Time, DateTime, Boolean, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base
from backend.app.core.datetime_utils import utc_now

class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    court_id: Mapped[str] = mapped_column(String(36), ForeignKey("courts.id", ondelete="CASCADE"), nullable=False, index=True)
    slot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ACTIVE")  # ACTIVE, NOTIFIED, CANCELLED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    notified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "court_id", "slot_date", "start_time", name="uq_user_court_date_time_waitlist"),
    )

class InAppNotification(Base):
    __tablename__ = "in_app_notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, default="SLOT_AVAILABLE")  # SLOT_AVAILABLE, BOOKING_UPDATE, REFUND_NOTICE
    slot_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    link_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)

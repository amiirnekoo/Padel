import uuid
from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import String, Integer, BigInteger, Boolean, DateTime, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base
from backend.app.core.datetime_utils import utc_now


class Drill(Base):
    __tablename__ = "drills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)
    sport: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # PADEL, TENNIS
    category: Mapped[str] = mapped_column(String(30), index=True, nullable=False)  # TECHNIQUE, TACTICS, PHYSICAL_FITNESS, MENTAL_SKILLS
    level: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # BEGINNER, INTERMEDIATE, ADVANCED, PRO
    participant_type: Mapped[str] = mapped_column(String(20), default="SOLO")  # SOLO, PAIR, GROUP

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    objective: Mapped[str] = mapped_column(Text, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=15)

    equipment_required: Mapped[List[str]] = mapped_column(JSON, default=list)
    steps: Mapped[List[dict]] = mapped_column(JSON, default=list)
    common_mistakes: Mapped[List[dict]] = mapped_column(JSON, default=list)
    safety_precautions: Mapped[List[str]] = mapped_column(JSON, default=list)

    status: Mapped[str] = mapped_column(String(30), default="DRAFT", index=True, nullable=False)  # DRAFT, PENDING_REVIEW, APPROVED, PUBLISHED, ARCHIVED
    content_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    approved_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    author_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    author_name: Mapped[str] = mapped_column(String(100), default="مربی رالی")

    reviewer_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    reviewer_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    last_editor_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    last_editor_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    version_contributors: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    cover_media_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    media_items: Mapped[List["DrillMedia"]] = relationship(
        "DrillMedia",
        back_populates="drill",
        cascade="all, delete-orphan",
        order_by="DrillMedia.display_order",
        lazy="selectin"
    )
    activities: Mapped[List["UserDrillActivity"]] = relationship(
        "UserDrillActivity",
        back_populates="drill",
        cascade="all, delete-orphan"
    )
    completion_events: Mapped[List["DrillCompletionEvent"]] = relationship(
        "DrillCompletionEvent",
        back_populates="drill",
        cascade="all, delete-orphan"
    )


class DrillMedia(Base):
    __tablename__ = "drill_media"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    drill_id: Mapped[str] = mapped_column(String(36), ForeignKey("drills.id", ondelete="CASCADE"), nullable=False, index=True)

    storage_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    media_type: Mapped[str] = mapped_column(String(20), nullable=False)  # VIDEO, IMAGE, DIAGRAM, SUBTITLE
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)

    validation_status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False)  # PENDING, VALID, INVALID
    validation_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    provenance: Mapped[str] = mapped_column(String(30), default="UNSPECIFIED", nullable=False)  # REAL_RECORDING, AI_GENERATED, HYBRID, UNSPECIFIED
    usage_rights_status: Mapped[str] = mapped_column(String(30), default="UNAUTHORIZED", nullable=False)  # OWNED, LICENSED, PUBLIC_DOMAIN, UNAUTHORIZED
    license_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="fa", nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    drill: Mapped["Drill"] = relationship("Drill", back_populates="media_items")


class UserDrillActivity(Base):
    __tablename__ = "user_drill_activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    drill_id: Mapped[str] = mapped_column(String(36), ForeignKey("drills.id", ondelete="CASCADE"), nullable=False, index=True)

    is_bookmarked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    bookmarked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    completion_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    drill: Mapped["Drill"] = relationship("Drill", back_populates="activities")

    __table_args__ = (
        UniqueConstraint("user_id", "drill_id", name="uq_user_drill_activity"),
    )


class DrillCompletionEvent(Base):
    __tablename__ = "drill_completion_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    drill_id: Mapped[str] = mapped_column(String(36), ForeignKey("drills.id", ondelete="CASCADE"), nullable=False, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    client_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    server_timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    drill: Mapped["Drill"] = relationship("Drill", back_populates="completion_events")

    __table_args__ = (
        UniqueConstraint("user_id", "idempotency_key", name="uq_user_drill_idempotency"),
    )

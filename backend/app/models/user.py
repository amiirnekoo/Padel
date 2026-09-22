import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone_number: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="PLAYER")  # PLAYER, CLUB_OPERATOR, CLUB_ADMIN
    password_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    club_id: Mapped[str] = mapped_column(String(36), nullable=True)  # for CLUB_OPERATOR / CLUB_ADMIN
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

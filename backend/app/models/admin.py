import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON
from backend.app.models.base import Base
from backend.app.core.datetime_utils import utc_now

class AdminIncidentReport(Base):
    """
    Emergency incident report submitted by operations admin to the platform owner.
    """
    __tablename__ = "admin_incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    severity = Column(String(20), nullable=False, default="WARNING")  # CRITICAL, WARNING, INFO
    category = Column(String(50), nullable=False, default="GENERAL")  # PAYMENT, COURT, SHOP, TECH, DISPUTE
    description = Column(Text, nullable=False)
    reporter_name = Column(String(100), nullable=False, default="ادمین عملیاتی")
    is_resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class AdminAuditLog(Base):
    """
    Audit trail for operations admin actions (price edits, stock changes, cancellations).
    """
    __tablename__ = "admin_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_name = Column(String(100), nullable=False, default="ادمین عملیاتی")
    action = Column(String(100), nullable=False)  # UPDATE_PRICE, UPDATE_STOCK, CANCEL_MATCH, CREATE_PRODUCT
    target_type = Column(String(50), nullable=False)  # PRODUCT, MATCH, ORDER, COURT
    target_id = Column(String(100), nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=utc_now)

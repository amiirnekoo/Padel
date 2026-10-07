import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models.user import User

class RoleUpgradeService:
    _REQUESTS_STORE: List[Dict[str, Any]] = [
        {
            "tracking_id": "RLY-REQ-COACH01",
            "user_id": "demo-coach-user-id",
            "requested_role": "COACH",
            "full_name": "سهراب مرادی",
            "phone_number": "09121112233",
            "national_code": "0012345678",
            "organization_name": None,
            "experience_years": 5,
            "license_number": "FED-PADEL-9942",
            "description": "مربی درجه ۲ فدراسیون پدل و تنیس، سابقه تدریس در باشگاه انقلاب",
            "status": "PENDING_REVIEW",
            "created_at": "2026-10-07T14:30:00"
        },
        {
            "tracking_id": "RLY-REQ-CLUB01",
            "user_id": "demo-club-user-id",
            "requested_role": "CLUB_OPERATOR",
            "full_name": "کامران رستمی",
            "phone_number": "09129998877",
            "national_code": "0078912345",
            "organization_name": "مجموعه پدل آجودانیه (لفور)",
            "experience_years": 4,
            "license_number": "LIC-TEH-2024",
            "description": "مدیر اجرایی کورت روباز سوپر پانورامیک لفور جهت مدیریت سانس‌های رالی",
            "status": "PENDING_REVIEW",
            "created_at": "2026-10-07T18:15:00"
        }
    ]

    @classmethod
    def create_request(
        cls,
        user_id: str,
        requested_role: str,
        full_name: str,
        phone_number: str,
        national_code: Optional[str] = None,
        organization_name: Optional[str] = None,
        experience_years: Optional[int] = 0,
        license_number: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        tracking_id = f"RLY-REQ-{uuid.uuid4().hex[:7].upper()}"
        record = {
            "tracking_id": tracking_id,
            "user_id": user_id,
            "requested_role": requested_role,
            "full_name": full_name,
            "phone_number": phone_number,
            "national_code": national_code,
            "organization_name": organization_name,
            "experience_years": experience_years,
            "license_number": license_number,
            "description": description,
            "status": "PENDING_REVIEW",
            "created_at": datetime.now().isoformat()
        }
        cls._REQUESTS_STORE.insert(0, record)
        return record

    @classmethod
    def list_requests(cls, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        if status_filter:
            return [r for r in cls._REQUESTS_STORE if r.get("status") == status_filter]
        return cls._REQUESTS_STORE

    @classmethod
    def get_by_tracking_id(cls, tracking_id: str) -> Optional[Dict[str, Any]]:
        for r in cls._REQUESTS_STORE:
            if r.get("tracking_id") == tracking_id:
                return r
        return None

    @classmethod
    async def approve_request(cls, db: AsyncSession, tracking_id: str) -> Dict[str, Any]:
        req = cls.get_by_tracking_id(tracking_id)
        if not req:
            raise ValueError("درخواست مورد نظر یافت نشد.")

        req["status"] = "APPROVED"
        req["reviewed_at"] = datetime.now().isoformat()

        # Update user in database if user exists
        user_id = req.get("user_id")
        if user_id:
            stmt = select(User).where(User.id == user_id)
            res = await db.execute(stmt)
            user = res.scalar_one_or_none()
            if user:
                user.role = req["requested_role"]
                await db.commit()
                await db.refresh(user)

        return req

    @classmethod
    def reject_request(cls, tracking_id: str, reason: Optional[str] = None) -> Dict[str, Any]:
        req = cls.get_by_tracking_id(tracking_id)
        if not req:
            raise ValueError("درخواست مورد نظر یافت نشد.")

        req["status"] = "REJECTED"
        req["rejection_reason"] = reason or "عدم احراز شرایط یا نقص مدارک ارسالی"
        req["reviewed_at"] = datetime.now().isoformat()
        return req

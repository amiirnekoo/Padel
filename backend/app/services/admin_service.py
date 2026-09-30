import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from backend.app.models.admin import AdminIncidentReport, AdminAuditLog
from backend.app.models.club import Club, Court
from backend.app.models.matchmaking import MatchmakingGame
from backend.app.models.wallet import Wallet, WalletTransaction
from backend.app.models.slot import TimeSlot

class AdminService:
    ADMIN_ACCOUNTS = {
        "Nimadvr": {
            "password": "kirtookoonesadati",
            "role": "OPERATIONS_ADMIN",
            "full_name": "نیما داورزنی (ادمین عملیاتی)"
        }
    }

    def __init__(self, session: AsyncSession):
        self.session = session

    async def authenticate_admin(
        self,
        username: str,
        password: str,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Authenticates operations admin credentials and records an immutable audit trail.
        """
        admin_info = self.ADMIN_ACCOUNTS.get(username)
        if not admin_info:
            await self.record_audit_log(
                admin_name=username,
                action="ADMIN_LOGIN_FAILED",
                target_type="AUTH",
                target_id=username,
                details={"ip_address": ip_address, "reason": "USER_NOT_FOUND"}
            )
            await self.session.commit()
            return {
                "success": False,
                "message": "نام کاربری ادمین یافت نشد."
            }

        if admin_info["password"] != password:
            await self.record_audit_log(
                admin_name=username,
                action="ADMIN_LOGIN_FAILED",
                target_type="AUTH",
                target_id=username,
                details={"ip_address": ip_address, "reason": "INVALID_PASSWORD"}
            )
            await self.session.commit()
            return {
                "success": False,
                "message": "رمز عبور وارد شده نادرست است."
            }

        token = f"admin_token_{uuid.uuid4().hex}"
        await self.record_audit_log(
            admin_name=username,
            action="ADMIN_LOGIN_SUCCESS",
            target_type="AUTH",
            target_id=username,
            details={"ip_address": ip_address, "role": admin_info["role"]}
        )
        await self.session.commit()

        return {
            "success": True,
            "username": username,
            "role": admin_info["role"],
            "full_name": admin_info["full_name"],
            "token": token,
            "message": "ورود با موفقیت انجام شد."
        }

    async def create_incident_report(
        self,
        title: str,
        severity: str,
        category: str,
        description: str,
        reporter_name: str = "ادمین عملیاتی"
    ) -> AdminIncidentReport:
        """
        Submits an emergency incident/SOS report to the platform owner.
        """
        incident_id = str(uuid.uuid4())
        incident = AdminIncidentReport(
            id=incident_id,
            title=title,
            severity=severity,
            category=category,
            description=description,
            reporter_name=reporter_name,
            is_resolved=False
        )
        self.session.add(incident)
        await self.session.flush()
        
        # Log this audit
        await self.record_audit_log(
            admin_name=reporter_name,
            action="CREATE_INCIDENT",
            target_type="INCIDENT",
            target_id=incident_id,
            details={"title": title, "severity": severity, "category": category}
        )

        await self.session.commit()
        await self.session.refresh(incident)
        return incident

    async def get_incidents(self, resolved: Optional[bool] = None) -> List[AdminIncidentReport]:
        """
        Fetches incident reports with optional resolution filter.
        """
        stmt = select(AdminIncidentReport).order_by(AdminIncidentReport.created_at.desc())
        if resolved is not None:
            stmt = stmt.where(AdminIncidentReport.is_resolved == resolved)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def resolve_incident(self, incident_id: str, resolution_notes: str) -> AdminIncidentReport:
        """
        Marks an incident as resolved by the platform owner/super-admin.
        """
        stmt = select(AdminIncidentReport).where(AdminIncidentReport.id == incident_id)
        result = await self.session.execute(stmt)
        incident = result.scalar_one_or_none()
        if not incident:
            raise HTTPException(status_code=404, detail="گزارش حادثه یافت نشد.")

        incident.is_resolved = True
        incident.resolution_notes = resolution_notes

        await self.record_audit_log(
            admin_name="مدیریت پلتفرم",
            action="RESOLVE_INCIDENT",
            target_type="INCIDENT",
            target_id=incident.id,
            details={"resolution_notes": resolution_notes}
        )

        await self.session.commit()
        await self.session.refresh(incident)
        return incident

    async def get_admin_dashboard_stats(self) -> Dict[str, Any]:
        """
        Calculates high-level platform KPI stats for operations & executive overview.
        """
        # Count clubs
        clubs_count = await self.session.scalar(select(func.count(Club.id))) or 0

        # Count courts
        courts_count = await self.session.scalar(select(func.count(Court.id))) or 0

        # Count active matches
        matches_count = await self.session.scalar(
            select(func.count(MatchmakingGame.id)).where(MatchmakingGame.status.in_(["OPEN", "CONFIRMED"]))
        ) or 0

        # Count open incidents
        open_incidents = await self.session.scalar(
            select(func.count(AdminIncidentReport.id)).where(AdminIncidentReport.is_resolved == False)
        ) or 0

        return {
            "total_clubs": clubs_count,
            "total_courts": courts_count,
            "active_matches": matches_count,
            "open_incidents_count": open_incidents,
            "system_health": "OPTIMAL" if open_incidents == 0 else "ATTENTION_REQUIRED"
        }

    async def emergency_cancel_match(
        self,
        game_id: str,
        reason: str,
        admin_name: str = "ادمین عملیاتی"
    ) -> MatchmakingGame:
        """
        Emergency cancellation of a match by operations admin (e.g. court broken glass, flood, light outage)
        with 100% full refund to all enrolled players' wallets.
        """
        stmt = select(MatchmakingGame).where(MatchmakingGame.id == game_id)
        res = await self.session.execute(stmt)
        game = res.scalar_one_or_none()
        if not game:
            raise HTTPException(status_code=404, detail="بازی مچ‌میکینگ یافت نشد.")

        if game.status == "CANCELLED":
            return game

        game.status = "CANCELLED"

        # Find all enrolled players
        player_ids = [
            uid for uid in [
                game.team_a_right_user_id,
                game.team_a_left_user_id,
                game.team_b_right_user_id,
                game.team_b_left_user_id
            ] if uid
        ]

        # 100% full refund each enrolled player
        refund_amount = game.price_per_player
        for uid in player_ids:
            w_stmt = select(Wallet).where(Wallet.user_id == uid)
            w_res = await self.session.execute(w_stmt)
            wallet = w_res.scalar_one_or_none()
            if wallet:
                wallet.balance += refund_amount
                tx = WalletTransaction(
                    wallet_id=wallet.id,
                    amount=refund_amount,
                    transaction_type="CREDIT",
                    category="REFUND",
                    reference_id=game.id,
                    description=f"استرداد ۱۰۰٪ لغو اضطراری بازی مچ‌میکینگ {game.id}: {reason}"
                )
                self.session.add(tx)

        # Release slot if present
        if game.timeslot_id:
            s_stmt = select(TimeSlot).where(TimeSlot.id == game.timeslot_id)
            s_res = await self.session.execute(s_stmt)
            slot = s_res.scalar_one_or_none()
            if slot:
                slot.status = "AVAILABLE"

        # Audit log
        await self.record_audit_log(
            admin_name=admin_name,
            action="EMERGENCY_CANCEL_MATCH",
            target_type="MATCH",
            target_id=game.id,
            details={"reason": reason, "refunded_players_count": len(player_ids), "amount_each": refund_amount}
        )

        await self.session.commit()
        await self.session.refresh(game)
        return game

    async def record_audit_log(
        self,
        admin_name: str,
        action: str,
        target_type: str,
        target_id: str,
        details: Optional[Dict[str, Any]] = None
    ) -> AdminAuditLog:
        """
        Persists an immutable audit log entry.
        """
        log = AdminAuditLog(
            admin_name=admin_name,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            timestamp=datetime.now(timezone.utc)
        )
        self.session.add(log)
        return log

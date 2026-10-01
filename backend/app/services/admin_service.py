import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from backend.app.models.admin import AdminIncidentReport, AdminAuditLog
from backend.app.models.admin_user import AdminUser
from backend.app.models.club import Club, Court
from backend.app.models.matchmaking import MatchmakingGame
from backend.app.models.wallet import Wallet, WalletTransaction
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking
from backend.app.models.product import Product, ProductCategory, ProductImage, ShopOrder, ShopOrderItem
from backend.app.models.content import Article, ArticleCategory, SiteBanner
from backend.app.models.tournament import Tournament, PlayerRanking
from backend.app.core.security import verify_password, get_password_hash, create_access_token


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
        Authenticates admin credentials (database first with bcrypt, fallback to in-memory)
        and issues secure JWT token with audit trail.
        """
        # 1. Query database for AdminUser
        stmt = select(AdminUser).where(AdminUser.username == username, AdminUser.is_active == True)
        res = await self.session.execute(stmt)
        admin_user = res.scalar_one_or_none()

        if admin_user:
            is_valid = verify_password(password, admin_user.password_hash)
            # If bcrypt failed, check if plain password matched (migration grace)
            if not is_valid and admin_user.password_hash == password:
                is_valid = True
                admin_user.password_hash = get_password_hash(password)

            if not is_valid:
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

            # Generate real JWT token
            token = create_access_token(
                subject=admin_user.username,
                role=admin_user.role,
                club_id=admin_user.club_id
            )
            admin_user.last_login_at = datetime.utcnow()
            await self.record_audit_log(
                admin_name=username,
                action="ADMIN_LOGIN_SUCCESS",
                target_type="AUTH",
                target_id=admin_user.id,
                details={"ip_address": ip_address, "role": admin_user.role}
            )
            await self.session.commit()

            return {
                "success": True,
                "username": admin_user.username,
                "role": admin_user.role,
                "full_name": admin_user.full_name,
                "token": token,
                "message": "ورود با موفقیت انجام شد."
            }

        # 2. In-memory fallback (for unit tests and bootstrap)
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

        token = create_access_token(subject=username, role=admin_info["role"])
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

    # ==================== Dashboard & KPI Stats ====================
    async def get_admin_dashboard_stats(self) -> Dict[str, Any]:
        """
        Calculates comprehensive platform KPI stats for operations & executive overview.
        """
        clubs_count = await self.session.scalar(select(func.count(Club.id))) or 0
        courts_count = await self.session.scalar(select(func.count(Court.id))) or 0
        matches_count = await self.session.scalar(
            select(func.count(MatchmakingGame.id)).where(MatchmakingGame.status.in_(["OPEN", "CONFIRMED"]))
        ) or 0
        open_incidents = await self.session.scalar(
            select(func.count(AdminIncidentReport.id)).where(AdminIncidentReport.is_resolved == False)
        ) or 0

        # Commercial / Shop KPIs
        total_products = await self.session.scalar(select(func.count(Product.id))) or 0
        low_stock_products = await self.session.scalar(
            select(func.count(Product.id)).where(Product.stock <= 3, Product.is_active == True)
        ) or 0
        total_orders = await self.session.scalar(select(func.count(ShopOrder.id))) or 0
        new_orders = await self.session.scalar(
            select(func.count(ShopOrder.id)).where(ShopOrder.order_status == "NEW")
        ) or 0
        shop_revenue = await self.session.scalar(
            select(func.sum(ShopOrder.payable_amount)).where(ShopOrder.payment_status == "PAID")
        ) or 0

        # Booking KPIs
        confirmed_bookings = await self.session.scalar(
            select(func.count(Booking.id)).where(Booking.status == "CONFIRMED")
        ) or 0
        booking_revenue = await self.session.scalar(
            select(func.sum(Booking.amount_paid)).where(Booking.status == "CONFIRMED")
        ) or 0

        return {
            "total_clubs": clubs_count,
            "total_courts": courts_count,
            "active_matches": matches_count,
            "open_incidents_count": open_incidents,
            "system_health": "OPTIMAL" if open_incidents == 0 else "ATTENTION_REQUIRED",
            "total_products": total_products,
            "low_stock_products": low_stock_products,
            "total_orders": total_orders,
            "new_orders": new_orders,
            "shop_revenue": shop_revenue,
            "confirmed_bookings": confirmed_bookings,
            "booking_revenue": booking_revenue,
            "total_turnover": shop_revenue + booking_revenue
        }

    # ==================== Incident Management ====================
    async def create_incident_report(
        self,
        title: str,
        severity: str,
        category: str,
        description: str,
        reporter_name: str = "ادمین عملیاتی"
    ) -> AdminIncidentReport:
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
        stmt = select(AdminIncidentReport).order_by(AdminIncidentReport.created_at.desc())
        if resolved is not None:
            stmt = stmt.where(AdminIncidentReport.is_resolved == resolved)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def resolve_incident(self, incident_id: str, resolution_notes: str) -> AdminIncidentReport:
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

    # ==================== Emergency Match Cancellation ====================
    async def emergency_cancel_match(
        self,
        game_id: str,
        reason: str,
        admin_name: str = "ادمین عملیاتی"
    ) -> MatchmakingGame:
        stmt = select(MatchmakingGame).where(MatchmakingGame.id == game_id)
        res = await self.session.execute(stmt)
        game = res.scalar_one_or_none()
        if not game:
            raise HTTPException(status_code=404, detail="بازی مچ‌میکینگ یافت نشد.")

        if game.status == "CANCELLED":
            return game

        game.status = "CANCELLED"

        player_ids = [
            uid for uid in [
                game.team_a_right_user_id,
                game.team_a_left_user_id,
                game.team_b_right_user_id,
                game.team_b_left_user_id
            ] if uid
        ]

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

        if game.timeslot_id:
            s_stmt = select(TimeSlot).where(TimeSlot.id == game.timeslot_id)
            s_res = await self.session.execute(s_stmt)
            slot = s_res.scalar_one_or_none()
            if slot:
                slot.status = "AVAILABLE"

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

    # ==================== Audit Trail ====================
    async def record_audit_log(
        self,
        admin_name: str,
        action: str,
        target_type: str,
        target_id: str,
        details: Optional[Dict[str, Any]] = None
    ) -> AdminAuditLog:
        log = AdminAuditLog(
            admin_name=admin_name,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            timestamp=datetime.utcnow()
        )
        self.session.add(log)
        return log

    async def get_audit_logs(self, limit: int = 100) -> List[AdminAuditLog]:
        stmt = select(AdminAuditLog).order_by(desc(AdminAuditLog.timestamp)).limit(limit)
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

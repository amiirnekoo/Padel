from typing import Any
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.models.booking import Booking
from backend.app.models.club import Club
from backend.app.models.coach import CoachProfile

class CrmService:
    @staticmethod
    async def get_customers_directory(
        db: AsyncSession,
        city: str | None = None,
        role: str | None = None,
        search: str | None = None,
        tag: str | None = None
    ) -> list[dict[str, Any]]:
        """
        Retrieves a clean, organized, high-fidelity customer intelligence directory.
        Aggregates LTV, booking history, owned venues, and coaching profiles across all personas.
        """
        query = select(User).options(selectinload(User.coach_profile))
        if city:
            query = query.where(User.city == city)
        if role:
            query = query.where(User.role == role)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                (User.full_name.ilike(search_pattern)) | 
                (User.phone_number.contains(search))
            )
        if tag:
            query = query.where(User.tags.contains(tag))

        res = await db.execute(query.order_by(User.created_at.desc()))
        users = list(res.scalars().all())

        directory = []
        for u in users:
            # Calculate LTV and booking count
            b_stmt = select(
                func.count(Booking.id).label("booking_count"),
                func.coalesce(func.sum(Booking.amount_paid), 0).label("ltv")
            ).where(Booking.user_id == u.id, Booking.status == "CONFIRMED")
            b_res = await db.execute(b_stmt)
            booking_row = b_res.one_or_none()
            booking_count = booking_row[0] if booking_row else 0
            ltv = float(booking_row[1]) if booking_row else 0.0

            # Check owned venues
            owned_venues = []
            if u.role in ["CLUB_MANAGER", "CLUB_OPERATOR"] or (u.tags and "VENUE_OWNER" in u.tags):
                v_stmt = select(Club.name, Club.city).where(Club.manager_id == u.id)
                v_res = await db.execute(v_stmt)
                owned_venues = [{"name": r[0], "city": r[1]} for r in v_res.all()]

            # Check coach profile
            coach_badge = None
            if u.coach_profile:
                coach_badge = {
                    "is_verified": u.coach_profile.is_verified,
                    "hourly_rate": float(u.coach_profile.hourly_rate),
                    "sport_types": u.coach_profile.sport_types
                }

            tag_list = [t.strip() for t in u.tags.split(",") if t.strip()] if u.tags else []

            directory.append({
                "id": u.id,
                "phone_number": u.phone_number,
                "full_name": u.full_name or "ورزشکار بدون نام",
                "role": u.role,
                "city": u.city or "نامشخص",
                "province": u.province or "نامشخص",
                "skill_level": u.skill_level or "BEGINNER",
                "tags": tag_list,
                "kyc_status": u.kyc_status,
                "notes": u.notes,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "total_bookings": booking_count,
                "lifetime_value": ltv,
                "owned_venues": owned_venues,
                "coach_profile": coach_badge
            })

        return directory

    @staticmethod
    async def update_customer_crm_profile(
        db: AsyncSession,
        user_id: str,
        notes: str | None = None,
        kyc_status: str | None = None,
        tags: list[str] | None = None
    ) -> User:
        """Updates internal CRM notes, tags, and KYC status for customer retention."""
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            raise ValueError("مشتری مورد نظر یافت نشد")

        if notes is not None:
            user.notes = notes
        if kyc_status is not None:
            user.kyc_status = kyc_status
        if tags is not None:
            user.tags = ",".join(tags)

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_platform_kpis(db: AsyncSession) -> dict[str, Any]:
        """Calculates system-wide intelligence KPIs across all customer segments and cities."""
        # Total customers
        total_stmt = select(func.count(User.id))
        total_cust = (await db.execute(total_stmt)).scalar() or 0

        # Distribution by role
        role_stmt = select(User.role, func.count(User.id)).group_by(User.role)
        role_rows = (await db.execute(role_stmt)).all()
        roles_dist = {r[0]: r[1] for r in role_rows}

        # Distribution by city
        city_stmt = select(User.city, func.count(User.id)).where(User.city.isnot(None)).group_by(User.city)
        city_rows = (await db.execute(city_stmt)).all()
        cities_dist = {r[0]: r[1] for r in city_rows if r[0]}

        # Total revenue processed across bookings
        rev_stmt = select(func.coalesce(func.sum(Booking.amount_paid), 0)).where(Booking.status == "CONFIRMED")
        total_revenue = float((await db.execute(rev_stmt)).scalar() or 0.0)

        # Venues count
        venue_stmt = select(func.count(Club.id))
        venues_count = (await db.execute(venue_stmt)).scalar() or 0

        return {
            "total_customers": total_cust,
            "roles_distribution": roles_dist,
            "cities_distribution": cities_dist,
            "venues_count": venues_count,
            "total_platform_revenue": total_revenue
        }

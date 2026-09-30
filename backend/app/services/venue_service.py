import uuid
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.club import Club, Court
from backend.app.models.user import User

class VenueService:
    @staticmethod
    async def register_venue(db: AsyncSession, owner_id: str, data: dict[str, Any]) -> Club:
        """
        Registers a new sports venue for an owner across any city in Iran.
        Initial state is PENDING_APPROVAL while platform team coordinates onboarding.
        Automatically sets up courts and upgrades user to CLUB_MANAGER.
        """
        name = data.get("name", "مجموعه ورزشی جدید")
        province = data.get("province", "تهران")
        city = data.get("city", "تهران")
        address = data.get("address", "")
        phone = data.get("phone", "")
        sports_supported = data.get("sports_supported", "PADEL")
        amenities = data.get("amenities", "")
        default_hourly_rate = float(data.get("default_hourly_rate", 3000000.0))
        iban = data.get("iban", "")
        description = data.get("description", "")
        courts_count = int(data.get("courts_count", 2))

        club = Club(
            id=str(uuid.uuid4()),
            name=name,
            province=province,
            city=city,
            address=address,
            phone=phone,
            manager_id=owner_id,
            iban=iban,
            commission_rate=3.00,
            default_hourly_rate=default_hourly_rate,
            sports_supported=sports_supported,
            amenities=amenities,
            description=description,
            approval_status="PENDING_APPROVAL",
            is_active=True
        )
        db.add(club)

        # Create initial courts based on courts_count
        first_sport = sports_supported.split(",")[0].strip() if "," in sports_supported else sports_supported
        for i in range(1, courts_count + 1):
            court = Court(
                id=str(uuid.uuid4()),
                club_id=club.id,
                name=f"کورت {i}",
                sport_type=first_sport,
                surface_type="چمن مصنوعی استاندارد",
                is_indoor=False,
                is_active=True
            )
            db.add(court)

        # Upgrade owner to CLUB_MANAGER role and add VENUE_OWNER tag
        user_stmt = select(User).where(User.id == owner_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        if user:
            user.role = "CLUB_MANAGER"
            user.club_id = club.id
            existing_tags = user.tags.split(",") if user.tags else []
            if "VENUE_OWNER" not in existing_tags:
                existing_tags.append("VENUE_OWNER")
            user.tags = ",".join(existing_tags)

        await db.commit()
        await db.refresh(club)
        return club

    @staticmethod
    async def approve_venue(db: AsyncSession, club_id: str) -> Club:
        """Approves a pending venue by platform administration."""
        stmt = select(Club).where(Club.id == club_id)
        res = await db.execute(stmt)
        club = res.scalar_one_or_none()
        if not club:
            raise ValueError("باشگاه مورد نظر یافت نشد")
        
        club.approval_status = "APPROVED"
        club.is_active = True
        await db.commit()
        await db.refresh(club)
        return club

    @staticmethod
    async def get_owner_venues(db: AsyncSession, owner_id: str) -> list[Club]:
        """Fetches all venues owned/managed by a specific user."""
        stmt = select(Club).where(Club.manager_id == owner_id).order_by(Club.created_at.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_club_courts(db: AsyncSession, club_id: str) -> list[Court]:
        """Fetches all courts belonging to a club."""
        stmt = select(Court).where(Court.club_id == club_id).order_by(Court.name)
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def add_court_to_club(db: AsyncSession, club_id: str, court_data: dict[str, Any]) -> Court:
        """Adds a new court with custom specifications, pricing, image, and lighting."""
        court = Court(
            id=str(uuid.uuid4()),
            club_id=club_id,
            name=court_data.get("name", "کورت جدید"),
            sport_type=court_data.get("sport_type", "PADEL"),
            surface_type=court_data.get("surface_type", "چمن مصنوعی استاندارد"),
            is_indoor=bool(court_data.get("is_indoor", False)),
            has_lighting=bool(court_data.get("has_lighting", True)),
            hourly_rate=int(court_data.get("hourly_rate", 3000000)),
            image_url=court_data.get("image_url"),
            is_active=True
        )
        db.add(court)
        await db.commit()
        await db.refresh(court)
        return court

    @staticmethod
    async def list_public_venues(db: AsyncSession, city: str | None = None, sport_type: str | None = None) -> list[Club]:
        """Public listing of approved sports venues filtered by city and sport."""
        query = select(Club).where(Club.approval_status == "APPROVED", Club.is_active == True)
        if city:
            query = query.where(Club.city == city)
        if sport_type:
            query = query.where(Club.sports_supported.contains(sport_type))
        
        res = await db.execute(query.order_by(Club.name))
        return list(res.scalars().all())

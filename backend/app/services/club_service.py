from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.app.models.club import Club, Court
from backend.app.models.slot import TimeSlot
from backend.app.models.booking import Booking

class ClubService:
    @staticmethod
    async def get_club_analytics(db: AsyncSession, club_id: str, target_date: date) -> dict:
        # 1. Fetch club info
        club_stmt = select(Club).where(Club.id == club_id)
        club_res = await db.execute(club_stmt)
        club = club_res.scalar_one_or_none()
        if not club:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="باشگاه یافت نشد")

        # 2. Count courts
        court_count_stmt = select(func.count(Court.id)).where(Court.club_id == club_id, Court.is_active == True)
        court_count_res = await db.execute(court_count_stmt)
        total_courts = court_count_res.scalar() or 0

        # 3. Aggregate slots on target date
        slots_stmt = (
            select(TimeSlot.status, func.count(TimeSlot.id))
            .join(Court, TimeSlot.court_id == Court.id)
            .where(Court.club_id == club_id, TimeSlot.slot_date == target_date)
            .group_by(TimeSlot.status)
        )
        slots_res = await db.execute(slots_stmt)
        status_counts = dict(slots_res.all())

        available_count = status_counts.get("AVAILABLE", 0)
        booked_count = status_counts.get("BOOKED", 0)
        hold_count = status_counts.get("HOLD", 0)
        blocked_count = status_counts.get("BLOCKED", 0)
        tournament_count = status_counts.get("TOURNAMENT_HOLD", 0)
        total_slots = sum(status_counts.values())

        return {
            "club_id": club.id,
            "club_name": club.name,
            "date": str(target_date),
            "total_courts": total_courts,
            "total_slots": total_slots,
            "available_slots": available_count,
            "booked_slots": booked_count,
            "hold_slots": hold_count,
            "blocked_slots": blocked_count,
            "tournament_slots": tournament_count,
            "commission_rate": float(club.commission_rate)
        }

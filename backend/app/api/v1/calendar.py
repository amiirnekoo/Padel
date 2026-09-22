from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.base import get_db_session
from backend.app.services.booking_service import BookingService

router = APIRouter(tags=["Calendar"])

@router.get("/clubs/{club_id}/calendar")
async def get_calendar(
    club_id: str,
    date: date = Query(default_factory=date.today),
    db: AsyncSession = Depends(get_db_session)
):
    return await BookingService.get_club_calendar(db, club_id, date)

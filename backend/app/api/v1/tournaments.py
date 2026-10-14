from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.models.base import get_db_session
from backend.app.models.tournament import Tournament, TournamentRegistration

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])


class TournamentRegisterRequest(BaseModel):
    team_name: str = Field(..., description="نام تیم دو نفره")
    partner_name: str = Field(..., description="نام و نام خانوادگی پارتنر")
    partner_phone: Optional[str] = Field(None, description="شماره تماس پارتنر")
    contact_phone: Optional[str] = Field(None, description="شماره تماس کاپیتان/ثبت‌نام‌کننده")
    user_id: Optional[str] = Field(None, description="شناسه کاربر ثبت‌نام‌کننده")


@router.get("/public")
async def list_public_tournaments(
    sport: Optional[str] = Query(None, description="PADEL یا TENNIS"),
    db: AsyncSession = Depends(get_db_session)
):
    """لیست تورنمنت‌های فعال و باز جهت نمایش عمومی به بازیکنان"""
    stmt = select(Tournament).where(Tournament.is_active == True).order_by(desc(Tournament.start_date))
    if sport and sport != "ALL":
        stmt = stmt.where(Tournament.sport_type == sport)
    res = await db.execute(stmt)
    tournaments = res.scalars().all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "slug": t.slug,
            "subtitle": t.subtitle,
            "cover_image": t.cover_image,
            "sport_type": t.sport_type,
            "tournament_format": t.tournament_format,
            "gender": t.gender,
            "level": t.level,
            "status": t.status,
            "venue_name": t.venue_name,
            "venue_address": t.venue_address,
            "start_date": t.start_date.isoformat() if t.start_date else None,
            "end_date": t.end_date.isoformat() if t.end_date else None,
            "entry_fee": t.entry_fee,
            "prize_pool": t.prize_pool,
            "max_teams": t.max_teams,
            "registered_teams_count": t.registered_teams_count,
            "rules_summary": t.rules_summary,
        }
        for t in tournaments
    ]


@router.post("/{tournament_id}/register")
async def register_tournament_team(
    tournament_id: str,
    payload: TournamentRegisterRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """ثبت‌نام تیم دونفره در تورنمنت و افزایش شمارنده ظرفیت"""
    # Check if tournament exists in database
    stmt = select(Tournament).where(Tournament.id == tournament_id)
    res = await db.execute(stmt)
    tourn = res.scalar_one_or_none()

    if tourn:
        if tourn.registered_teams_count >= tourn.max_teams:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ظرفیت جدول این تورنمنت تکمیل شده است."
            )
        tourn.registered_teams_count += 1
        curr_count = tourn.registered_teams_count
    else:
        curr_count = 1

    registration = TournamentRegistration(
        tournament_id=tournament_id,
        user_id=payload.user_id,
        team_name=payload.team_name,
        partner_name=payload.partner_name,
        partner_phone=payload.partner_phone,
        contact_phone=payload.contact_phone,
        status="CONFIRMED"
    )
    db.add(registration)
    await db.commit()
    await db.refresh(registration)

    return {
        "success": True,
        "message": f"تیم «{payload.team_name}» با موفقیت در تورنمنت ثبت‌نام شد.",
        "registered_teams_count": curr_count,
        "registration": {
            "id": registration.id,
            "tournament_id": registration.tournament_id,
            "team_name": registration.team_name,
            "partner_name": registration.partner_name,
            "status": registration.status,
            "registered_at": registration.registered_at.isoformat() if registration.registered_at else None
        }
    }


@router.get("/{tournament_id}/registrations")
async def get_tournament_registrations(
    tournament_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """دریافت لیست تیم‌های ثبت‌نام شده در یک تورنمنت"""
    stmt = select(TournamentRegistration).where(TournamentRegistration.tournament_id == tournament_id).order_by(desc(TournamentRegistration.registered_at))
    res = await db.execute(stmt)
    records = res.scalars().all()
    return [
        {
            "id": r.id,
            "team_name": r.team_name,
            "partner_name": r.partner_name,
            "status": r.status,
            "registered_at": r.registered_at.isoformat() if r.registered_at else None
        }
        for r in records
    ]

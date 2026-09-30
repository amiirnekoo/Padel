from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from backend.app.core.database import get_db
from backend.app.services.matchmaking_service import MatchmakingService

router = APIRouter(prefix="/matchmaking", tags=["Matchmaking"])

class MatchmakingCreateRequest(BaseModel):
    club_id: str = Field(..., description="شناسه باشگاه")
    court_id: str = Field(..., description="شناسه کورت")
    timeslot_id: str = Field(..., description="شناسه سانس انتخابی")
    skill_level: str = Field("D+", description="سطح مهارت مجاز: D, D+, C, C+, B, A")
    creator_id: str = Field(..., description="شناسه کاربر سازنده")
    creator_position: str = Field("TEAM_A_RIGHT", description="پوزیشن سازنده: TEAM_A_RIGHT, TEAM_A_LEFT, TEAM_B_RIGHT, TEAM_B_LEFT")
    title: str = Field("بازی آزاد پدل ۴ نفره", description="عنوان مچ")
    gender_category: str = Field("OPEN", description="رده جنسیتی: OPEN, MALE, FEMALE")

class MatchmakingJoinRequest(BaseModel):
    user_id: str = Field(..., description="شناسه کاربر متقاضی")
    position: str = Field(..., description="پوزیشن انتخابی: TEAM_A_RIGHT, TEAM_A_LEFT, TEAM_B_RIGHT, TEAM_B_LEFT")

@router.post("/create")
async def create_matchmaking(payload: MatchmakingCreateRequest, db: AsyncSession = Depends(get_db)):
    """ایجاد یک مسابقه آزاد ۴ نفره مچ‌میکینگ توسط باشگاه‌دار یا بازیکن."""
    try:
        game = await MatchmakingService.create_game(
            db,
            club_id=payload.club_id,
            court_id=payload.court_id,
            timeslot_id=payload.timeslot_id,
            skill_level=payload.skill_level,
            creator_id=payload.creator_id,
            creator_position=payload.creator_position,
            title=payload.title,
            gender_category=payload.gender_category
        )
        return {
            "success": True,
            "message": "بازی مچ‌میکینگ با موفقیت ایجاد شد و در لیست بازی‌های آزاد قرار گرفت.",
            "game_id": game.id,
            "skill_level": game.skill_level,
            "price_per_player": game.price_per_player,
            "filled_slots": game.filled_slots_count,
            "status": game.status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{game_id}/join")
async def join_matchmaking(game_id: str, payload: MatchmakingJoinRequest, db: AsyncSession = Depends(get_db)):
    """پیوستن بازیکن به یک پوزیشن خالی در بازی مچ‌میکینگ و کسر سهم هزینه."""
    try:
        game = await MatchmakingService.join_game(
            db,
            game_id=game_id,
            user_id=payload.user_id,
            position=payload.position
        )
        return {
            "success": True,
            "message": "شما با موفقیت به بازی ملحق شدید.",
            "game_id": game.id,
            "filled_slots": game.filled_slots_count,
            "status": game.status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("")
async def list_matchmaking_games(
    skill_level: str | None = Query(None, description="فیلتر بر اساس سطح: D, D+, C, C+, B, A"),
    club_id: str | None = Query(None, description="فیلتر بر اساس باشگاه"),
    status: str = Query("OPEN", description="وضعیت: OPEN, CONFIRMED"),
    db: AsyncSession = Depends(get_db)
):
    """لیست مسابقات آزاد مچ‌میکینگ فعال جهت مشاهده و عضویت بازیکنان."""
    games = await MatchmakingService.list_games(db, skill_level=skill_level, club_id=club_id, status=status)
    results = []
    for g in games:
        details = await MatchmakingService.get_game_details(db, g.id)
        results.append(details)
    return results

@router.get("/{game_id}")
async def get_matchmaking_details(game_id: str, db: AsyncSession = Depends(get_db)):
    """دریافت جزییات کامل یک بازی، نام بازیکنان ۴ پوزیشن و مشخصات کورت."""
    try:
        return await MatchmakingService.get_game_details(db, game_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

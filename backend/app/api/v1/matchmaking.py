from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from backend.app.core.database import get_db
from backend.app.services.matchmaking_service import MatchmakingService
from backend.app.services.elo_service import EloRatingService
from backend.app.api.deps import get_optional_user_id

router = APIRouter(prefix="/matchmaking", tags=["Matchmaking"])

class MatchmakingCreateRequest(BaseModel):
    club_id: str = Field(..., description="شناسه باشگاه")
    court_id: str = Field(..., description="شناسه کورت")
    timeslot_id: str = Field(..., description="شناسه سانس انتخابی")
    skill_level: str = Field("D+", description="سطح مهارت مجاز: D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+")
    creator_id: Optional[str] = Field(None, description="شناسه کاربر سازنده (در صورت عدم ارسال از توکن استخراج می‌شود)")
    creator_position: str = Field("TEAM_A_RIGHT", description="پوزیشن سازنده: TEAM_A_RIGHT, TEAM_A_LEFT, TEAM_B_RIGHT, TEAM_B_LEFT")
    title: str = Field("بازی آزاد پدل ۴ نفره", description="عنوان مچ")
    gender_category: str = Field("OPEN", description="رده جنسیتی: OPEN, MALE, FEMALE")
    level_lock: bool = Field(False, description="فعال‌سازی قفل سطح مهارتی بر اساس ریتینگ Elo")
    min_elo: Optional[int] = Field(None, description="حداقل ریتینگ مجاز Elo")
    max_elo: Optional[int] = Field(None, description="حداکثر ریتینگ مجاز Elo")

class MatchmakingJoinRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="شناسه کاربر متقاضی (در صورت عدم ارسال از توکن استخراج می‌شود)")
    position: str = Field(..., description="پوزیشن انتخابی: TEAM_A_RIGHT, TEAM_A_LEFT, TEAM_B_RIGHT, TEAM_B_LEFT")

class MatchResultSubmitRequest(BaseModel):
    set_scores: List[List[int]] = Field(..., description="امتیازات ست‌ها، مثلا: [[6, 4], [4, 6], [7, 5]]")

@router.post("/create")
async def create_matchmaking(
    payload: MatchmakingCreateRequest,
    current_user_id: Optional[str] = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db)
):
    """ایجاد یک مسابقه آزاد ۴ نفره مچ‌میکینگ توسط باشگاه‌دار یا بازیکن با قابلیت قفل سطح مهارتی."""
    creator_id = current_user_id or payload.creator_id
    if not creator_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شناسه سازنده بازی الزامی است."
        )

    if current_user_id and payload.creator_id and payload.creator_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز؛ ایجاد بازی مچ‌میکینگ به نام کاربر دیگر امکان‌پذیر نیست."
        )

    try:
        game = await MatchmakingService.create_game(
            db,
            club_id=payload.club_id,
            court_id=payload.court_id,
            timeslot_id=payload.timeslot_id,
            skill_level=payload.skill_level,
            creator_id=creator_id,
            creator_position=payload.creator_position,
            title=payload.title,
            gender_category=payload.gender_category,
            level_lock=payload.level_lock,
            min_elo=payload.min_elo,
            max_elo=payload.max_elo
        )
        return {
            "success": True,
            "message": "بازی مچ‌میکینگ با موفقیت ایجاد شد و در لیست بازی‌های آزاد قرار گرفت.",
            "game_id": game.id,
            "skill_level": game.skill_level,
            "price_per_player": game.price_per_player,
            "filled_slots": game.filled_slots_count,
            "level_lock": game.level_lock,
            "status": game.status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{game_id}/join")
async def join_matchmaking(
    game_id: str,
    payload: MatchmakingJoinRequest,
    current_user_id: Optional[str] = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db)
):
    """پیوستن بازیکن به یک پوزیشن خالی در بازی مچ‌میکینگ و کسر سهم هزینه."""
    user_id = current_user_id or payload.user_id
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شناسه کاربر متقاضی الزامی است."
        )

    if current_user_id and payload.user_id and payload.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز؛ پیوستن به بازی به جای کاربر دیگر یا از حساب دیگری امکان‌پذیر نیست."
        )

    try:
        game = await MatchmakingService.join_game(
            db,
            game_id=game_id,
            user_id=current_user_id,
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

@router.get("/elo-leaderboard")
async def get_elo_leaderboard(
    limit: int = Query(50, description="تعداد بازیکنان برتر لیدربورد"),
    db: AsyncSession = Depends(get_db)
):
    """دریافت جدول رده‌بندی رسمی بازیکنان پدل رالی بر اساس ریتینگ پویا و زنده Elo."""
    try:
        return await EloRatingService.get_elo_leaderboard(db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{game_id}")
async def get_matchmaking_details(game_id: str, db: AsyncSession = Depends(get_db)):
    """دریافت جزییات کامل یک بازی، نام بازیکنان ۴ پوزیشن و مشخصات کورت."""
    try:
        return await MatchmakingService.get_game_details(db, game_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{game_id}/result")
async def submit_match_result(
    game_id: str,
    payload: MatchResultSubmitRequest,
    current_user_id: Optional[str] = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db)
):
    """ثبت رسمی نتیجه مسابقه، محاسبه تغییرات ریتینگ Elo برای ۴ بازیکن و ثبت در لیدربورد."""
    submitter_id = current_user_id or "system-recorder"
    tuple_scores = [(s[0], s[1]) for s in payload.set_scores]
    try:
        result = await EloRatingService.record_match_result(
            db=db,
            game_id=game_id,
            set_scores=tuple_scores,
            submitted_by_user_id=submitter_id
        )
        return {
            "success": True,
            "message": "نتیجه مسابقه با موفقیت ثبت شد و ریتینگ بازیکنان بروزرسانی گردید.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

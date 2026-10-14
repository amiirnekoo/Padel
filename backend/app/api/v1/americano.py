from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

try:
    from backend.app.services.americano_service import AmericanoService, AmericanoTournamentState
except ImportError:
    from app.services.americano_service import AmericanoService, AmericanoTournamentState

router = APIRouter(prefix="/americano", tags=["americano"])


class CreateAmericanoRequest(BaseModel):
    title: str = Field(default="تورنمنت آمریکانو پدل رالی", description="عنوان تورنمنت")
    players: List[str] = Field(..., description="اسامی بازیکنان (حداقل ۴ و ترجیحاً ۸ نفر)")
    points_per_match: int = Field(default=32, description="سقف مجموع امتیازات هر بازی")
    club_name: str = Field(default="باشگاه پدل رالی", description="نام باشگاه برگزارکننده")


class MatchScoreItem(BaseModel):
    court_number: int
    score_a: int
    score_b: int


class RecordRoundScoreRequest(BaseModel):
    round_index: int
    scores: List[MatchScoreItem]


@router.post("/generate", response_model=AmericanoTournamentState, status_code=status.HTTP_201_CREATED)
def generate_americano_tournament(payload: CreateAmericanoRequest):
    """
    تولید خودکار جدول و راندهای تورنمنت آمریکانو با ماتریس چرخش پارتنرها
    """
    try:
        tournament = AmericanoService.create_tournament(
            title=payload.title,
            players=payload.players,
            points_per_match=payload.points_per_match,
            club_name=payload.club_name,
        )
        return tournament
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{tournament_id}", response_model=AmericanoTournamentState)
def get_americano_tournament(tournament_id: str):
    """
    دریافت وضعیت زنده تورنمنت، راندها و جدول امتیازات (Leaderboard)
    """
    tournament = AmericanoService.get_tournament(tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"تورنمنت با شناسه {tournament_id} یافت نشد."
        )
    return tournament


@router.post("/{tournament_id}/round-score", response_model=AmericanoTournamentState)
def record_americano_round_score(
    tournament_id: str,
    payload: RecordRoundScoreRequest
):
    """
    ثبت امتیازات یک راند و به‌روزرسانی آنی لیدربورد تورنمنت آمریکانو
    """
    try:
        scores_data = [item.model_dump() for item in payload.scores]
        updated = AmericanoService.record_round_scores(
            tournament_id=tournament_id,
            round_index=payload.round_index,
            match_scores=scores_data,
        )
        return updated
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

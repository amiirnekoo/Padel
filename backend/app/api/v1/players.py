from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from backend.app.core.database import get_db
from backend.app.services.player_profile_service import PlayerProfileService
from backend.app.api.deps import get_current_user_id

router = APIRouter(prefix="/players", tags=["Players"])

class UpdateSportsProfileRequest(BaseModel):
    dominant_hand: Optional[str] = Field(None, description="دست غالب: RIGHT یا LEFT")
    preferred_side: Optional[str] = Field(None, description="پوزیشن در کورت: RIGHT, LEFT, BOTH")
    racket_name: Optional[str] = Field(None, description="راکت تخصصی مورد استفاده")
    city: Optional[str] = Field(None, description="شهر بازیکن")

@router.get("/{user_id}/profile")
async def get_player_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """استعلام عمومی شناسنامه دیجیتال، سطح مهارتی، ریتینگ Elo و لاگ مسابقات بازیکن."""
    try:
        profile = await PlayerProfileService.get_player_profile(db, user_id)
        return {"success": True, "data": profile}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/me/sports-profile")
async def update_my_sports_profile(
    payload: UpdateSportsProfileRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """به‌روزرسانی مشخصات ورزشی و بیومکانیک بازیکن لاگین‌شده."""
    try:
        updated = await PlayerProfileService.update_sports_profile(
            db,
            user_id=current_user_id,
            dominant_hand=payload.dominant_hand,
            preferred_side=payload.preferred_side,
            racket_name=payload.racket_name,
            city=payload.city
        )
        return {
            "success": True,
            "message": "مشخصات شناسنامه ورزشی با موفقیت به‌روزرسانی شد.",
            "data": updated
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

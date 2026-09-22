from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.base import get_db_session
from backend.app.services.operator_service import OperatorService
from backend.app.api.deps import get_current_operator

router = APIRouter(prefix="/operator", tags=["Operator"])

class TournamentBatchRequest(BaseModel):
    slot_ids: list[str]

@router.post("/slots/{slot_id}/block")
async def block_slot(
    slot_id: str,
    operator: dict = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db_session)
):
    slot = await OperatorService.block_slot(db, slot_id, operator.get("club_id", "default-club"))
    return {
        "status": "SUCCESS",
        "slot_id": slot.id,
        "new_status": slot.status,
        "message": "سانس توسط متصدی باجه با موفقیت مسدود شد"
    }

@router.post("/slots/{slot_id}/unblock")
async def unblock_slot(
    slot_id: str,
    operator: dict = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db_session)
):
    slot = await OperatorService.unblock_slot(db, slot_id, operator.get("club_id", "default-club"))
    return {
        "status": "SUCCESS",
        "slot_id": slot.id,
        "new_status": slot.status,
        "message": "سانس با موفقیت آزاد گردید"
    }

@router.post("/slots/tournament-allocate")
async def allocate_tournament(
    payload: TournamentBatchRequest,
    operator: dict = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db_session)
):
    slots = await OperatorService.allocate_tournament_slots(db, payload.slot_ids, operator.get("club_id", "default-club"))
    return {
        "status": "SUCCESS",
        "updated_slots_count": len(slots),
        "message": "سانس‌های مسابقه با موفقیت تخصیص یافتند"
    }

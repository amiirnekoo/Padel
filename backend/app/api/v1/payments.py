from fastapi import APIRouter, Depends, Form, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.base import get_db_session
from backend.app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/callback")
async def payment_callback(
    gateway_token: str = Query(...),
    ref_id: str = Query(...),
    success: bool = Query(True),
    db: AsyncSession = Depends(get_db_session)
):
    return await PaymentService.process_callback(db, gateway_token, ref_id, success)

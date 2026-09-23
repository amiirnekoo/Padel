from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from backend.app.core.database import get_db
from backend.app.services.settlement_service import SettlementService

router = APIRouter(prefix="/settlements", tags=["Club Settlements & Payouts"])

class GenerateSettlementRequest(BaseModel):
    club_id: str = Field(..., description="شناسه کلوپ ورزشی")

class MarkPaidRequest(BaseModel):
    paya_reference: str = Field(..., description="کد پیگیری حواله بین‌بانکی پایا یا ساتنا")

@router.post("/generate")
async def generate_settlement(payload: GenerateSettlementRequest, db: AsyncSession = Depends(get_db)):
    """
    تسهیم و تجمیع خودکار رزروهای تسویه‌نشده یک باشگاه ورزشی،
    محاسبه ۹۷٪ سهم باشگاه و ۳٪ کارمزد پلتفرم، و ایجاد صورت‌حساب تسویه حساب.
    """
    try:
        batch = await SettlementService.generate_club_settlement(db, club_id=payload.club_id)
        return {
            "success": True,
            "message": "دسته تسویه با موفقیت ایجاد شد",
            "batch_id": batch.id,
            "batch_number": batch.batch_number,
            "total_bookings_amount": batch.total_bookings_amount,
            "platform_commission": batch.platform_commission_amount,
            "club_payout_amount": batch.club_payout_amount,
            "club_payout_toman": batch.club_payout_amount // 10,
            "status": batch.status,
            "destination_iban": batch.iban
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{batch_id}/mark-paid")
async def mark_settlement_paid(batch_id: str, payload: MarkPaidRequest, db: AsyncSession = Depends(get_db)):
    """تایید رسمی واریز بین‌بانکی سهم باشگاه توسط امور مالی پلتفرم همراه با شماره ارجاع پایا."""
    try:
        batch = await SettlementService.mark_settlement_paid(
            db,
            batch_id=batch_id,
            paya_reference=payload.paya_reference
        )
        return {
            "success": True,
            "message": "وضعیت تسویه به پرداخت‌شده تغییر یافت",
            "batch_id": batch.id,
            "paya_reference": batch.paya_reference,
            "status": batch.status,
            "paid_at": batch.paid_at.isoformat() if batch.paid_at else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/club/{club_id}")
async def get_club_settlements(club_id: str, db: AsyncSession = Depends(get_db)):
    """دریافت لیست و تاریخچه تمامی دوره‌های تسویه مالی یک مجموعه ورزشی."""
    batches = await SettlementService.get_club_settlements(db, club_id)
    return [
        {
            "id": b.id,
            "batch_number": b.batch_number,
            "total_bookings_amount": b.total_bookings_amount,
            "platform_commission": b.platform_commission_amount,
            "club_payout_amount": b.club_payout_amount,
            "club_payout_toman": b.club_payout_amount // 10,
            "status": b.status,
            "iban": b.iban,
            "paya_reference": b.paya_reference,
            "paid_at": b.paid_at.isoformat() if b.paid_at else None,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "items_count": len(b.items)
        }
        for b in batches
    ]

@router.get("/{batch_id}/export-paya")
async def export_paya_batch(batch_id: str, db: AsyncSession = Depends(get_db)):
    """تولید اطلاعات استاندارد جهت پرداخت حواله پایا/ساتنا به شماره شبای باشگاه."""
    try:
        return await SettlementService.export_paya_batch_data(db, batch_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

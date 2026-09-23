from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from backend.app.core.database import get_db
from backend.app.services.wallet_service import WalletService

router = APIRouter(prefix="/wallet", tags=["Wallet & Instant Checkout"])

class TopUpRequest(BaseModel):
    user_id: str = Field(..., description="شناسه کاربر")
    amount: int = Field(..., gt=0, description="مبلغ شارژ به ریال")
    reference_id: str | None = Field(None, description="شماره ارجاع تراکنش بانکی شاپرک")

class PayBookingRequest(BaseModel):
    user_id: str = Field(..., description="شناسه کاربر")
    slot_id: str = Field(..., description="شناسه سانس انتخابی")
    booking_id: str | None = Field(None, description="شناسه سفارش رزرو در صورت قفل موقت قبلی")

@router.get("/balance")
async def get_wallet_balance(user_id: str = Query(..., description="شناسه کاربر"), db: AsyncSession = Depends(get_db)):
    """دریافت موجودی ریالی و وضعیت کیف پول کاربر."""
    wallet = await WalletService.get_or_create_wallet(db, user_id)
    return {
        "wallet_id": wallet.id,
        "user_id": wallet.user_id,
        "balance": wallet.balance,
        "balance_toman": wallet.balance // 10,
        "currency": wallet.currency,
        "is_locked": wallet.is_locked
    }

@router.post("/topup")
async def topup_wallet(payload: TopUpRequest, db: AsyncSession = Depends(get_db)):
    """شارژ موجودی کیف پول کاربر پس از بازگشت موفق از شاپرک."""
    try:
        wallet = await WalletService.top_up_wallet(
            db,
            user_id=payload.user_id,
            amount=payload.amount,
            reference_id=payload.reference_id
        )
        return {
            "success": True,
            "message": "کیف پول با موفقیت شارژ شد",
            "new_balance": wallet.balance,
            "new_balance_toman": wallet.balance // 10
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/pay-booking")
async def pay_booking_from_wallet(payload: PayBookingRequest, db: AsyncSession = Depends(get_db)):
    """پرداخت آنی و ۱ کلیکی هزینه سانس از موجودی کیف پول بدون نیاز به ارجاع مجدد به درگاه بانکی."""
    try:
        booking = await WalletService.pay_booking_with_wallet(
            db,
            user_id=payload.user_id,
            slot_id=payload.slot_id,
            booking_id=payload.booking_id
        )
        return {
            "success": True,
            "message": "رزرو شما با موفقیت از طریق کیف پول قطعی شد",
            "booking_id": booking.id,
            "tracking_code": booking.tracking_code,
            "amount_paid": booking.amount_paid,
            "status": booking.status,
            "payment_method": booking.payment_method
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transactions")
async def get_wallet_transactions(user_id: str = Query(..., description="شناسه کاربر"), db: AsyncSession = Depends(get_db)):
    """دریافت لیست و تاریخچه کلیه تراکنش‌های واریز و برداشت کیف پول کاربر."""
    txs = await WalletService.get_wallet_transactions(db, user_id)
    return [
        {
            "id": t.id,
            "amount": t.amount,
            "amount_toman": t.amount // 10,
            "transaction_type": t.transaction_type,
            "category": t.category,
            "reference_id": t.reference_id,
            "description": t.description,
            "created_at": t.created_at.isoformat() if t.created_at else None
        }
        for t in txs
    ]

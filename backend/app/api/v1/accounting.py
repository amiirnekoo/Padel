from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.base import get_db_session
from backend.app.api.deps import get_current_user_id
from backend.app.services.accounting_service import AccountingService
from backend.app.schemas.accounting import (
    TransactionCreateIn,
    TransactionOut,
    AccountingSummaryOut,
)

router = APIRouter(prefix="/accounting", tags=["Accounting"])


# --- بخش حسابداری باشگاه (Club Accounting) ---

@router.get("/club/{club_id}/summary", response_model=AccountingSummaryOut)
async def get_club_accounting_summary(
    club_id: str,
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
):
    """دریافت خلاصه سود و زیان (P&L) و تراز مالی باشگاه."""
    summary = await AccountingService.calculate_summary(
        session=session,
        tenant_type="CLUB",
        tenant_id=club_id,
        start_date=start_date,
        end_date=end_date,
    )
    return summary


@router.get("/club/{club_id}/transactions", response_model=list[TransactionOut])
async def list_club_transactions(
    club_id: str,
    transaction_type: str | None = Query(None),
    category: str | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
):
    """دریافت دفتر کل تراکنش‌های مالی باشگاه."""
    return await AccountingService.get_ledger(
        session=session,
        tenant_type="CLUB",
        tenant_id=club_id,
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        category=category,
        limit=limit,
        offset=offset,
    )


@router.post("/club/{club_id}/transactions", response_model=TransactionOut, status_code=201)
async def create_club_transaction(
    club_id: str,
    payload: TransactionCreateIn,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
):
    """ثبت دستی درآمد یا هزینه برای باشگاه."""
    return await AccountingService.create_transaction(
        session=session,
        tenant_type="CLUB",
        tenant_id=club_id,
        transaction_type=payload.transaction_type,
        category=payload.category,
        title=payload.title,
        amount=payload.amount,
        payment_method=payload.payment_method,
        reference_id=payload.reference_id,
        contact_name=payload.contact_name,
        contact_phone=payload.contact_phone,
        description=payload.description,
        transaction_date=payload.transaction_date,
    )


@router.delete("/club/{club_id}/transactions/{tx_id}")
async def delete_club_transaction(
    club_id: str,
    tx_id: str,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
):
    """حذف یک تراکنش از دفتر مالی باشگاه."""
    await AccountingService.delete_transaction(
        session=session,
        tx_id=tx_id,
        tenant_type="CLUB",
        tenant_id=club_id,
    )
    return {"status": "success", "message": "تراکنش با موفقیت حذف گردید."}


# --- بخش حسابداری مربی (Coach Accounting) ---

@router.get("/coach/{coach_id}/summary", response_model=AccountingSummaryOut)
async def get_coach_accounting_summary(
    coach_id: str,
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
):
    """دریافت تراز مالی و سود خالص تدریس مربی."""
    summary = await AccountingService.calculate_summary(
        session=session,
        tenant_type="COACH",
        tenant_id=coach_id,
        start_date=start_date,
        end_date=end_date,
    )
    return summary


@router.get("/coach/{coach_id}/transactions", response_model=list[TransactionOut])
async def list_coach_transactions(
    coach_id: str,
    transaction_type: str | None = Query(None),
    category: str | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
):
    """دریافت دفتر کل تراکنش‌ها و دریافتی‌های مربی."""
    return await AccountingService.get_ledger(
        session=session,
        tenant_type="COACH",
        tenant_id=coach_id,
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type,
        category=category,
        limit=limit,
        offset=offset,
    )


@router.post("/coach/{coach_id}/transactions", response_model=TransactionOut, status_code=201)
async def create_coach_transaction(
    coach_id: str,
    payload: TransactionCreateIn,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
):
    """ثبت دستی درآمد کلاس یا هزینه آموزش برای مربی."""
    return await AccountingService.create_transaction(
        session=session,
        tenant_type="COACH",
        tenant_id=coach_id,
        transaction_type=payload.transaction_type,
        category=payload.category,
        title=payload.title,
        amount=payload.amount,
        payment_method=payload.payment_method,
        reference_id=payload.reference_id,
        contact_name=payload.contact_name,
        contact_phone=payload.contact_phone,
        description=payload.description,
        transaction_date=payload.transaction_date,
    )


@router.delete("/coach/{coach_id}/transactions/{tx_id}")
async def delete_coach_transaction(
    coach_id: str,
    tx_id: str,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
):
    """حذف یک تراکنش از دفتر مالی مربی."""
    await AccountingService.delete_transaction(
        session=session,
        tx_id=tx_id,
        tenant_type="COACH",
        tenant_id=coach_id,
    )
    return {"status": "success", "message": "تراکنش مربی با موفقیت حذف گردید."}

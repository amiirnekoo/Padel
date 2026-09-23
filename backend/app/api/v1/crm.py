from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from backend.app.core.database import get_db
from backend.app.services.crm_service import CrmService

router = APIRouter(prefix="/crm", tags=["CRM & Customer Intelligence"])

class CustomerUpdateRequest(BaseModel):
    notes: str | None = Field(None, description="یادداشت‌های محرمانه پشتیبانی و CRM")
    kyc_status: str | None = Field(None, description="وضعیت احراز هویت: UNVERIFIED, PENDING, VERIFIED")
    tags: list[str] | None = Field(None, description="برچسب‌های هوشمند سگمنت‌بندی")

@router.get("/customers")
async def get_customers_directory(
    city: str | None = Query(None, description="فیلتر بر اساس شهر"),
    role: str | None = Query(None, description="فیلتر بر اساس نقش"),
    search: str | None = Query(None, description="جستجوی نام یا شماره همراه"),
    tag: str | None = Query(None, description="فیلتر بر اساس تگ هوشمند"),
    db: AsyncSession = Depends(get_db)
):
    """
    دریافت دایرکتوری جامع و طبقه‌بندی‌شده از کلیه مشتریان پلتفرم
    (شامل مالکان باشگاه، مربیان، بازیکنان و شاگردان) به همراه سوابق مالی و رزروها.
    """
    return await CrmService.get_customers_directory(
        db,
        city=city,
        role=role,
        search=search,
        tag=tag
    )

@router.patch("/customers/{user_id}")
async def update_customer(
    user_id: str,
    payload: CustomerUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """ویرایش اطلاعات CRM، یادداشت‌ها و برچسب‌های اختصاصی مشتری توسط مدیریت."""
    try:
        user = await CrmService.update_customer_crm_profile(
            db,
            user_id=user_id,
            notes=payload.notes,
            kyc_status=payload.kyc_status,
            tags=payload.tags
        )
        return {
            "success": True,
            "user_id": user.id,
            "kyc_status": user.kyc_status,
            "tags": user.tags.split(",") if user.tags else []
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics")
async def get_crm_analytics(db: AsyncSession = Depends(get_db)):
    """دریافت شاخص‌های کلیدی، توزیع شهری مشتریان و ارزش مالی پلتفرم."""
    return await CrmService.get_platform_kpis(db)

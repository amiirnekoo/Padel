from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from backend.app.core.database import get_db
from backend.app.services.venue_service import VenueService

router = APIRouter(prefix="/venues", tags=["Venues"])

class VenueOnboardRequest(BaseModel):
    owner_id: str = Field(..., description="شناسه کاربر مالک مجموعه")
    name: str = Field(..., description="نام مجموعه ورزشی")
    province: str = Field("تهران", description="استان")
    city: str = Field("تهران", description="شهر")
    address: str = Field(..., description="آدرس دقیق مجموعه")
    phone: str = Field(..., description="شماره تماس مدیریت یا مجموعه")
    sports_supported: str = Field("PADEL", description="رشته‌های ورزشی مجاز مانند PADEL,TENNIS,FITNESS")
    amenities: str | None = Field(None, description="امکانات رفاهی مجموعه")
    courts_count: int = Field(2, ge=1, le=20, description="تعداد زمین‌ها یا سالن‌ها")
    default_hourly_rate: float = Field(3000000.0, description="نرخ پایه هر ساعت یا سانس به ریال")
    iban: str | None = Field(None, description="شماره شبا جهت تسویه حساب بانکی")
    description: str | None = Field(None, description="توضیحات معرفی مجموعه")

@router.post("/onboard")
async def onboard_venue(payload: VenueOnboardRequest, db: AsyncSession = Depends(get_db)):
    """
    ثبت ساده و فوری مجموعه ورزشی توسط مالک در هر کجای ایران.
    مجموعه در وضعیت در انتظار بررسی قرار گرفته و هماهنگی‌های بعدی با تیم پلتفرم انجام می‌شود.
    """
    try:
        club = await VenueService.register_venue(db, owner_id=payload.owner_id, data=payload.model_dump())
        return {
            "success": True,
            "message": "مجموعه ورزشی شما با موفقیت ثبت شد. کارشناسان ما جهت تایید نهایی و بارگذاری جدول سانس‌ها با شما تماس خواهند گرفت.",
            "club_id": club.id,
            "approval_status": club.approval_status,
            "name": club.name,
            "city": club.city
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-venues")
async def get_my_venues(owner_id: str = Query(..., description="شناسه مالک"), db: AsyncSession = Depends(get_db)):
    """دریافت لیست کلوپ‌های ورزشی ثبت‌شده توسط مالک جاری."""
    venues = await VenueService.get_owner_venues(db, owner_id)
    return [
        {
            "id": v.id,
            "name": v.name,
            "province": v.province,
            "city": v.city,
            "address": v.address,
            "sports_supported": v.sports_supported,
            "default_hourly_rate": float(v.default_hourly_rate),
            "approval_status": v.approval_status,
            "is_active": v.is_active,
            "created_at": v.created_at.isoformat() if v.created_at else None
        }
        for v in venues
    ]

@router.get("/public")
async def list_public_venues(
    city: str | None = Query(None, description="فیلتر بر اساس شهر"),
    sport: str | None = Query(None, description="فیلتر بر اساس رشته ورزشی"),
    db: AsyncSession = Depends(get_db)
):
    """لیست عمومی باشگاه‌های فعال و تایید شده سراسر ایران جهت رزرو بازیکنان."""
    venues = await VenueService.list_public_venues(db, city=city, sport_type=sport)
    return [
        {
            "id": v.id,
            "name": v.name,
            "city": v.city,
            "province": v.province,
            "address": v.address,
            "phone": v.phone,
            "sports_supported": v.sports_supported,
            "default_hourly_rate": float(v.default_hourly_rate),
            "amenities": v.amenities
        }
        for v in venues
    ]

@router.post("/{club_id}/approve")
async def approve_venue(club_id: str, db: AsyncSession = Depends(get_db)):
    """تایید رسمی باشگاه توسط ادمین پلتفرم."""
    try:
        club = await VenueService.approve_venue(db, club_id)
        return {"success": True, "approval_status": club.approval_status}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import settings
from backend.app.models.base import engine, Base
from backend.app.api.v1 import auth, calendar, booking, payments, operator, venues, crm, wallet, settlements, notifications, shop, matchmaking, admin, content, drills
from backend.app.services.cleanup_worker import run_periodic_cleanup

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Start periodic background cleanup worker
    import asyncio
    cleanup_task = asyncio.create_task(run_periodic_cleanup())
    yield
    cleanup_task.cancel()

tags_metadata = [
    {"name": "auth", "description": "احراز هویت پیامکی OTP بازیکنان و ورود با نام کاربری/رمز متصدیان باجه و مدیران باشگاه"},
    {"name": "calendar", "description": "مشاهده تقویم زنده، وضعیت کورت‌ها، سانس‌های فعال و آزاد بر اساس تاریخ"},
    {"name": "booking", "description": "هسته رزرو کورت، قفل اتمیک ۱۰ دقیقه‌ای، پیگیری سفارش و لغو طبق قوانین ۲۴ ساعته"},
    {"name": "payments", "description": "درگاه پرداخت شاپرک، اعتبارسنجی وب‌هوک و Reversal خودکار در صورت پرداخت دیرهنگام"},
    {"name": "operator", "description": "پنل اختصاصی کادر باجه باشگاه جهت مسدودسازی/آزادسازی دستی و تخصیص سانس‌های تورنمنت"},
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="""
### پلتفرم جامع رزرواسیون کورت‌های پدل و تنیس (نسخه ۱.۰.۰)

موتور رزرواسیون بلادرنگ طراحی‌شده برای کلوپ‌های پدل و تنیس تهران:
- **تضمین عدم Double Booking**: قفل ردیفی اتمیک و به‌روزرسانی شرطی پایگاه داده.
- **قفل موقت ۱۰ دقیقه‌ای (Atomic Hold)**: تخصیص انحصاری سانس برای پرداخت در شاپرک با ارزیابی درجا (Lazy Expiration).
- **برابری ۱۰۰٪ قیمت (Price Parity)**: بازیکن دقیقاً نرخ مصوب باشگاه را می‌پردازد بدون دریافت هیچ کارمزد مازاد.
- **قوانین استرداد ۲۴ ساعته**: ۹۰٪ عودت قبل از ۲۴ ساعت، ۰٪ زیر ۲۴ ساعت، و ۱۰۰٪ استرداد کامل لغو اضطراری باشگاه.
- **انطباق با تأخیر شاپرک (Late Callback Handling)**: ممانعت از ثبت رزرو پس از انقضای ۱۰ دقیقه و صدور خودکار دستور برگشت وجه بانکی (Reversal).
    """,
    openapi_tags=tags_metadata,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|213\.176\.121\.117|raally\.ir)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(calendar.router, prefix=settings.API_V1_STR)
app.include_router(booking.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(operator.router, prefix=settings.API_V1_STR)
app.include_router(venues.router, prefix=settings.API_V1_STR)
app.include_router(crm.router, prefix=settings.API_V1_STR)
app.include_router(wallet.router, prefix=settings.API_V1_STR)
app.include_router(settlements.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(shop.router, prefix=settings.API_V1_STR)
app.include_router(matchmaking.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(content.router, prefix=settings.API_V1_STR)
app.include_router(drills.router, prefix=settings.API_V1_STR)
app.include_router(drills.admin_router, prefix=settings.API_V1_STR)

# Ensure upload directory exists and mount static file server
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "padel-booking-engine"}

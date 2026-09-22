# Implementation Plan: Court Booking Engine & Live Club Calendar

**Branch**: `001-court-booking-engine` | **Date**: 2026-09-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-court-booking-engine/spec.md`

---

## Summary

پیاده‌سازی هسته رزرو اتمیک زمین‌های پدل و تنیس، تقویم زنده باشگاه‌ها، پنل مسدودسازی باجه برای متصدیان، اتصال به درگاه پرداخت شاپرک با رعایت قفل‌های موقت ۱۰ دقیقه‌ای، استرداد خودکار در صورت تأخیر، و اعمال قاعده ۲۴ ساعته کنسلی با مدل برابری قیمت (Price Parity). معماری بر پایه تراکنش‌های ایزوله دیتابیس (`SELECT FOR UPDATE`) برای تضمین صددرصدی عدم تداخل زمانی (Zero Double Booking) طراحی شده است.

---

## Technical Context

**Language/Version**: Python 3.11+ (Backend) | TypeScript 5.0+ (Frontend)

**Primary Dependencies**:
- Backend: FastAPI, Uvicorn, SQLAlchemy 2.0 (Async), Pydantic v2, python-jose (JWT), passlib/bcrypt
- Frontend: React 18, Vite, Lucide React (آیکون‌ها), CSS مجهز به پالت دارک و برندینگ مدرن ورزشی

**Storage**:
- Production/Development: PostgreSQL
- Automated Tests: SQLite (via `aiosqlite`) برای اجرای بسیار سریع و ایزوله در محیط CI و لوکال

**Testing**:
- `pytest`, `pytest-asyncio`, `httpx` (برای آزمون‌های همروندی و آزمون‌های رگرسیون ماشین‌های وضعیت)

**Target Platform**:
- سرورهای لینوکس/داکر و اپلیکیشن وب ریسپانسیو (دسکتاپ باجه و موبایل بازیکنان)

**Project Type**: Web Application (تفکیک ماژولار `backend/` و `frontend/`)

**Performance Goals**:
- پاسخگویی به ایجاد قفل موقت اتمیک (Hold) در کمتر از ۲۰۰ میلی‌ثانیه (p95)
- اجرای کوئری تقویم زنده روزانه باشگاه در کمتر از ۱۰۰ میلی‌ثانیه

**Constraints**:
- نرخ رزرو مضاعف و تداخل زمانی باید دقیقاً صفر درصد (0%) باشد.
- قفل موقت بدون استثنا رأس ۱۰ دقیقه منقضی شود.
- اصل برابری قیمت رعایت شود (نرخ بازیکن = نرخ مصوب باشگاه).

**Scale/Scope**:
- پشتیبانی از ۵۰ باشگاه و ۵۰۰ زمین فعال در فاز اول، ۱۰۰ درخواست همروند در ثانیه به ازای هر سانس پرطرفدار.

---

## Constitution Check

*ارزیابی گیت‌های انطباق با قانون اساسی پروژه ([.specify/memory/constitution.md](../../.specify/memory/constitution.md)):*

| اصل قانون اساسی | وضعیت انطباق | نحوه برآورده‌شدن در طرح |
| :--- | :--- | :--- |
| **I. تفکیک نقش‌ها و مرزهای اعتماد** | **PASS** | تفکیک احراز هویت (OTP برای بازیکن / رمز عبور برای متصدی باشگاه) و تفکیک دسترسی باجه هر باشگاه از سایر باشگاه‌ها. |
| **II. رزرو اتمیک و ناوردای عدم تداخل** | **PASS** | استفاده از `SELECT FOR UPDATE` در تراکنش اتمیک، بررسی شرط `now < expires_at`، و عدم امکان Double Booking تحت بار همروند. |
| **III. معماری ماژولار دامنه‌ها** | **PASS** | تفکیک دامنه رزرو زمین و زیرساخت باشگاه‌ها از دامنه‌های آتی مربیگری و تمرینات بدنسازی. |
| **IV. توسعه مبتنی بر آزمون و دقت مالی** | **PASS** | آزمون‌های استرس همروندی (`test_slot_concurrency.py`) و تست‌های فرمول استرداد ۹۰٪/۰٪/۱۰۰٪ قبل از تحویل کد. |
| **V. توسعه مرحله‌ای با انضباط Spec Kit** | **PASS** | رعایت کامل فرآیند (Spec -> Clarify -> Plan -> Tasks -> Implement). |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-court-booking-engine/
├── spec.md              # سند مشخصات نهایی فیچر
├── plan.md              # این سند (طرح پیاده‌سازی و انطباق معماری)
├── research.md          # نتایج پژوهش فاز صفر (تصمیم‌های همروندی و درگاه)
├── data-model.md        # مدل داده، فیلدها و ماشین‌های وضعیت
├── quickstart.md        # راهنمای اجرای آزمون‌های سرتاسری و سناریوهای تست
├── contracts/           # قراردادهای API
│   └── booking-api.yaml # مشخصات OpenAPI 3.0 اندپوینت‌های رزرو و تقویم
└── tasks.md             # وظایف خرد و مستقل (خروجی فرمان بعدی: /speckit-tasks)
```

### Source Code (repository layout)

```text
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py          # اندپوینت‌های OTP بازیکن و لاگین متصدی
│   │   │   ├── calendar.py      # دریافت تقویم روزانه باشگاه
│   │   │   ├── booking.py       # ایجاد Hold و لغو رزرو
│   │   │   ├── payments.py      # اتصال به درگاه و وب‌هوک شاپرک
│   │   │   └── operator.py      # پنل مسدودسازی باجه باشگاه
│   ├── core/
│   │   ├── config.py        # متغیرهای محیطی و تنظیمات سیستم
│   │   └── security.py      # تولید و اعتبارسنجی توکن JWT و هش رمزها
│   ├── models/
│   │   ├── base.py          # کلاس پایه SQLAlchemy
│   │   ├── club.py          # مدل باشگاه و زمین‌ها
│   │   ├── slot.py          # مدل سانس‌ها با قفل موقت
│   │   ├── booking.py       # مدل سفارش و تلاش‌های پرداخت
│   │   └── refund.py        # مدل ثبت استردادهای مالی
│   ├── services/
│   │   ├── booking_service.py # منطق اتمیک قفل و رزرو
│   │   ├── payment_service.py # درگاه شاپرک، Reversal و Idempotency
│   │   └── cleanup_worker.py  # جاب پس‌زمینه پاکسازی قفل‌های منقضی
│   └── main.py              # نقطه ورود و رجیستری روترهای FastAPI
└── tests/
    ├── conftest.py          # فیکسچرهای دیتابیس آزمایشی
    ├── concurrency/
    │   └── test_slot_concurrency.py # تست استرس همروندی و ممانعت از تداخل
    └── unit/
        ├── test_state_machines.py   # آزمون انتقال وضعیت‌ها
        └── test_cancellation.py     # آزمون قواعد کنسلی ۲۴ ساعته

frontend/
├── src/
│   ├── components/
│   │   ├── CalendarGrid.tsx     # گرید تقویم سانس‌های روزانه
│   │   ├── SlotCard.tsx         # کارت وضعیت سانس (آزاد، قفل، رزرو، مسدود)
│   │   ├── HoldTimer.tsx        # تایمر معکوس ۱۰ دقیقه‌ای برای خریدار
│   │   └── OperatorToolbar.tsx  # نوار ابزار متصدی باجه جهت مسدودسازی
│   ├── pages/
│   │   ├── ClubCalendarPage.tsx # صفحه اصلی تقویم رزرو باشگاه
│   │   ├── CheckoutPage.tsx     # صفحه ورود به درگاه پرداخت
│   │   └── OperatorPage.tsx     # پنل اختصاصی باجه باشگاه
│   ├── services/
│   │   └── api.ts               # کلاینت ارتباط با اندپوینت‌های بک‌اند
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

**Structure Decision**: ساختار تفکیک‌شده دوپروژه‌ای (Web Application با `backend/` و `frontend/`) برای پوشش همزمان موتور سریع رزرواسیون با قابلیت‌های همروندی پایتون و رابط کاربری تعاملی تقویم زنده باشگاه با React انتخاب شد.

---

## Complexity Tracking

> *هیچ مغایرتی با قانون اساسی وجود ندارد و معماری در ساده‌ترین و تست‌پذیرترین شکل ممکن بدون ایجاد وابستگی‌های زیرساختی پیچیده طراحی شده است.*

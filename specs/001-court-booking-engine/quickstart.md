# Phase 1: Quickstart Validation Guide

**Feature**: `001-court-booking-engine`  
**Date**: 2026-09-22  
**Status**: Ready  

---

## 1. Overview & Prerequisites

این راهنما سناریوهای آزمون و اعتبارسنجی سرتاسری (End-to-End) هسته رزرو اتمیک، تقویم زنده باشگاه، و قوانین پرداخت و استرداد را مشخص می‌کند.

### Prerequisites (پیش‌نیازها)
- **Python**: نسخه ۳.۱۱ یا بالاتر و محیط مجازی `.venv`
- **Node.js**: نسخه ۲۰ یا بالاتر (برای رابط کاربری تقویم زنده)
- **ابزارها**: `pytest`, `httpx`, `curl`

---

## 2. Environment Setup

```powershell
# ۱. فعال‌سازی محیط پایتون و نصب وابستگی‌های بک‌اند
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pydantic pytest pytest-asyncio httpx

# ۲. اجرای سرور توسعه بک‌اند
uvicorn backend.app.main:app --reload --port 8000

# ۳. اجرای فرانت‌اند تقویم زنده
cd frontend
npm install
npm run dev
```

---

## 3. Core Validation Scenarios

### سناریو ۱: ایجاد قفل موقت اتمیک ۱۰ دقیقه‌ای (Single Payer Hold)
- **هدف**: اثبات اینکه انتخاب یک سانس وضعیت آن را بلافاصله به `HOLD` تغییر داده و ۱۰ دقیقه انقضا تنظیم می‌کند.
- **فرمان تست**:
  ```powershell
  # درخواست ایجاد Hold برای سانس شماره ۱ با کاربر احراز هویت شده
  curl -X POST http://localhost:8000/api/v1/slots/1/hold -H "Authorization: Bearer <TOKEN>"
  ```
- **نتیجه مورد انتظار**:
  - کد وضعیت HTTP 200 دریافت شود.
  - فیلد `hold_expires_at` دقیقاً ۱۰ دقیقه پس از زمان جاری سرور باشد.
  - وضعیت سانس در تقویم برای سایر کاربران به `HOLD` تغییر یابد.

---

### سناریو ۲: آزمون تداخل و همروندی (Concurrency & Race Condition Test)
- **هدف**: اثبات اینکه دو درخواست همزمان برای یک سانس منجر به Double Booking نمی‌شود.
- **دستور اجرای آزمون خودکار**:
  ```powershell
  $env:PYTHONPATH="."
  .\.venv\Scripts\pytest backend/tests/concurrency/test_slot_concurrency.py -v
  ```
- **نتیجه مورد انتظار**:
  - از بین ۱۰ کلاینت همزمان، دقیقاً ۱ کلاینت کد موفقیت ۲۰۰ دریافت کند و ۹ کلاینت دیگر با خطای ۴۰۹ (Conflict) رد شوند.

---

### سناریو ۳: مسدودسازی دستی توسط متصدی باجه (Operator Manual Block)
- **هدف**: اثبات اینکه متصدی می‌تواند رزروهای تلفنی/حضوری را بلافاصله مسدود کند.
- **فرمان تست**:
  ```powershell
  curl -X POST http://localhost:8000/api/v1/operator/slots/2/block -H "Authorization: Bearer <OPERATOR_TOKEN>"
  ```
- **نتیجه مورد انتظار**:
  - وضعیت سانس به `BLOCKED` تغییر کند.
  - تلاش یک بازیکن برای فراخوانی `hold` روی این سانس بلافاصله رد شود.

---

### سناریو ۴: آزمون استرداد ۱۰۰٪ در بازگشت دیرهنگام (Late Callback Reversal)
- **هدف**: اثبات اینکه پرداخت پس از سپری شدن ۱۰ دقیقه مانع از رزرو شده و دستور برگشت پول صادر می‌شود.
- **دستور اجرای آزمون**:
  ```powershell
  .\.venv\Scripts\pytest -o pythonpath=. backend/tests/unit/test_booking_flow.py -v
  ```
- **نتیجه مورد انتظار**:
  - رکورد رزرو قطعی ایجاد نشود.
  - وضعیت تلاش پرداخت به `REVERSED` تغییر کند و رکورد `Refund` کامل ثبت شود.

---

## 4. References
- مدل داده و ماشین‌های وضعیت: [data-model.md](data-model.md)
- قراردادهای کامل API: [contracts/booking-api.yaml](contracts/booking-api.yaml)
- پژوهش و تصمیم‌های معماری: [research.md](research.md)

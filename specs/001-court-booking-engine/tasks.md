# Tasks: Court Booking Engine & Live Club Calendar

**Feature**: `001-court-booking-engine`  
**Branch**: `001-court-booking-engine`  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Date**: 2026-09-22  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: مقداردهی اولیه اسکلت فنی بک‌اند و فرانت‌اند، وابستگی‌ها و تنظیمات محیطی.

- [X] T001 مقداردهی ساختار پوشه‌های بک‌اند و فایل وابستگی‌ها در `backend/pyproject.toml`
- [X] T002 [P] مقداردهی اولیه پروژه فرانت‌اند با React 18، TypeScript و Vite در `frontend/package.json`
- [X] T003 [P] پیکربندی تنظیمات محیطی، متغیرهای اتصال به پایگاه داده و تنظیمات در `backend/app/core/config.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: زیرساخت داده‌ای، لایه امنیت، مدل‌های پایه و سیستم احراز هویت که پیش‌نیاز همه User Storyها هستند.

- [X] T004 ایجاد کلاس پایه SQLAlchemy و وهله پایگاه داده ناهمگام (Async Engine) در `backend/app/models/base.py`
- [X] T005 [P] ایجاد مدل‌های Club و Court به همراه روابط در `backend/app/models/club.py`
- [X] T006 [P] ایجاد مدل User با تفکیک نقش‌های بازیکن و متصدی باجه در `backend/app/models/user.py`
- [X] T007 پیاده‌سازی سرویس امنیتی، تولید و اعتبارسنجی توکن‌های JWT و هشینگ رمز در `backend/app/core/security.py`
- [X] T008 پیاده‌سازی سرویس رمز یکبارمصرف پیامکی (OTP ۵ رقمی با انقضای ۲ دقیقه) در `backend/app/services/otp_service.py`
- [X] T009 پیاده‌سازی اندپوینت‌های احراز هویت OTP بازیکن و ورود کادر باشگاه در `backend/app/api/v1/auth.py`

**Checkpoint**: زیرساخت و احراز هویت تکمیل شد — پیاده‌سازی User Storyها می‌تواند آغاز شود.

---

## Phase 3: User Story 1 - Online Court Reservation with Atomic Hold (Priority: P1) 🎯 MVP Core

**Goal**: امکان مشاهده تقویم روزانه باشگاه توسط بازیکن، انتخاب سانس، قفل موقت اتمیک ۱۰ دقیقه‌ای، پرداخت شاپرک با برابری کامل قیمت و نهایی‌سازی رزرو.

**Independent Test**: فراخوانی درخواست قفل ۱۰ دقیقه‌ای برای یک سانس آزاد و شبیه‌سازی Callback پرداخت بانکی؛ وضعیت سانس از `AVAILABLE` به `HOLD` و سپس `BOOKED` تغییر می‌یابد.

### Tests for User Story 1 🧪
- [X] T010 [P] [US1] آزمون استرس همروندی و ممانعت از Double Booking در `backend/tests/concurrency/test_slot_concurrency.py`
- [X] T011 [P] [US1] آزمون اعتبارسنجی کال‌بک شاپرک و نهایی‌سازی اتمیک در `backend/tests/unit/test_booking_flow.py`

### Implementation for User Story 1
- [X] T012 [P] [US1] ایجاد مدل TimeSlot با فیلدهای `hold_expires_at` و `status` در `backend/app/models/slot.py`
- [X] T013 [P] [US1] ایجاد مدل‌های Booking و PaymentAttempt در `backend/app/models/booking.py` و `backend/app/models/payment.py`
- [X] T014 [US1] پیاده‌سازی متد رزرو اتمیک با قفل ردیفی دیتابیس (`SELECT FOR UPDATE`) در `backend/app/services/booking_service.py`
- [X] T015 [US1] پیاده‌سازی وب‌هوک و کال‌بک درگاه بانکی شاپرک با بررسی شرط `now < expires_at` و ایجاد Reversal خودکار در صورت تأخیر در `backend/app/services/payment_service.py`
- [X] T016 [US1] ایجاد اندپوینت‌های دریافت تقویم روزانه، ایجاد قفل موقت و هدایت به درگاه در `backend/app/api/v1/calendar.py` و `backend/app/api/v1/booking.py`
- [X] T017 [US1] ثبت روتر وب‌هوک پرداخت در `backend/app/api/v1/payments.py`
- [X] T018 [P] [US1] پیاده‌سازی کامپوننت‌های نمایش گرید تقویم و کارت سانس در `frontend/src/components/CalendarGrid.tsx` و `frontend/src/components/SlotCard.tsx`
- [X] T019 [US1] پیاده‌سازی صفحه تقویم باشگاه و تایمر معکوس ۱۰ دقیقه‌ای در `frontend/src/pages/ClubCalendarPage.tsx` و `frontend/src/components/HoldTimer.tsx`

**Checkpoint**: هسته رزرو تک‌نفره (MVP) کامل، تست‌پذیر و قابل ارزیابی مستقل است.

---

## Phase 4: User Story 2 - Club Operator Live Calendar & Manual Block (Priority: P1)

**Goal**: پنل متصدی باجه برای مسدودسازی سریع سانس‌های واگذارشده تلفنی/حضوری (`BLOCKED`) و آزادسازی مجدد آنها.

**Independent Test**: متصدی یک سانس خالی را مسدود می‌کند؛ تلاش آنلاین بازیکن برای قفل سانس رد می‌شود؛ پس از آزادسازی، مجدداً در دسترس قرار می‌گیرد.

### Tests for User Story 2 🧪
- [X] T020 [P] [US2] آزمون انتقال وضعیت مسدودسازی باجه و تفکیک دسترسی در `backend/tests/unit/test_operator_block.py`

### Implementation for User Story 2
- [X] T021 [US2] پیاده‌سازی متدهای مسدودسازی و آزادسازی دستی با کنترل مالکیت باشگاه در `backend/app/services/operator_service.py`
- [X] T022 [US2] ایجاد اندپوینت‌های مسدودسازی باجه در `backend/app/api/v1/operator.py`
- [X] T023 [P] [US2] پیاده‌سازی نوار ابزار متصدی و صفحه پنل باجه باشگاه در `frontend/src/components/OperatorToolbar.tsx` و `frontend/src/pages/OperatorPage.tsx`

---

## Phase 5: User Story 3 - Automatic Hold Expiration & Release (Priority: P2)

**Goal**: آزادسازی قطعی سانس‌های دارای قفل موقت پس از اتمام مهلت ۱۰ دقیقه بدون پرداخت.

**Independent Test**: ایجاد یک قفل موقت و گذشت ۱۰ دقیقه مجازی؛ فراخوانی تقویم یا سرویس پاکسازی سانس را به `AVAILABLE` بازمی‌گرداند.

### Tests for User Story 3 🧪
- [X] T024 [P] [US3] آزمون آزادسازی درجا (Lazy Expiration) و جاب پاکسازی در `backend/tests/unit/test_hold_expiration.py`

### Implementation for User Story 3
- [X] T025 [US3] پیاده‌سازی منطق ارزیابی درجا در متدهای خواندن و ایجاد سانس در `backend/app/services/booking_service.py`
- [X] T026 [US3] پیاده‌سازی جاب پس‌زمینه سبک غیرهمزمان (Asyncio Worker با بازه ۶۰ ثانیه) در `backend/app/services/cleanup_worker.py`
- [X] T027 [US3] ثبت چرخه حیات (Lifespan Task) جاب پاکسازی در نقطه ورود اپلیکیشن در `backend/app/main.py`

---

## Phase 6: User Story 4 - Cancellation & Refund Flow (Priority: P2)

**Goal**: اعمال خودکار قانون زمانی کنسلی (۹۰٪ استرداد قبل از ۲۴ ساعت، ۰٪ زیر ۲۴ ساعت، و ۱۰۰٪ لغو اضطراری باشگاه).

**Independent Test**: ثبت لغو در فاصله ۲۵ ساعت مانده به سانس با ثبت استرداد ۹۰٪؛ ثبت لغو در کمتر از ۲۴ ساعت با پیام عدم استرداد؛ لغو باشگاه با استرداد ۱۰۰٪.

### Tests for User Story 4 🧪
- [X] T028 [P] [US4] آزمون جامع فرمول‌های استرداد و قواعد زمانی ۲۴ ساعته در `backend/tests/unit/test_cancellation.py`

### Implementation for User Story 4
- [X] T029 [P] [US4] ایجاد مدل Refund برای ثبت تراکنش‌های استرداد در `backend/app/models/refund.py`
- [X] T030 [US4] پیاده‌سازی متد لغو رزرو و محاسبه استرداد/جریمه در `backend/app/services/booking_service.py`
- [X] T031 [US4] ایجاد اندپوینت لغو رزرو توسط کاربر و لغو اضطراری باشگاه در `backend/app/api/v1/booking.py`

---

## Phase 7: User Story 5 - Tournament & Club Event Slot Allocation (Priority: P3)

**Goal**: علامت‌گذاری چند سانس پیاپی توسط مدیر باشگاه برای مسابقات و تورنمنت‌های دوره‌ای (`TOURNAMENT_HOLD`).

**Independent Test**: اختصاص ۳ سانس متوالی به مسابقه؛ رزرو عادی قفل شده و برچسب مسابقه نمایش داده می‌شود.

### Tests for User Story 5 🧪
- [X] T032 [P] [US5] آزمون اختصاص و آزادسازی سانس مسابقه‌ای در `backend/tests/unit/test_tournament_slots.py`

### Implementation for User Story 5
- [X] T033 [US5] پیاده‌سازی منطق تخصیص گروهی سانس‌ها به رویداد مسابقه در `backend/app/services/operator_service.py`
- [X] T034 [P] [US5] افزودن برچسب و وضعیت مسابقات به کامپوننت تقویم در `frontend/src/components/SlotCard.tsx`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: بهبودهای فراگیر، مستندسازی API، ممیزی امنیتی و اعتبارسنجی سرتاسری.

- [X] T035 [P] مستندسازی فارسی و کامل اندپوینت‌های OpenAPI در `backend/app/main.py`
- [X] T036 اجرای سناریوهای جامع راهنمای تست در `specs/001-court-booking-engine/quickstart.md`
- [X] T037 [P] یکپارچه‌سازی رابط کاربری با تم دارک و برندینگ ورزشی رالی در `frontend/src/App.tsx` و `frontend/src/index.css`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: مستقل و قابل اجرای فوری.
- **Phase 2 (Foundational)**: وابسته به Phase 1؛ پیش‌نیاز مسدودکننده (Blocking) برای شروع همه User Storyها.
- **Phase 3 (User Story 1 - MVP)**: وابسته به Phase 2؛ قابلیت اجرای مستقل.
- **Phase 4 (User Story 2)**: وابسته به Phase 2 و مدل‌های Phase 3.
- **Phase 5 (User Story 3)**: وابسته به Phase 3 (منطق Hold).
- **Phase 6 (User Story 4)**: وابسته به Phase 3 (رزروهای قطعی).
- **Phase 7 (User Story 5)**: وابسته به Phase 4 (کنترل باجه باشگاه).
- **Phase 8 (Polish)**: پس از تکمیل قابلیت‌های مد نظر.

### Parallel Opportunities ⚡
- **در فاز راه‌اندازی (Setup)**: وظایف `T002` (فرانت‌اند) و `T003` (تنظیمات) همزمان با `T001`.
- **در فاز زیرساخت (Foundational)**: ایجاد مدل‌های `T005` (کلوپ و زمین) و `T006` (کاربر) به‌طور موازی.
- **در User Story 1**: نوشتن تست همروندی `T010` و ایجاد مدل‌های `T012`، `T013` و کامپوننت فرانت‌اند `T018` کاملاً موازی.
- **توسعه تیمی**: پس از اتمام فاز ۲، توسعه User Story 1 (رزرو آنلاین) و User Story 2 (پنل متصدی) می‌تواند همزمان پیش برود.

---

## Implementation Strategy: MVP First

1. **گام اول**: تکمیل فاز ۱ (Setup) و فاز ۲ (Foundational).
2. **گام دوم (تحویل MVP)**: پیاده‌سازی فاز ۳ (User Story 1 - هسته رزرو تک‌نفره با قفل موقت ۱۰ دقیقه‌ای).
3. **توقف و اعتبارسنجی مستقل MVP**: اجرای تست همروندی `test_slot_concurrency.py` جهت اثبات نرخ تداخل صفر درصد.
4. **گام‌های افزایشی**: اضافه کردن فاز ۴ (پنل متصدی)، فاز ۵ (پاکسازی خودکار انقضا)، و فاز ۶ (کنسلی ۲۴ ساعته).

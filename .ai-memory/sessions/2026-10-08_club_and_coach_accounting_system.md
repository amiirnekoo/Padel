# خلاصه جلسه کاری: سامانه جامع حسابداری و دفاتر مالی اختصاصی باشگاه‌داران و مربیان
**تاریخ:** پنجشنبه، ۱۸ مهر ۱۴۰۵ (2026-10-08)  
**شاخه فعال گیت:** `001-court-booking-engine`  
**وضعیت تست‌ها و انضباط مهندسی:** ۷۳ تست واحد پایتون سبز (۱۰۰٪ قبولی)، بیلد فرانت‌اند موفق در ۲۹.۱۵ ثانیه، `git diff backend/tests` کاملاً سفید (Zero Tampering).

---

### ۱. اهداف، تصمیمات و دستاوردهای این نشست

۱. **معماری و توسعه ماژول حسابداری بک‌اند (Accounting Suite):**
   - مدل داده‌ای دیتابیس `FinancialTransaction` در `backend/app/models/accounting.py` با پشتیبانی از چندمستأجری (`tenant_type`, `tenant_id`).
   - اسکیماهای استاندارد `TransactionCreateIn`, `TransactionOut`, `AccountingSummaryOut` در `backend/app/schemas/accounting.py`.
   - سرویس بک‌اند `AccountingService` در `backend/app/services/accounting_service.py` جهت محاسبه تراز مالی، سود و زیان (P&L)، تفکیک دسته‌بندی‌ها و مدیریت تراکنش‌ها (رعایت خط قرمز ۴ مرجعیت محاسبات در پایتون).
   - روت‌های REST API در `backend/app/api/v1/accounting.py` با پیشوند `/api/v1/accounting/*` برای باشگاه و مربی به همراه اعتبارسنجی JWT.

۲. **آزمون‌های خودکار TDD (Phase 1 & Phase 2):**
   - ایجاد فایل تست جدید `backend/tests/unit/test_accounting_service_and_api.py` شامل تست‌های ثبت تراکنش، تفکیک حریم خصوصی دو باشگاه و مربیان، محاسبه P&L و اندپوینت‌های API.
   - پاس شدن هر ۷۳ آزمون پایتون با موفقیت کامل بدون دستکاری در تست‌های قبلی.

۳. **رابط کاربری و کامپوننت‌های فرانت‌اند پرتال:**
   - **مودال ثبت سند مالی ([NewTransactionModal.tsx](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/rally/portal/accounting/NewTransactionModal.tsx)):** برای ثبت سریع درآمدهای باجه، بوفه، سهم مربی و هزینه‌های آب/برق، نگهداری و حقوق با انواع متدهای پرداخت.
   - **تب حسابداری باشگاه‌دار ([ClubAccountingTab.tsx](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/rally/portal/accounting/ClubAccountingTab.tsx)):** شامل ۴ کارت شاخص کلیدی درآمد، هزینه، سود خالص و تعداد اسناد، فیلتر بازه زمانی و جدول بهینه `table-fixed`.
   - **تب حسابداری مربی ([CoachAccountingTab.tsx](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/rally/portal/accounting/CoachAccountingTab.tsx)):** شامل خلاصه درآمد جلسات، کسر اجاره کورت، دریافتی خالص مربی و دفتر حساب شاگردان.
   - **تفکیک ماژولار و سقف خطوط:** تفکیک جدول سانس‌ها به [ClubSlotsManager.tsx](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/rally/portal/ClubSlotsManager.tsx) و کاهش حجم [PortalClubTab.tsx](file:///g:/My%20Drive/Company/File/Padel/frontend/src/pages/rally/portal/PortalClubTab.tsx) به ۲۰۴ سطر و [PortalCoachTab.tsx](file:///g:/My%20Drive/Company/File/Padel/frontend/src/pages/rally/portal/PortalCoachTab.tsx) به ۲۴۴ سطر.
   - رعایت قانون Zero Backdrop Blur در تمام کامپوننت‌ها.
   - قبولی ۱۰۰٪ بیلد کلاینت `npm run build`.

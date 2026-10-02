<div dir="rtl">

# گزارش جامع ممیزی، ارزیابی امنیتی و آمادگی عملیاتی (PROJECT_AUDIT.md)
## سامانه رالی پدل و تنیس ایران (RAALLY.IR)

**تاریخ ممیزی:** ۱۳ مهر ۱۴۰۵ (2026-10-03)  
**نقش‌های ارزیاب:** Senior Full-Stack Engineer, Security Engineer, QA Engineer, Product Engineer  
**دامنه زنده:** `https://raally.ir`  
**وضعیت شاخه کاری:** `001-court-booking-engine`  
**هدف:** بررسی و مستندسازی عمیق رفتار فعلی، تطبیق سرنخ‌های ۹ گانه نسخه عمومی با کدهای سورس، شناسایی آسیب‌پذیری‌های مالی و هویتی، و تدوین شواهد فنی دقیق.

---

## ۱. جدول تطبیق سرنخ‌های ۹ گانه بررسی بیرونی با سورس‌کد فعلی

| ردیف | سرنخ اعلام‌شده | وضعیت تطبیق | شواهد فایل و خطوط مرتبط | شرح فنی و تحلیل ریسک |
| :--- | :--- | :---: | :--- | :--- |
| **۱** | ایجاد نشست آزمایشی و اجرای callback موفقیت در خطای ورود/ثبت‌نام/OTP | **Confirmed** | [OtpLoginForm.tsx:78-88](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/auth/OtpLoginForm.tsx#L78-L88)<br>[LoginForm.tsx:54-66](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/auth/LoginForm.tsx#L54-L66)<br>[RegisterForm.tsx:63-77](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/auth/RegisterForm.tsx#L63-L77) | در هر سه فرم احراز هویت، در صورت بروز خطای شبکه یا خطای ۵۰۰ سرور، در بلوک `catch` یک نشست تستی (`demoSession` یا `fallbackSession`) با توکن محلی ساخته شده و در `localStorage` ثبت می‌شود و کاربر وارد سامانه می‌شود! |
| **۲** | نمایش، پر کردن خودکار یا انتشار `dev_code` یا کد پیش‌فرض در OTP | **Confirmed** | [OtpLoginForm.tsx:18,38,45,153](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/auth/OtpLoginForm.tsx#L18-L158)<br>[auth.py:127-129](file:///g:/My%20Drive/Company/File/Padel/backend/app/api/v1/auth.py#L127-L129) | مقدار پیش‌فرض `code` با `'12345'` پر می‌شود. همچنین در `handleRequestOtp` و در پیام باکس زرد، مقدار `dev_code` نمایش داده شده و فیلد کد به صورت خودکار پر می‌شود. در بک‌اند نیز فلگ `ALLOW_DEV_AUTH_BYPASS` می‌تواند `dev_code` را برگرداند. |
| **۳** | عدم کنترل نتیجه `holdSlot` و صدور رسید جعلی با `setTimeout` | **Confirmed** | [BookingFlowModal.tsx:52-82](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/rally/BookingFlowModal.tsx#L52-L82)<br>[ClubCalendarPage.tsx:98-105](file:///g:/My%20Drive/Company/File/Padel/frontend/src/pages/ClubCalendarPage.tsx#L98-L105) | در مودال رزرو، `await rallyApi.holdSlot(slot.slotId, 'usr-1')` فراخوانی شده اما پاسخ اعتبارسنجی نمی‌شود؛ سپس بلافاصله یک `setTimeout` ۱۲۰۰ میلی‌ثانیه‌ای اجرا شده و با شناسه تصادفی `TRK-...` و `RLY-...` رسید موفقیت قطعی بدون بررسی بانک صادر می‌گردد. همچنین در خط ۵۸ به اشتباه ادعا می‌شود «مبلغی از شما کسر نشده» در حالی که وضعیت نامشخص است. |
| **۴** | شناسه کاربر پیش‌فرض، موجودی کیف پول اولیه و نشست Mock | **Confirmed** | [App.tsx:27,139,210](file:///g:/My%20Drive/Company/File/Padel/frontend/src/App.tsx#L27)<br>[BookingFlowModal.tsx:54](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/rally/BookingFlowModal.tsx#L54) | مقدار `walletBalance` اولیه در `App.tsx` روی ۳۵,۰۰۰,۰۰۰ ریال (۳.۵ میلیون تومان) هاردکد است. همچنین شناسه ثابت `'usr-1'` به عنوان کاربر پیش‌فرض به سرویس‌ها پاس داده می‌شود. |
| **۵** | فراخوانی‌های مالی/شخصی بدون هدر Bearer در مقایسه با پنل ادمین | **Confirmed** | [rallyApi.ts:19-105](file:///g:/My%20Drive/Company/File/Padel/frontend/src/services/rallyApi.ts#L19-L105)<br>[wallet.py:19-90](file:///g:/My%20Drive/Company/File/Padel/backend/app/api/v1/wallet.py#L19-L90)<br>[deps.py:48-73](file:///g:/My%20Drive/Company/File/Padel/backend/app/api/deps.py#L48-L73) | در حالی که متدهای ادمین در `rallyApi.ts` هدر `Authorization: Bearer` دارند، متدهای کاربر عادی از جمله `getWalletBalance`، `checkoutShopOrder`، `payBookingWithWallet` و `holdSlot` هیچ توکنی ارسال نمی‌کنند و در بک‌اند نیز اندپوینت‌های کیف پول (`wallet.py`) فقط پارامتر متنی `user_id` را از کاربر دریافت کرده و کنترل مالکیت توکن انجام نمی‌دهند (آسیب‌پذیری IDOR). |
| **۶** | اتکای بخش‌هایی از سامانه به آرایه‌های درون فرانت‌اند و `localStorage` | **Confirmed** | [App.tsx:60](file:///g:/My%20Drive/Company/File/Padel/frontend/src/App.tsx#L60)<br>[RallyCoachesPage.tsx:4](file:///g:/My%20Drive/Company/File/Padel/frontend/src/pages/rally/RallyCoachesPage.tsx#L4)<br>[RallyTournamentsPage.tsx:4](file:///g:/My%20Drive/Company/File/Padel/frontend/src/pages/rally/RallyTournamentsPage.tsx#L4)<br>[RallyRankingsPage.tsx:3](file:///g:/My%20Drive/Company/File/Padel/frontend/src/pages/rally/RallyRankingsPage.tsx#L3) | بخش مربیان، مسابقات، رنکینگ‌ها و در مواردی محصولات فروشگاه مستقیماً آرایه‌های ثابت `mockRallyData.ts` یا `localStorage` را رندر می‌کنند و تغییرات دیتابیس ادمین را منعکس نمی‌کنند. |
| **۷** | عدم مشاهده هدرهای امنیتی مهم در پاسخ صفحه اصلی | **Confirmed** | [nginx.conf:96-138](file:///g:/My%20Drive/Company/File/Padel/nginx/nginx.conf#L96-L138)<br>[nginx.conf:163-169](file:///g:/My%20Drive/Company/File/Padel/nginx/nginx.conf#L163-L169) | هدرهای امنیتی فقط در بلاک HTTPS (پورت ۴۴۳) اعمال شده‌اند و در پاسخ‌های پورت ۸۰ غایب هستند. همچنین هدر CSP به طور کامل غایب است و هدر قدیمی `X-XSS-Protection` به کار رفته است. |
| **۸** | تفاوت رفتار یا چرخه ریدایرکت در درخواست‌های HEAD | **Confirmed** | [nginx.conf:76-81,107](file:///g:/My%20Drive/Company/File/Padel/nginx/nginx.conf#L76-L81) | شرط ریدایرکت بر اساس `map` سه هدر `X-Forwarded-Proto`، `X-Request-ID` و `Host` بنا شده است. کلاینت‌هایی که متد HEAD ارسال کرده یا هدرهای CDN لبه را ناقص ارسال کنند ممکن است بین لبه CDN و سرور مبدا دچار ۳۰۱ تکراری شوند. |
| **۹** | دریافت فونت از Google Fonts و وابستگی اولیه به اجرای JavaScript | **Confirmed** | [index.html:7-9](file:///g:/My%20Drive/Company/File/Padel/frontend/index.html#L7-L9) | تگ‌های لینک فونت Vazirmatn همچنان از سرورهای گوگل فراخوانی می‌شوند (با اینکه فایل‌های محلی در `public/fonts/` موجود است). همچنین بادی صرفاً حاوی `<div id="root"></div>` بدون تگ‌های سئو یا متاتگ‌های شبکه اجتماعی است. |

---

## ۲. گزارش جزئی یافته‌ها، شواهد و تحلیل ریسک (Detailed Findings)

### یافته ۱: گریزگاه امنیتی در خطای احراز هویت (Auth Bypass on Network Error)
- **مسیرهای درگیر:**
  - [OtpLoginForm.tsx:78-88](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/auth/OtpLoginForm.tsx#L78-L88)
  - [LoginForm.tsx:54-66](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/auth/LoginForm.tsx#L54-L66)
  - [RegisterForm.tsx:63-77](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/auth/RegisterForm.tsx#L63-L77)
- **رفتار فعلی:** با قطع ارتباط کلاینت، سرور خاموش، یا هر خطای دیگر شبکه، به جای نمایش پیام خطا، یک کاربر جعلی در مرورگر ساخته شده و به پنل کاربر لاگین می‌کند!
- **رفتار مورد انتظار (Production):** هرگونه شکست در ارتباط یا رد شدن از سوی سرور باید به حالت امن (Fail-Secure) منتهی شود و پیام خطای مشخص و قابل فهم به کاربر داده شود؛ تحت هیچ شرایطی نباید نشست جعلی ساخته شود.
- **شدت و اولویت:** بحرانی (Critical / Blocker) — اولویت اول Must Fix.
- **اصلاح:** حذف کامل تولید `demoSession` و `fallbackSession` در بلوک‌های `catch`، و نمایش Toast یا پیام خطای قرمز جهت تلاش مجدد.

---

### یافته ۲: آسیب‌پذیری ارجاع مستقیم به شیء (IDOR) در سرویس کیف پول
- **مسیرهای درگیر:**
  - [backend/app/api/v1/wallet.py:19-90](file:///g:/My%20Drive/Company/File/Padel/backend/app/api/v1/wallet.py#L19-L90)
  - [frontend/src/services/rallyApi.ts:19-28](file:///g:/My%20Drive/Company/File/Padel/frontend/src/services/rallyApi.ts#L19-L28)
- **رفتار فعلی:**
  - اندپوینت `GET /api/v1/wallet/balance?user_id=xyz` بدون اعتبارسنجی توکن، موجودی هر کاربری را برمی‌گرداند.
  - اندپوینت `POST /api/v1/wallet/pay-booking` بدون کنترل توکن، به هر کاربری اجازه می‌دهد از کیف پول کاربر دیگری هزینه سانس را کسر کند!
  - اندپوینت `POST /api/v1/wallet/topup` بدون استعلام از درگاه بانکی یا مجوز ادمین، موجودی کاربر را به مقدار دلخواه افزایش می‌دهد.
- **رفتار مورد انتظار:**
  - استخراج هویت کاربر منحصراً از توکن JWT سمت سرور با استفاده از وابستگی `Depends(get_current_user_id)`.
  - عدم اعتماد به `user_id` ارسالی در کوئری یا بدنه.
  - شارژ کیف پول فقط پس از تأیید قطعی کال‌بک درگاه بانکی شاپرک انجام پذیرد.
- **شدت و اولویت:** بحرانی (Critical / Security Blocker) — اولویت اول Must Fix.

---

### یافته ۳: ساختگی بودن جریان رزرو و پرداخت در `BookingFlowModal`
- **مسیرهای درگیر:**
  - [BookingFlowModal.tsx:52-82](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/rally/BookingFlowModal.tsx#L52-L82)
- **رفتار فعلی:**
  - شناسه کاربر پیش‌فرض ثابت `'usr-1'` ارسال می‌شود.
  - نتیجه فراخوانی `holdSlot` اعتبارسنجی نمی‌شود؛ حتی اگر سانس توسط کاربر دیگری رزرو شده و خطای ۴۰۹ برگردد، کد با تایمر ۱.۲ ثانیه‌ای به مرحله SUCCESS می‌رود.
  - اطلاعات رسید شامل شناسه سفارش و کد رهگیری با `Math.random()` ساخته می‌شود.
- **رفتار مورد انتظار:**
  - احراز هویت الزامی است؛ در صورت عدم ورود، کاربر به لاگین هدایت شود.
  - فراخوانی اتمیک `POST /api/v1/slots/{slot_id}/hold` با هدر Bearer؛ در صورت شکست (۴۰۹)، جریان متوقف شده و به کاربر پیام انتخاب سانس دیگر داده شود.
  - در پرداخت کیف پول، فراخوانی واقعی `POST /api/v1/wallet/pay-booking` و در پرداخت شاپرک، هدایت به لینک درگاه؛ رسید صرفاً از رکورد بازگشتی سرور صادر شود.
- **شدت و اولویت:** بحرانی (Critical / Financial Integrity) — اولویت اول Must Fix.

---

### یافته ۴: موجودی پیش‌فرض ۳.۵ میلیون تومانی و شناسه کاربری هاردکد
- **مسیرهای درگیر:**
  - [App.tsx:27,210](file:///g:/My%20Drive/Company/File/Padel/frontend/src/App.tsx#L27)
  - [BookingFlowModal.tsx:39-40](file:///g:/My%20Drive/Company/File/Padel/frontend/src/components/rally/BookingFlowModal.tsx#L39-L40)
- **رفتار فعلی:** کاربر مهمان بلافاصله پس از باز کردن سایت، موجودی ۳۵,۰۰۰,۰۰۰ ریال در هدر و فرم‌ها مشاهده می‌کند و فرم‌ها با نام «امیر نکوزاده» و شماره «۰۹۱۲۳۴۵۶۷۸۹» پیش‌فرض پر شده‌اند.
- **رفتار مورد انتظار:** موجودی کاربر مهمان باید صفر باشد. موجودی کاربر واردشده منحصراً از API استعلام شود. فیلدهای مشخصات کاربر از پروفایل استخراج شوند یا خالی باشند تا کاربر پر کند.
- **شدت و اولویت:** بالا (High / Product Integrity) — اولویت اول Must Fix.

---

### یافته ۵: دوگانگی منبع داده محصولات و فروشگاه
- **مسیرهای درگیر:**
  - [backend/app/api/v1/shop.py:35](file:///g:/My%20Drive/Company/File/Padel/backend/app/api/v1/shop.py#L35)
  - [backend/app/services/shop_service.py:7](file:///g:/My%20Drive/Company/File/Padel/backend/app/services/shop_service.py#L7)
  - [backend/app/api/v1/admin.py:200-240](file:///g:/My%20Drive/Company/File/Padel/backend/app/api/v1/admin.py#L200-L240)
- **رفتار فعلی:** در پنل ادمین، محصولات در دیتابیس PostgreSQL/SQLite ذخیره و ویرایش می‌شوند، اما در `shop.py` عمومی، محصولات از لیست پایتونی هاردکد شده `CATALOG_PRODUCTS` خوانده می‌شوند! در نتیجه محصولی که ادمین اضافه کند در فروشگاه عمومی دیده نمی‌شود.
- **رفتار مورد انتظار:** سرویس عمومی فروشگاه نیز محصولات را مستقیماً از جدول `products` در پایگاه‌داده بخواند.
- **شدت و اولویت:** بالا (High / Operational) — اولویت Must Fix.

---

### یافته ۶: پیکربندی امنیتی هدرها و وب‌سرور Nginx
- **مسیرهای درگیر:**
  - [nginx/nginx.conf:96-170](file:///g:/My%20Drive/Company/File/Padel/nginx/nginx.conf#L96-L170)
  - [frontend/index.html:7-9](file:///g:/My%20Drive/Company/File/Padel/frontend/index.html#L7-L9)
- **رفتار فعلی:**
  - فقدان Content-Security-Policy (CSP).
  - استفاده از هدر منسوخ `X-XSS-Protection`.
  - عدم تزریق هدرهای امنیتی روی پاسخ‌های HTTP قبل از ریدایرکت.
  - وابستگی به سرورهای گوگل برای فونت در `index.html`.
- **رفتار مورد انتظار:**
  - تنظیم CSP امن (سازگار با درگاه شاپرک، فونت‌های محلی و رسانه‌های داخلی).
  - حذف لینک‌های Google Fonts و استفاده ۱۰۰٪ از فونت‌های محلی وزیرمتن.
  - تصحیح ریدایرکت‌های ۳۰۱ و متد HEAD.
- **شدت و اولویت:** متوسط به بالا (Medium-High / Security & Performance).

---

## ۳. مواردی که هنوز قابل بررسی یا نیازمند ورودی خارجی هستند
1. **اتصال واقعی به پنل پیامکی (کاوه نگار / SMS.ir):** نیاز به API Key اختصاصی و ثبت پترن در پنل پیامک.
2. **اتصال واقعی به درگاه شاپرک (زرین‌پال / سداد / به‌پرداخت):** نیازمند کد مرچنت (Merchant ID) و قرارداد بانکی.
3. **دسترسی مستقیم SSH به سرور لایو:** تغییرات Nginx و فایل‌های سرور پس از اعتبارسنجی در محیط محلی و تستینگ، باید روی سرور داکر پروداکشن دیپلوی شوند.

</div>

<div dir="rtl">

# دستورالعمل استقرار، ارتقا، پشتیبان‌گیری و بازگشت به عقب (DEPLOYMENT_ROLLBACK.md)
## سامانه رالی پدل و تنیس ایران (RAALLY.IR)

این سند راهنمای عملیاتی و گام‌به‌گام استقرار کنترل‌شده با کمترین وقفه (Near Zero-Downtime)، روش‌های استاندارد پشتیبان‌گیری، بازیابی و طرح بازگشت به عقب (Rollback) در محیط سرور اصلی است.

---

## ۱. تبیین واقع‌بینانه زمان قطعی (Downtime & Maintenance Window)

> [!IMPORTANT]
> **ارزیابی مهندسی زمان قطعی:**
> بر خلاف ادعاهای بازاریابی «بدون حتی یک ثانیه قطعی (Zero Downtime)»، در توپولوژی‌های تک‌سرور مبتنی بر Docker Compose با یک نمونه (Single-Instance) از بک‌اند و پایگاه‌داده، فرآیند ارتقا همواره با یک **پنجره نگهداری کوتاه (Maintenance Window) به مدت ۶۰ تا ۱۲۰ ثانیه** در ساعات کم‌ترافیک (بین ۳:۰۰ تا ۵:۰۰ بامداد) برنامه‌ریزی می‌شود.
> 
> **علل فنی ضرورت پنجره نگهداری:**
> ۱. **مایگریشن‌های ساختاری دیتابیس (DDL Migrations):** اعمال تغییراتی مانند افزودن کلیدهای خارجی، شاخص‌های یکتا یا تبدیل انواع داده ممکن است جدول را موقتاً در وضعیت انحصاری (Access Exclusive Lock) قرار دهد.
> ۲. **راه‌اندازی مجدد پردازه Uvicorn:** در لحظه جایگزینی کانتینر قدیمی بک‌اند با کانتینر جدید، درخواست‌های در جریان ممکن است با وقفه کوتاهی (۱ تا ۳ ثانیه) مواجه شوند.

---

## ۲. ساختار سرویس‌ها و کانتینرهای استقرار
سامانه توسط ۵ کانتینر ایزوله بر بستر `docker-compose.yml` در سرور مستقر است:
1. `rally_gateway`: سرور لبه Nginx (پورت‌های ۸۰ و ۴۴۳) با گواهی SSL، توزیع بار، هدرهای امنیتی و مانیتورینگ سلامت.
2. `rally_frontend`: وب‌سرور سبک Alpine جهت سرویس‌دهی باندل کامپایل‌شده React SPA.
3. `rally_backend`: سرور API مبتنی بر FastAPI و Uvicorn.
4. `rally_postgres`: موتور پایگاه‌داده PostgreSQL 16 همراه با والوم‌های پایدار ذخیره‌سازی داده (`/var/lib/postgresql/data`).
5. `rally_redis`: سرور رم‌محور کش و صف‌های هم‌روندی.

---

## ۳. فرآیند استاندارد پشتیبان‌گیری دیتابیس (Database Backup Procedure)

پیش از هرگونه تغییر یا استقرار، نسخه پشتیبان کامل از دیتابیس تهیه و اعتبارسنجی می‌شود.

### گام ۱: تهیه دامپ ساختاریافته (Custom Archive Format)
استفاده از فرمت سفارشی `-F c` به جای متن ساده SQL الزامی است؛ زیرا این فرمت امکان فشرده‌سازی درجا، بازیابی موازی و بازیابی انتخابی را فراهم می‌کند:

```bash
# ایجاد دایرکتوری پشتیبان در صورت عدم وجود
mkdir -p /root/db_backups

# استخراج نسخه پشتیبان لحظه‌ای با ثبت تاریخ و ساعت دقیق
BACKUP_FILE="/root/db_backups/backup_padel_$(date +%Y%m%d_%H%M%S).dump"

docker exec -t rally_postgres pg_dump \
    -U padel_user \
    -d padel_prod \
    -F c \
    -b \
    -v \
    -f "/var/lib/postgresql/data/backups/$(basename $BACKUP_FILE)"

# کپی امن فایل به هاست اصلی
docker cp rally_postgres:"/var/lib/postgresql/data/backups/$(basename $BACKUP_FILE)" "$BACKUP_FILE"
```

### گام ۲: اعتبارسنجی یکپارچگی فایل پشتیبان (Integrity Verification)
پیش از دست زدن به کد یا مایگریشن، اثبات خوانایی فایل با فهرست کردن جدول‌ها الزامی است:
```bash
# بررسی فهرست جداول و اشیای موجود در فایل پشتیبان بدون بازیابی
docker exec -i rally_postgres pg_restore --list "/var/lib/postgresql/data/backups/$(basename $BACKUP_FILE)" | head -n 25

# بررسی حجم فایل (حجم نباید صفر یا غیرعادی باشد)
ls -lh "$BACKUP_FILE"
```

---

## ۴. دستورالعمل مرحله‌ای استقرار (Deployment Procedure)

### مرحله اول: پیش‌پرواز محلی (Local Pre-Flight)
پیش از استقرار روی سرور اصلی، اجرای موفق دو دستور زیر الزامی است:
```bash
# ۱. اجرای کامل و قبولی ۱۰۰٪ آزمون‌های بک‌اند (۴۹ تست موفق)
.venv/bin/pytest backend/tests

# ۲. ساخت بیلد بهینه فرانت‌اند بدون خطای تایپ‌اسکریپت
cd frontend && npm run build
```

### مرحله دوم: اعمال تغییرات روی سرور اصلی (Staging / Production)
```bash
cd /root/Padel
# ۱. دریافت آخرین نسخه کد از شاخه پایدار
git pull origin 001-court-booking-engine

# ۲. اجرای مایگریشن‌های ساختاری پایگاه داده (در صورت وجود)
docker compose exec backend alembic upgrade head

# ۳. بازسازی کانتینرهای تغییریافته بدون ریستارت پایگاه داده
docker compose build frontend backend
docker compose up -d --no-deps frontend backend gateway
```

### مرحله سوم: ارزیابی بلادرنگ سلامت (Post-Deployment Health Check)
```bash
# استعلام سلامت مستقیم سرویس بک‌اند
curl -I http://127.0.0.1:8000/health

# استعلام سلامت از طریق لبه Nginx با متد GET و HEAD
curl -i https://raally.ir/health
curl -I https://raally.ir/health

# بررسی هدرهای امنیتی ضد Clickjacking
curl -sI https://raally.ir/ | grep -iE "x-frame-options|content-security-policy"
```

---

## ۵. فرآیند بازیابی و بازگشت به عقب (Rollback & Disaster Recovery)

در صورت بروز هرگونه شکست در تراکنش‌ها، خطای ۵۰۰ سیستمی یا خطای مایگریشن دیتابیس، سناریوهای بازگشت به این ترتیب اجرا می‌شوند:

### سناریوی الف: بازگشت نرم‌افزاری (کد و کانتینرها)
اگر مشکل صرفاً ناشی از کد جدید فرانت‌اند یا بک‌اند باشد و ساختار دیتابیس تغییر نکرده باشد:
```bash
cd /root/Padel
# ۱. بازگشت به کامیت پایدار پیشین
git reset --hard 23e219c

# ۲. بازسازی سریع کانتینرها و استقرار مجدد
docker compose build frontend backend
docker compose up -d --no-deps frontend backend gateway
```

### سناریوی ب: بازگردانی ساختار و داده‌های پایگاه‌داده (Database Restore)
در صورتی که مایگریشن با شکست روبرو شده یا داده‌ها دچار ناسازگاری شده باشند:
```bash
# ۱. متوقف کردن موقت سرویس بک‌اند برای قطع تراکنش‌های جدید
docker compose stop backend

# ۲. قطع کلیه اتصالات فعال به دیتابیس جهت آزادسازی قفل‌ها
docker exec -i rally_postgres psql -U padel_user -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'padel_prod' AND pid <> pg_backend_pid();"

# ۳. بازیابی ساختار و داده‌ها از فایل دامپ معتبر
docker exec -i rally_postgres pg_restore \
    -U padel_user \
    -d padel_prod \
    --clean \
    --if-exists \
    -v \
    "/var/lib/postgresql/data/backups/backup_padel_YYYYMMDD_HHMMSS.dump"

# ۴. راه‌اندازی مجدد بک‌اند و بررسی سلامت
docker compose start backend
docker compose logs --tail=50 backend
```

---

## ۶. چک‌لیست اعتبارسنجی نهایی (Final Verification Checklist)
- [x] تهیه و اعتبارسنجی بک‌آپ دیتابیس با فرمت Custom Dump (`pg_restore --list`).
- [x] تعیین پنجره نگهداری ۶۰-۱۲۰ ثانیه‌ای در ساعات کم‌ترافیک به جای ادعای استقرار بدون قطعی.
- [x] آزمون پاسخگویی اندپوینت `/health` با متدهای HEAD و GET بدون حلقه ریدایرکت.
- [x] اعمال هدرهای `X-Frame-Options: SAMEORIGIN` و `Content-Security-Policy: frame-ancestors 'self'` با قید `always` روی تمام کدهای وضعیت.
- [x] اثبات مسدودسازی شبیه‌سازها در حالت `ENVIRONMENT=production`.

</div>

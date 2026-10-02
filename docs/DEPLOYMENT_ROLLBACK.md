<div dir="rtl">

# دستورالعمل استقرار، ارتقا و بازگشت به عقب (DEPLOYMENT_ROLLBACK.md)
## سامانه رالی پدل و تنیس ایران (RAALLY.IR)

این سند راهنمای عملیاتی و گام‌به‌گام استقرار ایمن (Zero-Downtime Deployment)، اعتبارسنجی سلامت سامانه و فرآیند بازگشت به عقب (Rollback) در محیط سرور اصلی است.

---

## ۱. ساختار سرویس‌ها و کانتینرهای استقرار
سامانه توسط ۵ کانتینر ایزوله بر بستر `docker-compose.yml` در سرور لایو مستقر است:
1. `rally_gateway`: سرور دروازه ورود Nginx (پورت‌های ۸۰ و ۴۴۳) با گواهی SSL و کش محتوا.
2. `rally_frontend`: وب‌سرور سبک Alpine جهت سرویس‌دهی باندل کامپایل‌شده React SPA.
3. `rally_backend`: سرور API مبتنی بر FastAPI و ورکر Uvicorn.
4. `rally_postgres`: موتور پایگاه‌داده PostgreSQL 16 همراه با والوم‌های پایدار ذخیره‌سازی داده.
5. `rally_redis`: سرور رم‌محور کش و صف‌های هم‌روندی.

---

## ۲. دستورالعمل ارتقا و استقرار پیوسته (Deployment Procedure)

### مرحله اول: پیش‌پرواز و اعتبارسنجی محلی (Local Pre-Flight)
پیش از ارسال به سرور لایو، اجرای موفق این دو دستور اجباری است:
```bash
# ۱. اجرای کامل و قبولی ۱۰۰٪ آزمون‌های بک‌اند
python -m pytest backend/tests

# ۲. ساخت بیلد بهینه فرانت‌اند بدون خطای تایپ‌اسکریپت
cd frontend && npm run build
```

### مرحله دوم: پشتیبان‌گیری لحظه‌ای از پایگاه داده (Pre-Deploy Backup)
روی سرور لایو، پیش از هر تغییر دستور زیر اجرا می‌شود:
```bash
bash /root/Padel/scripts/backup_db.sh
```
این اسکریپت یک نسخه فشرده با مهر زمانی دقیق در مسیر `/root/db_backups/` ایجاد می‌کند.

### مرحله سوم: دریافت آخرین کد و بازسازی کانتینرها (Build & Rollout)
```bash
cd /root/Padel
git pull origin 001-court-booking-engine

# بازسازی کانتینرهای تغییریافته بدون قطعی سرویس پایگاه‌داده
docker compose build frontend backend
docker compose up -d --no-deps frontend backend gateway
```

### مرحله چهارم: مانیتورینگ اولیه و بررسی سلامت (Health Verification)
```bash
# بررسی وضعیت کانتینرها
docker compose ps

# بررسی لاگ‌های لایو بک‌اند برای اطمینان از بالا آمدن
docker compose logs --tail=50 backend

# استعلام سلامت از دروازه
curl -I https://raally.ir/
curl -s https://raally.ir/api/v1/health | jq .
```

---

## ۳. طرح بازگشت اضطراری به عقب (Emergency Rollback Plan)

در صورت بروز خطای پیش‌بینی‌نشده در عملکرد، کرش کانتینرها، یا گزارش باگ مالی، فوراً این فرآیند اجرا می‌شود:

### گام ۱: بازگشت کد به آخرین کامیت پایدار در گیت
```bash
cd /root/Padel
# بازگشت به کامیت پایدار قبلی
git log --oneline -n 5
git reset --hard <STABLE_COMMIT_HASH>
```

### گام ۲: بازنشانی کانتینرها به نسخه قبلی
```bash
docker compose build frontend backend
docker compose up -d
```

### گام ۳: بازگردانی پایگاه داده (در صورت اجرای مایگریشن معیوب)
```bash
# متوقف کردن موقت سرویس بک‌اند
docker compose stop backend

# بازگردانی فایل بک‌آپ دیتابیس به PostgreSQL
gunzip < /root/db_backups/backup_padel_YYYYMMDD_HHMMSS.sql.gz | docker exec -i rally_postgres psql -U padel_user -d padel_prod

# راه‌اندازی مجدد بک‌اند
docker compose start backend
```

---

## ۴. ماتریس بررسی پس از استقرار (Sanity Checklist)
- [ ] باز شدن موفقیت‌آمیز صفحه اصلی با پروتکل امن HTTPS و کد ۲۰۰.
- [ ] عملکرد بی‌نقص لاگین با کد OTP بدون نشت کد آزمایشی.
- [ ] اعتبارسنجی احراز هویت در کیف پول و رد درخواست‌های فاقد توکن با ۴۰۱.
- [ ] بررسی قفل موقت (Hold) کورت‌ها و عدم ایجاد رزرو دوگانه.
- [ ] استعلام موجودی واقعی کیف پول و عدم نمایش موجودی هاردکد.

</div>

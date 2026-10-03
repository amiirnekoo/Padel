import sys
import os
import time
import sqlite3
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 75)
print("🛡️ مانور عملیاتی بازگشت به عقب (Full Rollback Drill & Timing)")
print("   ۱. بررسی سازگاری افزایشی بدون بازیابی دیتابیس (Zero DB Restore Check)")
print("   ۲. تمرین کامل Rollback با بازیابی پشتیبان ساختاریافته در PostgreSQL 16")
print("   ۳. محدودسازی مسیرهای حساس در صورت بازگشت به نسخه دارای ضعف امنیتی")
print("=" * 75)

total_start = time.perf_counter()

# ۱. ارزیابی مایگریشن افزایشی: آیا برنامه نسخه قبلی بدون دستکاری دیتابیس کار می‌کند؟
print("\n[گام ۱] ارزیابی سازگاری عقبرو (Backward-Compatibility of Schema):")
test_db = "padel.db"
conn = sqlite3.connect(test_db)
cur = conn.cursor()

try:
    # کوئری‌های کد نسخه قدیمی (بدون اطلاع از ستون‌های جدید email, preferred_sport, dominant_hand)
    cur.execute("SELECT id, phone_number, full_name, is_active FROM users LIMIT 3")
    old_code_users = cur.fetchall()
    print(f"   ✅ خواندن داده‌ها توسط کوئری نسخه قبلی با موفقیت انجام شد: {len(old_code_users)} کاربر یافت شد.")

    # کوئری درج کاربر جدید توسط کد نسخه قبلی (که فیلدهای جدید را پاس نمی‌دهد)
    test_old_user_id = f"usr-old-{int(time.time())}"
    cur.execute(
        "INSERT INTO users (id, phone_number, full_name, role, kyc_status, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
        (test_old_user_id, f"0935{int(time.time())%10000000:07d}", "کاربر نسخه قدیمی", "PLAYER", "VERIFIED", 1)
    )
    conn.commit()
    print("   ✅ درج کاربر جدید با کوئری نسخه قدیمی روی اسکیما افزایشی با موفقیت انجام شد.")

    # نتیجه‌گیری فنی
    print("   💡 نتیجه: به دلیل ماهیت افزایشی (Nullable بودن ستون‌های جدید)، در صورت رول‌بک برنامه،")
    print("      هیچ نیازی به Restore دیتابیس نیست (RTO برابر با صفر ثانیه برای لایه داده).")
except Exception as e:
    print(f"   ❌ خطا در سازگاری عقبرو: {e}")
    sys.exit(1)
finally:
    conn.close()

# ۲. تمرین کامل Rollback با بازیابی پایگاه‌داده در محیط کانتینری ایزوله (PG16)
print("\n[گام ۲] تمرین عملیاتی Rollback کامل و اندازه‌گیری زمان واقعی (RTO Benchmark):")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("213.176.121.117", port=22, username="root", password="655crYvKR5", timeout=10)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return code, out, err

drill_db = "padel_rollback_drill_db"
backup_dump = "/tmp/drill_backup.dump"
restore_time = 0.0

try:
    # الف) ایجاد دیتابیس آزمایشی و پر کردن داده
    print(f"   ۱. ایجاد پایگاه داده آزمایشی ایزوله '{drill_db}'...")
    code, out, err = run(f'docker exec -i rally_postgres psql -U padel_user -d postgres -c "DROP DATABASE IF EXISTS {drill_db};"')
    code, out, err = run(f'docker exec -i rally_postgres psql -U padel_user -d postgres -c "CREATE DATABASE {drill_db};"')
    assert code == 0, f"خطا در ساخت دیتابیس: {err}"
    code, out, err = run(f'docker exec -i rally_postgres psql -U padel_user -d {drill_db} -c "CREATE TABLE users (id VARCHAR(36) PRIMARY KEY, phone VARCHAR(15), balance BIGINT); INSERT INTO users VALUES (\'u1\', \'09120000000\', 5000000);"')
    assert code == 0, f"خطا در درج داده: {err}"

    # ب) تهیه بک‌آپ ساختاریافته منجمد (pg_dump -F c)
    print("   ۲. تهیه پشتیبان منجمد ساختاریافته (pg_dump -F c)...")
    t_freeze = time.perf_counter()
    code, out, err = run(f"docker exec -i rally_postgres pg_dump -U padel_user -d {drill_db} -F c -f {backup_dump}")
    assert code == 0, f"خطا در بک‌آپ: {err}"
    t_backed = time.perf_counter()
    backup_time = t_backed - t_freeze
    print(f"      ⏱️ زمان ثبت بک‌آپ ساختاریافته: {backup_time:.2f} ثانیه")

    # ج) شبیه‌سازی رخ‌دادن خطا یا تغییر نامطلوب در نسخه جدید
    print("   ۳. شبیه‌سازی اعمال تغییرات معیوب (Corrupted Data / Broken Migration)...")
    run(f'docker exec -i rally_postgres psql -U padel_user -d {drill_db} -c "ALTER TABLE users ADD COLUMN corrupted_data TEXT DEFAULT \'CORRUPT\'; UPDATE users SET balance = 0;"')

    # د) شروع رول‌بک: قطع اتصالات و بازیابی کامل از پشتیبان
    t_restore_start = time.perf_counter()
    print("   ۴. آغاز فرآیند بازیابی: قطع اتصالات، بازسازی دیتابیس و pg_restore...")
    run(f'docker exec -i rally_postgres psql -U padel_user -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = \'{drill_db}\' AND pid != pg_backend_pid();"')
    run(f'docker exec -i rally_postgres psql -U padel_user -d postgres -c "DROP DATABASE {drill_db};"')
    run(f'docker exec -i rally_postgres psql -U padel_user -d postgres -c "CREATE DATABASE {drill_db};"')
    code, out, err = run(f"docker exec -i rally_postgres pg_restore -U padel_user -d {drill_db} {backup_dump}")
    t_restore_end = time.perf_counter()
    restore_time = t_restore_end - t_restore_start
    print(f"      ⏱️ زمان بازیابی کامل دیتابیس (RTO): {restore_time:.2f} ثانیه")

    # هـ) اعتبارسنجی صحت داده‌های بازگردانده شده
    code, out, _ = run(f'docker exec -i rally_postgres psql -U padel_user -d {drill_db} -t -c "SELECT count(*), sum(balance) FROM users;"')
    out_parts = out.strip().split('|')
    user_count = out_parts[0].strip()
    user_sum = out_parts[1].strip()
    print(f"   ✅ اعتبارسنجی یکپارچگی داده‌ها پس از رول‌بک: تعداد کاربر={user_count}، مانده کل={user_sum}")
    assert user_count == "1" and user_sum == "5000000", "ناهمخوانی داده پس از رول‌بک!"

    # پاکسازی دیتابیس و فایل دامپ آزمایشی
    run(f'docker exec -i rally_postgres psql -U padel_user -d postgres -c "DROP DATABASE {drill_db};"')
    run(f'docker exec -i rally_postgres rm -f {backup_dump}')
    print("   ✅ دیتابیس و فایل‌های آزمایشی ایزوله پاکسازی شدند.")

except Exception as ex:
    print(f"   ❌ خطا در مانور رول‌بک دیتابیس: {ex}")
    sys.exit(1)
finally:
    client.close()

# ۳. تدابیر امنیتی در صورت بازگشت به نسخه دارای ضعف امنیتی (Restrict Sensitive Routes)
print("\n[گام ۳] اعمال محدودیت‌های امنیتی لبه (Reverse Proxy Strict Controls):")
nginx_security_rules = """
# Nginx Security Shield for Rollback to legacy vulnerable versions
location ~ ^/api/v1/(admin|operator|auth/reset-password|debug) {
    # مسدودسازی دسترسی عمومی به مسیرهای حساس تا زمان اعمال پچ امنیتی
    allow 127.0.0.1;
    allow 213.176.121.117;
    deny all;
    return 403 '{"error": "Access restricted during security rollback mode"}';
}
"""
print("   ✅ قوانین Nginx جهت قرنطینه کردن مسیرهای حساس در حالت رول‌بک آماده شد:")
for line in nginx_security_rules.strip().split('\n'):
    print(f"      {line}")

total_elapsed = time.perf_counter() - total_start
print("\n" + "=" * 75)
print(f"🎉 مانور رول‌بک کامل با موفقیت ۱۰۰٪ پایان یافت.")
print(f"⏱️ زمان اندازه‌گیری‌شده بازیابی دیتابیس (RTO): {restore_time:.2f} ثانیه")
print(f"⏱️ زمان کل تمرین فرآیند رول‌بک: {total_elapsed:.2f} ثانیه")
print("=" * 75)

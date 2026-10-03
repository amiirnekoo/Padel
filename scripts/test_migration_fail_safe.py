import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 70)
print("🧪 آزمون اعتبارسنجی شکست ایمن مایگریشن (Safe Migration Abort & Rollback)")
print("   بر روی پایگاه داده ایزوله PostgreSQL 16 در کانتینر rally_postgres")
print("=" * 70)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("213.176.121.117", port=22, username="root", password="655crYvKR5", timeout=10)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return code, out, err

try:
    # ۱. ایجاد دیتابیس ایزوله برای تست شکست مایگریشن
    print("۱. آماده‌سازی دیتابیس ایزوله padel_test_migration_fail...")
    run('docker exec -i rally_postgres psql -U padel_user -d postgres -c "DROP DATABASE IF EXISTS padel_test_migration_fail;"')
    run('docker exec -i rally_postgres psql -U padel_user -d postgres -c "CREATE DATABASE padel_test_migration_fail;"')

    # ایجاد جدول اولیه users
    run('docker exec -i rally_postgres psql -U padel_user -d padel_test_migration_fail -c "CREATE TABLE users (id VARCHAR(36) PRIMARY KEY, phone_number VARCHAR(20) UNIQUE NOT NULL);"')
    print("   ✅ جدول اولیه users ایجاد گردید.")

    # بررسی ستون‌های اولیه
    code, out, _ = run("docker exec -i rally_postgres psql -U padel_user -d padel_test_migration_fail -t -c \"SELECT column_name FROM information_schema.columns WHERE table_name='users';\"")
    initial_cols = [c.strip() for c in out.split() if c.strip()]
    print(f"   ستون‌های اولیه جدول users: {initial_cols}")
    assert "email" not in initial_cols
    assert "preferred_sport" not in initial_cols

    # ۲. تزریق خطای عمدی در اسکریپت مایگریشن
    print("\n۲. اجرای مایگریشن حاوی خطای عمدی با ON_ERROR_STOP=1 و --single-transaction...")
    bad_migration_sql = """
    BEGIN;
    ALTER TABLE users ADD COLUMN email VARCHAR(100);
    DELIBERATE_SYNTAX_ERROR_AT_LINE_3;
    ALTER TABLE users ADD COLUMN preferred_sport VARCHAR(20);
    COMMIT;
    """
    
    # انتقال اسکریپت معیوب و اجرای آن
    run('cat << \'EOF\' > /tmp/bad_migration.sql\n' + bad_migration_sql + '\nEOF')
    code, out, err = run('docker exec -i rally_postgres psql -U padel_user -d padel_test_migration_fail -v ON_ERROR_STOP=1 --single-transaction < /tmp/bad_migration.sql')
    
    print(f"   کد خروج psql: {code} (انتظار: غیر صفر)")
    print(f"   خروجی خطا (stderr): {err}")
    assert code != 0, f"انتظار خطا داشتیم اما کد خروج {code} بود!"
    assert "syntax error" in err.lower() or "deliberate_syntax_error" in err.lower() or "error" in err.lower()
    print("   ✅ اثبات شد: psql خطای سینتکس خط ۳ را تشخیص داد و بلافاصله متوقف گردید.")

    # ۳. راستی‌آزمایی عدم ثبت تغییرات ناقص (No Partial Changes)
    print("\n۳. اعتبارسنجی رول‌بک کامل تراکنش و عدم وجود ستون‌های ناقص...")
    code, out, _ = run("docker exec -i rally_postgres psql -U padel_user -d padel_test_migration_fail -t -c \"SELECT column_name FROM information_schema.columns WHERE table_name='users';\"")
    after_cols = [c.strip() for c in out.split() if c.strip()]
    print(f"   ستون‌های جدول پس از خطای مایگریشن: {after_cols}")

    assert "email" not in after_cols, "خطا! ستون email علیرغم شکست مایگریشن ایجاد شده است!"
    assert "preferred_sport" not in after_cols, "خطا! ستون preferred_sport ایجاد شده است!"
    assert after_cols == initial_cols, "ساختار جدول دچار تغییر ناقص شده است!"

    print("   ✅ اثبات شد: تراکنش مایگریشن به طور کامل Rollback شد و دیتابیس دقیقاً به وضعیت اولیه برگشت.")
    print("\n" + "=" * 70)
    print("🎉 تست شکست ایمن مایگریشن (Fail-Safe Migration) با موفقیت ۱۰۰٪ تأیید شد!")
    print("=" * 70)

finally:
    run('docker exec -i rally_postgres psql -U padel_user -d postgres -c "DROP DATABASE IF EXISTS padel_test_migration_fail;"')
    run('rm -f /tmp/bad_migration.sql')
    client.close()

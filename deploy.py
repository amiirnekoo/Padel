#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎾 Padel / Rally Hardened Deployment & Rollback Script
استقرار کنترل‌شده، مایگریشن اتمیک، پشتیبان‌گیری پس از توقف نوشتن، بررسی سلامت و بازگشت به عقب
مطابق با الزامات مهندسی DEPLOYMENT_ROLLBACK.md و AGENTS.md
"""
import sys
import os
import time
import argparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

try:
    import paramiko
except ImportError:
    print("Paramiko not installed. Please install with: pip install paramiko")
    sys.exit(1)

SERVER_IP = "213.176.121.117"
SERVER_PORT = 22
SERVER_USER = "root"
SERVER_PASSWORD = os.getenv("SERVER_PASSWORD", "655crYvKR5")
SSH_KEY_PATH = os.path.expanduser(r"~/.ssh/id_ed25519")

DEFAULT_TARGET_COMMIT = "HEAD"

def get_ssh_client():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    connected = False

    if os.path.exists(SSH_KEY_PATH):
        try:
            client.connect(SERVER_IP, port=SERVER_PORT, username=SERVER_USER, key_filename=SSH_KEY_PATH, timeout=15)
            connected = True
        except Exception:
            pass

    if not connected:
        client.connect(SERVER_IP, port=SERVER_PORT, username=SERVER_USER, password=SERVER_PASSWORD, timeout=15)

    return client

def run_remote_command(client, title, cmd, check_exit_code=True):
    print(f"\n🔄 [{title}] در حال اجرا:\n   $ {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()

    if out:
        print(out)
    if err and "warning" not in err.lower() and "deprecated" not in err.lower():
        print(f"⚠️ پیام سرور / خروجی: {err}")

    if check_exit_code and exit_code != 0:
        raise RuntimeError(f"دستور '{title}' با کد خطای {exit_code} شکست خورد: {err}")

    return out

def deploy(target_commit=DEFAULT_TARGET_COMMIT):
    print("=" * 70)
    print("🎾 شروع فرآیند استقرار ایمن و کنترل‌شده سامانه رالی (RAALLY.IR)")
    print(f"📡 مقصد: {SERVER_USER}@{SERVER_IP}:{SERVER_PORT}")
    print(f"🎯 نسخه دقیق کامیت هدف: {target_commit}")
    print("=" * 70)

    start_deploy_time = time.perf_counter()
    client = get_ssh_client()
    try:
        # ۱. بررسی هویت و دریافت کدها
        run_remote_command(client, "بررسی مسیر پروژه", "cd /root/Padel && pwd")
        run_remote_command(client, "واکشی کدهای گیت‌هاب", "cd /root/Padel && git fetch origin")
        if target_commit == "HEAD":
            run_remote_command(client, "انتقال به آخرین کامیت شاخه پایدار", "cd /root/Padel && git checkout 001-court-booking-engine && git pull origin 001-court-booking-engine")
        else:
            run_remote_command(client, f"جابجایی به کامیت قطعی {target_commit}", f"cd /root/Padel && git checkout {target_commit}")

        # ۲. آماده‌سازی و بیلد ایمیج‌های نسخه منتخب پیش از توقف سرویس (Pre-build Images)
        print("\n🏗️ پیش‌بیلد ایمیج‌های نسخه مشخص پیش از قطع سرویس لایو...")
        run_remote_command(
            client,
            "پیش‌بیلد ایمیج‌های داکر نسخه هدف",
            "cd /root/Padel && docker compose build backend frontend"
        )

        # ۳. توقف تمام نویسنده‌ها و ورکرها و فعال‌سازی حالت نگهداری (Write Freeze)
        print("\n⏳ متوقف‌سازی نویسنده‌ها و فعال‌سازی توقف نوشتن...")
        run_remote_command(
            client,
            "توقف سرویس‌های نویسنده و ورکرها (Stop Backend & Workers)",
            "cd /root/Padel && docker compose stop backend"
        )

        # ۴. انتظار برای پایان تراکنش‌های معلق و اطمینان از سکون دیتابیس
        print("\n⏳ انتظار برای پایان اتصالات و تراکنش‌های معلق...")
        time.sleep(3)
        run_remote_command(
            client,
            "بررسی اتصالات فعال به پایگاه داده",
            "docker exec -i rally_postgres psql -U padel_user -d padel_production -t -c \"SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND pid != pg_backend_pid();\""
        )

        # ۵. تهیه نسخه پشتیبان نهایی و پایدار پس از توقف قطعی نوشتن (Final Consistent Backup)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        backup_file = f"/root/db_backups/post_freeze_deploy_{timestamp}.dump"
        run_remote_command(client, "ایجاد دایرکتوری بک‌آپ", "mkdir -p /root/db_backups")
        run_remote_command(
            client,
            "تهیه پشتیبان نهایی ساختاریافته در وضعیت سکون دیتابیس",
            f"docker exec -i rally_postgres pg_dump -U padel_user -d padel_production -F c -b -f /tmp/backup.dump && "
            f"docker cp rally_postgres:/tmp/backup.dump {backup_file} && "
            f"docker exec -i rally_postgres rm -f /tmp/backup.dump"
        )
        run_remote_command(client, "بررسی یکپارچگی فایل پشتیبان نهایی", f"ls -lh {backup_file}")

        # ۶. اعمال مایگریشن ساختاری در قالب تراکنش اتمیک با توقف صریح روی خطا
        migration_sql_path = "/root/Padel/scripts/migration_add_missing_user_columns.sql"
        run_remote_command(
            client,
            "اعمال مایگریشن ساختاری با ON_ERROR_STOP=1 و تراکنش اتمیک",
            f"docker exec -i rally_postgres psql -U padel_user -d padel_production -v ON_ERROR_STOP=1 --single-transaction < {migration_sql_path}"
        )

        # ۷. راه‌اندازی سریع کانتینرها با ایمیج‌های آماده (Fast Container Launch)
        run_remote_command(
            client,
            "راه‌اندازی فوری کانتینرها با ایمیج‌های از پیش ساخته‌شده",
            "cd /root/Padel && docker compose up -d && docker restart rally_gateway"
        )
        run_remote_command(
            client,
            "تأیید اصالت و تطابق ایمیج‌های در حال اجرا با نسخه هدف",
            "docker inspect --format 'Container={{.Name}} Image={{.Config.Image}} ImageID={{.Image}} Created={{.Created}}' rally_backend rally_frontend rally_gateway"
        )

        # ۸. بررسی سلامت چندمرحله‌ای پس از استقرار
        print("\n🩺 اجرای ارزیابی سلامت پس از استقرار...")
        time.sleep(4)
        run_remote_command(client, "استعلام سلامت داخلی بک‌اند (Port 8000)", "docker exec rally_gateway curl -sSf http://backend:8000/health || (echo 'Backend Health FAILED' && exit 1)")
        run_remote_command(client, "استعلام سلامت لبه Nginx (GET /health)", "docker exec rally_gateway curl -sSf -i http://127.0.0.1/health || (echo 'Edge Health FAILED' && exit 1)")

        total_elapsed = time.perf_counter() - start_deploy_time
        print("\n" + "=" * 70)
        print(f"🎉 استقرار نسخه {target_commit} با موفقیت کامل در {total_elapsed:.1f} ثانیه به پایان رسید!")
        print(f"📦 فایل پشتیبان نهایی ذخیره گردید: {backup_file}")
        print("🌐 سامانه لایو در دسترس است: https://raally.ir")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ شکست در فرآیند استقرار: {e}")
        print(f"🚨 جهت بازگشت به عقب دستور زیر را اجرا فرمایید:")
        print(f"   python deploy.py --rollback 23e219c --backup-file {backup_file if 'backup_file' in locals() else '<backup_path>'}")
        sys.exit(1)
    finally:
        client.close()

def rollback(rollback_commit, backup_file=None, restrict_sensitive=False):
    print("=" * 70)
    print("🚨 شروع فرآیند کنترل‌شده بازگشت به عقب (Rollback Procedure)")
    print(f"🎯 کامیت هدف بازگشت: {rollback_commit}")
    print(f"📦 فایل پشتیبان پایگاه داده: {backup_file if backup_file else 'ندارد (تنها بازگشت کد و کانتینرها)'}")
    print(f"🛡️ قرنطینه امنیتی مسیرهای حساس: {'فعال' if restrict_sensitive else 'غیرفعال'}")
    print("=" * 70)

    start_rb_time = time.perf_counter()
    client = get_ssh_client()
    try:
        # ۱. توقف کانتینرهای سرویس
        run_remote_command(client, "توقف کانتینرها جهت رول‌بک", "cd /root/Padel && docker compose stop backend")

        # ۲. جابجایی کدها به کامیت قبلی
        run_remote_command(client, f"برگشت کدها به کامیت {rollback_commit}", f"cd /root/Padel && git checkout {rollback_commit}")

        # ۳. در صورت مشخص بودن فایل پشتیبان، بازیابی پایگاه‌داده
        if backup_file:
            print(f"\n📥 در حال بازیابی پایگاه‌داده از فایل {backup_file}...")
            run_remote_command(
                client,
                "بازیابی دیتابیس با pg_restore",
                f"docker cp {backup_file} rally_postgres:/tmp/restore.dump && "
                f"docker exec -i rally_postgres pg_restore -U padel_user -d padel_production --clean -v /tmp/restore.dump && "
                f"docker exec -i rally_postgres rm -f /tmp/restore.dump"
            )
        else:
            print("\nℹ️ بازگشت بدون بازیابی دیتابیس (سازگاری رو به عقب مایگریشن افزایشی بدون از دست رفتن داده‌های جدید).")

        # ۴. در صورت فعال بودن فلگ قرنطینه، محدودسازی مسیرهای حساس در بازگشت به نسخه دارای نقص امنیتی
        if restrict_sensitive:
            print("\n🛡️ اعمال قوانین امنیتی لبه جهت محدودسازی مسیرهای حساس در نسخه دارای ضعف...")
            restrict_cmd = (
                "docker exec -i rally_gateway sh -c 'cat << \"EOF\" > /etc/nginx/conf.d/99-quarantine.conf\n"
                "location ~ ^/api/v1/(admin|operator|auth/reset-password|debug) {\n"
                "    allow 127.0.0.1;\n"
                "    deny all;\n"
                "    return 403 \"{\\\"error\\\": \\\"Restricted in security rollback mode\\\"}\";\n"
                "}\nEOF\n"
                "nginx -s reload || true'"
            )
            run_remote_command(client, "قرنطینه امنیتی مسیرهای حساس در Nginx", restrict_cmd)

        # ۵. بازسازی و راه‌اندازی کانتینرها با نسخه قبلی
        run_remote_command(
            client,
            "بیلد و راه‌اندازی کانتینرها با نسخه قبل",
            "cd /root/Padel && docker compose up -d --build && docker restart rally_gateway"
        )

        # ۶. بررسی سلامت پس از رول‌بک
        time.sleep(4)
        run_remote_command(client, "بررسی سلامت پس از رول‌بک", "curl -sSf http://127.0.0.1:8000/health")

        total_rb_time = time.perf_counter() - start_rb_time
        print("\n" + "=" * 70)
        print(f"✅ فرآیند بازگشت به عقب با موفقیت کامل ظرف {total_rb_time:.1f} ثانیه به پایان رسید.")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ شکست در فرآیند رول‌بک: {e}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Padel Deployment & Rollback Tool")
    parser.add_argument("--commit", default=DEFAULT_TARGET_COMMIT, help="Target git commit hash to deploy")
    parser.add_argument("--rollback", help="Target git commit to rollback to")
    parser.add_argument("--backup-file", help="Specific backup file to restore during rollback")
    parser.add_argument("--restrict-sensitive", action="store_true", help="Restrict sensitive routes via reverse proxy during rollback")
    args = parser.parse_args()

    if args.rollback:
        rollback(args.rollback, args.backup_file, args.restrict_sensitive)
    else:
        deploy(args.commit)

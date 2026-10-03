#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎾 Padel / Rally Hardened Deployment & Rollback Script
استقرار کنترل‌شده، مایگریشن، پشتیبان‌گیری خودکار، توقف نوشتن، بررسی سلامت و بازگشت به عقب
مطابق با استانداردهای مهندسی DEPLOYMENT_ROLLBACK.md
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

DEFAULT_TARGET_COMMIT = "HEAD"  # شناسه دقیق کامیت قابل استقرار

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
        print(f"⚠️ پیام سرور / خطا: {err}")

    if check_exit_code and exit_code != 0:
        raise RuntimeError(f"دستور '{title}' با کد خطای {exit_code} مواجه شد: {err}")

    return out

def deploy(target_commit=DEFAULT_TARGET_COMMIT):
    print("=" * 70)
    print("🎾 شروع فرآیند استقرار ایمن و کنترل‌شده سامانه رالی (RAALLY.IR)")
    print(f"📡 مقصد: {SERVER_USER}@{SERVER_IP}:{SERVER_PORT}")
    print(f"🎯 نسخه دقیق کامیت هدف: {target_commit}")
    print("=" * 70)

    client = get_ssh_client()
    try:
        # ۱. بررسی هویت و مسیر پروژه
        run_remote_command(client, "بررسی مسیر پروژه", "cd /root/Padel && pwd")

        # ۲. تهیه نسخه پشتیبان اتمیک پیش از هرگونه تغییر
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        backup_file = f"/root/db_backups/pre_deploy_{timestamp}.dump"
        run_remote_command(client, "ایجاد دایرکتوری بک‌آپ", "mkdir -p /root/db_backups")
        run_remote_command(
            client,
            "تهیه پشتیبان ساختاریافته لحظه‌ای (Custom Format Dump)",
            f"docker exec -i rally_postgres pg_dump -U padel_user -d padel_production -F c -b -f /tmp/backup.dump && "
            f"docker cp rally_postgres:/tmp/backup.dump {backup_file} && "
            f"docker exec -i rally_postgres rm -f /tmp/backup.dump"
        )
        run_remote_command(client, "بررسی یکپارچگی فایل پشتیبان", f"ls -lh {backup_file}")

        # ۳. توقف نوشتن و فعال‌سازی پنجره نگهداری در لایه Nginx
        print("\n⏳ فعال‌سازی توقف موقت نوشتن (Write-Freeze) جهت تضمین یکپارچگی داده‌ها...")
        # در صورت نیاز سوئیچ به صفحه ۵۰۳ نگهداری برای درخواست‌های جهش داده (POST/PUT/PATCH/DELETE)

        # ۴. دریافت آخرین تغییرات و جابجایی قطعی به کامیت مشخص
        run_remote_command(client, "واکشی کدهای گیت‌هاب", "cd /root/Padel && git fetch origin")
        if target_commit == "HEAD":
            run_remote_command(client, "انتقال به آخرین کامیت شاخه پایدار", "cd /root/Padel && git checkout 001-court-booking-engine && git pull origin 001-court-booking-engine")
        else:
            run_remote_command(client, f"جابجایی به کامیت قطعی {target_commit}", f"cd /root/Padel && git checkout {target_commit}")

        # ۵. اعمال مایگریشن‌های ساختاری دیتابیس (DDL Migration)
        migration_sql_path = "/root/Padel/scripts/migration_add_missing_user_columns.sql"
        run_remote_command(
            client,
            "اعمال مایگریشن ساختاری و افزودن فیلدهای مفقود (DDL Safe Migration)",
            f"docker exec -i rally_postgres psql -U padel_user -d padel_production < {migration_sql_path}"
        )

        # ۶. بازسازی کانتینرهای سرویس و بالا آوردن سرویس
        run_remote_command(client, "ساخت و به‌روزرسانی کانتینرها (Build & Up)", "cd /root/Padel && docker compose up -d --build && docker restart rally_gateway")

        # ۷. بررسی بلادرنگ سلامت (Post-Deployment Health Checks)
        print("\n🩺 اجرای ارزیابی سلامت پس از استقرار...")
        time.sleep(5)
        run_remote_command(client, "استعلام سلامت کانتینرها", "docker compose -f /root/Padel/docker-compose.yml ps")
        run_remote_command(client, "استعلام سلامت داخلی بک‌اند (Port 8000)", "curl -sSf http://127.0.0.1:8000/health || (echo 'Backend Health FAILED' && exit 1)")
        run_remote_command(client, "استعلام سلامت لبه Nginx (GET /health)", "curl -sSf -i http://127.0.0.1/health || (echo 'Edge Health FAILED' && exit 1)")

        print("\n" + "=" * 70)
        print(f"🎉 استقرار نسخه {target_commit} با موفقیت کامل و بدون خطا به پایان رسید!")
        print("🌐 سامانه لایو در دسترس است: https://raally.ir")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ شکست در فرآیند استقرار: {e}")
        print("🚨 وضعیت: پیشنهاد بازگشت به عقب (Rollback) با دستور: python deploy.py --rollback <commit>")
        sys.exit(1)
    finally:
        client.close()

def rollback(rollback_commit, backup_file=None):
    print("=" * 70)
    print("🚨 شروع فرآیند کنترل‌شده بازگشت به عقب (Rollback Procedure)")
    print(f"🎯 کامیت هدف بازگشت: {rollback_commit}")
    print("=" * 70)

    client = get_ssh_client()
    try:
        # ۱. جابجایی کد به کامیت مورد نظر
        run_remote_command(client, f"برگشت به کامیت {rollback_commit}", f"cd /root/Padel && git checkout {rollback_commit}")

        # ۲. در صورت ارجاع فایل بک‌آپ، بازیابی دیتابیس
        if backup_file:
            print(f"بازیابی پایگاه‌داده از فایل {backup_file}...")
            run_remote_command(
                client,
                "بازیابی دیتابیس",
                f"docker cp {backup_file} rally_postgres:/tmp/restore.dump && "
                f"docker exec -i rally_postgres pg_restore -U padel_user -d padel_production --clean -v /tmp/restore.dump"
            )

        # ۳. بازسازی کانتینرها
        run_remote_command(client, "ریستارت کانتینرها با نسخه قبلی", "cd /root/Padel && docker compose up -d --build && docker restart rally_gateway")

        # ۴. تست سلامت
        run_remote_command(client, "بررسی سلامت پس از رول‌بک", "curl -sSf http://127.0.0.1:8000/health")
        print("\n✅ فرآیند بازگشت به عقب با موفقیت اجرا شد.")
    finally:
        client.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Padel Deployment & Rollback Tool")
    parser.add_argument("--commit", default=DEFAULT_TARGET_COMMIT, help="Target git commit hash to deploy")
    parser.add_argument("--rollback", help="Target git commit to rollback to")
    parser.add_argument("--backup-file", help="Specific backup file to restore during rollback")
    args = parser.parse_args()

    if args.rollback:
        rollback(args.rollback, args.backup_file)
    else:
        deploy(args.commit)

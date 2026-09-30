#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎾 Padel / Rally One-Click Deployment Script
استقرار تک‌کلیکی و همگام‌سازی مستقیم سرور با مخزن گیت‌هاب
"""
import sys
import os
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

try:
    import paramiko
except ImportError:
    print("Paramiko not installed in current environment. Please install with: pip install paramiko")
    sys.exit(1)

SERVER_IP = "213.176.121.117"
SERVER_PORT = 22
SERVER_USER = "root"
SERVER_PASSWORD = os.getenv("SERVER_PASSWORD", "655crYvKR5")
SSH_KEY_PATH = os.path.expanduser(r"~/.ssh/id_ed25519")

def deploy():
    print("=" * 60)
    print("🎾 شروع فرآیند استقرار خودکار روی سرور لایو Padel / Rally...")
    print(f"📡 مقصد: {SERVER_USER}@{SERVER_IP}:{SERVER_PORT}")
    print("=" * 60)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    connected = False
    if os.path.exists(SSH_KEY_PATH):
        try:
            print(f"🔑 تلاش برای اتصال با کلید امن SSH: {SSH_KEY_PATH}")
            client.connect(
                SERVER_IP,
                port=SERVER_PORT,
                username=SERVER_USER,
                key_filename=SSH_KEY_PATH,
                timeout=15,
            )
            connected = True
            print("✅ اتصال با موفقیت از طریق SSH Key برقرار شد.")
        except Exception as e:
            print(f"⚠️ اتصال با کلید ناموفق بود ({e}). تلاش با رمز عبور...")

    if not connected:
        try:
            client.connect(
                SERVER_IP,
                port=SERVER_PORT,
                username=SERVER_USER,
                password=SERVER_PASSWORD,
                timeout=15,
            )
            connected = True
            print("✅ اتصال با موفقیت از طریق Password برقرار شد.")
        except Exception as e:
            print(f"❌ خطا در برقراری ارتباط با سرور: {e}")
            sys.exit(1)

    commands = [
        ("بررسی مسیر پروژه", "cd /root/Padel && pwd"),
        ("دریافت آخرین تغییرات از گیت‌هاب (Git Pull)", "cd /root/Padel && git fetch origin && git pull origin 001-court-booking-engine"),
        ("اعمال پیکربندی بهینه‌سازی همزمانی و بیلد کانتینرها", "cd /root/Padel && docker compose up -d --build"),
        ("بررسی وضعیت کانتینرهای فعال", "docker compose -f /root/Padel/docker-compose.yml ps"),
    ]

    for title, cmd in commands:
        print(f"\n🔄 [{title}] در حال اجرا: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        
        if out:
            print(out.strip())
        if err and "warning" not in err.lower() and "deprecated" not in err.lower():
            print(f"گزارش خطا / هشدار: {err.strip()}")

    print("\n" + "=" * 60)
    print("🎉 استقرار با موفقیت کامل انجام شد!")
    print("🌐 سامانه لایو در دسترس است: http://213.176.121.117 یا https://raally.ir")
    print("=" * 60)

    client.close()

if __name__ == "__main__":
    deploy()

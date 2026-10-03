import sys
import os
import asyncio
from httpx import AsyncClient, ASGITransport

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))

# تحمیل قطعی متغیرهای محیطی پروداکشن
os.environ["ENVIRONMENT"] = "production"
os.environ["SMS_PROVIDER"] = "SIMULATOR"
os.environ["ALLOW_DEV_AUTH_BYPASS"] = "false"

from backend.app.core.config import settings
# بازنویسی دستی جهت اطمینان از تنظیمات پروداکشن
settings.ENVIRONMENT = "production"
settings.SMS_PROVIDER = "SIMULATOR"
settings.ALLOW_DEV_AUTH_BYPASS = False

from backend.app.main import app

async def run_test():
    print("=" * 70)
    print("🧪 آزمون اعتبارسنجی رفتار Fail-Closed برای OTP در محیط Production")
    print(f"   محیط: {settings.ENVIRONMENT} | ارائه‌دهنده پیامک: {settings.SMS_PROVIDER}")
    print("=" * 70)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        test_phone = "09129990022"

        # ۱. تلاش برای درخواست کد پیامکی
        print("\n۱. ارسال درخواست کد به /api/v1/auth/otp/request:")
        req_res = await client.post("/api/v1/auth/otp/request", json={"phone_number": test_phone})
        print(f"   وضعیت HTTP: {req_res.status_code}")
        print(f"   پاسخ سرور: {req_res.text}")
        assert req_res.status_code == 503, f"انتظار ۵۰۳ داشتیم اما {req_res.status_code} دریافت شد!"
        assert "غیرفعال" in req_res.text or "کلمه عبور" in req_res.text
        print("   ✅ اثبات شد: درخواست ارسال پیامک مسدود گردید و هیچ کدی صادر نشد.")

        # ۲. تلاش برای ارسال کد تأیید فرضی یا آزمایشی 12345
        print("\n۲. تلاش برای احراز هویت با کد ساختگی و آزمایشی (12345):")
        verify_res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": test_phone, "code": "12345"})
        print(f"   وضعیت HTTP: {verify_res.status_code}")
        print(f"   پاسخ سرور: {verify_res.text}")
        assert verify_res.status_code in [503, 400], f"انتظار خطای ۵۰۳ یا ۴۰۰ داشتیم اما {verify_res.status_code} دریافت شد!"
        assert "access_token" not in verify_res.text
        print("   ✅ اثبات شد: هیچ توکن نشست معتبری صادر نشد و راه ورود پیامکی کاملاً مسدود است.")

        # ۳. تلاش برای ارسال کد تصادفی
        print("\n۳. تلاش برای احراز هویت با کد تصادفی (98765):")
        random_verify_res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": test_phone, "code": "98765"})
        print(f"   وضعیت HTTP: {random_verify_res.status_code}")
        assert random_verify_res.status_code in [503, 400]
        assert "access_token" not in random_verify_res.text
        print("   ✅ اثبات شد: هیچ راه نفوذی برای صدور نشست با OTP در غیاب درگاه واقعی پیامک وجود ندارد.")

    print("\n" + "=" * 70)
    print("🎉 نتیجه نهایی: رفتار Fail-Closed سامانه OTP در تنظیمات Production با موفقیت تایید شد.")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_test())

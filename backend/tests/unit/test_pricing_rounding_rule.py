import pytest
import os
import tempfile
from backend.app.services.supply_rules_service import (
    SupplyRulesService,
    round_price_to_ceil_step,
    calculate_markup_price
)

def test_round_price_to_ceil_step_rackets_multi_million():
    """
    بررسی قانون رندسازی پله‌ای به بالا (۵۰۰ هزار تومانی) برای راکت‌ها و مبالغ بزرگ:
    هر قیمتی باید به نزدیک‌ترین پله ۵۰۰ هزار تومانی بالایی رند شود تا هیچ‌گونه خرده‌ای نداشته باشد.
    """
    # ۹۲,۵۶۰,۰۰۰ باید به ۹۳,۰۰۰,۰۰۰ رند شود (خرده ۵۶۰ هزار تومان حذف شده و به بالا می‌رود)
    assert round_price_to_ceil_step(92560000) == 93000000

    # ۹۲,۱۰۰,۰۰۰ باید به ۹۲,۵۰۰,۰۰۰ رند شود
    assert round_price_to_ceil_step(92100000) == 92500000

    # ۹۲,۵۰۰,۰۰۰ دقیقاً روی پله است و نباید تغییر کند
    assert round_price_to_ceil_step(92500000) == 92500000

    # ۹۲,۰۰۰,۰۰۰ دقیقاً روی پله است و نباید تغییر کند
    assert round_price_to_ceil_step(92000000) == 92000000

    # ۳۶,۴۰۰,۰۰۰ باید به ۳۶,۵۰۰,۰۰۰ رند شود
    assert round_price_to_ceil_step(36400000) == 36500000

    # ۵۵,۵۶۰,۰۰۰ باید به ۵۶,۰۰۰,۰۰۰ رند شود
    assert round_price_to_ceil_step(55560000) == 56000000

    # ۸۱,۱۲۰,۰۰۰ باید به ۸۱,۵۰۰,۰۰۰ رند شود
    assert round_price_to_ceil_step(81120000) == 81500000

    # مقادیر صفر یا منفی
    assert round_price_to_ceil_step(0) == 0
    assert round_price_to_ceil_step(-500) == 0

def test_round_price_to_ceil_step_mid_and_low_range():
    """
    بررسی رندسازی اقلام میانی (کفش، ساک) و اقلام ارزان (اورگریپ، توپ) بدون تحمیل گام ۵۰۰ هزار تومانی.
    """
    # اقلام ۱ تا ۵ میلیون تومان (گام ۵۰ هزار تومانی):
    # ۲,۸۵۲,۰۰۰ -> ۲,۹۰۰,۰۰۰
    assert round_price_to_ceil_step(2852000) == 2900000

    # اقلام زیر ۱ میلیون تومان (گام ۱۰ هزار تومانی):
    # ۴۹۴,۰۰۰ -> ۵۰۰,۰۰۰
    assert round_price_to_ceil_step(494000) == 500000
    # ۷۷۰,۸۰۰ -> ۷۸۰,۰۰۰
    assert round_price_to_ceil_step(770800) == 780000

def test_calculate_markup_price_with_rounding_step():
    """
    بررسی عملکرد calculate_markup_price با فلگ اختیاری round_clean_step:
    در حالت پیش‌فرض (سازگاری ۱۰۰٪ با تست‌های قدیمی) به ۱۰۰۰ تومان رند می‌شود،
    و در حالت فعال، گام ۵۰۰ هزار تومانی به بالا اعمال می‌گردد.
    """
    # حالت پیش‌فرض (حفظ سازگاری عقب‌رو):
    assert calculate_markup_price(20000000, 4.0) == 20800000

    # حالت با رندسازی به ۵۰۰ هزار تومان به بالا:
    # 89M + 4% = 92,560,000 -> 93,000,000
    res_rounded = calculate_markup_price(89000000, 4.0, round_clean_step=True)
    assert res_rounded == 93000000

    # 35M + 4% = 36,400,000 -> 36,500,000
    res_rounded_35 = calculate_markup_price(35000000, 4.0, round_clean_step=True)
    assert res_rounded_35 == 36500000

def test_supply_rules_service_pricing_policy_storage():
    """
    بررسی ذخیره‌سازی و بازیابی قانون رندسازی در SupplyRulesService.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
        temp_path = tf.name

    try:
        service = SupplyRulesService(storage_path=temp_path)
        policy = service.get_pricing_policy()

        assert policy["rounding_enabled"] is True
        assert policy["racket_rounding_step"] == 500000
        assert policy["rounding_mode"] == "CEIL"

        # به‌روزرسانی سیاست و ذخیره پایدار
        updated = service.update_pricing_policy({
            "racket_rounding_step": 500000,
            "description": "قانون رندسازی پله‌ای به بالای رالی"
        })
        assert updated["description"] == "قانون رندسازی پله‌ای به بالای رالی"

        # بارگذاری مجدد سرویس از دیسک و اطمینان از بقای قانون
        new_instance = SupplyRulesService(storage_path=temp_path)
        loaded_policy = new_instance.get_pricing_policy()
        assert loaded_policy["racket_rounding_step"] == 500000
        assert loaded_policy["description"] == "قانون رندسازی پله‌ای به بالای رالی"
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@pytest.mark.asyncio
async def test_admin_pricing_policy_endpoints():
    """
    بررسی اندپوینت‌های GET و PUT سیاست قیمت‌گذاری در API ادمین.
    """
    from httpx import AsyncClient, ASGITransport
    from backend.app.main import app
    from backend.app.api.v1.admin import get_current_admin

    app.dependency_overrides[get_current_admin] = lambda: {"admin_id": "test-admin", "role": "SUPER_ADMIN"}
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. GET
            res_get = await ac.get("/api/v1/admin/supply-rules/pricing-policy")
            assert res_get.status_code == 200
            data_get = res_get.json()
            assert data_get["success"] is True
            assert data_get["policy"]["racket_rounding_step"] == 500000

            # 2. PUT
            res_put = await ac.put("/api/v1/admin/supply-rules/pricing-policy", json={
                "racket_rounding_step": 500000,
                "rounding_mode": "CEIL"
            })
            assert res_put.status_code == 200
            data_put = res_put.json()
            assert data_put["success"] is True
            assert data_put["policy"]["racket_rounding_step"] == 500000
    finally:
        app.dependency_overrides.pop(get_current_admin, None)


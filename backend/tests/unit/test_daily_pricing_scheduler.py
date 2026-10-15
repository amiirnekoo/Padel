import pytest
import os
import json
from unittest.mock import patch, MagicMock
from backend.app.services.supply_rules_service import SupplyRulesService, SupplySourceRule
from backend.app.services.daily_pricing_scheduler import DailyPricingScheduler
from backend.app.services.multi_source_scraper import extract_prices_from_html

def test_extract_prices_from_html_domestic_and_europe():
    """
    بررسی استخراج بومی قیمت‌ها از HTML سایت‌های داخلی و اروپایی بدون نیاز به هوش مصنوعی (Zero Token).
    """
    # 1. شبیه‌سازی HTML سایت ووکامرس ایرانی
    domestic_html = """
    <div class="product">
        <h2 class="woocommerce-loop-product__title">راکت پدل ناکس Nox AT10 Genius 18K 2026</h2>
        <span class="price"><span class="woocommerce-Price-amount">88,500,000 تومان</span></span>
    </div>
    """
    domestic_items = extract_prices_from_html(domestic_html, source_name="تامین داخلی تست", currency="TOMAN")
    assert len(domestic_items) == 1
    assert domestic_items[0]["product_id"] == "nox-at10-18k-2026"
    assert domestic_items[0]["raw_price"] == 88500000

    # 2. شبیه‌سازی HTML سایت اروپایی FunPadel به یورو
    europe_html = """
    <div class="product-miniature">
        <a class="product-title">Nox AT10 Luxury Genius 12K 2026</a>
        <span class="price" itemprop="price" content="299.95">299,95 €</span>
    </div>
    """
    europe_items = extract_prices_from_html(europe_html, source_name="FunPadel Europe", currency="EUR")
    assert len(europe_items) == 1
    assert europe_items[0]["product_id"] == "nox-at10-12k-2026"
    assert europe_items[0]["raw_price"] == 299.95

def test_daily_pricing_scheduler_lifecycle(tmp_path):
    """
    آزمون چرخه کامل زمان‌بند روزانه خودکار، ذخیره وضعیت و اعمال قیمت‌های استعلام‌شده به کاتالوگ رالی.
    """
    state_file = str(tmp_path / "scheduler_state.json")
    rules_file = str(tmp_path / "test_rules.json")

    # آماده‌سازی سورس‌های آزمایشی
    service = SupplyRulesService(storage_path=rules_file)
    r1 = service.create_rule(
        source_name="سان اسپرت مرجع",
        base_url="https://sunsportiran.com/padel",
        supply_mode="INSTANT",
        markup_percent=4.0
    )
    r2 = service.create_rule(
        source_name="فان‌پدل پرتغال",
        base_url="https://funpadel.pt/nox",
        supply_mode="EUROPE",
        currency="EUR",
        markup_percent=40.0
    )

    scheduler = DailyPricingScheduler(
        supply_rules_service=service,
        state_file=state_file,
        interval_hours=24
    )

    # وضعیت اولیه زمان‌بند
    status = scheduler.get_status()
    assert status["is_enabled"] is True
    assert status["interval_hours"] == 24

    # شبیه‌سازی اجرای کرول روزانه با واکشی موک
    mock_results = {
        r1.id: [{"product_id": "nox-at10-18k-2026", "raw_price": 85000000, "currency": "TOMAN"}],
        r2.id: [{"product_id": "nox-at10-18k-2026", "raw_price": 310.0, "currency": "EUR"}]
    }

    with patch("backend.app.services.daily_pricing_scheduler.fetch_source_prices", side_effect=lambda rule: mock_results.get(rule.id, [])):
        run_res = scheduler.run_daily_sync()

    assert run_res["success"] is True
    assert run_res["rules_scanned"] >= 2
    assert run_res["prices_updated"] >= 2

    # بررسی ثبت قیمت‌ها در سورس‌ها
    updated_r1 = service.get_rule(r1.id)
    assert updated_r1.latest_prices.get("nox-at10-18k-2026") == 85000000
    assert updated_r1.last_sync_status == "SUCCESS"

    updated_r2 = service.get_rule(r2.id)
    assert updated_r2.latest_prices.get("nox-at10-18k-2026") == 310.0
    assert updated_r2.last_sync_status == "SUCCESS"

    # بررسی به‌روزرسانی وضعیت زمان‌بند
    final_status = scheduler.get_status()
    assert final_status["last_run_at"] is not None
    assert final_status["last_run_status"] == "SUCCESS"
    assert final_status["next_run_at"] is not None

import pytest
import os
import tempfile
import json
from backend.app.services.supply_rules_service import (
    SupplyRulesService,
    SupplySourceRule,
    calculate_markup_price
)

def test_default_rules_contains_five_domestic_and_five_european_sources():
    """
    بررسی اینکه قوانین پیش‌فرض شامل ۵ سورس داخلی (انبار ایران) و ۵ سورس خارجی (سفارش اروپا) است.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
        temp_path = tf.name

    try:
        service = SupplyRulesService(storage_path=temp_path)
        all_rules = service.get_all_rules()
        domestic_rules = [r for r in all_rules if r.supply_mode == "INSTANT"]
        europe_rules = [r for r in all_rules if r.supply_mode == "EUROPE"]

        assert len(domestic_rules) >= 5, f"Expected at least 5 domestic sources, found {len(domestic_rules)}"
        assert len(europe_rules) >= 5, f"Expected at least 5 european sources, found {len(europe_rules)}"
        
        # بررسی وجود سورس‌های شاخص داخلی و خارجی
        domestic_names = [r.source_name for r in domestic_rules]
        assert any("سان اسپرت" in name for name in domestic_names)
        
        europe_names = [r.source_name for r in europe_rules]
        assert any("فان‌پدل" in name or "FunPadel" in name for name in europe_names)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_domestic_best_price_arbitrage_selects_cheapest_source():
    """
    تست موتور انتخاب ارزان‌ترین قیمت داخلی:
    بین ۵ تامین‌کننده داخلی، منبعی که کمترین قیمت را ارائه داده انتخاب شده و سود ۴٪ روی آن اعمال شود.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
        temp_path = tf.name

    try:
        service = SupplyRulesService(storage_path=temp_path)
        product_id = "racket-nox-at10-18k"

        # ثبت قیمت‌های متفاوت در سورس‌های داخلی
        # سورس A: 20,000,000 تومان
        # سورس B: 18,500,000 تومان (ارزان‌ترین)
        # سورس C: 19,000,000 تومان
        service.record_product_price("rule-domestic-1", product_id, 20000000)
        service.record_product_price("rule-domestic-2", product_id, 18500000)
        service.record_product_price("rule-domestic-3", product_id, 19000000)

        best_quote = service.find_best_price(product_id, supply_mode="INSTANT")
        assert best_quote is not None
        assert best_quote["best_source_id"] == "rule-domestic-2"
        assert best_quote["lowest_base_price_toman"] == 18500000
        
        # قیمت نهایی با ۴٪ سود: 18,500,000 * 1.04 = 19,240,000
        expected_price = calculate_markup_price(18500000, 4.0)
        assert best_quote["final_rally_price"] == expected_price
        assert best_quote["final_rally_price"] == 19240000
        
        # بررسی لیست مقایسه
        quotes = best_quote["all_quotes"]
        assert len(quotes) >= 3
        cheapest_in_list = [q for q in quotes if q["is_lowest"]][0]
        assert cheapest_in_list["source_id"] == "rule-domestic-2"
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_european_best_price_arbitrage_with_euro_conversion():
    """
    تست موتور انتخاب ارزان‌ترین قیمت اروپایی با تبدیل نرخ یورو به تومان و اعمال سود ۲۵٪.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
        temp_path = tf.name

    try:
        service = SupplyRulesService(storage_path=temp_path)
        product_id = "racket-nox-at10-18k"
        eur_rate = 298310

        # سورس A: 280 یورو
        # سورس B: 240 یورو (ارزان‌ترین)
        # سورس C: 260 یورو
        service.record_product_price("rule-europe-1", product_id, 280, currency="EUR")
        service.record_product_price("rule-europe-2", product_id, 240, currency="EUR")
        service.record_product_price("rule-europe-3", product_id, 260, currency="EUR")

        best_quote = service.find_best_price(product_id, supply_mode="EUROPE", eur_rate=eur_rate)
        assert best_quote is not None
        assert best_quote["best_source_id"] == "rule-europe-2"
        assert best_quote["raw_price"] == 240
        assert best_quote["currency"] == "EUR"

        lowest_toman = int(round(240 * eur_rate))
        assert best_quote["lowest_base_price_toman"] == lowest_toman
        
        # سود ۲۵٪
        expected_price = calculate_markup_price(lowest_toman, 25.0)
        assert best_quote["final_rally_price"] == expected_price
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_deactivating_cheapest_source_fails_over_to_next_lowest():
    """
    تست عدم دسترسی یا غیرفعال شدن ارزان‌ترین سورس و انتخاب هوشمند سورس ارزان‌تر بعدی.
    """
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
        temp_path = tf.name

    try:
        service = SupplyRulesService(storage_path=temp_path)
        product_id = "racket-nox-ml10-pro"

        # سورس ۱: ۱۵ میلیون (ارزان‌ترین ولی قرار است غیرفعال شود)
        # سورس ۲: ۱۶ میلیون (دومین ارزان‌ترین)
        # سورس ۳: ۱۷ میلیون
        service.record_product_price("rule-domestic-1", product_id, 15000000)
        service.record_product_price("rule-domestic-2", product_id, 16000000)
        service.record_product_price("rule-domestic-3", product_id, 17000000)

        # غیرفعال کردن سورس ۱
        service.update_rule("rule-domestic-1", {"is_active": False})

        best_quote = service.find_best_price(product_id, supply_mode="INSTANT")
        assert best_quote is not None
        # باید سورس ۲ به عنوان ارزان‌ترین منبع فعال انتخاب شود
        assert best_quote["best_source_id"] == "rule-domestic-2"
        assert best_quote["lowest_base_price_toman"] == 16000000
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

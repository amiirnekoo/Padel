try:
    import pytest
except ImportError:
    pytest = None
from backend.app.services.supply_rules_service import (
    SupplyRulesService,
    SupplySourceRule,
    calculate_markup_price,
    match_product_model
)

def test_calculate_markup_price():
    # 4% margin calculation for local supplier
    base_price = 20_000_000
    res = calculate_markup_price(base_price, 4.0)
    assert res == 20_800_000

    # 40% margin calculation for foreign supplier
    res_40 = calculate_markup_price(10_000_000, 40.0)
    assert res_40 == 14_000_000

    # Zero or negative protection
    assert calculate_markup_price(0, 4.0) == 0

def test_match_product_model():
    # Model keyword matching between supplier title and catalog model
    supplier_title = "راکت پدل نوکس مدل AT10 Luxury Genius Attack 12K Alum XTREM 2026"
    assert match_product_model(supplier_title, "nox-at10-genius-attack-12k-2026") is True

    # Negative match
    other_title = "راکت پدل نوکس مدل ML10 Pro Cup Coorp 2026"
    assert match_product_model(other_title, "nox-at10-genius-attack-12k-2026") is False

def test_default_supply_rules():
    service = SupplyRulesService()
    rules = service.get_all_rules()
    
    # Must have at least SunSport and FunPadel
    assert len(rules) >= 2
    
    sunsport = next((r for r in rules if "sunsport" in r.base_url.lower()), None)
    assert sunsport is not None
    assert sunsport.markup_percent == 4.0
    assert sunsport.currency == "TOMAN"
    assert sunsport.delivery_time == "تحویل فوری ۲۴ ساعته"
    assert sunsport.supply_mode == "INSTANT"
    assert sunsport.brand == "Nox"

    funpadel = next((r for r in rules if "funpadel" in r.base_url.lower()), None)
    assert funpadel is not None
    assert funpadel.markup_percent == 40.0
    assert funpadel.currency == "EUR"
    assert funpadel.supply_mode == "EUROPE"

def test_create_and_update_supply_rule():
    service = SupplyRulesService()
    new_rule = service.create_rule(
        source_name="نمایندگی دبی (بول‌پدل)",
        base_url="https://padeldubai.example/bullpadel",
        brand="Bullpadel",
        markup_percent=15.0,
        currency="AED",
        delivery_time="۳ تا ۵ روز کاری",
        supply_mode="INSTANT"
    )
    assert new_rule.id is not None
    assert new_rule.markup_percent == 15.0

    # Update markup to 12.0%
    updated = service.update_rule(new_rule.id, {"markup_percent": 12.0, "delivery_time": "۲ روز کاری"})
    assert updated.markup_percent == 12.0
    assert updated.delivery_time == "۲ روز کاری"

    # Delete rule
    deleted = service.delete_rule(new_rule.id)
    assert deleted is True
    assert service.get_rule(new_rule.id) is None

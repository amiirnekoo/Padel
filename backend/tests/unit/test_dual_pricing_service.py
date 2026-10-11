try:
    import pytest
except ImportError:
    pytest = None
from backend.app.services.shop_service import ShopService

def test_calculate_custom_order_price_with_40_percent_margin():
    # Nox AT10 18K with base price of €229 from FunPadel
    eur_price = 229.0
    eur_rate = 298310 # TGJU Euro to Toman rate
    margin_percent = 40.0 # 40% margin for user, friend, and shipping costs

    # Base Toman = 229.0 * 298,310 = 68,312,990
    # With 40% margin = 68,312,990 * 1.40 = 95,638,186 Tomans
    expected_price = round(eur_price * eur_rate * 1.40)
    
    calculated_price = ShopService.calculate_custom_order_price(
        eur_price=eur_price,
        eur_rate=eur_rate,
        margin_percent=margin_percent
    )
    assert calculated_price == expected_price
    assert calculated_price == 95638186

def test_custom_order_delivery_estimate_logic():
    # If item is in stock (stock > 0), delivery is immediate / 24h
    in_stock_delivery = ShopService.get_delivery_estimate(stock=5)
    assert in_stock_delivery == "تحویل فوری (۲۴ ساعته)"

    # If item is out of stock (stock == 0), delivery is 4 to 6 weeks from Europe
    out_of_stock_delivery = ShopService.get_delivery_estimate(stock=0)
    assert out_of_stock_delivery == "۴ الی ۶ هفته"

def test_catalog_products_contain_dual_pricing_fields():
    products = ShopService.get_products()
    assert len(products) > 0
    
    for p in products:
        # All products must have dual pricing support fields
        assert "custom_order_delivery" in p
        assert p["custom_order_delivery"] in ["تحویل فوری (۲۴ ساعته)", "۴ الی ۶ هفته"]
        
        # If eur_price exists, custom_order_price must be calculated with 40% margin
        if p.get("eur_price"):
            expected = ShopService.calculate_custom_order_price(p["eur_price"])
            assert p.get("custom_order_price") == expected

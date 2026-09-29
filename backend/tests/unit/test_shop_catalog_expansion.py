import pytest
from backend.app.services.shop_service import ShopService

def test_shop_catalog_full_category_coverage():
    products = ShopService.get_products()
    assert len(products) >= 12

    categories = {p["category"] for p in products}
    expected_categories = {"PADEL_RACKET", "TENNIS_RACKET", "BALLS", "BAGS", "SHOES", "ACCESSORIES"}
    assert expected_categories.issubset(categories)

    brands = {p["brand"] for p in products}
    expected_brands = {"Bullpadel", "Babolat", "Nox", "Head", "Wilson", "Yonex", "Asics"}
    assert expected_brands.issubset(brands)

    for p in products:
        assert p["price"] > 0
        assert p["image_url"].startswith("/images/")
        assert p["image_url"].endswith(".jpg")
        assert len(p["name_fa"]) > 5
        assert len(p["warranty"]) > 0

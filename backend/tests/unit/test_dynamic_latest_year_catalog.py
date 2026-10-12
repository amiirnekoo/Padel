import pytest
from backend.app.services.shop_service import ShopService

def test_dynamic_latest_year_calculation():
    """
    تست TDD: محاسبه پویای جدیدترین سال کاتالوگ (مثلاً ۲۰۲۷ و سال‌های بعد ۲۰۲۸)
    بدون هاردکد بودن سال در سیستم.
    """
    latest_year = ShopService.get_latest_catalog_year()
    assert latest_year >= 2027, f"جدیدترین سال کاتالوگ باید حداقل ۲۰۲۷ باشد اما {latest_year} بازگردانده شد"

def test_featured_products_prioritizes_latest_year():
    """
    تست TDD: دریافت محصولات شاخص و ویژه هوم‌پیج باید منحصراً از راکت‌های
    جدیدترین سال کاتالوگ (در حال حاضر ۲۰۲۷) باشد.
    """
    featured = ShopService.get_featured_products(count=3, randomize=False)
    assert len(featured) == 3, "باید ۳ محصول ویژه برگردانده شود"

    latest_year = ShopService.get_latest_catalog_year()
    for p in featured:
        assert p.get("year") == latest_year, f"محصول {p.get('name_en')} دارای سال {p.get('year')} است ولی باید {latest_year} باشد"

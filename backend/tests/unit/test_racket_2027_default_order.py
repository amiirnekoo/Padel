import pytest
from backend.app.services.shop_service import ShopService

def test_default_rackets_display_order_prioritizes_2027():
    """
    تست TDD: تضمین اینکه در لیست محصولات، راکت‌های سال ۲۰۲۷ همیشه به عنوان اولویت اول
    و در ابتدای کاتالوگ نمایش داده می‌شوند.
    """
    products = ShopService.get_products()
    assert len(products) > 0, "کاتالوگ نباید خالی باشد"

    # فیلتر راکت‌های پدل
    padel_rackets = [p for p in products if p.get("category") == "PADEL_RACKET"]
    assert len(padel_rackets) >= 5, "حداقل ۵ راکت پدل باید در کاتالوگ موجود باشد"

    # بررسی اینکه راکت‌های ۲۰۲۷ پیش از راکت‌های ۲۰۲۶ یا سال‌های قبل‌تر قرار گرفته‌اند
    years = [p.get("year", 0) for p in padel_rackets if p.get("year")]
    assert len(years) > 0, "راکت‌ها باید دارای فیلد year باشند"

    # اولین راکت باید حتماً ۲۰۲۷ باشد
    assert padel_rackets[0].get("year") == 2027, f"اولین راکت باید سال ۲۰۲۷ باشد اما {padel_rackets[0].get('year')} است"

    # بررسی اینکه هیچ راکت سال‌های قبل‌تر (مثلاً ۲۰۲۶) پیش از راکت‌های ۲۰۲۷ نیامده باشد
    seen_lower_year = False
    for p in padel_rackets:
        yr = p.get("year", 0)
        if yr < 2027:
            seen_lower_year = True
        elif seen_lower_year and yr >= 2027:
            pytest.fail(f"راکت {p.get('name_en')} با سال {yr} بعد از راکت‌های قدیمی‌تر قرار گرفته است!")

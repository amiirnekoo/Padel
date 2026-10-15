import pytest
from app.services.price_alert_service import (
    PriceAlertService,
    PriceAlertItem,
    PriceAlertType,
)

def test_detect_price_surge():
    service = PriceAlertService(state_file="backend/app/data/test_pricing_alerts.json")
    service.clear_all()

    # کالا از ۳۰ میلیون تومان به ۳۸ میلیون تومان افزایش یافته (حدود ۲۶.۶٪ افزایش)
    old_prices = {"nox_at10_18k_2026": 30000000}
    new_prices = {"nox_at10_18k_2026": 38000000}

    alerts = service.evaluate_price_changes(
        rule_id="rule_sunsport_nox",
        source_name="سان اسپرت ایران",
        old_prices=old_prices,
        new_prices=new_prices,
        surge_threshold_percent=15.0,
    )

    assert len(alerts) == 1
    alert = alerts[0]
    assert alert.alert_type == PriceAlertType.PRICE_SURGE
    assert alert.product_id == "nox_at10_18k_2026"
    assert alert.old_price == 30000000
    assert alert.new_price == 38000000
    assert alert.percent_change > 26.0
    assert alert.is_acknowledged is False

def test_detect_stock_out():
    service = PriceAlertService(state_file="backend/app/data/test_pricing_alerts.json")
    service.clear_all()

    # کالا قبلا قیمت داشته ولی اکنون در سورس ناموجود شده (یا در لیست جدید نیست)
    old_prices = {"nox_ml10_pro_cup_2026": 22000000}
    new_prices = {}

    alerts = service.evaluate_price_changes(
        rule_id="rule_sunsport_nox",
        source_name="سان اسپرت ایران",
        old_prices=old_prices,
        new_prices=new_prices,
    )

    assert len(alerts) == 1
    alert = alerts[0]
    assert alert.alert_type == PriceAlertType.STOCK_OUT
    assert alert.product_id == "nox_ml10_pro_cup_2026"
    assert alert.is_acknowledged is False

def test_acknowledge_and_clear_alerts():
    service = PriceAlertService(state_file="backend/app/data/test_pricing_alerts.json")
    service.clear_all()

    old_prices = {"nox_at10_18k_2026": 30000000}
    new_prices = {"nox_at10_18k_2026": 40000000}

    service.evaluate_price_changes(
        rule_id="rule_funpadel",
        source_name="FunPadel Europe",
        old_prices=old_prices,
        new_prices=new_prices,
    )

    unacknowledged = service.get_alerts(unacknowledged_only=True)
    assert len(unacknowledged) == 1
    alert_id = unacknowledged[0]["id"]

    # تایید هشدار
    success = service.acknowledge_alert(alert_id)
    assert success is True

    assert len(service.get_alerts(unacknowledged_only=True)) == 0
    assert len(service.get_alerts(unacknowledged_only=False)) == 1

    # پاکسازی هشدارهای تاییدشده
    cleared = service.clear_acknowledged()
    assert cleared == 1
    assert len(service.get_alerts(unacknowledged_only=False)) == 0

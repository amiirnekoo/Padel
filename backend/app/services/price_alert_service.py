import json
import os
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class PriceAlertType(str, Enum):
    PRICE_SURGE = "PRICE_SURGE"
    STOCK_OUT = "STOCK_OUT"

class PriceAlertItem(BaseModel):
    id: str = Field(default_factory=lambda: f"alert_{uuid.uuid4().hex[:10]}")
    rule_id: str
    source_name: str
    product_id: str
    alert_type: PriceAlertType
    old_price: Optional[float] = None
    new_price: Optional[float] = None
    percent_change: Optional[float] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_acknowledged: bool = False
    message: str = ""

DEFAULT_STATE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "pricing_alerts.json"
)

class PriceAlertService:
    def __init__(self, state_file: str = DEFAULT_STATE_FILE):
        self.state_file = state_file
        self._ensure_storage()

    def _ensure_storage(self):
        os.makedirs(os.path.dirname(self.state_file), exist_ok=True)
        if not os.path.exists(self.state_file):
            self._save([])

    def _load(self) -> List[dict]:
        try:
            with open(self.state_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _save(self, alerts: List[dict]):
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(alerts, f, ensure_ascii=False, indent=2)

    def evaluate_price_changes(
        self,
        rule_id: str,
        source_name: str,
        old_prices: Dict[str, float],
        new_prices: Dict[str, float],
        surge_threshold_percent: float = 15.0,
    ) -> List[PriceAlertItem]:
        """
        مقایسه قیمت‌های پیشین با جدید و ثبت هشدارهای جهش قیمت یا ناموجودی.
        """
        created_alerts: List[PriceAlertItem] = []
        old_prices = old_prices or {}
        new_prices = new_prices or {}

        # ۱. بررسی جهش‌های قیمتی
        for prod_id, new_p in new_prices.items():
            if prod_id in old_prices and old_prices[prod_id] > 0 and new_p > 0:
                old_p = old_prices[prod_id]
                diff = new_p - old_p
                pct = (diff / old_p) * 100.0

                if abs(pct) >= surge_threshold_percent:
                    direction_fa = "افزایش" if pct > 0 else "کاهش"
                    msg = (
                        f"هشدار جهش قیمتی: {direction_fa} {abs(pct):.1f} درصدی "
                        f"برای راکت {prod_id} در منبع {source_name} "
                        f"(از {old_p:,.0f} به {new_p:,.0f})"
                    )
                    alert = PriceAlertItem(
                        rule_id=rule_id,
                        source_name=source_name,
                        product_id=prod_id,
                        alert_type=PriceAlertType.PRICE_SURGE,
                        old_price=float(old_p),
                        new_price=float(new_p),
                        percent_change=round(pct, 2),
                        message=msg,
                    )
                    created_alerts.append(alert)

        # ۲. بررسی کالاهایی که قبلاً بودند و اکنون ناموجود یا حذف شده‌اند
        for prod_id, old_p in old_prices.items():
            if old_p > 0 and (prod_id not in new_prices or new_prices[prod_id] <= 0):
                msg = (
                    f"هشدار ناموجودی کالا: راکت {prod_id} در منبع {source_name} "
                    f"ناموجود یا از کاتالوگ منبع حذف شده است."
                )
                alert = PriceAlertItem(
                    rule_id=rule_id,
                    source_name=source_name,
                    product_id=prod_id,
                    alert_type=PriceAlertType.STOCK_OUT,
                    old_price=float(old_p),
                    new_price=0.0,
                    percent_change=-100.0,
                    message=msg,
                )
                created_alerts.append(alert)

        if created_alerts:
            existing = self._load()
            existing.extend([a.model_dump() for a in created_alerts])
            # حفظ حداکثر ۱۰۰ هشدار اخیر
            if len(existing) > 100:
                existing = existing[-100:]
            self._save(existing)

        return created_alerts

    def get_alerts(self, unacknowledged_only: bool = False) -> List[dict]:
        alerts = self._load()
        if unacknowledged_only:
            return [a for a in alerts if not a.get("is_acknowledged", False)]
        return list(reversed(alerts))

    def acknowledge_alert(self, alert_id: str) -> bool:
        alerts = self._load()
        found = False
        for a in alerts:
            if a.get("id") == alert_id:
                a["is_acknowledged"] = True
                found = True
                break
        if found:
            self._save(alerts)
        return found

    def clear_acknowledged(self) -> int:
        alerts = self._load()
        remaining = [a for a in alerts if not a.get("is_acknowledged", False)]
        cleared_count = len(alerts) - len(remaining)
        self._save(remaining)
        return cleared_count

    def clear_all(self):
        self._save([])

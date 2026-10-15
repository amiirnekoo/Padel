import os
import json
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

from backend.app.services.supply_rules_service import SupplyRulesService
from backend.app.services.multi_source_scraper import fetch_source_prices

SCHEDULER_DEFAULT_STATE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "pricing_scheduler_state.json"
)

class DailyPricingScheduler:
    """
    سرویس زمان‌بندی روزانه خودکار برای پایش سایت‌های مرجع تامین و استخراج قیمت‌های روز.
    کاملاً بومی، بدون هزینه توکن هوش مصنوعی و قابل کنترل از پنل مدیریت رالی.
    """
    def __init__(
        self,
        supply_rules_service: SupplyRulesService,
        state_file: str = SCHEDULER_DEFAULT_STATE_PATH,
        interval_hours: int = 24
    ):
        self.supply_rules_service = supply_rules_service
        self.state_file = state_file
        self.interval_hours = interval_hours
        self._is_running = False
        self._thread: Optional[threading.Thread] = None
        self._state: Dict[str, Any] = {
            "is_enabled": True,
            "interval_hours": interval_hours,
            "last_run_at": None,
            "last_run_status": "READY",
            "last_rules_scanned": 0,
            "last_prices_updated": 0,
            "next_run_at": None,
            "logs": []
        }
        self._load_state()

    def _load_state(self) -> None:
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        self._state.update(data)
            except Exception:
                pass
        else:
            self._save_state()

    def _save_state(self) -> None:
        try:
            os.makedirs(os.path.dirname(self.state_file), exist_ok=True)
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(self._state, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def get_status(self) -> Dict[str, Any]:
        """دریافت آخرین وضعیت زمان‌بند روزانه جهت نمایش در پنل مدیریت ادمین"""
        return self._state.copy()

    def toggle_scheduler(self, enabled: bool) -> Dict[str, Any]:
        """فعال یا غیرفعال‌سازی فرآیند خودکار روزانه از پنل ادمین"""
        self._state["is_enabled"] = enabled
        self._save_state()
        return self.get_status()

    def run_daily_sync(self) -> Dict[str, Any]:
        """
        اجرای فرآیند پایش تمام سایت‌های رفرنس فعال (داخلی و اروپایی).
        استخراج قیمت‌ها، به‌روزرسانی قوانین تامین و ثبت زمان اجرای بعدی.
        """
        now = datetime.now()
        now_str = now.strftime("%Y-%m-%d %H:%M:%S")
        rules = [r for r in self.supply_rules_service.get_all_rules() if r.is_active]

        rules_scanned = 0
        prices_updated = 0
        details = []

        for rule in rules:
            scraped = fetch_source_prices(rule)
            rules_scanned += 1
            rule_updated_count = 0

            for item in scraped:
                pid = item["product_id"]
                price = item["raw_price"]
                rule.latest_prices[pid] = price
                prices_updated += 1
                rule_updated_count += 1

            # ذخیره وضعیت سورس
            status_str = "SUCCESS" if (rule_updated_count > 0 or not rule.base_url.startswith("http")) else "FAILED"
            self.supply_rules_service.update_rule(rule.id, {
                "last_sync_at": now_str,
                "last_sync_status": status_str,
                "synced_products_count": rule_updated_count,
                "latest_prices": rule.latest_prices
            })

            details.append({
                "rule_id": rule.id,
                "source_name": rule.source_name,
                "items_found": rule_updated_count,
                "status": status_str
            })

        next_run = now + timedelta(hours=self.interval_hours)
        next_run_str = next_run.strftime("%Y-%m-%d %H:%M:%S")

        # ثبت گزارش در لاگ زمان‌بند
        log_entry = {
            "timestamp": now_str,
            "rules_scanned": rules_scanned,
            "prices_updated": prices_updated,
            "status": "SUCCESS"
        }
        current_logs = self._state.get("logs", [])
        current_logs.insert(0, log_entry)
        self._state["logs"] = current_logs[:15]  # حفظ حداکثر ۱۵ لاگ اخیر

        self._state["last_run_at"] = now_str
        self._state["last_run_status"] = "SUCCESS"
        self._state["last_rules_scanned"] = rules_scanned
        self._state["last_prices_updated"] = prices_updated
        self._state["next_run_at"] = next_run_str
        self._save_state()

        return {
            "success": True,
            "synced_at": now_str,
            "rules_scanned": rules_scanned,
            "prices_updated": prices_updated,
            "next_run_at": next_run_str,
            "details": details
        }

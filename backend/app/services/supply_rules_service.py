import os
import json
import uuid
import re
from typing import List, Dict, Any, Optional
try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **data):
            for k, v in data.items():
                setattr(self, k, v)
        def dict(self):
            return {k: v for k, v in self.__dict__.items() if not k.startswith("_")}
        def model_dump(self):
            return self.dict()
    def Field(default_factory=None, **kwargs):
        return default_factory() if default_factory else kwargs.get("default")

RULES_STORAGE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "supply_rules.json"
)

POLICY_STORAGE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "pricing_policy.json"
)

class SupplySourceRule(BaseModel):
    id: str = Field(default_factory=lambda: f"rule-{uuid.uuid4().hex[:8]}")
    source_name: str
    base_url: str
    brand: str = "Nox"
    markup_percent: float = 4.0
    currency: str = "TOMAN"  # TOMAN, EUR, AED, USD
    delivery_time: str = "تحویل فوری ۲۴ ساعته"
    supply_mode: str = "INSTANT"  # INSTANT (انبار و تامین داخلی) or EUROPE (سفارش خارجی)
    is_active: bool = True
    last_sync_at: Optional[str] = None
    last_sync_status: str = "READY"  # READY, SUCCESS, FAILED
    synced_products_count: int = 0
    latest_prices: Dict[str, float] = Field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        if hasattr(self, "model_dump"):
            return self.model_dump()
        return self.dict()

DEFAULT_PRICING_POLICY: Dict[str, Any] = {
    "rounding_enabled": True,
    "racket_rounding_step": 500000,
    "rounding_mode": "CEIL",
    "description": "قانون رندسازی پله‌ای به بالا: کلیه قیمت‌های راکت‌ها در پله‌های ۵۰۰ هزار تومانی (مانند ۹۲، ۹۲.۵، ۹۳ میلیون) رند به بالا می‌شوند."
}

def round_price_to_ceil_step(price: float, step: int = 500_000) -> int:
    """
    قانون عالی رندسازی قیمت‌های رالی (Ceil Step Rounding Rule):
    رند به نزدیک‌ترین پله بالایی (به سمت بالا) جهت حذف کامل خرده‌ها و حفظ حاشیه سود.
    - برای راکت‌ها و مبالغ بزرگ (۵ میلیون به بالا): گام ۵۰۰,۰۰۰ تومان (نیم میلیون تومان)
      مثال: 92,560,000 -> 93,000,000
            36,400,000 -> 36,500,000
    - برای مبالغ ۱ تا ۵ میلیون تومان (کفش، ساک و پوشاک): گام ۵۰,۰۰۰ تومان
      مثال: 2,852,000 -> 2,900,000
    - برای مبالغ زیر ۱ میلیون تومان (توپ، اورگریپ، اکسسوری): گام ۱۰,۰۰۰ تومان
      مثال: 494,000 -> 500,000
    """
    if price <= 0:
        return 0
    import math
    if price >= 5_000_000:
        actual_step = step if step > 0 else 500_000
        return int(math.ceil(price / actual_step) * actual_step)
    elif price >= 1_000_000:
        return int(math.ceil(price / 50_000) * 50_000)
    else:
        return int(math.ceil(price / 10_000) * 10_000)

def calculate_markup_price(
    base_price: float,
    markup_percent: float,
    round_clean_step: bool = False,
    step: int = 500_000
) -> int:
    """
    Calculate final retail price with given markup percent.
    By default (round_clean_step=False), rounds to nearest 1,000 Tomans for backward compatibility.
    When round_clean_step=True, applies Rally's 500k Ceil Rounding Rule.
    """
    if base_price <= 0:
        return 0
    calculated = base_price * (1.0 + (markup_percent / 100.0))
    if round_clean_step:
        return round_price_to_ceil_step(calculated, step=step)
    return int(round(calculated / 1000.0) * 1000)

def match_product_model(supplier_title: str, catalog_product_id: str) -> bool:
    """
    Deterministically match supplier product title with catalog product ID
    using technical model keywords (e.g., AT10, 18K, 12K, ML10, Attack, 2026).
    """
    title_lower = supplier_title.lower()
    norm_id = catalog_product_id.lower().replace("-", " ")
    
    id_tokens = [tok for tok in norm_id.split() if tok not in ("nox", "racket", "padel", "model")]
    
    matched_count = 0
    for tok in id_tokens:
        if re.search(rf"\b{re.escape(tok)}\b", title_lower) or tok in title_lower:
            matched_count += 1
            
    if not id_tokens:
        return False
        
    match_ratio = matched_count / len(id_tokens)
    return match_ratio >= 0.7

DEFAULT_RULES: List[Dict[str, Any]] = [
    # 🇮🇷 ۵ سورس معتبر تامین و انبار داخلی (تحویل فوری ۲۴ ساعته - ۴٪ سود)
    {
        "id": "rule-sunsport-nox",
        "source_name": "سان اسپرت ایران (موجودی تهران)",
        "base_url": "https://sunsportiran.com/category/sports-equipment/racket-padel/",
        "brand": "Nox",
        "markup_percent": 4.0,
        "currency": "TOMAN",
        "delivery_time": "تحویل فوری ۲۴ ساعته",
        "supply_mode": "INSTANT",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },
    {
        "id": "rule-iranpadel-nox",
        "source_name": "ایران‌پدل (انبار مرجع تهران)",
        "base_url": "https://iranpadel.ir/shop/",
        "brand": "Nox",
        "markup_percent": 4.0,
        "currency": "TOMAN",
        "delivery_time": "تحویل فوری ۲۴ ساعته",
        "supply_mode": "INSTANT",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },
    {
        "id": "rule-tennisfa-nox",
        "source_name": "تنیس‌فا / پدل‌مارکت",
        "base_url": "https://tennisfa.com/padel/",
        "brand": "Nox",
        "markup_percent": 4.0,
        "currency": "TOMAN",
        "delivery_time": "تحویل فوری ۲۴ ساعته",
        "supply_mode": "INSTANT",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },
    {
        "id": "rule-banisport-nox",
        "source_name": "بانی‌اسپرت تجهیزات پدل",
        "base_url": "https://banisport.com/padel-rackets/",
        "brand": "Nox",
        "markup_percent": 4.0,
        "currency": "TOMAN",
        "delivery_time": "تحویل فوری ۲۴ ساعته",
        "supply_mode": "INSTANT",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },
    {
        "id": "rule-digipadel-nox",
        "source_name": "دیجی‌پدل سنترال",
        "base_url": "https://digipadel.ir/rackets/",
        "brand": "Nox",
        "markup_percent": 4.0,
        "currency": "TOMAN",
        "delivery_time": "تحویل فوری ۲۴ ساعته",
        "supply_mode": "INSTANT",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },

    # 🇪🇺 ۵ سورس معتبر سفارش اختصاصی اروپا (تحویل ۴ الی ۶ هفته - ۲۵٪ سود)
    {
        "id": "rule-funpadel-europe",
        "source_name": "فان‌پدل پرتغال (FunPadel)",
        "base_url": "https://funpadel.pt/pt/padel-raquetes/nox",
        "brand": "Nox",
        "markup_percent": 40.0,
        "currency": "EUR",
        "delivery_time": "۴ الی ۶ هفته",
        "supply_mode": "EUROPE",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },
    {
        "id": "rule-padelnuestro-europe",
        "source_name": "پدل‌نوئسترو اسپانیا (PadelNuestro)",
        "base_url": "https://www.padelnuestro.com/palas-padel/nox.html",
        "brand": "Nox",
        "markup_percent": 25.0,
        "currency": "EUR",
        "delivery_time": "۴ الی ۶ هفته",
        "supply_mode": "EUROPE",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },
    {
        "id": "rule-smashinn-europe",
        "source_name": "اسماش‌این اروپا (Smashinn)",
        "base_url": "https://www.tradeinn.com/smashinn/nox/",
        "brand": "Nox",
        "markup_percent": 25.0,
        "currency": "EUR",
        "delivery_time": "۴ الی ۶ هفته",
        "supply_mode": "EUROPE",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },
    {
        "id": "rule-time2padel-europe",
        "source_name": "تایم تو پدل اسپانیا (Time2Padel)",
        "base_url": "https://time2padel.com/palas-nox/",
        "brand": "Nox",
        "markup_percent": 25.0,
        "currency": "EUR",
        "delivery_time": "۴ الی ۶ هفته",
        "supply_mode": "EUROPE",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    },
    {
        "id": "rule-totalpadel-europe",
        "source_name": "توتال‌پدل اروپا (TotalPadel)",
        "base_url": "https://www.totalpadel.com/nox.html",
        "brand": "Nox",
        "markup_percent": 25.0,
        "currency": "EUR",
        "delivery_time": "۴ الی ۶ هفته",
        "supply_mode": "EUROPE",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0,
        "latest_prices": {}
    }
]

class SupplyRulesService:
    def __init__(self, storage_path: str = RULES_STORAGE_PATH):
        self.storage_path = storage_path
        self.policy_storage_path = (
            self.storage_path.replace(".json", "_policy.json")
            if self.storage_path != RULES_STORAGE_PATH
            else POLICY_STORAGE_PATH
        )
        self._rules: Dict[str, SupplySourceRule] = {}
        self._pricing_policy: Dict[str, Any] = DEFAULT_PRICING_POLICY.copy()
        self._load_rules()
        self._load_policy()

    def _load_policy(self) -> None:
        if os.path.exists(self.policy_storage_path):
            try:
                with open(self.policy_storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        self._pricing_policy.update(data)
                        return
            except Exception:
                pass
        self._save_policy()

    def _save_policy(self) -> None:
        try:
            os.makedirs(os.path.dirname(self.policy_storage_path), exist_ok=True)
            with open(self.policy_storage_path, "w", encoding="utf-8") as f:
                json.dump(self._pricing_policy, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def get_pricing_policy(self) -> Dict[str, Any]:
        return self._pricing_policy.copy()

    def update_pricing_policy(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        for k, v in updates.items():
            self._pricing_policy[k] = v
        self._save_policy()
        return self._pricing_policy.copy()

    def _load_rules(self) -> None:
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        rule = SupplySourceRule(**item)
                        self._rules[rule.id] = rule
                
                # بررسی حداقل ۵ سورس داخلی و ۵ سورس خارجی
                domestic = [r for r in self._rules.values() if r.supply_mode == "INSTANT"]
                europe = [r for r in self._rules.values() if r.supply_mode == "EUROPE"]
                if len(domestic) < 5 or len(europe) < 5:
                    for d_rule in DEFAULT_RULES:
                        if d_rule["id"] not in self._rules:
                            rule = SupplySourceRule(**d_rule)
                            self._rules[rule.id] = rule
                    self._save_rules()
                return
            except Exception:
                pass
        
        # در صورت نبود فایل، پر کردن با ۱۰ سورس استاندارد
        for item in DEFAULT_RULES:
            rule = SupplySourceRule(**item)
            self._rules[rule.id] = rule
        self._save_rules()

    def _save_rules(self) -> None:
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump([r.to_dict() for r in self._rules.values()], f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def get_all_rules(self) -> List[SupplySourceRule]:
        return list(self._rules.values())

    def get_rule(self, rule_id: str) -> Optional[SupplySourceRule]:
        return self._rules.get(rule_id)

    def create_rule(
        self,
        source_name: str,
        base_url: str,
        brand: str = "Nox",
        markup_percent: float = 4.0,
        currency: str = "TOMAN",
        delivery_time: str = "تحویل فوری ۲۴ ساعته",
        supply_mode: str = "INSTANT"
    ) -> SupplySourceRule:
        rule = SupplySourceRule(
            source_name=source_name,
            base_url=base_url,
            brand=brand,
            markup_percent=markup_percent,
            currency=currency,
            delivery_time=delivery_time,
            supply_mode=supply_mode,
            is_active=True
        )
        self._rules[rule.id] = rule
        self._save_rules()
        return rule

    def update_rule(self, rule_id: str, updates: Dict[str, Any]) -> Optional[SupplySourceRule]:
        rule = self._rules.get(rule_id)
        if not rule:
            return None
        rule_data = rule.to_dict()
        for k, v in updates.items():
            if k in rule_data and k != "id":
                rule_data[k] = v
        updated_rule = SupplySourceRule(**rule_data)
        self._rules[rule_id] = updated_rule
        self._save_rules()
        return updated_rule

    def delete_rule(self, rule_id: str) -> bool:
        if rule_id in self._rules:
            del self._rules[rule_id]
            self._save_rules()
            return True
        return False

    def record_product_price(
        self,
        rule_id: str,
        product_id: str,
        price: float,
        currency: Optional[str] = None
    ) -> bool:
        """
        ثبت قیمت استعلام‌شده کالا برای یک سورس تامین.
        """
        rule = self._rules.get(rule_id)
        if not rule:
            # اگر سورس هنوز ثبت نشده، به صورت داینامیک ثبت شود
            mode = "EUROPE" if currency == "EUR" else "INSTANT"
            rule = SupplySourceRule(
                id=rule_id,
                source_name=f"سورس تامین {rule_id}",
                base_url="",
                currency=currency or ("EUR" if mode == "EUROPE" else "TOMAN"),
                supply_mode=mode,
                markup_percent=25.0 if mode == "EUROPE" else 4.0
            )
            self._rules[rule_id] = rule

        if currency and rule.currency != currency:
            rule.currency = currency

        rule.latest_prices[product_id] = float(price)
        self._save_rules()
        return True

    def find_best_price(
        self,
        product_id: str,
        supply_mode: str = "INSTANT",
        eur_rate: int = 298310,
        apply_rounding: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        موتور هوشمند آربیتراژ و انتخاب ارزان‌ترین قیمت (Best Price Selector) بین تمام منابع فعال:
        ۱. تمام سورس‌های فعال با مود تامین درخواستی (داخلی یا خارجی) را فیلتر می‌کند.
        ۲. قیمت خام هر سورس را در صورت یورویی بودن به تومان تبدیل می‌کند.
        ۳. ارزان‌ترین منبع (کمترین قیمت مبدا) را انتخاب می‌کند.
        ۴. سود مصوب را به ارزان‌ترین قیمت اضافه کرده و گزارش کامل مقایسه‌ای تولید می‌کند.
        ۵. محاسبه قیمت رند بر اساس قانون ۵۰۰ هزار تومانی به بالا (Ceil Rounding).
        """
        active_rules = [
            r for r in self._rules.values()
            if r.supply_mode == supply_mode and r.is_active
        ]

        if not active_rules:
            return None

        candidates = []
        for rule in active_rules:
            if product_id in rule.latest_prices:
                raw_price = rule.latest_prices[product_id]
                if raw_price <= 0:
                    continue

                if rule.currency == "EUR":
                    raw_price_toman = int(round(raw_price * eur_rate))
                else:
                    raw_price_toman = int(round(raw_price))

                candidates.append({
                    "rule": rule,
                    "raw_price": raw_price,
                    "currency": rule.currency,
                    "raw_price_toman": raw_price_toman
                })

        if not candidates:
            return None

        # انتخاب ارزان‌ترین منبع (کمترین raw_price_toman)
        best_candidate = min(candidates, key=lambda c: c["raw_price_toman"])
        lowest_toman = best_candidate["raw_price_toman"]
        best_rule = best_candidate["rule"]
        final_rally_price = calculate_markup_price(lowest_toman, best_rule.markup_percent)

        racket_step = self._pricing_policy.get("racket_rounding_step", 500_000)
        final_rally_price_rounded = round_price_to_ceil_step(final_rally_price, racket_step)
        effective_price = final_rally_price_rounded if apply_rounding else final_rally_price

        all_quotes = []
        for c in sorted(candidates, key=lambda x: x["raw_price_toman"]):
            c_rule = c["rule"]
            q_final = calculate_markup_price(c["raw_price_toman"], c_rule.markup_percent)
            all_quotes.append({
                "source_id": c_rule.id,
                "source_name": c_rule.source_name,
                "base_url": c_rule.base_url,
                "raw_price": c["raw_price"],
                "currency": c["currency"],
                "raw_price_toman": c["raw_price_toman"],
                "markup_percent": c_rule.markup_percent,
                "final_price_toman": q_final,
                "final_price_toman_rounded": round_price_to_ceil_step(q_final, racket_step),
                "delivery_time": c_rule.delivery_time,
                "is_lowest": (c_rule.id == best_rule.id),
                "diff_from_lowest_toman": c["raw_price_toman"] - lowest_toman
            })

        return {
            "product_id": product_id,
            "supply_mode": supply_mode,
            "best_source_id": best_rule.id,
            "best_source_name": best_rule.source_name,
            "base_url": best_rule.base_url,
            "raw_price": best_candidate["raw_price"],
            "currency": best_candidate["currency"],
            "lowest_base_price_toman": lowest_toman,
            "markup_percent": best_rule.markup_percent,
            "final_rally_price": effective_price,
            "final_rally_price_rounded": final_rally_price_rounded,
            "delivery_time": best_rule.delivery_time,
            "all_quotes": all_quotes
        }


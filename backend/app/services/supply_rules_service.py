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
    def Field(default_factory=None, **kwargs):
        return default_factory() if default_factory else kwargs.get("default")

RULES_STORAGE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "supply_rules.json"
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

def calculate_markup_price(base_price: float, markup_percent: float) -> int:
    """
    Calculate final retail price with given markup percent rounded to nearest thousand Tomans.
    Example: 20,000,000 + 4% = 20,800,000
    """
    if base_price <= 0:
        return 0
    calculated = base_price * (1.0 + (markup_percent / 100.0))
    # Round to nearest 1,000 Tomans
    return int(round(calculated / 1000.0) * 1000)

def match_product_model(supplier_title: str, catalog_product_id: str) -> bool:
    """
    Deterministically match supplier product title with catalog product ID
    using technical model keywords (e.g., AT10, 18K, 12K, ML10, Attack, 2026).
    """
    title_lower = supplier_title.lower()
    norm_id = catalog_product_id.lower().replace("-", " ")
    
    # Extract technical tokens from catalog product ID
    id_tokens = [tok for tok in norm_id.split() if tok not in ("nox", "racket", "padel", "model")]
    
    # Check if key distinguishing tokens appear in the supplier title
    matched_count = 0
    for tok in id_tokens:
        if re.search(rf"\b{re.escape(tok)}\b", title_lower) or tok in title_lower:
            matched_count += 1
            
    if not id_tokens:
        return False
        
    match_ratio = matched_count / len(id_tokens)
    return match_ratio >= 0.7

DEFAULT_RULES: List[Dict[str, Any]] = [
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
        "synced_products_count": 0
    },
    {
        "id": "rule-funpadel-europe",
        "source_name": "تامین اروپا (سفارش خارجی)",
        "base_url": "https://funpadel.pt/pt/padel-raquetes/nox",
        "brand": "Nox",
        "markup_percent": 40.0,
        "currency": "EUR",
        "delivery_time": "۴ الی ۶ هفته",
        "supply_mode": "EUROPE",
        "is_active": True,
        "last_sync_at": None,
        "last_sync_status": "READY",
        "synced_products_count": 0
    }
]

class SupplyRulesService:
    def __init__(self, storage_path: str = RULES_STORAGE_PATH):
        self.storage_path = storage_path
        self._rules: Dict[str, SupplySourceRule] = {}
        self._load_rules()

    def _load_rules(self) -> None:
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        rule = SupplySourceRule(**item)
                        self._rules[rule.id] = rule
                return
            except Exception:
                pass
        
        # Populate defaults if storage file does not exist
        for item in DEFAULT_RULES:
            rule = SupplySourceRule(**item)
            self._rules[rule.id] = rule
        self._save_rules()

    def _save_rules(self) -> None:
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump([r.dict() for r in self._rules.values()], f, ensure_ascii=False, indent=2)
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
        rule_data = rule.dict()
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

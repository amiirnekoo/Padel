import urllib.request
import re
from typing import List, Dict, Any, Optional

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

from backend.app.services.supply_rules_service import match_product_model, SupplySourceRule

KNOWN_NOX_MODELS = [
    ("nox-at10-18k-2026", ["at10 18k", "at10 genius 18k", "at10 18k 2026", "18k alupadel"]),
    ("nox-at10-12k-2026", ["at10 12k", "at10 genius 12k", "at10 12k 2026", "12k luxury"]),
    ("nox-ml10-pro-cup-2026", ["ml10 pro cup", "ml10 luxury", "ml10 pro cup 2026", "miguel lamperti"]),
    ("nox-at10-genius-attack-12k-2026", ["at10 attack", "genius attack 12k", "at10 attack 12k", "attack 12k"]),
    ("nox-tl10-quantum-2026", ["tl10", "tl10 quantum", "tino libaak"]),
    ("nox-la10-quantum-2026", ["la10", "la10 quantum", "leo augsburger"]),
    ("nox-vk10-quantum-2026", ["vk10", "vk10 quantum", "aranzazu osoro"]),
]

def map_title_to_product_id(title: str) -> Optional[str]:
    """تطبیق عنوان محصول سایت با شناسه استاندارد کاتالوگ رالی"""
    t_clean = title.lower()
    for pid, aliases in KNOWN_NOX_MODELS:
        if any(alias in t_clean for alias in aliases):
            return pid
    for pid, _ in KNOWN_NOX_MODELS:
        if match_product_model(title, pid):
            return pid
    return None

def parse_price_value(price_str: str, currency: str) -> Optional[float]:
    """استخراج مقدار عددی قیمت از متن با پشتیبانی از فرمت‌های فارسی و اروپایی"""
    clean_str = re.sub(r"[^\d,\.]", "", price_str).strip()
    if not clean_str:
        return None
    
    if currency == "EUR":
        # در سایت‌های اروپایی مانند پرتغال و اسپانیا کاما نشان‌دهنده ممیز اعشاری است (299,95)
        if "," in clean_str and "." in clean_str:
            clean_str = clean_str.replace(".", "").replace(",", ".")
        elif "," in clean_str:
            clean_str = clean_str.replace(",", ".")
        try:
            val = float(clean_str)
            return round(val, 2) if val > 0 else None
        except ValueError:
            return None
    else:
        # تومان / ریال
        digits_only = re.sub(r"[^\d]", "", clean_str)
        if digits_only:
            try:
                val = float(digits_only)
                return val if val > 0 else None
            except ValueError:
                return None
    return None

def extract_prices_from_html(
    html: str,
    source_name: str = "سایت تامین‌کننده",
    currency: str = "TOMAN"
) -> List[Dict[str, Any]]:
    """
    استخراج بومی قیمت‌ها از بدنه HTML بدون مصرف توکن هوش مصنوعی.
    پشتیبانی از قالب‌های ووکامرس، پرستاشاپ، شاپیفای و ساختارهای استاندارد فروشگاهی.
    """
    results: List[Dict[str, Any]] = []
    if not html:
        return results

    if BeautifulSoup:
        try:
            soup = BeautifulSoup(html, "html.parser")
            # پیدا کردن کارت‌های محصول
            selectors = [
                ".product", ".product-item", ".product-card", ".product-miniature",
                "article.product-miniature", "li.product", ".item-product"
            ]
            cards = []
            for sel in selectors:
                found = soup.select(sel)
                if found:
                    cards.extend(found)

            # اگر کارت جداگانه یافت نشد، تمام المان‌های حاوی نام نوکس را بررسی کن
            if not cards:
                cards = soup.find_all(["div", "article", "li"], class_=re.compile(r"product|item"))

            for card in cards:
                # استخراج عنوان
                title_tag = card.select_one(
                    ".woocommerce-loop-product__title, .product-title, .product-name, h2, h3, a.product-thumbnail"
                )
                if not title_tag:
                    continue
                title = title_tag.get_text(strip=True)
                if not title:
                    title = title_tag.get("title", "")
                if not title:
                    continue

                # بررسی برند نوکس یا راکت
                if "nox" not in title.lower() and "نوکس" not in title and "ناکس" not in title:
                    continue

                pid = map_title_to_product_id(title)
                if not pid:
                    continue

                # استخراج قیمت
                price_tag = card.select_one(
                    "span[itemprop='price'], .price, ins .amount, .product-price, .woocommerce-Price-amount, .current-price"
                )
                if not price_tag:
                    continue

                raw_price_str = price_tag.get("content") or price_tag.get_text(strip=True)
                parsed_val = parse_price_value(raw_price_str, currency)
                if parsed_val:
                    # بررسی عدم ثبت تکراری در این صفحه
                    if not any(r["product_id"] == pid for r in results):
                        results.append({
                            "source_name": source_name,
                            "product_id": pid,
                            "title": title,
                            "raw_price": parsed_val,
                            "currency": currency
                        })
        except Exception:
            pass

    # فال‌بک با عبارات منظم (Regex) در صورت عدم وجود bs4 یا ساختارهای متنی ساده
    if not results:
        # جستجوی الگوهای متنی
        patterns = [
            r"(Nox\s+[A-Za-z0-9\s\-]+)[\s\S]*?(?:€|EUR|\$|تومان|ریال)\s*([\d\.,]+)",
            r"(Nox\s+[A-Za-z0-9\s\-]+)[\s\S]*?([\d\.,]+)\s*(?:€|EUR|تومان)"
        ]
        for pat in patterns:
            for match in re.finditer(pat, html, re.IGNORECASE):
                t = match.group(1).strip()
                p_str = match.group(2).strip()
                pid = map_title_to_product_id(t)
                val = parse_price_value(p_str, currency)
                if pid and val and not any(r["product_id"] == pid for r in results):
                    results.append({
                        "source_name": source_name,
                        "product_id": pid,
                        "title": t,
                        "raw_price": val,
                        "currency": currency
                    })

    return results

def fetch_source_prices(rule: SupplySourceRule) -> List[Dict[str, Any]]:
    """
    درخواست زنده HTTP به آدرس رفرنس تامین‌کننده با هدرهای مرورگر واقعی و استخراج قیمت‌ها.
    """
    if not rule.base_url or not rule.base_url.startswith("http"):
        return []

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fa,en-US;q=0.9,en;q=0.8,pt;q=0.7,es;q=0.7",
    }

    try:
        req = urllib.request.Request(rule.base_url, headers=headers)
        with urllib.request.urlopen(req, timeout=14) as response:
            html = response.read().decode("utf-8", errors="ignore")
            return extract_prices_from_html(
                html=html,
                source_name=rule.source_name,
                currency=rule.currency
            )
    except Exception:
        # در صورت قطعی اینترنت، فیلترینگ یا تایم‌اوت سایت مبدا
        return []

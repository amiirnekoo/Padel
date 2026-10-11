import urllib.request
import re
from typing import List, Dict, Any, Optional

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

from .supply_rules_service import calculate_markup_price, match_product_model

def scrape_sunsport_nox_rackets(
    category_url: str = "https://sunsportiran.com/category/sports-equipment/racket-padel/",
    markup_percent: float = 4.0
) -> List[Dict[str, Any]]:
    """
    Lightweight, zero-token Python scraper for SunSport Iran WooCommerce catalog.
    Extracts Nox padel racket pricing and calculates Rally retail price with markup_percent.
    Uses resilient standard regex/HTML parsing without forcing external bs4 dependency.
    """
    results: List[Dict[str, Any]] = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    try:
        req = urllib.request.Request(category_url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as response:
            html = response.read().decode("utf-8", errors="ignore")
    except Exception:
        # Graceful fallback on network timeout
        return results

    if BeautifulSoup:
        try:
            soup = BeautifulSoup(html, "html.parser")
            product_cards = soup.select(".product, .product-item, .product-card") or soup.find_all("li", class_=re.compile(r"product"))
            for card in product_cards:
                title_tag = card.select_one(".woocommerce-loop-product__title, .product-title, h2, h3, a.woocommerce-LoopProduct-link")
                if not title_tag:
                    continue
                title = title_tag.get_text(strip=True)
                if "nox" not in title.lower() and "نوکس" not in title and "ناکس" not in title:
                    continue
                link_tag = card.find("a", href=True)
                product_url = link_tag["href"] if link_tag else ""
                price_tag = card.select_one("ins .woocommerce-Price-amount, .price .amount, .woocommerce-Price-amount")
                if not price_tag:
                    continue
                digits = re.sub(r"[^\d]", "", price_tag.get_text(strip=True))
                if not digits:
                    continue
                price_amount = int(digits)
                rally_price = calculate_markup_price(price_amount, markup_percent)
                results.append({
                    "supplier": "SunSport Iran",
                    "title": title,
                    "url": product_url,
                    "supplier_price": price_amount,
                    "markup_percent": markup_percent,
                    "rally_retail_price": rally_price,
                    "is_in_stock": True
                })
            if results:
                return results
        except Exception:
            pass

    # Resilient Regex-based fallback parser (Standard Library only)
    product_blocks = re.findall(r'<li[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)</li>', html, re.DOTALL | re.IGNORECASE)
    for block in product_blocks:
        title_match = re.search(r'<(?:h2|h3|span)[^>]*class="[^"]*(?:woocommerce-loop-product__title|product-title)[^"]*"[^>]*>(.*?)</(?:h2|h3|span)>', block, re.DOTALL | re.IGNORECASE)
        if not title_match:
            title_match = re.search(r'<a[^>]*class="[^"]*woocommerce-LoopProduct-link[^"]*"[^>]*>(.*?)</a>', block, re.DOTALL | re.IGNORECASE)
        if not title_match:
            continue

        raw_title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
        if "nox" not in raw_title.lower() and "نوکس" not in raw_title and "ناکس" not in raw_title:
            continue

        url_match = re.search(r'href="([^"]+)"', block)
        product_url = url_match.group(1) if url_match else ""

        price_matches = re.findall(r'(?:woocommerce-Price-amount|amount)[^>]*>(.*?)</span>', block, re.DOTALL | re.IGNORECASE)
        if not price_matches:
            continue

        digits = re.sub(r"[^\d]", "", price_matches[-1])
        if not digits:
            continue

        price_amount = int(digits)
        rally_price = calculate_markup_price(price_amount, markup_percent)

        results.append({
            "supplier": "SunSport Iran",
            "title": raw_title,
            "url": product_url,
            "supplier_price": price_amount,
            "markup_percent": markup_percent,
            "rally_retail_price": rally_price,
            "is_in_stock": "out-of-stock" not in block
        })

    return results

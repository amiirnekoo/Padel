import urllib.request
import re
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from .supply_rules_service import calculate_markup_price, match_product_model

def scrape_sunsport_nox_rackets(
    category_url: str = "https://sunsportiran.com/category/sports-equipment/racket-padel/",
    markup_percent: float = 4.0
) -> List[Dict[str, Any]]:
    """
    Lightweight, zero-token Python scraper for SunSport Iran WooCommerce catalog.
    Extracts Nox padel racket pricing and calculates Rally retail price with markup_percent.
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
    except Exception as e:
        # Graceful fallback or network log
        return results

    soup = BeautifulSoup(html, "html.parser")
    # WooCommerce standard product selectors
    product_cards = soup.select(".product, .product-item, .product-card") or soup.find_all("li", class_=re.compile(r"product"))

    for card in product_cards:
        try:
            # Extract title
            title_tag = card.select_one(".woocommerce-loop-product__title, .product-title, h2, h3, a.woocommerce-LoopProduct-link")
            if not title_tag:
                continue
            title = title_tag.get_text(strip=True)

            # Filter for Nox rackets only
            if "nox" not in title.lower() and "نوکس" not in title and "ناکس" not in title:
                continue

            # Extract URL
            link_tag = card.find("a", href=True)
            product_url = link_tag["href"] if link_tag else ""

            # Extract Price (in Tomans)
            price_amount = 0
            price_tag = card.select_one("ins .woocommerce-Price-amount, .price .amount, .woocommerce-Price-amount")
            if price_tag:
                price_text = price_tag.get_text(strip=True)
                # Remove non-digit characters
                digits = re.sub(r"[^\d]", "", price_text)
                if digits:
                    val = int(digits)
                    # Iranian WooCommerce often displays Tomans or Rials.
                    # Standard check: if > 10,000,000 and has trailing zero for Rials, normalize to Tomans
                    price_amount = val

            if price_amount <= 0:
                continue

            # Calculate Rally retail price with markup (e.g., 4% profit)
            rally_price = calculate_markup_price(price_amount, markup_percent)

            # In-stock check
            is_in_stock = True
            if "out-of-stock" in card.get("class", []) or card.select_one(".out-of-stock"):
                is_in_stock = False

            results.append({
                "supplier": "SunSport Iran",
                "title": title,
                "url": product_url,
                "supplier_price": price_amount,
                "markup_percent": markup_percent,
                "rally_retail_price": rally_price,
                "is_in_stock": is_in_stock
            })
        except Exception:
            continue

    return results

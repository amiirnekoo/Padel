#!/usr/bin/env python3
"""Validate the required Phase 1 product documents."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


DOCUMENTS: dict[str, tuple[str, ...]] = {
    "docs/product-state.md": (
        "## وضعیت جاری",
        "## تصمیم‌های تثبیت‌شده",
        "## فرضیات",
        "## شواهد",
        "## ریسک‌ها",
        "## اقدام بعدی",
    ),
    "docs/phase-01/product-charter.md": (
        "## مسئله",
        "## کاربران",
        "## ارزش پیشنهادی",
        "## محدوده",
        "## خارج از محدوده",
        "## معیار موفقیت",
    ),
    "docs/phase-01/validation-evidence.md": (
        "## روش",
        "## شواهد",
        "## فرضیات",
        "## شکاف‌های شواهد",
        "## نتیجه",
    ),
    "docs/phase-01/mvp-contract.md": (
        "## جریان‌های اصلی",
        "## قابلیت‌های داخل MVP",
        "## قابلیت‌های خارج MVP",
        "## معیارهای پذیرش",
        "## معیار توقف",
    ),
    "docs/phase-01/domain-rules.md": (
        "## نقش‌ها",
        "## موجودیت‌ها",
        "## قواعد رزرو",
        "## قواعد پرداخت و تسویه",
        "## قواعد لغو و بازپرداخت",
        "## مجوزها",
    ),
    "docs/phase-01/phase-01-gate-report.md": (
        "## تصمیم نهایی",
        "## خروجی‌های تأییدشده",
        "## موارد حل‌نشده",
        "## آمادگی فاز دوم",
        "## اقدام بعدی",
    ),
}

REQUIRED_METADATA = ("**وضعیت:**", "**نسخه:**", "**تاریخ:**")
PLACEHOLDER_PATTERN = re.compile(
    r"\b(?:TODO|TBD)\b|لورم|متن نمونه|existing code|منطق را اینجا",
    re.IGNORECASE,
)


def validate_document(root: Path, relative_path: str, headings: tuple[str, ...]) -> list[str]:
    errors: list[str] = []
    path = root / relative_path
    if not path.is_file():
        return [f"فایل الزامی وجود ندارد: {relative_path}"]

    text = path.read_text(encoding="utf-8")
    stripped = text.strip()

    if not stripped.startswith('<div dir="rtl">'):
        errors.append(f"{relative_path}: فایل با کانتینر RTL آغاز نمی‌شود")
    if not stripped.endswith("</div>"):
        errors.append(f"{relative_path}: فایل با کانتینر RTL پایان نمی‌یابد")

    for marker in REQUIRED_METADATA:
        if marker not in text:
            errors.append(f"{relative_path}: فراداده الزامی ندارد: {marker}")

    for heading in headings:
        if heading not in text:
            errors.append(f"{relative_path}: بخش الزامی ندارد: {heading}")

    match = PLACEHOLDER_PATTERN.search(text)
    if match:
        errors.append(
            f"{relative_path}: متن پرکننده یا تصمیم ثبت‌نشده یافت شد: {match.group(0)}"
        )

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(
        description="اعتبارسنجی اسناد اجباری فاز اول پلتفرم پدل و تنیس"
    )
    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        help="ریشه پروژه؛ پیش‌فرض پوشه جاری است",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    errors: list[str] = []
    for relative_path, headings in DOCUMENTS.items():
        errors.extend(validate_document(root, relative_path, headings))

    if errors:
        print("اعتبارسنجی فاز اول ناموفق بود:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("اسناد فاز اول از نظر ساختار، RTL و نبود متن پرکننده معتبر هستند.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

import { ShopProduct } from '../types/rally';

/**
 * استخراج پویای جدیدترین سال کاتالوگ (مثلاً ۲۰۲۷، سال آینده ۲۰۲۸ و ...)
 * بدون هرگونه هاردکد بودن سال در کامپوننت‌ها
 */
export function getLatestCatalogYear(products: ShopProduct[]): number {
  if (!products || products.length === 0) return 2027;
  const years = products
    .map((p) => p.year)
    .filter((y): y is number => typeof y === 'number' && y > 2000);
  return years.length > 0 ? Math.max(...years) : 2027;
}

/**
 * بررسی اینکه آیا محصول به جدیدترین کلکسیون سال کاتالوگ تعلق دارد یا خیر
 */
export function isLatestYearProduct(product: ShopProduct, latestYear: number): boolean {
  if (!product || !product.year) return false;
  return product.year === latestYear;
}

/**
 * انتخاب تصادفی (رندوم) راکت‌های جدیدترین سال برای نمایش در ویترین صفحه اصلی
 * روند همیشگی: هر سال که راکت‌های سال جدید (مثلاً ۲۰۲۸) اضافه شوند،
 * به صورت خودکار راکت‌های سال جدید به شکل رندوم در صدر ویترین قرار می‌گیرند.
 */
export function getFeaturedLatestYearProducts(products: ShopProduct[], count: number = 3): ShopProduct[] {
  if (!products || products.length === 0) return [];

  // راکت‌های پدل کاتالوگ
  const padelRackets = products.filter(
    (p) => p.category === 'PADEL_RACKET' || p.sport === 'PADEL'
  );

  const latestYear = getLatestCatalogYear(products);
  const latestRackets = padelRackets.filter((p) => p.year === latestYear);

  // استخر کاندیداها: راکت‌های سال جدید
  const candidates = latestRackets.length > 0 ? [...latestRackets] : [...padelRackets];

  // الگوریتم برزدن تصادفی فیشر-یتز (Fisher-Yates Shuffle)
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const selected = candidates.slice(0, count);

  // در صورت کمتر بودن تعداد از count، با راکت‌های دیگر تکمیل می‌شود
  if (selected.length < count) {
    const selectedIds = new Set(selected.map((p) => p.id));
    const others = padelRackets.filter((p) => !selectedIds.has(p.id));
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    selected.push(...others.slice(0, count - selected.length));
  }

  return selected;
}

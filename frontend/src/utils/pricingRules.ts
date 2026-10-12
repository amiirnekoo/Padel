/**
 * Rally Platform - Pricing Rounding Rules Utility
 * قانون مصوب رندسازی پله‌ای به بالا (Ceil Price Rounding Rule)
 * 
 * طبق بند ۱۰ قوانین پلتفرم رالی، کلیه قیمت‌ها باید بدون خرده و رند به سمت بالا باشند:
 * - راکت‌ها و اقلام بالای ۵ میلیون تومان: پله‌های ۵۰۰,۰۰۰ تومانی (مثلاً ۹۲، ۹۲.۵ یا ۹۳ میلیون)
 * - اقلام بین ۱ تا ۵ میلیون تومان: پله‌های ۵۰,۰۰۰ تومانی
 * - اقلام زیر ۱ میلیون تومان: پله‌های ۱۰,۰۰۰ تومانی
 */

export interface PricingPolicy {
  roundingEnabled: boolean;
  racketRoundingStep: number;
  midRangeRoundingStep: number;
  lowRangeRoundingStep: number;
  roundingMode: 'ceil';
  description: string;
}

export const DEFAULT_PRICING_POLICY: PricingPolicy = {
  roundingEnabled: true,
  racketRoundingStep: 500_000,
  midRangeRoundingStep: 50_000,
  lowRangeRoundingStep: 10_000,
  roundingMode: 'ceil',
  description: 'قانون دائمی رندسازی پله‌ای به بالا (Ceil) بدون هیچ‌گونه خرده‌قیمت در سایت رالی'
};

/**
 * رند کردن قیمت به بالا بر اساس پله مصوب رالی
 * @param price قیمت محاسبه‌شده به تومان
 * @param customStep پله اختیاری سفارشی (پیش‌فرض بر اساس رنج قیمت تعیین می‌شود)
 */
export function roundPriceToCeilStep(price: number, customStep?: number): number {
  if (!price || price <= 0 || isNaN(price)) {
    return 0;
  }

  let step = customStep;
  if (!step) {
    if (price >= 5_000_000) {
      step = DEFAULT_PRICING_POLICY.racketRoundingStep; // 500,000 تومان برای راکت‌ها
    } else if (price >= 1_000_000) {
      step = DEFAULT_PRICING_POLICY.midRangeRoundingStep; // 50,000 تومان
    } else {
      step = DEFAULT_PRICING_POLICY.lowRangeRoundingStep; // 10,000 تومان
    }
  }

  return Math.ceil(price / step) * step;
}

/**
 * فرمت‌بندی قیمت به میلیون تومان برای نمایش‌های فشرده (نظیر ۹۲.۵ م.ت یا ۹۳ م.ت)
 */
export function formatToMillionTomans(price: number): string {
  const rounded = roundPriceToCeilStep(price);
  const inMillions = rounded / 1_000_000;
  // حذف صفرهای غیرضروری اعشار (مثلاً ۹۲ به جای ۹۲.۰)
  return Number.isInteger(inMillions) ? `${inMillions}` : `${inMillions.toFixed(1)}`;
}

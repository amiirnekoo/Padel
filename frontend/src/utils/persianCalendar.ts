/**
 * ماژول محاسبات تقویم رسمی جلالی (شمسی) برای کورت‌ها و سیستم رزرواسیون
 */

export const PERSIAN_MONTH_NAMES = [
  '',
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

export const WEEKDAYS = [
  { short: 'ش', full: 'شنبه' },
  { short: 'ی', full: 'یکشنبه' },
  { short: 'د', full: 'دوشنبه' },
  { short: 'س', full: 'سه‌شنبه' },
  { short: 'چ', full: 'چهارشنبه' },
  { short: 'پ', full: 'پنجشنبه' },
  { short: 'ج', full: 'جمعه' }
];

export interface PersianDateObj {
  year: number;
  month: number;
  day: number;
}

export function getPersianDate(d: Date): PersianDateObj {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(d);

  let year = 1405;
  let month = 7;
  let day = 1;

  for (const p of parts) {
    if (p.type === 'year') year = parseInt(p.value, 10);
    if (p.type === 'month') month = parseInt(p.value, 10);
    if (p.type === 'day') day = parseInt(p.value, 10);
  }

  return { year, month, day };
}

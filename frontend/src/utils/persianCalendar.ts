/**
 * ماژول پیشرفته و پیوسته محاسبات تقویم رسمی جلالی (شمسی) برای کورت‌ها و سیستم رزرواسیون رالی
 * برگرفته از الگوریتم‌های دقیق نجومی و استاندارد باحساب (bahesab.ir)
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

export interface CalendarDayItem {
  offset: number;
  year: number;
  month: number;
  dayNum: number;
  weekdayName: string;
  dayOfWeek: number;
  isPast: boolean;
  isToday: boolean;
  isFriday: boolean;
  isHoliday: boolean;
  priceLabel: string;
  fullDateLabel: string;
}

export interface CalendarMonthConfig {
  year: number;
  month: number;
  monthName: string;
  days: CalendarDayItem[];
  startPadding: number;
}

export function isPersianLeap(year: number): boolean {
  const rem = ((year + 38) * 31) % 128;
  return rem < 31;
}

export function getDaysInPersianMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isPersianLeap(year) ? 30 : 29;
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let gy: number, gm: number, gd: number, days: number;
  jy += 1595;
  days = -355668 + (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  gd = days + 1;
  const sal_b = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (gm = 0; gm < 13 && gd > sal_b[gm]; gm++) gd -= sal_b[gm];
  return { gy, gm, gd };
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

export function isOfficialHoliday(month: number, day: number, dayOfWeek: number): boolean {
  if (dayOfWeek === 6) return true; // جمعه‌ها همیشه تعطیل رسمی هستند
  // مناسبت‌های ملی و مذهبی تعطیل تقویم رسمی ایران
  if (month === 1 && (day >= 1 && day <= 4)) return true; // عید نوروز
  if (month === 1 && (day === 12 || day === 13)) return true; // روز جمهوری اسلامی و طبیعت
  if (month === 3 && (day === 14 || day === 15)) return true; // ارتحال امام و قیام ۱۵ خرداد
  if (month === 11 && day === 22) return true; // پیروزی انقلاب
  if (month === 12 && day === 29) return true; // ملی شدن صنعت نفت
  return false;
}

export function getDayStartingPrice(dayOfWeek: number, isHoliday: boolean): string {
  if (isHoliday || dayOfWeek === 6) return '۱.۶ م'; // جمعه و تعطیلات: اوج تقاضا
  if (dayOfWeek === 5) return '۱.۴ م'; // پنجشنبه
  if (dayOfWeek === 4) return '۱.۳ م'; // چهارشنبه
  return '۱.۲ م'; // شنبه تا سه‌شنبه
}

export function getCalendarMonth(
  year: number,
  month: number,
  toPersianDigitsFn: (n: number | string) => string,
  today: Date = new Date()
): CalendarMonthConfig {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const totalDays = getDaysInPersianMonth(year, month);
  const g1 = jalaliToGregorian(year, month, 1);
  const d1 = new Date(g1.gy, g1.gm - 1, g1.gd);
  const startPadding = (d1.getDay() + 1) % 7;

  const days: CalendarDayItem[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const gd = jalaliToGregorian(year, month, d);
    const dateObj = new Date(gd.gy, gd.gm - 1, gd.gd);
    const dayOfWeek = (dateObj.getDay() + 1) % 7;
    const targetMidnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
    const offset = Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
    const isPast = offset < 0;
    const isToday = offset === 0;
    const isFriday = dayOfWeek === 6;
    const isHoliday = isOfficialHoliday(month, d, dayOfWeek);
    const priceLabel = isPast ? '' : getDayStartingPrice(dayOfWeek, isHoliday);
    const weekdayName = WEEKDAYS[dayOfWeek].full;
    const fullDateLabel = `${weekdayName} ${toPersianDigitsFn(d)} ${PERSIAN_MONTH_NAMES[month]} ${toPersianDigitsFn(year)}`;

    days.push({
      offset,
      year,
      month,
      dayNum: d,
      weekdayName,
      dayOfWeek,
      isPast,
      isToday,
      isFriday,
      isHoliday,
      priceLabel,
      fullDateLabel
    });
  }

  return {
    year,
    month,
    monthName: PERSIAN_MONTH_NAMES[month],
    days,
    startPadding
  };
}

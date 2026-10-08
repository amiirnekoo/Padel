/**
 * ابزارهای نرمال‌سازی متون فارسی، جستجوی هوشمند و اعتبارسنجی زمان در منطقه زمانی ایران (Asia/Tehran)
 */

/**
 * یکسان‌سازی نویسه‌های عربی و فارسی (ی/ي، ک/ك، ه/ة)، حذف اعراب و تنظیم فواصل
 */
export function normalizePersianText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    // تبدیل انواع ی عربی به ی فارسی
    .replace(/[\u064A\u0649]/g, '\u06CC')
    // تبدیل ک عربی به ک فارسی
    .replace(/[\u0643]/g, '\u06A9')
    // تبدیل ة به ه
    .replace(/[\u0629]/g, '\u0647')
    // تبدیل أ و إ و آ به ا
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    // حذف اعراب (فتحه، ضمه، کسره، تنوین، تشدید، سکون)
    .replace(/[\u064B-\u0652]/g, '')
    // تبدیل نیم‌فاصله به فاصله ساده برای مقایسه آسان
    .replace(/[\u200C\u200B]/g, ' ')
    // جایگزینی کاراکترهای اضافی و فواصل متوالی
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * بررسی تطابق فازی عبارت جستجو با متن داده شده پس از نرمال‌سازی
 */
export function matchesPersianSearch(targetText: string | null | undefined, searchWord: string | null | undefined): boolean {
  if (!searchWord || !searchWord.trim()) return true;
  if (!targetText) return false;

  const normalizedTarget = normalizePersianText(targetText);
  const normalizedQuery = normalizePersianText(searchWord);

  // جستجوی چندکلمه‌ای: همه کلمات باید در متن وجود داشته باشند
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  return queryTokens.every((token) => normalizedTarget.includes(token));
}

/**
 * دریافت دقیقه جاری از نیمه‌شب در منطقه زمانی تهران (Asia/Tehran)
 */
export function getTehranTimeMinutes(): { hours: number; minutes: number; totalMinutes: number; todayIsoDate: string } {
  try {
    const now = new Date();
    // تبدیل به رشته محلی تهران
    const tehranFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const parts = tehranFormatter.formatToParts(now);
    let year = '', month = '', day = '', hour = 0, minute = 0;
    for (const p of parts) {
      if (p.type === 'year') year = p.value;
      if (p.type === 'month') month = p.value;
      if (p.type === 'day') day = p.value;
      if (p.type === 'hour') hour = parseInt(p.value, 10);
      if (p.type === 'minute') minute = parseInt(p.value, 10);
    }

    const todayIsoDate = `${year}-${month}-${day}`;
    return {
      hours: hour,
      minutes: minute,
      totalMinutes: hour * 60 + minute,
      todayIsoDate
    };
  } catch {
    // Fallback در صورت عدم پشتیبانی مرورگر
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      totalMinutes: now.getHours() * 60 + now.getMinutes(),
      todayIsoDate: now.toISOString().split('T')[0]
    };
  }
}

/**
 * تبدیل ساعت فرمت HH:MM به دقیقه از نیمه‌شب
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const [h, m] = clean.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + (m || 0);
}

/**
 * بررسی اینکه آیا یک سانس گذشته است یا خیر (بر اساس تاریخ و ساعت تهران)
 */
export function isSlotPast(targetIsoDate: string, startTimeStr: string): boolean {
  const tehran = getTehranTimeMinutes();
  if (targetIsoDate < tehran.todayIsoDate) {
    return true; // تاریخ گذشته است
  }
  if (targetIsoDate === tehran.todayIsoDate) {
    const slotMinutes = parseTimeToMinutes(startTimeStr);
    // اگر سانس شروع شده یا کمتر از ۱۵ دقیقه به آن باقی مانده، قابل رزرو فوری نیست
    return slotMinutes <= (tehran.totalMinutes + 15);
  }
  return false;
}

/**
 * محاسبه فاصله مستقیم هوایی بین دو مختصات جغرافیایی بر حسب کیلومتر با فرمول Haversine
 * بدون وابستگی به سرویس خارجی
 */
export function calculateDirectDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // شعاع کره زمین به کیلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const PERSIAN_DIGIT_MAP = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * تبدیل قطعی ارقام انگلیسی و عربی به ارقام فارسی استاندارد
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  return input
    .toString()
    .replace(/[0-9]/g, (d) => PERSIAN_DIGIT_MAP[parseInt(d, 10)])
    .replace(/[\u0660-\u0669]/g, (d) => PERSIAN_DIGIT_MAP[d.charCodeAt(0) - 0x0660]);
}

/**
 * قالب‌بندی مبلغ به ریال/تومان با جداکننده سه‌رقمی و ارقام تمام‌فارسی
 */
export function formatPersianPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '۰';
  const num = Math.round(Number(amount));
  const formattedEn = num.toLocaleString('en-US');
  return toPersianDigits(formattedEn);
}

/**
 * فرمت‌دهی امن ساعت سانس‌ها، جایگزینی خط تیره با «تا»، و تصحیح ترتیب زمانی در موتور BiDi
 */
export function formatSlotTimeString(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  const parts = timeStr.split(/\s*[-–—]|\s+تا\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 2) {
    let [p1, p2] = parts;
    const m1 = parseTimeToMinutes(p1);
    const m2 = parseTimeToMinutes(p2);
    // اگر p1 > p2 و سانس مربوط به بامداد روز بعد نباشد، ترتیب را اصلاح کن
    if (m1 > m2 && m2 > 360) {
      [p1, p2] = [p2, p1];
    }
    return `${toPersianDigits(p1)} تا ${toPersianDigits(p2)}`;
  }
  return toPersianDigits(timeStr);
}


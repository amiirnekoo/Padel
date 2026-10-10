import { ShopProduct } from '../types/rally';

export interface ProPlayerProfile {
  id: string;
  name_fa: string;
  name_en: string;
  nickname_fa: string;
  avatar_url: string;
  bust_url?: string;
  action_photo_url?: string;
  ranking_fip: number;
  ranking_label_fa: string;
  country_fa: string;
  country_flag: string;
  hand: string;
  position_fa: string;
  brand: string;
  titles_count: number;
  racket_series_fa: string;
  bio_fa: string;
  endorsement_quote_fa: string;
  verified_pro: boolean;
}

export const PRO_PLAYERS: Record<string, ProPlayerProfile> = {
  'agustin-tapia': {
    id: 'agustin-tapia',
    name_fa: 'آگوستین تاپیا',
    name_en: 'Agustín Tapia',
    nickname_fa: 'موتزارت پدل جهان (The Mozart)',
    avatar_url: '/images/players/agustin_tapia_circle.webp',
    bust_url: '/images/players/agustin_tapia_bust.webp',
    action_photo_url: '/images/players/agustin_tapia_nox_hd.jpg',
    ranking_fip: 1,
    ranking_label_fa: 'رنک ۱ فدراسیون جهانی پدل (FIP)',
    country_fa: 'آرژانتین',
    country_flag: '🇦🇷',
    hand: 'راست‌دست',
    position_fa: 'بازیکن تخصصی سمت چپ (بک‌هند)',
    brand: 'Nox',
    titles_count: 28,
    racket_series_fa: 'سری رسمی NOX AT10 & Genius',
    bio_fa: 'نابغه بی‌بدیل پدل جهان از کاتامارکای آرژانتین؛ ملقب به موتزارت به دلیل جادوی ضربات غیرقابل پیش‌بینی، اسمش‌های پروازی و هماهنگی استثنایی با راکت‌های کربن نوکس.',
    endorsement_quote_fa: '«برای من قالب و بالانس راکت AT10 مثل امتداد دستم در زمین بازیه؛ ترکیب کربن Alum و فوم MLD نهایت اعتماد به نفس رو در سرعت‌های بالا بهم میده.»',
    verified_pro: true
  },
  'arturo-coello': {
    id: 'arturo-coello',
    name_fa: 'آرتورو کوئلو',
    name_en: 'Arturo Coello',
    nickname_fa: 'شاه آرتور (King Arturo)',
    avatar_url: '/images/players/arturo_coello_avatar.webp',
    ranking_fip: 1,
    ranking_label_fa: 'رنک ۱ فدراسیون جهانی پدل (FIP)',
    country_fa: 'اسپانیا',
    country_flag: '🇪🇸',
    hand: 'چپ‌دست',
    position_fa: 'بازیکن تخصصی سمت راست (فورهند)',
    brand: 'Head',
    titles_count: 30,
    racket_series_fa: 'سری رسمی Head Extreme',
    bio_fa: 'غول مهارنشدنی چپ‌دست اسپانیایی و نفر اول رنکینگ جهانی با بلندترین قد و مرگبارترین اسمش‌های تور بین‌المللی.',
    endorsement_quote_fa: '«اسمش‌های انفجاری و پوشش تور نیازمند راکتی با بیشترین پایداریه.»',
    verified_pro: true
  }
};

/**
 * Maps a ShopProduct to its designated Pro Player endorsement (if applicable).
 */
export function getProPlayerForProduct(product?: ShopProduct | null): ProPlayerProfile | null {
  if (!product) return null;

  const id = product.id.toLowerCase();
  const nameEn = (product.name_en || '').toLowerCase();
  const nameFa = product.name_fa || '';
  const desc = (product.description || '').toLowerCase();
  const tags = (product.tags || []).map(t => t.toLowerCase());

  // Check for Agustín Tapia
  const isTapia =
    id.includes('at10') ||
    id.includes('tapia') ||
    id.includes('genius') ||
    nameEn.includes('tapia') ||
    nameFa.includes('تاپیا') ||
    desc.includes('تاپیا') ||
    tags.some(t => t.includes('تاپیا') || t.includes('tapia'));

  if (isTapia) {
    return PRO_PLAYERS['agustin-tapia'];
  }

  // Check for Arturo Coello
  const isCoello =
    id.includes('coello') ||
    nameEn.includes('coello') ||
    nameFa.includes('کوئلو') ||
    tags.some(t => t.includes('کوئلو') || t.includes('coello'));

  if (isCoello) {
    return PRO_PLAYERS['arturo-coello'];
  }

  return null;
}

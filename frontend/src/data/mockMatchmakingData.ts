import { MatchmakingGameItem } from '../types/rally';

export interface SkillFilterPill {
  id: string;
  label: string;
}

export const SKILL_FILTER_PILLS: SkillFilterPill[] = [
  { id: 'ALL', label: 'همه سطوح' },
  { id: 'D-', label: 'سطح D- (تازه‌کار)' },
  { id: 'D', label: 'سطح D (مبتدی)' },
  { id: 'D+', label: 'سطح D+ (نیمه‌مبتدی)' },
  { id: 'C-', label: 'سطح C- (متوسط مقدماتی)' },
  { id: 'C', label: 'سطح C (متوسط)' },
  { id: 'C+', label: 'سطح C+ (نیمه‌پیشرفته)' },
  { id: 'B-', label: 'سطح B- (پیشرفته مقدماتی)' },
  { id: 'B', label: 'سطح B (پیشرفته)' },
  { id: 'B+', label: 'سطح B+ (پیشرفته عالی)' },
  { id: 'A-', label: 'سطح A- (حرفه‌ای مقدماتی)' },
  { id: 'A', label: 'سطح A (حرفه‌ای)' },
  { id: 'A+', label: 'سطح A+ (الیت کشوری)' },
];

export const FALLBACK_MATCHMAKING_GAMES: MatchmakingGameItem[] = [
  {
    id: 'mock-mm-1',
    title: 'بازی پرانرژی عصرگاهی پدل • سطح D+',
    skill_level: 'D+',
    gender_category: 'OPEN',
    total_price: 16000000,
    price_per_player: 4000000,
    status: 'OPEN',
    filled_count: 3,
    club_name: 'باشگاه پدل انقلاب',
    club_city: 'تهران',
    court_name: 'کورت ۱ پانورامیک',
    slot_date: 'امروز',
    start_time: '۱۸:۳۰',
    end_time: '۲۰:۰۰',
    positions: {
      team_a_right: { user_id: 'usr-1', user_name: 'امیرحسین (شما)', label: 'تیم ۱ • راست' },
      team_a_left: { user_id: 'usr-2', user_name: 'کیان رضایی', label: 'تیم ۱ • چپ' },
      team_b_right: { user_id: 'usr-3', user_name: 'بردیا تهرانی', label: 'تیم ۲ • راست' },
      team_b_left: { user_id: null, user_name: null, label: 'تیم ۲ • چپ' },
    },
  },
  {
    id: 'mock-mm-2',
    title: 'چلنج مچ پدل دابلز • سطح C',
    skill_level: 'C',
    gender_category: 'OPEN',
    total_price: 20000000,
    price_per_player: 5000000,
    status: 'OPEN',
    filled_count: 2,
    club_name: 'پدل سنتر پالادیوم',
    club_city: 'تهران',
    court_name: 'کورت VIP',
    slot_date: 'امشب',
    start_time: '۲۰:۳۰',
    end_time: '۲۲:۰۰',
    positions: {
      team_a_right: { user_id: 'usr-4', user_name: 'سهراب محمدی', label: 'تیم ۱ • راست' },
      team_a_left: { user_id: null, user_name: null, label: 'تیم ۱ • چپ' },
      team_b_right: { user_id: 'usr-5', user_name: 'ماهان پاشا', label: 'تیم ۲ • راست' },
      team_b_left: { user_id: null, user_name: null, label: 'تیم ۲ • چپ' },
    },
  },
  {
    id: 'mock-mm-3',
    title: 'بازی دوستانه پدل مبتدی • سطح D',
    skill_level: 'D',
    gender_category: 'OPEN',
    total_price: 12000000,
    price_per_player: 3000000,
    status: 'OPEN',
    filled_count: 1,
    club_name: 'مجموعه پدل شمیران',
    club_city: 'تهران',
    court_name: 'کورت ۲ شیشه‌ای',
    slot_date: 'فردا',
    start_time: '۱۷:۰۰',
    end_time: '۱۸:۳۰',
    positions: {
      team_a_right: { user_id: 'usr-6', user_name: 'نیما افشار', label: 'تیم ۱ • راست' },
      team_a_left: { user_id: null, user_name: null, label: 'تیم ۱ • چپ' },
      team_b_right: { user_id: null, user_name: null, label: 'تیم ۲ • راست' },
      team_b_left: { user_id: null, user_name: null, label: 'تیم ۲ • چپ' },
    },
  },
];

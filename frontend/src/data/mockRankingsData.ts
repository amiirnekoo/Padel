export interface RankingPlayer {
  id: string;
  rank: number;
  previousRank: number;
  name: string;
  englishName: string;
  country: string;
  countryFlag: string;
  points: number;
  tournamentsCount: number;
  winRate: string;
  avatarUrl: string | null;
  club: string;
  hand: string;
  category: 'IRAN' | 'WORLD';
}

export const IRAN_PADEL_RANKINGS: RankingPlayer[] = [
  {
    id: 'ir-1',
    rank: 1,
    previousRank: 1,
    name: 'فرساد شاهی',
    englishName: 'Farsad Shahi',
    country: 'ایران',
    countryFlag: '🇮🇷',
    points: 2450,
    tournamentsCount: 14,
    winRate: '۸۸٪',
    avatarUrl: null,
    club: 'پدل سنترال انقلاب',
    hand: 'راست دست',
    category: 'IRAN'
  },
  {
    id: 'ir-2',
    rank: 2,
    previousRank: 3,
    name: 'امیرمحمد جمشیدی',
    englishName: 'Amir Mohammad Jamshidi',
    country: 'ایران',
    countryFlag: '🇮🇷',
    points: 2280,
    tournamentsCount: 15,
    winRate: '۸۴٪',
    avatarUrl: null,
    club: 'پدل آرنا ولنجک',
    hand: 'چپ دست',
    category: 'IRAN'
  },
  {
    id: 'ir-3',
    rank: 3,
    previousRank: 2,
    name: 'سهراب درفشی',
    englishName: 'Sohrab Derafshi',
    country: 'ایران',
    countryFlag: '🇮🇷',
    points: 2190,
    tournamentsCount: 13,
    winRate: '۸۱٪',
    avatarUrl: null,
    club: 'باشگاه پیام تهران',
    hand: 'راست دست',
    category: 'IRAN'
  },
  {
    id: 'ir-4',
    rank: 4,
    previousRank: 4,
    name: 'آریا روغنی',
    englishName: 'Aria Roghani',
    country: 'ایران',
    countryFlag: '🇮🇷',
    points: 1940,
    tournamentsCount: 12,
    winRate: '۷۹٪',
    avatarUrl: null,
    club: 'پدل سنترال انقلاب',
    hand: 'راست دست',
    category: 'IRAN'
  },
  {
    id: 'ir-5',
    rank: 5,
    previousRank: 6,
    name: 'مازیار مشکاتی',
    englishName: 'Maziar Meshkati',
    country: 'ایران',
    countryFlag: '🇮🇷',
    points: 1820,
    tournamentsCount: 11,
    winRate: '۷۶٪',
    avatarUrl: null,
    club: 'پدل سنتر شیراز',
    hand: 'راست دست',
    category: 'IRAN'
  },
  {
    id: 'ir-6',
    rank: 6,
    previousRank: 5,
    name: 'کوروش قناعتی',
    englishName: 'Kourosh Ghenaati',
    country: 'ایران',
    countryFlag: '🇮🇷',
    points: 1750,
    tournamentsCount: 10,
    winRate: '۷۴٪',
    avatarUrl: null,
    club: 'پدل زون اصفهان',
    hand: 'چپ دست',
    category: 'IRAN'
  },
  {
    id: 'ir-7',
    rank: 7,
    previousRank: 8,
    name: 'پژمان شریفی',
    englishName: 'Pejman Sharifi',
    country: 'ایران',
    countryFlag: '🇮🇷',
    points: 1610,
    tournamentsCount: 12,
    winRate: '۷۲٪',
    avatarUrl: null,
    club: 'پدل کلاب کیش',
    hand: 'راست دست',
    category: 'IRAN'
  },
  {
    id: 'ir-8',
    rank: 8,
    previousRank: 7,
    name: 'دانیال ثقفی',
    englishName: 'Danial Saghafi',
    country: 'ایران',
    countryFlag: '🇮🇷',
    points: 1530,
    tournamentsCount: 9,
    winRate: '۷۰٪',
    avatarUrl: null,
    club: 'پدل آرنا ولنجک',
    hand: 'راست دست',
    category: 'IRAN'
  }
];

export const WORLD_PADEL_RANKINGS: RankingPlayer[] = [
  {
    id: 'w-1',
    rank: 1,
    previousRank: 1,
    name: 'آرتورو کوئلو',
    englishName: 'Arturo Coello',
    country: 'اسپانیا',
    countryFlag: '🇪🇸',
    points: 14920,
    tournamentsCount: 22,
    winRate: '۹۲٪',
    avatarUrl: null,
    club: 'Premier Padel Tour',
    hand: 'چپ دست',
    category: 'WORLD'
  },
  {
    id: 'w-2',
    rank: 2,
    previousRank: 2,
    name: 'آگوستین تاپیا',
    englishName: 'Agustín Tapia',
    country: 'آرژانتین',
    countryFlag: '🇦🇷',
    points: 14850,
    tournamentsCount: 22,
    winRate: '۹۱٪',
    avatarUrl: null,
    club: 'Premier Padel Tour',
    hand: 'راست دست',
    category: 'WORLD'
  },
  {
    id: 'w-3',
    rank: 3,
    previousRank: 3,
    name: 'آلخاندرو گالان',
    englishName: 'Alejandro Galán',
    country: 'اسپانیا',
    countryFlag: '🇪🇸',
    points: 12400,
    tournamentsCount: 21,
    winRate: '۸۸٪',
    avatarUrl: null,
    club: 'Premier Padel Tour',
    hand: 'راست دست',
    category: 'WORLD'
  },
  {
    id: 'w-4',
    rank: 4,
    previousRank: 4,
    name: 'فدریکو چینگوتو',
    englishName: 'Federico Chingotto',
    country: 'آرژانتین',
    countryFlag: '🇦🇷',
    points: 11950,
    tournamentsCount: 21,
    winRate: '۸۶٪',
    avatarUrl: null,
    club: 'Premier Padel Tour',
    hand: 'راست دست',
    category: 'WORLD'
  },
  {
    id: 'w-5',
    rank: 5,
    previousRank: 5,
    name: 'خوان لبرون',
    englishName: 'Juan Lebrón',
    country: 'اسپانیا',
    countryFlag: '🇪🇸',
    points: 9840,
    tournamentsCount: 20,
    winRate: '۸۲٪',
    avatarUrl: null,
    club: 'Premier Padel Tour',
    hand: 'راست دست',
    category: 'WORLD'
  },
  {
    id: 'w-6',
    rank: 6,
    previousRank: 7,
    name: 'فرانکو استوپاچوک',
    englishName: 'Franco Stupaczuk',
    country: 'آرژانتین',
    countryFlag: '🇦🇷',
    points: 8760,
    tournamentsCount: 19,
    winRate: '۸۰٪',
    avatarUrl: null,
    club: 'Premier Padel Tour',
    hand: 'راست دست',
    category: 'WORLD'
  },
  {
    id: 'w-7',
    rank: 7,
    previousRank: 6,
    name: 'مارتین دی ننـو',
    englishName: 'Martín Di Nenno',
    country: 'آرژانتین',
    countryFlag: '🇦🇷',
    points: 8650,
    tournamentsCount: 19,
    winRate: '۷۹٪',
    avatarUrl: null,
    club: 'Premier Padel Tour',
    hand: 'راست دست',
    category: 'WORLD'
  },
  {
    id: 'w-8',
    rank: 8,
    previousRank: 8,
    name: 'پالکیتو ناوارو',
    englishName: 'Paquito Navarro',
    country: 'اسپانیا',
    countryFlag: '🇪🇸',
    points: 7920,
    tournamentsCount: 18,
    winRate: '۷۷٪',
    avatarUrl: null,
    club: 'Premier Padel Tour',
    hand: 'راست دست',
    category: 'WORLD'
  }
];

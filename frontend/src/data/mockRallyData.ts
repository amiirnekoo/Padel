import { CourtClub, Coach, Tournament } from '../types/rally';

export const MOCK_CLUBS: CourtClub[] = [
  {
    "id": "club-viva",
    "name": "باشگاه پدل ویوا (VIVA Padel Club)",
    "sport": "PADEL",
    "city": "تهران",
    "area": "مینی‌سیتی",
    "address": "تهران، منطقه ۱، مینی‌سیتی، بلوار ارتش، مجموعه ورزشی و کلوپ پدل ویوا",
    "courtType": "INDOOR",
    "surface": "کورت سوپر پانورامیک مسقف سازه‌ای با چمن مشکی استاندارد WPT و دیواره شیشه‌ای سکوریت",
    "rating": 4.98,
    "startingPrice": 3500000,
    "latitude": 35.7981,
    "longitude": 51.5032,
    "nearestAvailableSlot": "فردا ۱۷:۰۰ تا ۱۸:۰۰",
    "images": [
      "/images/court_viva.jpg"
    ],
    "amenities": [
      {
        "id": "canopy",
        "label": "سقف سازه‌ای مسقف با تهویه آزاد",
        "iconName": "Shield"
      },
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی مجموعه",
        "iconName": "Car"
      },
      {
        "id": "cafe",
        "label": "کافه رستوران و لانژ استراحت",
        "iconName": "Coffee"
      },
      {
        "id": "shower",
        "label": "رختکن مدرن و دوش آبگرم",
        "iconName": "Bath"
      },
      {
        "id": "lighting",
        "label": "پروژکتورهای قوسی مدرن WPT",
        "iconName": "Sun"
      },
      {
        "id": "racket",
        "label": "اجاره و تست راکت‌های حرفه‌ای",
        "iconName": "Shield"
      }
    ],
    "rules": [
      "کورت دارای سقف محافظ بوده و در تمام شرایط جوی فعال است.",
      "ورود با کفش استاندارد کورت پدل الزامی است.",
      "تعداد حداکثر بازیکنان در زمین دونفره ۴ نفر می‌باشد."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد ۱۰۰٪ وجه امکان‌پذیر است.",
    "slots": [
      {
        "slotId": "viva-1",
        "startTime": "۱۵:۳۰",
        "endTime": "۱۷:۰۰",
        "durationMinutes": 90,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-2",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۳۰",
        "durationMinutes": 90,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-3",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-4",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۳۰",
        "durationMinutes": 90,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-5",
        "startTime": "۲۱:۳۰",
        "endTime": "۲۳:۰۰",
        "durationMinutes": 90,
        "price": 3500000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-lafour",
    "name": "باشگاه پدل لفور (Lafour Club)",
    "sport": "PADEL",
    "city": "تهران",
    "area": "آجودانیه",
    "address": "تهران، منطقه ۱، اقدسیه / آجودانیه، مجموعه پدل و تندرستی لفور",
    "courtType": "OUTDOOR",
    "surface": "کورت سوپر پانورامیک روباز با چمن مونت‌کارلو استاندارد مسابقات جهانی",
    "rating": 4.96,
    "startingPrice": 3000000,
    "latitude": 35.8115,
    "longitude": 51.4889,
    "nearestAvailableSlot": "فردا ۱۸:۰۰ تا ۱۹:۳۰",
    "images": [
      "/images/court_lafour.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی و ولت",
        "iconName": "Car"
      },
      {
        "id": "cafe",
        "label": "کافه رستوران مدرن لفور",
        "iconName": "Coffee"
      },
      {
        "id": "shower",
        "label": "رختکن VIP و دوش اختصاصی",
        "iconName": "Bath"
      },
      {
        "id": "lighting",
        "label": "نورپردازی استاندارد پریمیر پدل",
        "iconName": "Sun"
      },
      {
        "id": "racket",
        "label": "تست و اجاره راکت‌های حرفه‌ای",
        "iconName": "Shield"
      }
    ],
    "rules": [
      "کورت در حال حاضر روباز (Open-Air) می‌باشد.",
      "ورود با کفش استاندارد پدل الزامی است.",
      "تعداد حداکثر بازیکنان در زمین دونفره ۴ نفر می‌باشد."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد ۱۰۰٪ وجه امکان‌پذیر است.",
    "slots": [
      {
        "slotId": "laf-1",
        "startTime": "۱۶:۳۰",
        "endTime": "۱۸:۰۰",
        "durationMinutes": 90,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "laf-2",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "laf-3",
        "startTime": "۱۹:۳۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 90,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "laf-4",
        "startTime": "۲۱:۰۰",
        "endTime": "۲۲:۳۰",
        "durationMinutes": 90,
        "price": 3000000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-enghelab",
    "name": "مجموعه پدل FGB انقلاب (FGB Padel Club)",
    "sport": "PADEL",
    "city": "تهران",
    "area": "باشگاه انقلاب",
    "address": "تهران، خیابان سئول، مجموعه فرهنگی ورزشی انقلاب، نخستین مجموعه پدل ایران (FGB Arena)",
    "courtType": "INDOOR",
    "surface": "کورت‌های آرنا سرپوشیده با چمن آبی استاندارد مسابقات بین‌المللی WPT و دیواره سوپر پانورامیک شیشه سکوریت",
    "rating": 4.98,
    "startingPrice": 2800000,
    "latitude": 35.7772,
    "longitude": 51.4053,
    "nearestAvailableSlot": "فردا ۱۶:۳۰ تا ۱۸:۰۰",
    "images": [
      "/images/court_fgb_enghelab.jpg"
    ],
    "amenities": [
      {
        "id": "canopy",
        "label": "آرنا سرپوشیده اختصاصی با تهویه مطبوع",
        "iconName": "Shield"
      },
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی باشگاه انقلاب",
        "iconName": "Car"
      },
      {
        "id": "shower",
        "label": "رختکن VIP و دوش آبگرم",
        "iconName": "Bath"
      },
      {
        "id": "racket",
        "label": "اجاره و تست راکت‌های مسابقاتی Bullpadel و Babolat",
        "iconName": "Shield"
      },
      {
        "id": "cafe",
        "label": "کافه رستوران ورزشی و بار انرژی",
        "iconName": "Coffee"
      },
      {
        "id": "lighting",
        "label": "سیستم نورپردازی لوکس و استاندارد مسابقات بین‌المللی",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "نخستین و اصیل‌ترین مجموعه کورت‌های پدل ایران (FGB Padel Club).",
      "ورود با کفش اختصاصی کورت پدل الزامی است.",
      "تعداد حداکثر بازیکنان در زمین دونفره ۴ نفر می‌باشد."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل شامل استرداد ۱۰۰٪ وجه است.",
    "slots": [
      {
        "slotId": "eng-1",
        "startTime": "۱۵:۰۰",
        "endTime": "۱۶:۳۰",
        "durationMinutes": 90,
        "price": 2800000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-2",
        "startTime": "۱۶:۳۰",
        "endTime": "۱۸:۰۰",
        "durationMinutes": 90,
        "price": 2800000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-3",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-4",
        "startTime": "۱۹:۳۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 90,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-5",
        "startTime": "۲۱:۰۰",
        "endTime": "۲۲:۳۰",
        "durationMinutes": 90,
        "price": 3000000,
        "status": "AVAILABLE"
      }
    ]
  }
];

export const MOCK_COACHES: Coach[] = [
  {
    id: 'coach-1',
    name: 'کاوه آریا',
    title: 'مربی رسمی سطح ۲ فدراسیون جهانی پدل (FIP)',
    sport: 'PADEL',
    experienceYears: 7,
    certificate: 'مدرک بین‌المللی FIP و عضو سابق تیم ملی تنیس',
    rating: 4.95,
    sessionsCount: 640,
    city: 'تهران',
    clubs: ['مجموعه پدل FGB انقلاب', 'باشگاه پدل لفور'],
    levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    hourlyRate: 950000,
    avatarUrl: '/images/rally_coach.jpg',
    bio: 'تمرکز ویژه بر بازیکنان مبتدی و متوسط جهت آموزش پایه، ضربات دیوار شیشه‌ای (Bandeja و Vibora) و بازی جایگیری اصولی در زمین.',
    bookingType: 'APPROVAL_REQUIRED',
    specialties: ['اصلاح تکنیک والیه', 'بازی با دیواره‌های شیشه‌ای', 'آمادگی مسابقاتی']
  },
  {
    id: 'coach-2',
    name: 'سارا رهنما',
    title: 'مربی تخصصی پدل بانوان و رده‌های پایه',
    sport: 'PADEL',
    experienceYears: 5,
    certificate: 'مدرک ملی مربیگری و کارشناس ارشد فیزیولوژی ورزشی',
    rating: 4.9,
    sessionsCount: 420,
    city: 'تهران',
    clubs: ['مجموعه پدل FGB انقلاب', 'باشگاه پدل ویوا'],
    levels: ['BEGINNER', 'INTERMEDIATE'],
    hourlyRate: 850000,
    avatarUrl: '/images/rally_coach.jpg',
    bio: 'طراحی جلسات با رویکرد ارگونومی، ایجاد آمادگی بدنی هوازی و یادگیری سریع قوانین پدل برای کسانی که نخستین بار راکت به دست می‌گیرند.',
    bookingType: 'INSTANT',
    specialties: ['مبتدیان بدون سابقه قبلی', 'تاکتیک بازی دونفره', 'تقویت سرویس']
  }
];

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 'trn-friday-cup',
    title: 'مسابقات ویکند کاپ رولو پدل (Rulo Weekend Cup - Padel Hills No.28)',
    sport: 'PADEL',
    category: 'OPEN',
    level: 'سطح C (C-Level Men)',
    organizer: 'برند Rulo و مجموعه ورزشی Padel Hills Club',
    isOfficial: true,
    city: 'تهران',
    venueName: 'مجموعه پدل هیلز کلاب (Padel Hills Club)',
    startDate: 'پنج‌شنبه ۲۴ مهر ۱۴۰۵ (15:30)',
    endDate: 'پنج‌شنبه ۲۴ مهر ۱۴۰۵',
    entryFee: 4200000,
    prizePool: 22500000,
    maxTeams: 18,
    registeredTeams: 16,
    status: 'REGISTRATION_OPEN',
    bannerUrl: '/images/tournaments/rulo_weekend_cup_2026.jpg',
    rules: [
      'مسابقات یک‌روزه ویکند کاپ با حمایت رسمی برند Rulo و نظارت رالی در پدل هیلز کلاب.',
      'سطح رقابت: C Level مردان در جدول ۱۸ تیمی با توپ رسمی مسابقات HEAD.',
      'مجموع جوایز ۲۲,۵۰۰,۰۰۰ تومان به همراه پکیج هدایای اختصاصی Rulo برای تیم‌های برتر.'
    ],
    format: 'DOUBLES'
  },
  {
    id: 'trn-king-of-court',
    title: 'مسابقات پادشاه زمین (King of the Court Challenge)',
    sport: 'PADEL',
    category: 'OPEN',
    level: 'سطح رقابتی و سرعتی (King of the Court)',
    organizer: 'پدل آرنا و تیم داوری رالی با حمایت رسمی',
    isOfficial: true,
    city: 'تهران',
    venueName: 'مجموعه پدل FGB انقلاب (FGB Arena)',
    startDate: 'جمعه ۲ آبان ۱۴۰۵',
    endDate: 'جمعه ۲ آبان ۱۴۰۵',
    entryFee: 1500000,
    prizePool: 45000000,
    maxTeams: 12,
    registeredTeams: 11,
    status: 'REGISTRATION_OPEN',
    bannerUrl: '/images/tournaments/king_of_court_2026.jpg',
    rules: [
      'فرمت رسمی و مهیج King of the Court: تیم برنده در زمین پادشاه مانده و چلنجرها پیوسته تعویض می‌شوند.',
      'تایم مسابقه بدون وقفه و امتیازات بر اساس رالی‌های موفق کسب‌شده در زمین کینگ است.',
      'اعطای کاپ نمادین پادشاه زمین به همراه جوایز نقدی ۴۵ میلیون تومانی رالی.'
    ],
    format: 'DOUBLES'
  },
  {
    id: 'trn-padel-league',
    title: 'MEL & MOJ PADEL LEAGUE - TEHRAN 2026',
    sport: 'PADEL',
    category: 'OPEN',
    level: 'Level 1 - Professional (Tehran Padel Committee)',
    organizer: 'Tehran Padel Committee & Lafour Club',
    isOfficial: true,
    city: 'تهران',
    venueName: 'Lafour Padel Club, Tehran',
    startDate: 'September - November 2026',
    endDate: 'December 2026',
    entryFee: 5000000,
    prizePool: 250000000,
    maxTeams: 16,
    registeredTeams: 16,
    status: 'IN_PROGRESS',
    bannerUrl: '/images/tournaments/mel_moj_league_2026.jpg',
    rules: [
      'Official Mel & Moj Padel League supervised by the Tehran Padel Committee.',
      'Premier professional division hosted at Lafour Club padel courts.',
      'Includes official ranking points, live scoring and sponsor awards (Rulo, Stiga, Lafour).'
    ],
    format: 'DOUBLES'
  }
];



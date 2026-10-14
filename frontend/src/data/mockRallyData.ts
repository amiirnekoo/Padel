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
        "startTime": "۱۶:۰۰",
        "endTime": "۱۷:۰۰",
        "durationMinutes": 60,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-2",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۰۰",
        "durationMinutes": 60,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-3",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۰۰",
        "durationMinutes": 60,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-4",
        "startTime": "۱۹:۰۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 60,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-5",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 60,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-6",
        "startTime": "۲۱:۰۰",
        "endTime": "۲۲:۰۰",
        "durationMinutes": 60,
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
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۰۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "laf-2",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۰۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "laf-3",
        "startTime": "۱۹:۰۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "laf-4",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "laf-5",
        "startTime": "۲۱:۰۰",
        "endTime": "۲۲:۰۰",
        "durationMinutes": 60,
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
        "startTime": "۱۶:۰۰",
        "endTime": "۱۷:۰۰",
        "durationMinutes": 60,
        "price": 2800000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-2",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۰۰",
        "durationMinutes": 60,
        "price": 2800000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-3",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۰۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-4",
        "startTime": "۱۹:۰۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-5",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-6",
        "startTime": "۲۱:۰۰",
        "endTime": "۲۲:۰۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "court-namakabrood",
    "name": "کلوپ پدل ساحلی نمک‌آبرود",
    "sport": "PADEL",
    "city": "مازندران",
    "area": "چالوس / نمک‌آبرود",
    "address": "مازندران، چالوس، شهرک توریستی نمک‌آبرود، کورت‌های اختصاصی ساحلی",
    "courtType": "OUTDOOR",
    "surface": "کورت سوپر پانورامیک روباز ساحلی با چمن تخصصی مقاوم به رطوبت و نمک",
    "rating": 4.90,
    "startingPrice": 3000000,
    "latitude": 36.6710,
    "longitude": 51.3020,
    "nearestAvailableSlot": "امروز ۱۷:۰۰ تا ۱۸:۰۰",
    "images": ["/images/court_lafour.jpg"],
    "amenities": [
      { "id": "parking", "label": "پارکینگ اختصاصی شهرک", "iconName": "Car" },
      { "id": "cafe", "label": "کافه ساحلی نمک‌آبرود", "iconName": "Coffee" },
      { "id": "shower", "label": "رختکن و دوش آبگرم", "iconName": "Bath" },
      { "id": "lighting", "label": "پروژکتورهای هوایی دید در شب", "iconName": "Sun" }
    ],
    "rules": [
      "کورت در محوطه خوش آب‌وهوای ساحلی نمک‌آبرود واقع شده است.",
      "ورود با کفش استاندارد پدل الزامی است."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد ۱۰۰٪ وجه امکان‌پذیر است.",
    "slots": [
      { "slotId": "namak-1", "startTime": "۱۷:۰۰", "endTime": "۱۸:۰۰", "durationMinutes": 60, "price": 3000000, "status": "AVAILABLE" },
      { "slotId": "namak-2", "startTime": "۱۸:۰۰", "endTime": "۱۹:۰۰", "durationMinutes": 60, "price": 3000000, "status": "AVAILABLE" }
    ]
  },
  {
    "id": "court-babolsar",
    "name": "آکادمی پدل دریاکنار بابلسر",
    "sport": "PADEL",
    "city": "مازندران",
    "area": "بابلسر / دریاکنار",
    "address": "مازندران، بابلسر، شهرک دریاکنار، مجموعه ورزشی ساحل پدل",
    "courtType": "OUTDOOR",
    "surface": "کورت استاندارد روباز دریاکنار با چشم‌انداز ساحل دریای کاسپین",
    "rating": 4.88,
    "startingPrice": 2800000,
    "latitude": 36.7080,
    "longitude": 52.6120,
    "nearestAvailableSlot": "امروز ۱۸:۰۰ تا ۱۹:۰۰",
    "images": ["/images/court_viva.jpg"],
    "amenities": [
      { "id": "parking", "label": "پارکینگ اختصاصی شهرک دریاکنار", "iconName": "Car" },
      { "id": "cafe", "label": "لانژ استراحت و نوشیدنی", "iconName": "Coffee" },
      { "id": "shower", "label": "رختکن و دوش اختصاصی", "iconName": "Bath" },
      { "id": "lighting", "label": "نورپردازی استاندارد", "iconName": "Sun" }
    ],
    "rules": ["ورود به شهرک با هماهنگی رزرو رالی انجام می‌پذیرد."],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد کامل وجه امکان‌پذیر است.",
    "slots": [
      { "slotId": "bbl-1", "startTime": "۱۸:۰۰", "endTime": "۱۹:۰۰", "durationMinutes": 60, "price": 2800000, "status": "AVAILABLE" }
    ]
  },
  {
    "id": "court-mashhad-sajjad",
    "name": "مجموعه پدل سجاد مشهد",
    "sport": "PADEL",
    "city": "مشهد",
    "area": "بلوار سجاد",
    "address": "مشهد، بلوار سجاد، خیابان بهار، مجموعه ورزشی اختصاصی پدل سجاد",
    "courtType": "INDOOR",
    "surface": "کورت مسقف مدرن با سازه استاندارد و چمن آبی رنگ مسابقاتی",
    "rating": 4.89,
    "startingPrice": 2600000,
    "latitude": 36.3210,
    "longitude": 59.5480,
    "nearestAvailableSlot": "امروز ۱۸:۰۰ تا ۱۹:۰۰",
    "images": ["/images/court_viva.jpg"],
    "amenities": [
      { "id": "parking", "label": "پارکینگ اختصاصی", "iconName": "Car" },
      { "id": "canopy", "label": "سازه تمام مسقف ۴ فصل", "iconName": "Shield" },
      { "id": "cafe", "label": "کافه رستوران ورزشی", "iconName": "Coffee" },
      { "id": "shower", "label": "رختکن مدرن و دوش آبگرم", "iconName": "Bath" }
    ],
    "rules": ["ورود با کفش تمیز سالنی پدل الزامی است."],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل شامل بازگشت کامل هزینه به کیف پول است.",
    "slots": [
      { "slotId": "msh-1", "startTime": "۱۸:۰۰", "endTime": "۱۹:۰۰", "durationMinutes": 60, "price": 2600000, "status": "AVAILABLE" }
    ]
  },
  {
    "id": "court-isfahan-parvaz",
    "name": "کلوپ پدل پرواز اصفهان",
    "sport": "PADEL",
    "city": "اصفهان",
    "area": "بلوار مشتاق",
    "address": "اصفهان، بلوار مشتاق دوم، مجموعه ورزشی پرواز، کورت‌های اختصاصی پدل",
    "courtType": "OUTDOOR",
    "surface": "کورت پانورامیک در امتداد زاینده‌رود با نورپردازی مسابقاتی",
    "rating": 4.91,
    "startingPrice": 2700000,
    "latitude": 32.6320,
    "longitude": 51.7210,
    "nearestAvailableSlot": "امروز ۱۸:۰۰ تا ۱۹:۰۰",
    "images": ["/images/court_fgb_enghelab.jpg"],
    "amenities": [
      { "id": "parking", "label": "پارکینگ اختصاصی پرواز", "iconName": "Car" },
      { "id": "cafe", "label": "کافه و فضای استراحت", "iconName": "Coffee" },
      { "id": "lighting", "label": "پروژکتورهای دید در شب", "iconName": "Sun" }
    ],
    "rules": ["رعایت اصول ایمنی کورت الزامی است."],
    "cancellationPolicy": "استرداد ۱۰۰٪ وجه تا ۱۲ ساعت قبل از سانس.",
    "slots": [
      { "slotId": "esf-1", "startTime": "۱۸:۰۰", "endTime": "۱۹:۰۰", "durationMinutes": 60, "price": 2700000, "status": "AVAILABLE" }
    ]
  },
  {
    "id": "court-shiraz-chamran",
    "name": "آکادمی پدل چمران شیراز",
    "sport": "PADEL",
    "city": "شیراز",
    "area": "بلوار چمران",
    "address": "شیراز، بلوار شهید چمران، تپه ورزشی چمران، مجتمع پدل آکادمیک",
    "courtType": "OUTDOOR",
    "surface": "کورت‌های تخصصی روباز در ارتفاع تپه ورزشی چمران شیراز",
    "rating": 4.93,
    "startingPrice": 2900000,
    "latitude": 29.6450,
    "longitude": 52.5020,
    "nearestAvailableSlot": "امروز ۱۹:۰۰ تا ۲۰:۰۰",
    "images": ["/images/court_lafour.jpg"],
    "amenities": [
      { "id": "parking", "label": "پارکینگ مجموعه ورزشی چمران", "iconName": "Car" },
      { "id": "cafe", "label": "کافه بار VIP", "iconName": "Coffee" },
      { "id": "shower", "label": "رختکن مجهز", "iconName": "Bath" }
    ],
    "rules": ["استفاده از راکت و توپ استاندارد در زمین الزامی است."],
    "cancellationPolicy": "استرداد ۱۰۰٪ وجه تا ۱۲ ساعت قبل از سانس.",
    "slots": [
      { "slotId": "shz-1", "startTime": "۱۹:۰۰", "endTime": "۲۰:۰۰", "durationMinutes": 60, "price": 2900000, "status": "AVAILABLE" }
    ]
  },
  {
    "id": "court-tabriz-elgoli",
    "name": "کورت پدل ائل‌گلی تبریز",
    "sport": "PADEL",
    "city": "تبریز",
    "area": "ائل‌گلی",
    "address": "تبریز، بلوار ائل‌گلی، مجموعه تفریحی و ورزشی کورت‌های پدل تبریز",
    "courtType": "OUTDOOR",
    "surface": "کورت پانورامیک در محوطه دیدنی ائل‌گلی با چمن استاندارد فدراسیونی",
    "rating": 4.87,
    "startingPrice": 2500000,
    "latitude": 38.0250,
    "longitude": 46.3680,
    "nearestAvailableSlot": "امروز ۱۶:۰۰ تا ۱۷:۰۰",
    "images": ["/images/court_fgb_enghelab.jpg"],
    "amenities": [
      { "id": "parking", "label": "پارکینگ مجموعه ائل‌گلی", "iconName": "Car" },
      { "id": "cafe", "label": "کافه و فضای پذیرایی", "iconName": "Coffee" },
      { "id": "lighting", "label": "نورافکن‌های با کیفیت", "iconName": "Sun" }
    ],
    "rules": ["رعایت کفش ورزشی پدل الزامی است."],
    "cancellationPolicy": "استرداد ۱۰۰٪ وجه تا ۱۲ ساعت قبل از سانس.",
    "slots": [
      { "slotId": "tbz-1", "startTime": "۱۶:۰۰", "endTime": "۱۷:۰۰", "durationMinutes": 60, "price": 2500000, "status": "AVAILABLE" }
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



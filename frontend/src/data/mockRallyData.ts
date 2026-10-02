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
        "endTime": "۱۶:۳۰",
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
        "startTime": "۱۸:۳۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 60,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-4",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 60,
        "price": 3500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "viva-5",
        "startTime": "۲۱:۳۰",
        "endTime": "۲۲:۳۰",
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
    "nearestAvailableSlot": "فردا ۱۸:۰۰ تا ۱۹:۰۰",
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
        "endTime": "۱۷:۳۰",
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
        "startTime": "۱۹:۳۰",
        "endTime": "۲۰:۳۰",
        "durationMinutes": 60,
        "price": 3000000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "laf-4",
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
    "startingPrice": 2400000,
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
        "price": 2400000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-2",
        "startTime": "۱۶:۳۰",
        "endTime": "۱۸:۰۰",
        "durationMinutes": 90,
        "price": 2400000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-3",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 2600000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-4",
        "startTime": "۱۹:۳۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 90,
        "price": 2600000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "eng-5",
        "startTime": "۲۱:۰۰",
        "endTime": "۲۲:۳۰",
        "durationMinutes": 90,
        "price": 2600000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-velenjak",
    "name": "کلوپ پدل بام ولنجک (Velenjak Arena)",
    "sport": "PADEL",
    "city": "تهران",
    "area": "ولنجک / توچال",
    "address": "تهران، انتهای ولنجک، ایستگاه اول توچال، مجموعه پدل پانوراما",
    "courtType": "OUTDOOR",
    "surface": "کورت پانورامیک روباز با دید ۳۶۰ درجه به تهران",
    "rating": 4.85,
    "startingPrice": 2000000,
    "nearestAvailableSlot": "فردا ۱۹:۳۰ تا ۲۱:۰۰",
    "images": [
      "/images/real_padel_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "view",
        "label": "دید پانوراما بام تهران",
        "iconName": "Sun"
      },
      {
        "id": "cafe",
        "label": "رستوران و لانژ اختصاصی",
        "iconName": "Coffee"
      }
    ],
    "rules": [
      "در صورت شرایط جوی نامساعد، سانس بدون کسر هزینه عودت داده می‌شود."
    ],
    "cancellationPolicy": "لغو تا ۲۴ ساعت قبل با استرداد کامل وجه.",
    "slots": [
      {
        "slotId": "vel-1",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۳۰",
        "durationMinutes": 90,
        "price": 2100000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "vel-2",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 2500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "vel-3",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۳۰",
        "durationMinutes": 90,
        "price": 2500000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-esteghlal-tennis",
    "name": "آکادمی بین‌المللی تنیس استقلال تهران",
    "sport": "TENNIS",
    "city": "تهران",
    "area": "پارک‌وی / تجریش",
    "address": "تهران، تقاطع بزرگراه چمران و ولیعصر، جنب هتل استقلال، مجموعه زمین‌های تنیس",
    "courtType": "OUTDOOR",
    "surface": "زمین خاک رس قرمز فرانسوی استاندارد مسابقات (Red Clay Court)",
    "rating": 4.92,
    "startingPrice": 1600000,
    "nearestAvailableSlot": "امروز ۱۷:۰۰ تا ۱۸:۳۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "locker",
        "label": "رختکن مجزا و سونا",
        "iconName": "Bath"
      },
      {
        "id": "proshop",
        "label": "فروشگاه تخصصی تنیس Head",
        "iconName": "ShoppingBag"
      },
      {
        "id": "lighting",
        "label": "پروژکتورهای ۸۰۰ لوکس",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "ورود به زمین خاک فقط با کفش مناسب زیره Clay Court مجاز است."
    ],
    "cancellationPolicy": "لغو تا ۶ ساعت قبل بدون جریمه انجام می‌شود.",
    "slots": [
      {
        "slotId": "est-1",
        "startTime": "۱۵:۳۰",
        "endTime": "۱۷:۰۰",
        "durationMinutes": 90,
        "price": 1600000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "est-2",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۳۰",
        "durationMinutes": 90,
        "price": 1800000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "est-3",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 1800000,
        "status": "BOOKED"
      }
    ]
  },
  {
    "id": "club-shahrak",
    "name": "مرکز تنیس و پدل شهرک غرب",
    "sport": "TENNIS",
    "city": "تهران",
    "area": "شهرک غرب / دادمان",
    "address": "تهران، بلوار دادمان، خیابان هرمزان، باشگاه ورزشی هرمزان",
    "courtType": "OUTDOOR",
    "surface": "زمین تنیس خاک رس قرمز (Clay Court)",
    "rating": 4.75,
    "startingPrice": 1400000,
    "nearestAvailableSlot": "امروز ۲۰:۰۰ تا ۲۱:۳۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "lighting",
        "label": "سیستم روشنایی LED شبانه",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "کفش عاج‌دار یا خیابانی به بافت خاک رس آسیب می‌زند و ممنوع است."
    ],
    "cancellationPolicy": "لغو تا ۶ ساعت قبل با استرداد وجه.",
    "slots": [
      {
        "slotId": "sh-1",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 1400000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "sh-2",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۳۰",
        "durationMinutes": 90,
        "price": 1500000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-mashhad-padel",
    "name": "مجموعه ورزشی پدل آکادمی سجاد مشهد",
    "sport": "PADEL",
    "city": "مشهد",
    "area": "بلوار سجاد",
    "address": "مشهد، بلوار سجاد، خیابان بهار، مجموعه کورت‌های پدل سجاد",
    "courtType": "INDOOR",
    "surface": "چمن مصنوعی استاندارد بین‌المللی با دیواره شیشه سکوریت ۱۰ میل",
    "rating": 4.88,
    "startingPrice": 1500000,
    "nearestAvailableSlot": "فردا ۱۶:۳۰ تا ۱۸:۰۰",
    "images": [
      "/images/real_padel_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ سرپوشیده",
        "iconName": "Car"
      },
      {
        "id": "cafe",
        "label": "کافه بار اختصاصی",
        "iconName": "Coffee"
      },
      {
        "id": "racket",
        "label": "تست و رنت راکت NOX و Head",
        "iconName": "Shield"
      }
    ],
    "rules": [
      "استفاده از کفش ورزشی کورت اجباری است."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد کامل وجه.",
    "slots": [
      {
        "slotId": "msh-p1",
        "startTime": "۱۶:۳۰",
        "endTime": "۱۸:۰۰",
        "durationMinutes": 90,
        "price": 1500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "msh-p2",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 1700000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-mashhad-tennis",
    "name": "کلوپ بین‌المللی تنیس خاکی کوهسنگی مشهد",
    "sport": "TENNIS",
    "city": "مشهد",
    "area": "کوهسنگی",
    "address": "مشهد، انتهای خیابان کوهسنگی، مجموعه تنیس آستان قدس",
    "courtType": "OUTDOOR",
    "surface": "زمین خاک رس قرمز استاندارد ITF مسابقات (Red Clay Court)",
    "rating": 4.91,
    "startingPrice": 1300000,
    "nearestAvailableSlot": "امروز ۱۸:۰۰ تا ۱۹:۳۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ وسیع",
        "iconName": "Car"
      },
      {
        "id": "lighting",
        "label": "نور استاندارد مسابقات شبانه",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "ورود با کفش اختصاصی خاک رس اجباری است."
    ],
    "cancellationPolicy": "لغو تا ۸ ساعت قبل بدون جریمه.",
    "slots": [
      {
        "slotId": "msh-t1",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 1300000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "msh-t2",
        "startTime": "۱۹:۳۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 90,
        "price": 1400000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-isfahan-padel",
    "name": "باشگاه پدل ملل اصفهان (Isfahan Padel Club)",
    "sport": "PADEL",
    "city": "اصفهان",
    "area": "مرداویج / شیخ کلینی",
    "address": "اصفهان، مرداویج، انتهای خیابان ملاصدرا، کلوپ پدل ملل",
    "courtType": "OUTDOOR",
    "surface": "کورت پانورامیک روباز با چمن مونت کارلو شنی",
    "rating": 4.86,
    "startingPrice": 1600000,
    "nearestAvailableSlot": "فردا ۱۸:۰۰ تا ۱۹:۳۰",
    "images": [
      "/images/real_padel_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "cafe",
        "label": "کافه شیک ورزشی",
        "iconName": "Coffee"
      }
    ],
    "rules": [
      "رعایت سکوت در مجاورت مناطق مسکونی."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد ۱۰۰٪ وجه.",
    "slots": [
      {
        "slotId": "esf-p1",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 1600000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "esf-p2",
        "startTime": "۱۹:۳۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 90,
        "price": 1750000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-isfahan-tennis",
    "name": "مجموعه تنیس خاکی شهدای پرواز اصفهان",
    "sport": "TENNIS",
    "city": "اصفهان",
    "area": "مشتاق دوم",
    "address": "اصفهان، خیابان مشتاق دوم، جنب پارک پرواز، زمین‌های تنیس خاکی",
    "courtType": "OUTDOOR",
    "surface": "زمین خاک رس قرمز دندانه‌دار استاندارد (Clay Court)",
    "rating": 4.89,
    "startingPrice": 1350000,
    "nearestAvailableSlot": "امروز ۱۷:۰۰ تا ۱۸:۳۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "lighting",
        "label": "نورافکن‌های قوی شبانه",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "استفاده از کفش تنیس خاکی الزامی است."
    ],
    "cancellationPolicy": "لغو تا ۶ ساعت قبل بدون کسر وجه.",
    "slots": [
      {
        "slotId": "esf-t1",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۳۰",
        "durationMinutes": 90,
        "price": 1350000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "esf-t2",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 1450000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-shiraz-padel",
    "name": "آکادمی پدل ارم شیراز (Eram Padel Arena)",
    "sport": "PADEL",
    "city": "شیراز",
    "area": "بلوار ارم",
    "address": "شیراز، میدان ارم، بلوار ارم، مجموعه ورزشی دانشگاه شیراز",
    "courtType": "OUTDOOR",
    "surface": "کورت روباز با چمن فیبری آبی رنگ و دید باغ ارم",
    "rating": 4.9,
    "startingPrice": 1550000,
    "nearestAvailableSlot": "فردا ۱۷:۳۰ تا ۱۹:۰۰",
    "images": [
      "/images/real_padel_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "cafe",
        "label": "کافه در فضای سبز",
        "iconName": "Coffee"
      }
    ],
    "rules": [
      "رعایت شئونات ورزشی و پوشش استاندارد."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد کامل.",
    "slots": [
      {
        "slotId": "shz-p1",
        "startTime": "۱۷:۳۰",
        "endTime": "۱۹:۰۰",
        "durationMinutes": 90,
        "price": 1550000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "shz-p2",
        "startTime": "۱۹:۰۰",
        "endTime": "۲۰:۳۰",
        "durationMinutes": 90,
        "price": 1700000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-shiraz-tennis",
    "name": "کلوپ تنیس خاکی چمران شیراز",
    "sport": "TENNIS",
    "city": "شیراز",
    "area": "بلوار چمران",
    "address": "شیراز، بلوار شهید چمران، جنب هتل چمران، زمین‌های خاک رس",
    "courtType": "OUTDOOR",
    "surface": "زمین تنیس خاک رس کوبیده شده استاندارد مسابقات (Clay Court)",
    "rating": 4.87,
    "startingPrice": 1400000,
    "nearestAvailableSlot": "امروز ۱۸:۳۰ تا ۲۰:۰۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "shower",
        "label": "رختکن و دوش اختصاصی",
        "iconName": "Bath"
      }
    ],
    "rules": [
      "کفش تنیس خاک رس جهت جلوگیری از تخریب زمین الزامی است."
    ],
    "cancellationPolicy": "لغو تا ۶ ساعت قبل بدون هزینه.",
    "slots": [
      {
        "slotId": "shz-t1",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 1400000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "shz-t2",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۳۰",
        "durationMinutes": 90,
        "price": 1500000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-sari-padel",
    "name": "مجموعه پدل ساحلی طبرستان ساری",
    "sport": "PADEL",
    "city": "ساری",
    "area": "بلوار طبرستان",
    "address": "ساری، بلوار طبرستان، خیابان دانشجو، مجموعه کورت پدل طبرستان",
    "courtType": "OUTDOOR",
    "surface": "کورت شیشه‌ای روباز با چمن ضد رطوبت شمال",
    "rating": 4.82,
    "startingPrice": 1450000,
    "nearestAvailableSlot": "فردا ۱۸:۰۰ تا ۱۹:۳۰",
    "images": [
      "/images/real_padel_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "cafe",
        "label": "کافه فضای باز جنگلی",
        "iconName": "Coffee"
      }
    ],
    "rules": [
      "در صورت بارندگی شدید، سانس به روز دیگر موکول می‌گردد."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد کامل.",
    "slots": [
      {
        "slotId": "sari-p1",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 1450000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "sari-p2",
        "startTime": "۱۹:۳۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 90,
        "price": 1600000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-sari-tennis",
    "name": "آکادمی تنیس خاکی داراب ساری",
    "sport": "TENNIS",
    "city": "ساری",
    "area": "میدان خزر",
    "address": "ساری، جاده فرح‌آباد، بعد از میدان خزر، مجتمع ورزشی داراب",
    "courtType": "OUTDOOR",
    "surface": "زمین خاک رس قرمز دندانه‌دار محصور در طبیعت شمال (Clay Court)",
    "rating": 4.85,
    "startingPrice": 1250000,
    "nearestAvailableSlot": "امروز ۱۷:۰۰ تا ۱۸:۳۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "lighting",
        "label": "روشنایی قوی شبانه",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "ورود با کفش استاندارد Clay Court."
    ],
    "cancellationPolicy": "لغو تا ۶ ساعت قبل بدون جریمه.",
    "slots": [
      {
        "slotId": "sari-t1",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۳۰",
        "durationMinutes": 90,
        "price": 1250000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "sari-t2",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 1350000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-kish-padel",
    "name": "سنترال کورت پدل المپیک کیش (Kish Olympic Padel)",
    "sport": "PADEL",
    "city": "کیش",
    "area": "میدان المپیک",
    "address": "جزیره کیش، میدان المپیک، دهکده ورزشی المپیک، استادیوم پدل",
    "courtType": "OUTDOOR",
    "surface": "کورت ساحلی WPT با شیشه سوپر کلیر ۱۲ میل و چمن تک‌رشته‌ای آبی",
    "rating": 4.96,
    "startingPrice": 2200000,
    "nearestAvailableSlot": "امروز ۲۱:۰۰ تا ۲۲:۳۰",
    "images": [
      "/images/real_padel_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ رایگان",
        "iconName": "Car"
      },
      {
        "id": "shower",
        "label": "رختکن‌های لوکس با تهویه مطبوع",
        "iconName": "Bath"
      },
      {
        "id": "proshop",
        "label": "پرو شاپ تجهیزات اورجینال",
        "iconName": "ShoppingBag"
      },
      {
        "id": "lighting",
        "label": "روشنایی ویژه مسابقات پخش تلویزیونی",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "بهترین زمان بازی در فصول گرم پس از غروب آفتاب است."
    ],
    "cancellationPolicy": "لغو تا ۲۴ ساعت قبل شامل عودت ۱۰۰٪ وجه است.",
    "slots": [
      {
        "slotId": "kish-p1",
        "startTime": "۱۹:۳۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 90,
        "price": 2200000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "kish-p2",
        "startTime": "۲۱:۰۰",
        "endTime": "۲۲:۳۰",
        "durationMinutes": 90,
        "price": 2400000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-kish-tennis",
    "name": "آکادمی تنیس خاکی مارینا کیش",
    "sport": "TENNIS",
    "city": "کیش",
    "area": "مارینا پارک",
    "address": "جزیره کیش، بلوار مرجان، جنب هتل مارینا پارک، کورت تنیس ساحلی",
    "courtType": "OUTDOOR",
    "surface": "زمین تنیس خاک رس روباز با چشم‌انداز خلیج فارس (Clay Court)",
    "rating": 4.92,
    "startingPrice": 1800000,
    "nearestAvailableSlot": "امروز ۲۰:۰۰ تا ۲۱:۳۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ هتل",
        "iconName": "Car"
      },
      {
        "id": "view",
        "label": "منظره دید به دریا",
        "iconName": "Sun"
      },
      {
        "id": "cafe",
        "label": "کافه لانژ مارینا",
        "iconName": "Coffee"
      }
    ],
    "rules": [
      "کفش مخصوص خاک رس الزامی است."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل بدون هزینه.",
    "slots": [
      {
        "slotId": "kish-t1",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 1800000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "kish-t2",
        "startTime": "۲۰:۰۰",
        "endTime": "۲۱:۳۰",
        "durationMinutes": 90,
        "price": 2000000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-tabriz-padel",
    "name": "باشگاه پدل ائل‌گلی تبریز (El Goli Padel)",
    "sport": "PADEL",
    "city": "تبریز",
    "area": "ائل‌گلی",
    "address": "تبریز، جاده ائل‌گلی، مجموعه تفریحی ورزشی ائل‌گلی",
    "courtType": "INDOOR",
    "surface": "کورت سرپوشیده با سیستم گرمایش هوشمند زمستانی و چمن Mondo",
    "rating": 4.88,
    "startingPrice": 1500000,
    "nearestAvailableSlot": "فردا ۱۷:۰۰ تا ۱۸:۳۰",
    "images": [
      "/images/real_padel_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "shower",
        "label": "رختکن گرم و آبگرم دائم",
        "iconName": "Bath"
      }
    ],
    "rules": [
      "ورود به سالن با کفش تمیز کورت."
    ],
    "cancellationPolicy": "لغو تا ۱۲ ساعت قبل با استرداد وجه کامل.",
    "slots": [
      {
        "slotId": "tbz-p1",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۳۰",
        "durationMinutes": 90,
        "price": 1500000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "tbz-p2",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 1650000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-tabriz-tennis",
    "name": "کلوپ تنیس خاکی یادگار تبریز",
    "sport": "TENNIS",
    "city": "تبریز",
    "area": "استادیوم یادگار امام",
    "address": "تبریز، اتوبان شهید کسایی، دهکده ورزشی یادگار امام، کورت‌های تنیس",
    "courtType": "OUTDOOR",
    "surface": "زمین خاک رس قرمز استاندارد با هوای خنک کوهستانی (Clay Court)",
    "rating": 4.84,
    "startingPrice": 1300000,
    "nearestAvailableSlot": "امروز ۱۶:۳۰ تا ۱۸:۰۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ بزرگ",
        "iconName": "Car"
      },
      {
        "id": "lighting",
        "label": "روشنایی استانداردی مسابقات",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "کفش عاج‌دار مجاز نیست؛ فقط کفش زیره صاف شیاردار Clay."
    ],
    "cancellationPolicy": "لغو تا ۶ ساعت قبل بدون جریمه.",
    "slots": [
      {
        "slotId": "tbz-t1",
        "startTime": "۱۶:۳۰",
        "endTime": "۱۸:۰۰",
        "durationMinutes": 90,
        "price": 1300000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "tbz-t2",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 1400000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-nowshahr-padel",
    "name": "کلوپ پدل ساحلی چلک نوشهر (Chelak Padel)",
    "sport": "PADEL",
    "city": "نوشهر",
    "area": "ساحل چلک",
    "address": "مازندران، جاده ساحلی نوشهر به رویان، منطقه توریستی چلک، کلوپ پدل ساحلی",
    "courtType": "OUTDOOR",
    "surface": "کورت روباز با نسیم ملایم دریا و شیشه‌های ضد باد سکوریت",
    "rating": 4.93,
    "startingPrice": 1700000,
    "nearestAvailableSlot": "فردا ۱۸:۰۰ تا ۱۹:۳۰",
    "images": [
      "/images/real_padel_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "cafe",
        "label": "کافه بارهای ساحلی",
        "iconName": "Coffee"
      },
      {
        "id": "racket",
        "label": "رنت راکت مسابقه‌ای",
        "iconName": "Shield"
      }
    ],
    "rules": [
      "رعایت آرامش و پوشش استاندارد ورزشی ساحلی."
    ],
    "cancellationPolicy": "لغو تا ۲۴ ساعت قبل با استرداد کامل وجه.",
    "slots": [
      {
        "slotId": "now-p1",
        "startTime": "۱۸:۰۰",
        "endTime": "۱۹:۳۰",
        "durationMinutes": 90,
        "price": 1700000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "now-p2",
        "startTime": "۱۹:۳۰",
        "endTime": "۲۱:۰۰",
        "durationMinutes": 90,
        "price": 1900000,
        "status": "AVAILABLE"
      }
    ]
  },
  {
    "id": "club-nowshahr-tennis",
    "name": "مجموعه تنیس خاکی همافران نوشهر",
    "sport": "TENNIS",
    "city": "نوشهر",
    "area": "بلوار همافران",
    "address": "مازندران، نوشهر، بلوار همافران، جنب پارک جنگلی نگین، زمین‌های تنیس خاکی",
    "courtType": "OUTDOOR",
    "surface": "زمین خاک رس قرمز محصور در میان درختان جنگلی و دریا (Clay Court)",
    "rating": 4.88,
    "startingPrice": 1400000,
    "nearestAvailableSlot": "امروز ۱۷:۰۰ تا ۱۸:۳۰",
    "images": [
      "/images/rally_hero.jpg"
    ],
    "amenities": [
      {
        "id": "parking",
        "label": "پارکینگ اختصاصی",
        "iconName": "Car"
      },
      {
        "id": "view",
        "label": "هوای پاک جنگلی ساحلی",
        "iconName": "Sun"
      }
    ],
    "rules": [
      "ورود منحصراً با کفش تنیس خاک رس."
    ],
    "cancellationPolicy": "لغو تا ۶ ساعت قبل بدون جریمه.",
    "slots": [
      {
        "slotId": "now-t1",
        "startTime": "۱۷:۰۰",
        "endTime": "۱۸:۳۰",
        "durationMinutes": 90,
        "price": 1400000,
        "status": "AVAILABLE"
      },
      {
        "slotId": "now-t2",
        "startTime": "۱۸:۳۰",
        "endTime": "۲۰:۰۰",
        "durationMinutes": 90,
        "price": 1500000,
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
    clubs: ['آکادمی انقلاب', 'پدل ولنجک'],
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
    clubs: ['پدل سنترال انقلاب', 'کلوپ دادمان'],
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
    venueName: 'زمین اختصاصی پدل سنترال آرنا',
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



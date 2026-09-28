import { CourtClub, Coach, Tournament } from '../types/rally';

export const MOCK_CLUBS: CourtClub[] = [
  {
    id: 'club-enghelab',
    name: 'مجموعه ورزشی انقلاب - آکادمی پدل',
    sport: 'PADEL',
    city: 'تهران',
    area: 'ونک / خیابان سئول',
    address: 'تهران، خیابان سئول، انتهای خیابان ورزشگاه انقلاب، کورت‌های سنترال پدل',
    courtType: 'INDOOR',
    surface: 'چمن مصنوعی Mondo استاندارد WPT با دیواره شیشه سکوریت',
    rating: 4.9,
    startingPrice: 1800000,
    nearestAvailableSlot: 'فردا ۱۸:۰۰ تا ۱۹:۳۰',
    images: [
      '/images/rally_hero.jpg',
      '/images/rally_tournament.jpg'
    ],
    amenities: [
      { id: 'parking', label: 'پارکینگ اختصاصی', iconName: 'Car' },
      { id: 'shower', label: 'رختکن و دوش آبگرم', iconName: 'Bath' },
      { id: 'racket', label: 'اجاره و تست راکت پدل', iconName: 'Shield' },
      { id: 'cafe', label: 'کافه ورزشی و بار انرژی', iconName: 'Coffee' },
      { id: 'lighting', label: 'نورپردازی استاندارد فدراسیون جهانی', iconName: 'Sun' },
      { id: 'proshop', label: 'فروشگاه تخصصی پدل', iconName: 'ShoppingBag' }
    ],
    rules: [
      'حضور در کورت با کفش مخصوص کورت اجباری است (استفاده از کفش خیابانی ممنوع است).',
      'تعداد حداکثر بازیکنان در زمین دونفره ۴ نفر می‌باشد.',
      'رعایت سکوت و اخلاق ورزشی در هنگام بازی الزامی است.'
    ],
    cancellationPolicy: 'لغو تا ۱۲ ساعت قبل از شروع سانس شامل استرداد ۱۰۰٪ وجه است. بین ۶ تا ۱۲ ساعت با کسر ۲۰٪ کارمزد باشگاه و کمتر از ۶ ساعت غیرقابل استرداد می‌باشد.',
    slots: [
      { slotId: 'eng-1', startTime: '۰۸:۰۰', endTime: '۰۹:۳۰', durationMinutes: 90, price: 1600000, status: 'AVAILABLE' },
      { slotId: 'eng-2', startTime: '۰۹:۳۰', endTime: '۱۱:۰۰', durationMinutes: 90, price: 1600000, status: 'BOOKED' },
      { slotId: 'eng-3', startTime: '۱۱:۰۰', endTime: '۱۲:۳۰', durationMinutes: 90, price: 1800000, status: 'AVAILABLE' },
      { slotId: 'eng-4', startTime: '۱۶:۳۰', endTime: '۱۸:۰۰', durationMinutes: 90, price: 2200000, status: 'BOOKED' },
      { slotId: 'eng-5', startTime: '۱۸:۰۰', endTime: '۱۹:۳۰', durationMinutes: 90, price: 2400000, status: 'AVAILABLE' },
      { slotId: 'eng-6', startTime: '۱۹:۳۰', endTime: '۲۱:۰۰', durationMinutes: 90, price: 2400000, status: 'AVAILABLE' },
      { slotId: 'eng-7', startTime: '۲۱:۰۰', endTime: '۲۲:۳۰', durationMinutes: 90, price: 2200000, status: 'HOLD' }
    ]
  },
  {
    id: 'club-velenjak',
    name: 'کلوپ پدل بام ولنجک (Velenjak Arena)',
    sport: 'PADEL',
    city: 'تهران',
    area: 'ولنجک / توچال',
    address: 'تهران، انتهای ولنجک، ایستگاه اول توچال، مجموعه پدل پانوراما',
    courtType: 'OUTDOOR',
    surface: 'کورت پانورامیک روباز با دید ۳۶۰ درجه به تهران',
    rating: 4.8,
    startingPrice: 2000000,
    nearestAvailableSlot: 'فردا ۱۹:۳۰ تا ۲۱:۰۰',
    images: [
      '/images/rally_hero.jpg'
    ],
    amenities: [
      { id: 'parking', label: 'پارکینگ اختصاصی', iconName: 'Car' },
      { id: 'view', label: 'دید پانوراما بام تهران', iconName: 'Sun' },
      { id: 'cafe', label: 'رستوران و لانژ اختصاصی', iconName: 'Coffee' },
      { id: 'racket', label: 'اجاره راکت Bullpadel و Babolat', iconName: 'Shield' }
    ],
    rules: [
      'در صورت شرایط جوی نامساعد (بارش شدید یا طوفان)، سانس بدون کسر هزینه جابه‌جا یا عودت می‌گردد.'
    ],
    cancellationPolicy: 'لغو تا ۲۴ ساعت قبل با استرداد کامل؛ کمتر از ۱۲ ساعت غیرقابل استرداد.',
    slots: [
      { slotId: 'vel-1', startTime: '۱۷:۰۰', endTime: '۱۸:۳۰', durationMinutes: 90, price: 2100000, status: 'AVAILABLE' },
      { slotId: 'vel-2', startTime: '۱۸:۳۰', endTime: '۲۰:۰۰', durationMinutes: 90, price: 2500000, status: 'BOOKED' },
      { slotId: 'vel-3', startTime: '۲۰:۰۰', endTime: '۲۱:۳۰', durationMinutes: 90, price: 2500000, status: 'AVAILABLE' }
    ]
  },
  {
    id: 'club-shahrak',
    name: 'مرکز تنیس و پدل شهرک غرب',
    sport: 'TENNIS',
    city: 'تهران',
    area: 'شهرک غرب / دادمان',
    address: 'تهران، بلوار دادمان، خیابان هرمزان، باشگاه ورزشی هرمزان',
    courtType: 'OUTDOOR',
    surface: 'زمین خاک رس فرانسوی (Clay Court)',
    rating: 4.7,
    startingPrice: 1400000,
    nearestAvailableSlot: 'امروز ۲۰:۰۰ تا ۲۱:۳۰',
    images: [
      '/images/rally_hero.jpg'
    ],
    amenities: [
      { id: 'parking', label: 'پارکینگ اختصاصی', iconName: 'Car' },
      { id: 'locker', label: 'رختکن مجزا VIP', iconName: 'Bath' },
      { id: 'lighting', label: 'سیستم پروژکتور LED شبانه', iconName: 'Sun' }
    ],
    rules: [
      'ورود به زمین خاک فقط با کفش مناسب Clay Court مجاز است.'
    ],
    cancellationPolicy: 'لغو تا ۶ ساعت قبل بدون جریمه.',
    slots: [
      { slotId: 'sh-1', startTime: '۱۸:۳۰', endTime: '۲۰:۰۰', durationMinutes: 90, price: 1400000, status: 'AVAILABLE' },
      { slotId: 'sh-2', startTime: '۲۰:۰۰', endTime: '۲۱:۳۰', durationMinutes: 90, price: 1500000, status: 'AVAILABLE' }
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
    id: 'trn-rally-cup-1',
    title: 'جام پاییزی پدل رالی (Rally Autumn Master 1000)',
    sport: 'PADEL',
    category: 'OPEN',
    level: 'سطح ۳ و آزاد (متوسط به بالا)',
    organizer: 'باشگاه انقلاب با نظارت رسمی انجمن پدل',
    isOfficial: true,
    city: 'تهران',
    venueName: 'کورت سنترال انقلاب',
    startDate: '۱۵ مهر ۱۴۰۵',
    endDate: '۱۸ مهر ۱۴۰۵',
    entryFee: 1800000,
    prizePool: 60000000,
    maxTeams: 16,
    registeredTeams: 12,
    status: 'REGISTRATION_OPEN',
    bannerUrl: '/images/rally_tournament.jpg',
    rules: [
      'مسابقات بر اساس جدول تک‌حذفی و سیستم رالی پوینت استاندارد FIP برگزار می‌شود.',
      'هر تیم شامل ۲ بازیکن است. راکت‌ها باید دارای بند مچ ایمن باشند.',
      'توپ رسمی مسابقات Head Padel Pro S می‌باشد.'
    ],
    format: 'DOUBLES'
  },
  {
    id: 'trn-rally-amateur',
    title: 'تورنمنت آخر هفته تازه‌واردان پدل (Rally Starter Series)',
    sport: 'PADEL',
    category: 'MIXED',
    level: 'مبتدی و نیمه‌متوسط (مناسب بازیکنان کمتر از ۱ سال سابقه)',
    organizer: 'آکادمی رالی پدل',
    isOfficial: true,
    city: 'تهران',
    venueName: 'پدل آرنا ولنجک',
    startDate: '۲۴ مهر ۱۴۰۵',
    endDate: '۲۵ مهر ۱۴۰۵',
    entryFee: 950000,
    prizePool: 25000000,
    maxTeams: 12,
    registeredTeams: 8,
    status: 'REGISTRATION_OPEN',
    bannerUrl: '/images/rally_tournament.jpg',
    rules: [
      'مناسب کسب تجربه مسابقاتی بدون فشار روانی.',
      'جوایز شامل تجهیزات تخصصی پدل Bullpadel و بن اختصاصی رالی.'
    ],
    format: 'DOUBLES'
  }
];

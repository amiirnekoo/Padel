export interface ClubTechnicalSpec {
  glassType: string;
  turfType: string;
  lightingType: string;
  courtDimensions: string;
  structureType: string;
  ceilingHeight?: string;
}

export interface ClubRichProfile {
  id: string;
  slug: string;
  headline: string;
  descriptionFa: string;
  galleryImages: string[];
  specs: ClubTechnicalSpec;
  accessGuide: string;
  parkingInfo: string;
  coaches: Array<{
    name: string;
    role: string;
    phone?: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const CLUBS_RICH_PROFILES: Record<string, ClubRichProfile> = {
  'club-viva': {
    id: 'club-viva',
    slug: 'viva',
    headline: 'مجموعه سوپر پانورامیک مسقف ویوا | استاندارد بین‌المللی WPT در شمال‌شرق تهران',
    descriptionFa:
      'باشگاه پدل ویوا (VIVA Padel Club) یکی از مدرن‌ترین و مجهزترین کلوپ‌های ورزشی پدل در شمال‌شرق تهران (منطقه مینی‌سیتی و بلوار ارتش) است. این مجموعه با تکیه بر معماری سازه‌ای مسقف با تهویه آزاد کوهپایه‌ای، کورت‌های سوپر پانورامیک بدون ستون مزاحم، چمن مشکی مسابقاتی WPT و شیشه‌های سکوریت ضخیم ۱۲ میل، محیطی فوق‌حرفه‌ای و در عین حال مفرح برای بازیکنان مبتدی تا ملی‌پوشان فراهم آورده است.',
    galleryImages: [
      '/images/court_viva.jpg',
      '/images/real_padel_hero.jpg',
      '/images/rackets/hero_racket_bullpadel.png'
    ],
    specs: {
      structureType: 'سازه مسقف قوسی استاندارد با پوشش عایق UV و فعال در تمام ۴ فصل',
      glassType: 'شیشه سکوریت ۱۲ میلی‌متری سوپر پانورامیک بدون ستون میانی دید',
      turfType: 'چمن مصنوعی مشکی مونوپرو با بافت متراکم و سیلیکاژل استاندارد WPT',
      lightingType: '۸ پروژکتور قوسی LED بدون سایه با توان نوری ۱۲۰۰ لوکس',
      courtDimensions: 'کورت دوبل استاندارد جهانی (۲۰ × ۱۰ متر)',
      ceilingHeight: 'ارتفاع آزاد سقف ۱۰.۵ متر در نقطه اوج'
    },
    accessGuide: 'تهران، منطقه ۱، مینی‌سیتی، بلوار ارتش، ورودی مجموعه ورزشی و کلوپ پدل ویوا (دسترسی سریع از بزرگراه امام علی و ارتش).',
    parkingInfo: 'دارای پارکینگ اختصاصی رایگان با ظرفیت ۵۰ خودرو و نگهبانی ۲۴ ساعته ویژه بازیکنان رالی.',
    coaches: [
      { name: 'کاوه آریا', role: 'مربی رسمی FIP و بازیکن سابق تیم ملی', phone: '۰۲۱-۲۲۰۵۰۰۰۰' },
      { name: 'سارا رهنما', role: 'مربی تخصصی پدل بانوان و رده‌های پایه', phone: '۰۲۱-۲۲۰۵۰۰۰۰' }
    ],
    faqs: [
      {
        question: 'آیا در روزهای بارانی یا برفی بازی در ویوا امکان‌پذیر است؟',
        answer: 'بله، کورت‌های ویوا دارای سقف سازه‌ای دائمی مقاوم در برابر باران و برف بوده و در تمامی فصول سال فعال هستند.'
      },
      {
        question: 'آیا امکان اجاره یا تست راکت در محل باشگاه وجود دارد؟',
        answer: 'بله، کلوپ ویوا مجهز به غرفه تست راکت‌های رسمی نایترو، نوکس و بول‌پدل برای بازیکنان است.'
      },
      {
        question: 'قوانین لغو سانس و استرداد وجه چگونه است؟',
        answer: 'لغو سانس تا ۱۲ ساعت قبل از شروع بازی با استرداد ۱۰۰٪ وجه به کیف پول رالی امکان‌پذیر است.'
      }
    ]
  },
  'club-lafour': {
    id: 'club-lafour',
    slug: 'lafour',
    headline: 'کلوپ پدل سوپر پانورامیک لفور | تجربه بازی در هوای آزاد کوهپایه‌ای آجودانیه',
    descriptionFa:
      'باشگاه پدل لفور (Lafour Padel Club) در منطقه خوش آب‌وهوای اقدسیه و آجودانیه تهران، یکی از معتبرترین پایگاه‌های پدل روباز (Open-Air) کشور است. محصور بودن کورت در فضای سرسبز باغ، چمن مونت‌کارلو استاندارد مسابقات تور جهانی و کافه لانژ VIP، فضایی باکلاس و سرشار از آرامش را برای بازیکنان رقم زده است.',
    galleryImages: [
      '/images/court_lafour.jpg',
      '/images/real_padel_hero.jpg'
    ],
    specs: {
      structureType: 'کورت سوپر پانورامیک روباز (Open-Air) در محوطه کوهپایه‌ای',
      glassType: 'شیشه‌های سکوریت نشکن ۲ لایه با مقاومت در برابر فشار باد',
      turfType: 'چمن مونت‌کارلو پریمیر پدل با بافت ارگونومیک و جهش یکنواخت توپ',
      lightingType: 'سیستم نورافکن‌های افقی استاندارد با دمای رنگ ۵۵۰۰ کلوین',
      courtDimensions: 'کورت دوبل استاندارد جهانی (۲۰ × ۱۰ متر)',
      ceilingHeight: 'فضای باز بدون سقف (Open Sky)'
    },
    accessGuide: 'تهران، منطقه ۱، خیابان آجودانیه (سباری)، انتهای کوچه دهم غربی، کلوپ پدل و تندرستی لفور.',
    parkingInfo: 'پارکینگ اختصاصی کلوپ و سرویس پارک‌بان ویژه مراجعین رالی.',
    coaches: [
      { name: 'کاوه آریا', role: 'مربی رسمی FIP و سرپرست آکادمی لفور' }
    ],
    faqs: [
      {
        question: 'در صورت شرایط نامساعد جوی تکلیف سانس چه می‌شود؟',
        answer: 'در کورت روباز لفور، در صورت بارندگی یا باد شدید، سانس بدون کسر هزینه جابجا شده یا وجه به کیف پول مسترد می‌شود.'
      },
      {
        question: 'آیا رختکن و دوش آبگرم در باشگاه فعال است؟',
        answer: 'بله، رختکن لوکس، کمدهای دیجیتال و دوش آبگرم اختصاصی به صورت کامل در دسترس است.'
      }
    ]
  },
  'club-enghelab': {
    id: 'club-enghelab',
    slug: 'enghelab',
    headline: 'نخستین و اصیل‌ترین پایگاه پدل ایران | FGB Padel Arena در مجموعه ورزشی انقلاب',
    descriptionFa:
      'مجموعه FGB Padel Club در مجموعه فرهنگی ورزشی انقلاب، کهنه‌کارترین و نام‌آشناترین مرکز پدل در ایران است. این مجموعه با زمین‌های سرپوشیده آرنا، چمن آبی اختصاصی World Padel Tour و اتمسفر پرانرژی و قهرمان‌پرور، همواره کانون اصلی برگزاری لیگ‌ها، مسابقات رسمی و تمرینات تیم‌های ملی بوده است.',
    galleryImages: [
      '/images/court_fgb_enghelab.jpg',
      '/images/real_padel_hero.jpg'
    ],
    specs: {
      structureType: 'آرنا سرپوشیده اختصاصی با سقف بلند و سیستم تهویه مطبوع هوا',
      glassType: 'شیشه سکوریت ضدشوک با لبه‌های فاز لیزری',
      turfType: 'چمن آبی مسابقاتی WPT با الیاف مقاوم در برابر سایش',
      lightingType: 'پروژکتورهای خطی استاندارد تلویزیونی با شاخص CRI بالای ۹۰',
      courtDimensions: 'کورت دوبل استاندارد جهانی (۲۰ × ۱۰ متر)',
      ceilingHeight: 'ارتفاع سقف ۱۰ متر'
    },
    accessGuide: 'تهران، خیابان سئول، اتوبان نیایش، مجموعه فرهنگی ورزشی انقلاب، جاده تندرستی، کلوپ پدل FGB.',
    parkingInfo: 'پارکینگ‌های متعدد شمالی و جنوبی مجموعه ورزشی انقلاب.',
    coaches: [
      { name: 'کاوه آریا', role: 'مربی سطح ۲ بین‌المللی' },
      { name: 'سارا رهنما', role: 'مربی تخصصی بانوان' }
    ],
    faqs: [
      {
        question: 'آیا برای ورود به باشگاه نیاز به کارت عضویت باشگاه انقلاب است؟',
        answer: 'با داشتن رزرو قطعی در رالی، پیامک تأیید رزرو به منزله مجوز ورود شما به مجموعه خواهد بود.'
      },
      {
        question: 'آیا راکت و توپ در محل در اختیار قرار می‌گیرد؟',
        answer: 'بله، امکان اجاره راکت‌های تست برند بول‌پدل و خرید توپ نو مسابقاتی در پذیرش فراهم است.'
      }
    ]
  }
};

export function getClubRichProfile(clubId: string): ClubRichProfile | null {
  const normalized = clubId.toLowerCase();
  return (
    CLUBS_RICH_PROFILES[normalized] ||
    CLUBS_RICH_PROFILES[`club-${normalized}`] ||
    CLUBS_RICH_PROFILES[normalized.replace('club-', '')] ||
    null
  );
}

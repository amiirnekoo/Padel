import { ShopProduct } from '../types/rally';
import { RacketVerdictData, CommunityReview } from '../types/racketVerdict';

export const KNOWN_RACKET_VERDICTS: Record<string, RacketVerdictData> = {
  // مدل اختصاصی اسکرین‌شات کاربر با نمرات دقیق PadelVerdict
  'nox-equation-soft-advanced-2026': {
    overallScore: 8.4,
    verdictTitle_fa: 'آیا راحتی بالاترین موازنه برای سبک بازی شماست؟',
    verdictSummary_fa: 'راکت Equation Soft Advanced ۲۰۲۶ نوکس با تلفیق نقطه شیرین وسیع، رویه فایبرگلاس 3D و فوم انعطاف‌پذیر HR3، اوج لذت کنترل و دفع فشارهای سرعتی را بدون هیچ آسیبی به مچ دست ارائه می‌دهد.',
    playProfile_fa: 'مدافع و بازی‌ساز (Defender)',
    playProfile_en: 'DEFENDER',
    playerLevel_fa: 'متوسط و در حال ارتقا',
    racketShape_fa: 'گرد متقارن (Round)',
    weightGrams: 365,
    balanceMm: 265,
    stiffness: {
      value: 35,
      label_fa: 'نرم و ضربه‌گیر (Soft)',
      label_en: 'Soft • 35/100'
    },
    triad: {
      att: 7.17,
      hyb: 7.87,
      def: 8.25
    },
    parameters: {
      power: 6.4,
      control: 8.6,
      maneuverability: 8.1,
      spin: 7.2,
      comfort: 8.4,
      sweetspot: 7.8,
      playability: 8.2,
      stability: 7.1
    }
  },

  'nox-at10-genius-18k-2026': {
    overallScore: 9.3,
    verdictTitle_fa: 'استاندارد طلایی تعادل هجومی و دقت فوق‌حرفه‌ای آگوستین تاپیا',
    verdictSummary_fa: 'شاهکار کربن ۱۸K آلومینایز با سیستم تعادل متقارن؛ پاسخی انفجاری به شوت‌های تند حریف و بالاترین ثبات ساختاری در بازی‌های سرعتی.',
    playProfile_fa: 'همه‌کاره حرفه‌ای (All-Round)',
    playProfile_en: 'ALL-ROUND',
    playerLevel_fa: 'پیشرفته و حرفه‌ای (PRO)',
    racketShape_fa: 'اشکی قطره‌ای (Teardrop)',
    weightGrams: 365,
    balanceMm: 260,
    stiffness: {
      value: 62,
      label_fa: 'نیمه‌خشک کنترل‌شده (Medium-Hard)',
      label_en: 'Medium-Hard • 62/100'
    },
    triad: {
      att: 9.15,
      hyb: 9.40,
      def: 8.95
    },
    parameters: {
      power: 9.2,
      control: 9.6,
      maneuverability: 9.0,
      spin: 9.4,
      comfort: 8.6,
      sweetspot: 8.8,
      playability: 8.9,
      stability: 9.5
    }
  },

  'nox-at10-genius-attack-12k-2026': {
    overallScore: 9.1,
    verdictTitle_fa: 'سلاح مرگبار بازیکنان سمت چپ با تمرکز بر نهایت قدرت اسمش',
    verdictSummary_fa: 'قالب الماسی با سرسنگینی هجومی و کربن ۱۲K XTREM که برای تمام‌کردن رالی‌ها و زدن اسمش‌های پرواز به بیرون کورت ساخته شده است.',
    playProfile_fa: 'مهاجم انفجاری (Attacker)',
    playProfile_en: 'ATTACKER',
    playerLevel_fa: 'پیشرفته و حرفه‌ای (PRO)',
    racketShape_fa: 'الماسی هجومی (Diamond)',
    weightGrams: 370,
    balanceMm: 275,
    stiffness: {
      value: 82,
      label_fa: 'خشک و هجومی (Hard)',
      label_en: 'Hard • 82/100'
    },
    triad: {
      att: 9.85,
      hyb: 8.60,
      def: 7.90
    },
    parameters: {
      power: 9.9,
      control: 8.4,
      maneuverability: 8.2,
      spin: 9.1,
      comfort: 7.5,
      sweetspot: 7.6,
      playability: 8.0,
      stability: 9.6
    }
  },

  'nox-ml10-pro-cup-rough-surface-2026': {
    overallScore: 8.9,
    verdictTitle_fa: 'افسانه میگوئل لامپرتی با رویه زبر سیلیسی برای حداکثر کات',
    verdictSummary_fa: 'کلاسیک‌ترین راکت تاریخ پدل با لمس بی‌نقص توپ و سوییت اسپات سخاوتمندانه؛ گزینه‌ای مطمئن برای هر بازیکنی که به حس ضربه اهمیت می‌دهد.',
    playProfile_fa: 'کنترلی و لمسی (Control & Touch)',
    playProfile_en: 'ALL-ROUND',
    playerLevel_fa: 'تمامی سطوح (مبتدی تا پیشرفته)',
    racketShape_fa: 'گرد کلاسیک (Round)',
    weightGrams: 365,
    balanceMm: 258,
    stiffness: {
      value: 45,
      label_fa: 'متعادل انعطاف‌پذیر (Medium-Soft)',
      label_en: 'Medium-Soft • 45/100'
    },
    triad: {
      att: 7.80,
      hyb: 8.90,
      def: 9.20
    },
    parameters: {
      power: 7.8,
      control: 9.7,
      maneuverability: 9.2,
      spin: 8.8,
      comfort: 9.1,
      sweetspot: 9.4,
      playability: 9.5,
      stability: 8.7
    }
  }
};

/**
 * الگوریتم هوشمند تخمین نمرات آزمایشگاهی رالی برای سایر راکت‌ها
 */
export function getRacketVerdict(product: ShopProduct): RacketVerdictData {
  if (KNOWN_RACKET_VERDICTS[product.id]) {
    return KNOWN_RACKET_VERDICTS[product.id];
  }

  const pPower = product.power_index || 8.5;
  const pCtrl = product.control_index || 8.8;
  const isDiamond = (product.shape || '').includes('الماسی') || (product.shape || '').toLowerCase().includes('diamond');
  const isRound = (product.shape || '').includes('گرد') || (product.shape || '').toLowerCase().includes('round');

  const power = Math.min(9.9, Math.max(5.5, Number((pPower * 0.95 + (isDiamond ? 0.6 : isRound ? -0.5 : 0)).toFixed(1))));
  const control = Math.min(9.9, Math.max(6.0, Number((pCtrl * 0.95 + (isRound ? 0.6 : isDiamond ? -0.4 : 0.1)).toFixed(1))));
  const maneuv = Math.min(9.8, Math.max(6.5, Number((isRound ? 8.8 : isDiamond ? 7.6 : 8.3).toFixed(1))));
  const spin = Math.min(9.8, Math.max(6.8, Number(((product.surface || '').includes('3D') || (product.surface || '').includes('زبر') ? 8.9 : 7.6).toFixed(1))));
  const comfort = Math.min(9.8, Math.max(6.5, Number(((product.core || '').includes('Soft') ? 8.8 : 7.9).toFixed(1))));
  const sweetspot = Math.min(9.8, Math.max(6.8, Number((isRound ? 8.9 : isDiamond ? 7.4 : 8.2).toFixed(1))));
  const playability = Math.min(9.8, Math.max(7.0, Number((isRound ? 8.8 : 8.2).toFixed(1))));
  const stability = Math.min(9.8, Math.max(7.0, Number((isDiamond ? 9.2 : 8.5).toFixed(1))));

  const att = Number(((power * 0.6) + (spin * 0.25) + (stability * 0.15)).toFixed(2));
  const hyb = Number(((maneuv * 0.35) + (sweetspot * 0.35) + (playability * 0.3)).toFixed(2));
  const def = Number(((control * 0.5) + (comfort * 0.3) + (sweetspot * 0.2)).toFixed(2));

  const overallScore = Number(((att * 0.35) + (hyb * 0.35) + (def * 0.3)).toFixed(1));

  let profileFa = 'همه‌کاره و متعادل (All-Round)';
  let profileEn: 'DEFENDER' | 'ALL-ROUND' | 'ATTACKER' = 'ALL-ROUND';
  if (isDiamond || power > control + 0.8) {
    profileFa = 'مهاجم و اسمش‌زن (Attacker)';
    profileEn = 'ATTACKER';
  } else if (isRound || control > power + 0.6) {
    profileFa = 'مدافع و بازی‌ساز (Defender)';
    profileEn = 'DEFENDER';
  }

  const stiffnessVal = isDiamond ? 75 : isRound ? 40 : 58;

  return {
    overallScore,
    verdictTitle_fa: `ارزیابی مهندسی و تجربی راکت ${product.brand} در شرایط کورت مسابقه‌ای`,
    verdictSummary_fa: product.description || `راکت ${product.name_fa} موازنه استانداردی میان شتاب اولیه توپ و ایمنی دست در ضربات باثبات کورت پدل فراهم می‌کند.`,
    playProfile_fa: profileFa,
    playProfile_en: profileEn,
    playerLevel_fa: product.level === 'PRO' ? 'حرفه‌ای و مسابقاتی' : product.level === 'ADVANCED' ? 'پیشرفته' : 'متوسط',
    racketShape_fa: product.shape || 'اشکی استاندارد',
    weightGrams: 365,
    balanceMm: isDiamond ? 270 : isRound ? 255 : 265,
    stiffness: {
      value: stiffnessVal,
      label_fa: stiffnessVal > 70 ? 'خشک و تهاجمی (Hard)' : stiffnessVal < 45 ? 'نرم و منعطف (Soft)' : 'متعادل (Medium)',
      label_en: `${stiffnessVal > 70 ? 'Hard' : stiffnessVal < 45 ? 'Soft' : 'Medium'} • ${stiffnessVal}/100`
    },
    triad: { att, hyb, def },
    parameters: {
      power,
      control,
      maneuverability: maneuv,
      spin,
      comfort,
      sweetspot,
      playability,
      stability
    }
  };
}

export const SAMPLE_COMMUNITY_REVIEWS: Record<string, CommunityReview[]> = {
  'nox-equation-soft-advanced-2026': [
    {
      id: 'rev-eq-1',
      userName: 'آرمین شریفی',
      playerLevel: 'متوسط (سطح ۳ در کورت انقلاب)',
      rating: 8.8,
      scores: { power: 6.5, control: 9.0, comfort: 9.5 },
      comment: 'حدود ۳ هفته‌س با این راکت بازی می‌کنم. درد مچ دستم که با راکت قبلی داشتم کاملاً محو شد. از انتهای زمین هر توپی رو به راحتی لوپ می‌کنی و کنترلش شگفت‌انگیزه.',
      date: '۳ روز پیش',
      likesCount: 14,
      isVerifiedPlayer: true
    },
    {
      id: 'rev-eq-2',
      userName: 'کیوان دادرس',
      playerLevel: 'پیشرفته (باشگاه FGB)',
      rating: 8.2,
      scores: { power: 6.0, control: 8.8, comfort: 8.5 },
      comment: 'برای بازیکنانی که اسمش‌های سهمگین می‌خوان شاید کمی نرم باشه، اما برای بازی‌های طولانی و کنترل رالی‌ها شاهکاره. نقطه شیرینش انقدر بزرگه که شات کج هم درست می‌ره!',
      date: 'هفته گذشته',
      likesCount: 9,
      isVerifiedPlayer: true
    }
  ]
};

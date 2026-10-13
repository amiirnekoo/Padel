import React from 'react';
import { Sparkles, Shield, Zap, Target, Activity, Award } from 'lucide-react';

export interface QuizOption {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: string;
}

interface RacketQuizStepViewProps {
  currentStep: number;
  selectedValues: {
    player_level: string;
    playstyle: string;
    physical_priority: string;
    budget_tier: string;
  };
  onSelectOption: (field: string, value: string) => void;
}

export const RacketQuizStepView: React.FC<RacketQuizStepViewProps> = ({
  currentStep,
  selectedValues,
  onSelectOption
}) => {
  if (currentStep === 1) {
    const LEVEL_OPTIONS: QuizOption[] = [
      { id: 'BEGINNER', title: 'مبتدی / تازه‌کار', subtitle: 'کمتر از ۶ ماه تجربه، نیازمند راکت بخشنده با سوئیت‌اسپات وسیع', badge: 'شروع قدرتمند', icon: '🌱' },
      { id: 'INTERMEDIATE', title: 'متوسط و باشگاهی', subtitle: 'بازی منظم هفتگی، تسلط بر ضربات پایه و بازی با دیواره شیشه', badge: 'پرفروش‌ترین', icon: '🎾' },
      { id: 'ADVANCED', title: 'پیشرفته و کاپ', subtitle: 'ریتم بازی سریع، والی‌های پای تور و نیاز به دقت نقطه‌زنی بالا', badge: 'سطح رقابتی', icon: '⚡' },
      { id: 'PRO', title: 'حرفه‌ای / مسابقاتی', subtitle: 'بازیکن لیگ و تورنمنت، تسلط بر اسمش‌های Por 3 و استراتژی مسابقه', badge: 'کلکسیون WPT', icon: '🏆' },
    ];

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <span className="text-xs font-black text-rally-primary bg-rally-primary/10 px-3 py-1 rounded-full inline-block mb-2">
            گام اول از ۴
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">سطح مهارت و تجربه بازی شما در پدل چیست؟</h3>
          <p className="text-xs text-slate-400 mt-1">این فاکتور وزن راکت و نوع فوم داخلی (هسته الاستیک) را مشخص می‌کند</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LEVEL_OPTIONS.map((opt) => {
            const isSelected = selectedValues.player_level === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectOption('player_level', opt.id)}
                className={`p-4 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-[#D7ED68] shadow-[0_0_15px_rgba(215,237,104,0.15)] ring-1 ring-[#D7ED68]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{opt.icon}</span>
                  {opt.badge && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <div className="font-black text-sm text-white mb-1">{opt.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{opt.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    const PLAYSTYLE_OPTIONS: QuizOption[] = [
      { id: 'DEFENSIVE_CONTROL', title: 'دفاعی و کنترلی (Control Master)', subtitle: 'تسلط بر انتهای زمین، بازی با شیشه، لوپ‌های کمانه‌دار و فریم گرد', badge: 'دقت ۱۰۰٪', icon: '🛡️' },
      { id: 'ALL_ROUND_BALANCED', title: 'تعادلی و همه‌کاره (Hybrid All-Round)', subtitle: 'جابجایی مداوم پای تور و عقب زمین، والی‌های چابک و فریم اشکی', badge: 'متعادل‌ترین', icon: '⚖️' },
      { id: 'AGGRESSIVE_ATTACK', title: 'تهاجمی و اسمشر (Power Attacker)', subtitle: 'ضربه تمام‌کننده، اسپایک و وایپر، پرش‌های هوایی و فریم الماسی سرسنگین', badge: 'حداکثر شتاب', icon: '💥' },
    ];

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <span className="text-xs font-black text-rally-primary bg-rally-primary/10 px-3 py-1 rounded-full inline-block mb-2">
            گام دوم از ۴
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">سبک بازی غالب شما در کورت چگونه است؟</h3>
          <p className="text-xs text-slate-400 mt-1">این فاکتور شکل هندسی فریم (الماس، اشکی، گرد) و بالانس راکت را تعیین می‌کند</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {PLAYSTYLE_OPTIONS.map((opt) => {
            const isSelected = selectedValues.playstyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectOption('playstyle', opt.id)}
                className={`p-4 rounded-2xl text-right transition-all flex items-start gap-4 border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-[#D7ED68] shadow-[0_0_15px_rgba(215,237,104,0.15)] ring-1 ring-[#D7ED68]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <span className="text-3xl shrink-0 p-2 rounded-xl bg-slate-800/80">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm text-white">{opt.title}</span>
                    {opt.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-rally-primary">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">{opt.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    const PHYSICAL_OPTIONS: QuizOption[] = [
      { id: 'ARM_COMFORT', title: 'محافظت از آرنج و مچ (ضدلرزش)', subtitle: 'پیشگیری از آسیب تاندون، تنیس‌البو و خستگی دست با فوم الاستیک و مواد جاذب شوک', badge: 'ارگونومیک سلامت', icon: '🩹' },
      { id: 'MAX_POWER', title: 'حداکثر شتاب و قدرت اهرمی', subtitle: 'بدن کاملاً آماده و عضلات قوی، علاقه به بازگشت بیشترین انرژی به توپ بدون افت توان', badge: 'کربن ۱۸K پرچگال', icon: '🚀' },
      { id: 'BALANCED', title: 'حالت استاندارد و متوازن', subtitle: 'بدون آسیب قبلی، ترکیبی خوش‌دست از راحتی ارگونومیک و سرعت ضربه در بازی طولانی', badge: 'استاندارد جهانی', icon: '👌' },
    ];

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <span className="text-xs font-black text-rally-primary bg-rally-primary/10 px-3 py-1 rounded-full inline-block mb-2">
            گام سوم از ۴
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">اولویت فیزیکی و بیومکانیک بازوی شما چیست؟</h3>
          <p className="text-xs text-slate-400 mt-1">تطابق با ضریب سختی شاسی و سیستم ضدشوک تاییدشده آزمایشگاه بیومکانیک</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {PHYSICAL_OPTIONS.map((opt) => {
            const isSelected = selectedValues.physical_priority === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectOption('physical_priority', opt.id)}
                className={`p-4 rounded-2xl text-right transition-all flex items-start gap-4 border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-[#D7ED68] shadow-[0_0_15px_rgba(215,237,104,0.15)] ring-1 ring-[#D7ED68]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <span className="text-3xl shrink-0 p-2 rounded-xl bg-slate-800/80">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm text-white">{opt.title}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {opt.badge}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">{opt.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 4
  const BUDGET_OPTIONS: QuizOption[] = [
    { id: 'FLAGSHIP', title: 'کلکسیون جدید ۲۰۲۷ و راکت‌های تاپیا', subtitle: 'جدیدترین نسخه پرچمدار سال نوکس و برندهای جهانی با بالاترین فناوری', badge: 'جدیدترین سال', icon: '✨' },
    { id: 'MID_RANGE', title: 'راکت‌های پیشرفته و کارشناسی ۲۰۲۶', subtitle: 'پرفروش‌ترین سری‌های تست‌شده مسابقاتی با نسبت عملکرد به قیمت عالی', badge: 'محبوب‌ترین', icon: '⭐' },
    { id: 'ECONOMIC', title: 'کلاس استاندارد و بهینه اقتصادی', subtitle: 'شروع هوشمندانه و کم‌هزینه با حفظ کامل استانداردهای ایمنی و اصالت کالا', badge: 'اقتصادی', icon: '🎯' },
    { id: 'ANY', title: 'هر بازه قیمتی (بهترین راکت ممکن)', subtitle: 'محدودیتی نیست؛ تمرکز ۱۰۰٪ روی منطبق‌ترین سلاح بر اساس سبک بازی من باشد', badge: 'بدون محدودیت', icon: '👑' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="text-xs font-black text-rally-primary bg-rally-primary/10 px-3 py-1 rounded-full inline-block mb-2">
          گام پایانی
        </span>
        <h3 className="text-lg sm:text-xl font-black text-white">ترجیح بودجه و کلکسیون مدنظر شما چیست؟</h3>
        <p className="text-xs text-slate-400 mt-1">کلیه قیمت‌ها بر اساس قوانین رندسازی ۵۰۰ هزار تومانی و تامین مصوب رالی است</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BUDGET_OPTIONS.map((opt) => {
          const isSelected = selectedValues.budget_tier === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectOption('budget_tier', opt.id)}
              className={`p-4 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-[#D7ED68] shadow-[0_0_15px_rgba(215,237,104,0.15)] ring-1 ring-[#D7ED68]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {opt.badge}
                </span>
              </div>
              <div className="font-black text-sm text-white mb-1">{opt.title}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{opt.subtitle}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

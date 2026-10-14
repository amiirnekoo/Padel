import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Users, Zap, Compass } from 'lucide-react';

interface BeginnerPadelGuideProps {
  onExploreCourts?: () => void;
  onExploreMatches?: () => void;
}

export const BeginnerPadelGuide: React.FC<BeginnerPadelGuideProps> = ({
  onExploreCourts,
  onExploreMatches,
}) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" dir="rtl">
      {/* Container with crisp solid dark background - Zero Blur */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative lime glow edge */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-rally-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rally-accent/15 text-rally-accent border border-rally-accent/30 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>راهنمای ویژه شروع سریع برای تازه‌واردها</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
              پدل چیست و چطور در ۱۰ دقیقه شروع کنم؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              پدل سریع‌ترین ورزش در حال رشد جهان است؛ ترکیبی از هیجان دیواره‌های اسکواش و پویایی تنیس که یادگیری آن بسیار آسان و پر از آدرنالین است.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onExploreCourts && (
              <button
                type="button"
                onClick={onExploreCourts}
                className="px-4 py-2.5 rounded-xl bg-rally-accent hover:bg-lime-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md"
              >
                مشاهده زمین‌ها و سانس‌ها
              </button>
            )}
            {onExploreMatches && (
              <button
                type="button"
                onClick={onExploreMatches}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer border border-slate-700"
              >
                پارتنر ندارم! (بازی‌های باز)
              </button>
            )}
          </div>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">یادگیری آسان و فوق‌العاده سریع</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              برخلاف تنیس که نیاز به ماه‌ها تمرین دارد، قوانین پدل را در ۵ دقیقه یاد می‌گیرید و از همان جلسه اول رالی‌های طولانی و لذت‌بخش خواهید داشت.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">ورزش گروهی و شاداب (همیشه ۴ نفره)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              پدل همیشه دو به دو (دابلز) بازی می‌شود؛ بنابراین بهترین بهانه برای تفریح با دوستان یا آشنایی با ورزشکاران جدید در محیطی دوستانه است.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">دیواره‌های شیشه‌ای تعاملی</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              توپ بعد از برخورد به زمین می‌تواند به شیشه‌ها بخورد و در بازی بماند؛ این ویژگی بازی را پرهیجان و غیرقابل پیش‌بینی می‌کند.
            </p>
          </div>
        </div>

        {/* Golden Confidence Banner: No need to buy racket! */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-white">
                  نگران راکت نباشید! نیازی به خرید تجهیزات گران‌قیمت ندارید.
                </h4>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                  تضمین رالی
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                در تمامی باشگاه‌های پدل طرف قرارداد رالی، امکان <span className="text-white font-bold underline decoration-amber-400">اجاره راکت و توپ استاندارد</span> با هزینه بسیار ناچیز در بدو ورود مهیا است. فقط با لباس ورزشی بیایید!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-300 shrink-0 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>اجاره آسان در محل</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>توپ مخصوص رایگان</span>
            </div>
          </div>
        </div>

        {/* 3 Steps Flow */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-rally-accent font-black text-xs inline-flex items-center justify-center mb-1.5">۱</span>
            <h5 className="text-xs font-black text-white">انتخاب کورت نزدیک</h5>
            <p className="text-[11px] text-slate-400 mt-0.5">زمین سرپوشیده یا روباز در شهر خود را پیدا کنید.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-rally-accent font-black text-xs inline-flex items-center justify-center mb-1.5">۲</span>
            <h5 className="text-xs font-black text-white">رزرو سانس یا ثبت‌نام مچ</h5>
            <p className="text-[11px] text-slate-400 mt-0.5">سانس کامل با دوستان، یا تنهایی در بازی‌های هم‌سطح.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-rally-accent font-black text-xs inline-flex items-center justify-center mb-1.5">۳</span>
            <h5 className="text-xs font-black text-white">حضور در کلوپ و بازی</h5>
            <p className="text-[11px] text-slate-400 mt-0.5">راکت را در کانتر بگیرید و وارد زمین شوید!</p>
          </div>
        </div>

      </div>
    </section>
  );
};

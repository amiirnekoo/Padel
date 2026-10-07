import React from 'react';
import { X, Sparkles, Trophy, Video, Target, Zap, Clock } from 'lucide-react';

interface DrillsComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrillsComingSoonModal: React.FC<DrillsComingSoonModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 select-none"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0B2238] border-2 border-[#D7ED68]/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-right overflow-hidden transition-transform animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow & Decorative Pattern */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#D7ED68] via-[#0284C7] to-[#D7ED68]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="بستن"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7ED68]/15 border border-[#D7ED68]/40 text-[#D7ED68] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#D7ED68]" />
            <span>سورپرایز بزرگ رالی در راه است</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0284C7]/20 border border-[#0284C7]/40 text-[#0284C7] text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            <span>افتتاح به زودی</span>
          </span>
        </div>

        {/* Main Title & Teaser */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            سامانه هوشمند <span className="text-[#D7ED68]">تمرینات تخصصی</span> رالی
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            این بخش هیجان‌انگیز و انقلابی به زودی افتتاح می‌گردد و در دسترس شما ورزشکاران و قهرمانان گرامی قرار خواهد گرفت! آماده یک جهش بزرگ در سطح بازی خود باشید.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2 rounded-xl bg-[#D7ED68]/15 text-[#D7ED68] shrink-0 mt-0.5">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">ویدیوهای تکنیکال گام‌به‌گام</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-snug">
                آموزش‌های ویدیویی استاندارد ضربات طلایی (باندخا، ویبروخا، بازی با شیشه، اسمش و والی) از مربیان معتبر بین‌المللی.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2 rounded-xl bg-[#0284C7]/20 text-[#0284C7] shrink-0 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">تحلیل اشتباهات رایج و نکات ایمنی</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-snug">
                تشریح ریزترین خطاهای بازیکنان در هر ضربه همراه با روش‌های اصلاح و پیشگیری از آسیب‌های مچ و شانه.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2 rounded-xl bg-[#D7ED68]/15 text-[#D7ED68] shrink-0 mt-0.5">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">رهگیری پیشرفت و برنامه‌های هدفمند</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-snug">
                ثبت تمرینات اجراشده در کورت، تعیین سطح مهارت از مبتدی تا قهرمانی و ارتقای رکورد بازی با تمرینات انفرادی و تیمی.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 px-5 rounded-2xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#0B2238] font-black text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>منتظر این سورپرایز بزرگ هستم! 🎾</span>
          </button>
        </div>
      </div>
    </div>
  );
};

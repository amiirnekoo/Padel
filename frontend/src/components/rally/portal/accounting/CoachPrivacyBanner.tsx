import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

export const CoachPrivacyBanner: React.FC = () => {
  return (
    <div className="bg-[#0B1E30] border border-emerald-500/30 rounded-2xl p-4 text-right space-y-3 relative overflow-hidden" dir="rtl">
      {/* Accent edge */}
      <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 to-[#D7ED68]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>تضمین ۱۰۰٪ محرمانگی اطلاعات و لیست شاگردان مربی</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                امنیت تضمین‌شده
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              دفتر حساب، لیست شاگردان، شهریه‌ها و درآمدهای شخصی تدریس شما کاملاً خصوصی است.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#07131F] border border-white/10 text-slate-300">
            <Lock className="w-3 h-3 text-[#D7ED68]" />
            رمزنگاری اتمیک داده‌ها
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#07131F] border border-white/10 text-slate-300">
            <EyeOff className="w-3 h-3 text-emerald-400" />
            عدم دسترسی باشگاه به شماره شاگردان
          </span>
        </div>
      </div>

      <div className="bg-[#07131F] border border-white/5 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-start gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          مدیریت باشگاه‌ها صرفاً سانس‌های رزرو شده در تقویم کورت را می‌بینند و به هیچ‌یک از مراودات مالی، قراردادهای خصوصی، نرخ ساعتی تدریس و مبالغ واریزی شاگردان مربی دسترسی ندارند.
        </p>
      </div>
    </div>
  );
};

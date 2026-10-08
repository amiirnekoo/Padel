import React from 'react';
import { Percent, CheckCircle2, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';

export const ClubZeroFeeDeskBanner: React.FC = () => {
  return (
    <div className="bg-[#0B1E30] border border-[#D7ED68]/30 rounded-2xl p-4 text-right space-y-3 relative overflow-hidden" dir="rtl">
      {/* Accent edge */}
      <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-[#D7ED68] to-emerald-400" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D7ED68]/10 border border-[#D7ED68]/20 flex items-center justify-center text-[#D7ED68] shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>خط‌مشی کارمزد صفر درصد (۰٪) باجه، پوز و رزروهای تلفنی</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#D7ED68] text-[#07131F]">
                ۱۰۰٪ رایگان برای باجه
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              درآمدهای باجه، کارت‌خوان (POS)، واریز نقدی و کارت‌به‌کارت مستقیماً متعلق به باشگاه است.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#07131F] border border-white/10 text-slate-300">
            <CreditCard className="w-3 h-3 text-[#D7ED68]" />
            کارمزد پلتفرم: ۰ تومان
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#07131F] border border-white/10 text-slate-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            بدون نیاز به درگاه واسط
          </span>
        </div>
      </div>

      <div className="bg-[#07131F] border border-white/5 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-start gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#D7ED68] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          برای سانس‌هایی که خود باشگاه از طریق باجه یا تلفنی رزرو می‌کند، هیچ کارمزدی از باشگاه کسر نمی‌شود و مبالغ مستقیم به حساب مدیر مجموعه واریز می‌شود؛ پلتفرم تنها نقش نرم‌افزار مدیریت هوشمند و ضد اوربوکینگ را برای شما ایفا می‌کند.
        </p>
      </div>
    </div>
  );
};

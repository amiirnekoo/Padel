import React from 'react';
import { ShieldCheck, Award, CreditCard, Lock, Heart } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-rally-border-subtle mt-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Top Badges & Security Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-rally-border-subtle/60 text-xs">
          <div className="flex items-center gap-6 flex-wrap text-slate-300 font-medium">
            <span className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              تضمین استرداد وجه طبق مقررات ۲۴ ساعته
            </span>
            <span className="flex items-center gap-2 text-rally-accent font-bold">
              <Award className="w-4 h-4 text-rally-accent" />
              برابری ۱۰۰٪ نرخ مصوب کلوپ (بدون کارمزد مازاد)
            </span>
            <span className="flex items-center gap-2 text-sky-400 font-bold">
              <CreditCard className="w-4 h-4 text-sky-400" />
              پرداخت امن شاپرک و تسویه دوره‌ای پایا
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-pill border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>رمزنگاری سراسری ۲۵۶ بیتی SSL</span>
          </div>
        </div>

        {/* Bottom Attribution & Legal Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span>© ۲۰۲۶ پلتفرم رالی پدل ایران — توسعه‌یافته با معماری رزرواسیون اتمیک و عملکرد فوق‌سریع.</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>طراحی‌شده برای جامعه ورزشکاران حرفه‌ای و کلوپ‌های پدل و تنیس</span>
            <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500 ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
};

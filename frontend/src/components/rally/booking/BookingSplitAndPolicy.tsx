import React, { useState } from 'react';
import { Users, ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';

interface BookingSplitAndPolicyProps {
  totalAmount: number;
  cancellationPolicy: string;
  isSplitActive: boolean;
  onToggleSplit: (active: boolean) => void;
}

export const BookingSplitAndPolicy: React.FC<BookingSplitAndPolicyProps> = ({
  totalAmount,
  cancellationPolicy,
  isSplitActive,
  onToggleSplit,
}) => {
  const [copied, setCopied] = useState(false);
  const perPersonAmount = Math.round(totalAmount / 4);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + '/courts');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* 1. Split Payment (تسهیم دُنگ ۴ نفره) */}
      <div className={`p-3.5 rounded-2xl border transition-all ${
        isSplitActive 
          ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-950' 
          : 'bg-gray-50 border-gray-200 text-gray-700'
      }`}>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
            <input
              type="checkbox"
              checked={isSplitActive}
              onChange={(e) => onToggleSplit(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
            />
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تسهیم دُنگ ۴ نفره (پرداخت اشتراکی)</span>
            </div>
          </label>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            ویژه بازی‌های ۴ نفره
          </span>
        </div>

        {isSplitActive && (
          <div className="mt-3 pt-3 border-t border-emerald-500/20 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-gray-500 block">سهم شما (پرداخت اکنون):</span>
                <span className="font-black text-emerald-700 text-sm">
                  {perPersonAmount.toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان</span>
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-gray-500 block">سهم ۳ هم‌تیمی دیگر:</span>
                <span className="font-bold text-gray-700 text-xs">
                  ۳ × {perPersonAmount.toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
              💡 با پرداخت سهم خود، سانس برای شما رزرو شده و لینک پرداخت دُنگ جهت ارسال به ۳ هم‌تیمی صادر می‌شود.
            </p>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'لینک اشتراک‌گذاری دُنگ کپی شد' : 'کپی لینک دعوت هم‌تیمی‌ها'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Cancellation Guarantee & Instant Refund to Wallet */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-extrabold text-xs">ضمانت استرداد آنی وجه به کیف پول رالی</span>
        </div>
        
        <div className="flex items-start gap-1.5 text-[11px] text-amber-900 leading-relaxed font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>کنسلی تا ۶ ساعت پیش از شروع سانس: عودت ۱۰۰٪ مبلغ به کیف پول کاربری بدون کسر کارمزد.</span>
        </div>

        <div className="pt-2 border-t border-amber-500/20 text-[10px] text-amber-800 flex items-center justify-between">
          <span className="font-bold">قوانین اختصاصی باشگاه:</span>
          <span>{cancellationPolicy}</span>
        </div>
      </div>
    </div>
  );
};

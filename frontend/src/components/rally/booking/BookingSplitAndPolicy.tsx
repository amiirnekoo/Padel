import React, { useState } from 'react';
import { Users, ShieldCheck, CheckCircle2, Copy, Check, Plus, Minus, Package, Sparkles } from 'lucide-react';

interface BookingSplitAndPolicyProps {
  totalAmount: number;
  cancellationPolicy: string;
  isSplitActive: boolean;
  onToggleSplit: (active: boolean) => void;
  racketsCount: number;
  ballsCanCount: number;
  onAddonsChange: (rackets: number, balls: number) => void;
}

export const BookingSplitAndPolicy: React.FC<BookingSplitAndPolicyProps> = ({
  totalAmount,
  cancellationPolicy,
  isSplitActive,
  onToggleSplit,
  racketsCount,
  ballsCanCount,
  onAddonsChange,
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
      {/* 1. Optional Add-ons (اجاره راکت و توپ نو) */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Package className="w-4 h-4 text-rally-primary shrink-0" />
            <span>خدمات و ملزومات کلوپ (اختیاری)</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">تحویل در گیشه باشگاه</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Rackets rental */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-xs">اجاره راکت پدل</span>
              <span className="text-[10px] text-slate-400">۵۰,۰۰۰ تومان / عدد</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg">
              <button
                type="button"
                disabled={racketsCount <= 0}
                onClick={() => onAddonsChange(Math.max(0, racketsCount - 1), ballsCanCount)}
                className="w-5 h-5 rounded flex items-center justify-center bg-white text-slate-700 disabled:opacity-30 cursor-pointer shadow-xs"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-extrabold text-xs w-3 text-center">{racketsCount}</span>
              <button
                type="button"
                disabled={racketsCount >= 4}
                onClick={() => onAddonsChange(Math.min(4, racketsCount + 1), ballsCanCount)}
                className="w-5 h-5 rounded flex items-center justify-center bg-white text-slate-700 disabled:opacity-30 cursor-pointer shadow-xs"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* New balls can */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-xs">قوطی توپ نو (۳ تایی)</span>
              <span className="text-[10px] text-slate-400">۱۵۰,۰۰۰ تومان / پلمپ</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg">
              <button
                type="button"
                disabled={ballsCanCount <= 0}
                onClick={() => onAddonsChange(racketsCount, Math.max(0, ballsCanCount - 1))}
                className="w-5 h-5 rounded flex items-center justify-center bg-white text-slate-700 disabled:opacity-30 cursor-pointer shadow-xs"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-extrabold text-xs w-3 text-center">{ballsCanCount}</span>
              <button
                type="button"
                disabled={ballsCanCount >= 2}
                onClick={() => onAddonsChange(racketsCount, Math.min(2, ballsCanCount + 1))}
                className="w-5 h-5 rounded flex items-center justify-center bg-white text-slate-700 disabled:opacity-30 cursor-pointer shadow-xs"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Split Payment (تسهیم دُنگ ۴ نفره) */}
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

      {/* 3. Cancellation Guarantee & Instant Refund to Wallet */}
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

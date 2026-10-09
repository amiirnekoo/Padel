import React from 'react';
import { Zap, Target, Shield, Award, Sparkles } from 'lucide-react';
import { RacketVerdictData } from '../../../../types/racketVerdict';
import { ShopProduct } from '../../../../types/rally';

interface RacketVerdictCardProps {
  product: ShopProduct;
  verdict: RacketVerdictData;
}

export const RacketVerdictCard: React.FC<RacketVerdictCardProps> = React.memo(({
  product,
  verdict
}) => {
  const { overallScore, triad, stiffness, playProfile_fa, playerLevel_fa, racketShape_fa, weightGrams, balanceMm } = verdict;
  
  // محاسبه درصد زاویه حلقه امتیاز کلی (نمره از ۱۰)
  const scorePercent = Math.min(100, Math.max(0, (overallScore / 10) * 100));
  const strokeDash = 2 * Math.PI * 40; // شعاع 40
  const strokeOffset = strokeDash - (strokeDash * scorePercent) / 100;

  return (
    <div className="w-full bg-[#0b1329] text-white rounded-3xl p-5 sm:p-7 border border-cyan-500/30 shadow-[0_12px_36px_rgba(2,6,23,0.45)] relative overflow-hidden">
      {/* شبکه‌بندی مدرن پس‌زمینه بدون بلور */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* سربرگ کارت ورردیکت */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-cyan-500/20 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest font-black text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30">
            RALLY VERDICT SCORE
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            {product.brand.toUpperCase()}
          </span>
        </div>

        {/* بج‌های مشخصات ارگونومیک راکت */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="bg-slate-800/90 border border-slate-700 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            {playProfile_fa}
          </span>
          <span className="bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
            {playerLevel_fa}
          </span>
          <span className="bg-slate-800/90 border border-slate-700 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            {racketShape_fa}
          </span>
        </div>
      </div>

      {/* بخش بدنه: امتیاز دایره‌ای + تیتر + نوارهای سه گانه */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* ستون چپ: دایره بزرگ ریتینگ */}
        <div className="md:col-span-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 96 96">
              {/* پس‌زمینه حلقه */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#1e293b"
                strokeWidth="7"
                fill="none"
              />
              {/* حلقه پیشرفت درخشان فیروزه‌ای */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#06b6d4"
                strokeWidth="7"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {overallScore.toFixed(1)}
              </span>
              <span className="text-[10px] text-cyan-400 font-bold -mt-1">
                از ۱۰
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {product.name_en || product.name_fa}
            </h3>
            <p className="text-xs text-cyan-300/90 font-medium mt-1 leading-snug">
              {verdict.verdictTitle_fa}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-[10px] text-slate-400">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>ارزیابی الگوریتمی رالی بر اساس دیتای مسابقه‌ای</span>
            </div>
          </div>
        </div>

        {/* ستون راست: مثلث شاخص‌های ۳ گانه (ATT, HYB, DEF) */}
        <div className="md:col-span-7 flex flex-col gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          
          {/* نوار حمله (ATT) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>حمله و تمام‌کنندگی (ATT)</span>
              </span>
              <span className="font-mono font-black text-amber-400 text-xs">
                {triad.att.toFixed(2)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${(triad.att / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* نوار ترکیبی و جریان بازی (HYB) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>بازی ترکیبی و تعادل (HYB)</span>
              </span>
              <span className="font-mono font-black text-cyan-400 text-xs">
                {triad.hyb.toFixed(2)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-700"
                style={{ width: `${(triad.hyb / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* نوار دفاع و دفع فشار (DEF) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>دفاع و مهار ضربات (DEF)</span>
              </span>
              <span className="font-mono font-black text-emerald-400 text-xs">
                {triad.def.toFixed(2)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${(triad.def / 10) * 100}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* نوار پایین: ۴ فاکتور فیزیکی شاخص */}
      <div className="mt-5 pt-3 border-t border-cyan-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs relative z-10">
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">وزن میانگین</span>
          <span className="font-bold text-white mt-0.5 block">{weightGrams || 365} گرم</span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">نقطه تعادل</span>
          <span className="font-bold text-white mt-0.5 block">{balanceMm || 265} میلی‌متر</span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">سفتی هسته و شاسی</span>
          <span className="font-bold text-cyan-300 mt-0.5 block">{stiffness.label_fa}</span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">سال عرضه</span>
          <span className="font-bold text-white mt-0.5 block">{product.year || 2026}</span>
        </div>
      </div>
    </div>
  );
});

RacketVerdictCard.displayName = 'RacketVerdictCard';

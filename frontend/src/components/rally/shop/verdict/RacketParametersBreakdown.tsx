import React from 'react';
import { RacketVerdictParameters, RacketStiffnessGauge } from '../../../../types/racketVerdict';

interface RacketParametersBreakdownProps {
  parameters: RacketVerdictParameters;
  stiffness: RacketStiffnessGauge;
  hoveredKey?: string | null;
  onHoverParam?: (key: string | null) => void;
}

interface ParamItem {
  key: keyof RacketVerdictParameters;
  label_fa: string;
  label_en: string;
  description: string;
}

const PARAM_ITEMS: ParamItem[] = [
  { key: 'power', label_fa: 'قدرت ضربه', label_en: 'Power', description: 'شتاب انفجاری و سرعت اسمش روی تور' },
  { key: 'control', label_fa: 'کنترل و هدایت', label_en: 'Control', description: 'دقت در لوپ، بالورنا و جای‌گذاری توپ' },
  { key: 'maneuverability', label_fa: 'مانورپذیری و چابکی', label_en: 'Maneuverability', description: 'سرعت عکس‌العمل دست در دوئل‌های تور' },
  { key: 'spin', label_fa: 'پیچ‌دهی و تاپ‌اسپین', label_en: 'Spin', description: 'چنگ‌زنی رویه زبر و کات سنگین ضربات' },
  { key: 'comfort', label_fa: 'راحتی مچ و ضدلرزش', label_en: 'Comfort', description: 'جذب ضربه و محافظت کامل از آرنج' },
  { key: 'sweetspot', label_fa: 'وسعت سوییت‌اسپات', label_en: 'Sweetspot', description: 'سطح پاسخگوی ایده‌آل حتی در ضربات خارج از مرکز' },
  { key: 'playability', label_fa: 'سهولت بازی', label_en: 'Playability', description: 'سازگاری سریع و ارگونومی دلنشین بازیکن' },
  { key: 'stability', label_fa: 'پایداری فریم', label_en: 'Stability', description: 'استحکام شاسی در برابر شوت‌های سنگین حریف' },
];

export const RacketParametersBreakdown: React.FC<RacketParametersBreakdownProps> = React.memo(({
  parameters,
  stiffness,
  hoveredKey,
  onHoverParam
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 bg-slate-900/60 rounded-2xl border border-slate-800">
      
      {/* عنوان تفکیک نمرات */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="text-xs font-black text-cyan-400">
          تفکیک نمرات ۸ پارامتر کلیدی (SCORE BREAKDOWN)
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          مقیاس ۱ الی ۱۰
        </span>
      </div>

      {/* لیست نوارهای پارامترها */}
      <div className="grid grid-cols-1 gap-2.5">
        {PARAM_ITEMS.map((item) => {
          const val = parameters[item.key] || 7.0;
          const isHovered = hoveredKey === item.key;
          const percent = Math.min(100, Math.max(0, (val / 10) * 100));

          return (
            <div
              key={item.key}
              onMouseEnter={() => onHoverParam && onHoverParam(item.key)}
              onMouseLeave={() => onHoverParam && onHoverParam(null)}
              className={`flex flex-col gap-1 p-2 rounded-xl transition-all cursor-pointer ${
                isHovered ? 'bg-slate-800/90 ring-1 ring-cyan-500/50' : 'hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold transition-colors ${isHovered ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {item.label_fa}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({item.label_en})
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-black text-xs text-white">
                    {val.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    / ۱۰
                  </span>
                </div>
              </div>

              {/* نوار گرافیکی */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHovered
                      ? 'bg-gradient-to-r from-cyan-400 to-sky-300'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {isHovered && (
                <span className="text-[10px] text-cyan-200/80 animate-in fade-in duration-150">
                  {item.description}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* اسلایدر میزان سفتی و حس تماس (FEEL • STIFFNESS GAUGE) */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 text-[11px]">
            میزان سفتی و حس ضربه (FEEL • STIFFNESS)
          </span>
          <span className="font-mono font-bold text-cyan-400 text-xs">
            {stiffness.label_en || `${stiffness.value}/100 • Soft`}
          </span>
        </div>

        {/* خط مدرن نشانگر سفتی */}
        <div className="relative w-full h-6 flex items-center">
          {/* خط پیوسته نوار */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 rounded-full"
              style={{ width: '100%' }}
            />
          </div>

          {/* نشانگر داینامیک دایره‌ای روی خط */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-slate-900 pointer-events-none transition-all duration-300"
            style={{ left: `${Math.min(96, Math.max(4, stiffness.value))}%` }}
          />
        </div>

        {/* برچسب‌های دو طرف Soft و Hard */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span className="text-emerald-400">نرم و ضربه‌گیر (Soft)</span>
          <span className="text-amber-400">خشک و هجومی (Hard)</span>
        </div>
      </div>

    </div>
  );
});

RacketParametersBreakdown.displayName = 'RacketParametersBreakdown';

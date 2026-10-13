import React from 'react';
import { Award, CheckCircle2, RotateCcw, ShoppingBag, Eye, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

const formatPrice = (price: number) => (price || 0).toLocaleString('fa-IR');

interface RacketQuizResultViewProps {
  result: {
    top_recommendation: any;
    alternatives: any[];
    total_matches: number;
    quiz_summary: any;
  };
  onRetake: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: any) => void;
}

export const RacketQuizResultView: React.FC<RacketQuizResultViewProps> = ({
  result,
  onRetake,
  onSelectProduct,
  onAddToCart,
}) => {
  const top = result.top_recommendation;

  if (!top) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-400">راکت منطبقی با معیارهای انتخابی یافت نشد.</p>
        <button
          type="button"
          onClick={onRetake}
          className="px-6 py-2.5 rounded-xl bg-rally-primary text-black font-black text-sm cursor-pointer hover:bg-lime-400"
        >
          شروع مجدد راکت‌سنج
        </button>
      </div>
    );
  }

  const primaryImage = Array.isArray(top.images) && top.images.length > 0 
    ? top.images[0] 
    : (top.image || '/images/products/racket-placeholder.webp');

  return (
    <div className="space-y-6 text-right">
      {/* هدر تبریک و درصد تطابق */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-rally-primary animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-rally-primary">
            تطابق بیومکانیک اختصاصی شما
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white mb-1">
          {top.match_title || 'پیشنهاد طلایی کورت رالی'}
        </h3>
        <p className="text-xs text-slate-400">
          محاسبه‌شده بر اساس شاخص‌های آزمایشگاه بیومکانیک Testea Padel و سبک بازی شما
        </p>
      </div>

      {/* کارت راکت برتر */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border-2 border-rally-primary/40 shadow-xl relative">
        <div className="absolute top-4 left-4 bg-rally-primary text-black font-black text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Award className="w-3.5 h-3.5" />
          <span>{top.match_score || 95}٪ تطابق</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* عکس راکت */}
          <div className="md:col-span-5 flex items-center justify-center p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <img
              src={primaryImage}
              alt={top.title}
              className="max-h-56 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* مشخصات راکت */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-400">{top.brand}</span>
                {top.year && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-rally-primary border border-slate-700">
                    مدل {top.year}
                  </span>
                )}
                {top.supply_mode === 'EUROPE' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    سفارش اروپا (تحویل اختصاصی)
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-black text-white hover:text-rally-primary transition-colors">
                {top.title}
              </h4>
            </div>

            {/* نمرات قدرت و کنترل */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> شاخص قدرت:
                </span>
                <span className="font-black text-white">{top.power_index || '9.0'} / 10</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-sky-400" /> شاخص کنترل:
                </span>
                <span className="font-black text-white">{top.control_index || '9.0'} / 10</span>
              </div>
            </div>

            {/* دلایل بیومکانیک انتخاب */}
            {Array.isArray(top.match_reasons) && top.match_reasons.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] font-bold text-slate-300">چرا این راکت مناسب شماست؟</div>
                <div className="space-y-1">
                  {top.match_reasons.map((reason: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rally-primary shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* قیمت و دکمه‌های اکشن */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-slate-400">قیمت مصوب رالی:</div>
                <div className="text-lg font-black text-rally-primary">
                  {formatPrice(top.price)} تومان
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectProduct(top.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  مشخصات کامل
                </button>
                <button
                  type="button"
                  onClick={() => onAddToCart(top)}
                  className="px-4 py-2 rounded-xl bg-rally-primary text-black text-xs font-black hover:bg-lime-400 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  افزودن به سبد
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* گزینه‌های جایگزین (Alternatives) */}
      {Array.isArray(result.alternatives) && result.alternatives.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-black text-white">سایر گزینه‌های بسیار نزدیک به سبک شما:</h5>
            <span className="text-xs text-slate-400">{result.alternatives.length} گزینه پیشنهادی</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {result.alternatives.map((alt: any) => {
              const altImage = Array.isArray(alt.images) && alt.images.length > 0
                ? alt.images[0]
                : (alt.image || '/images/products/racket-placeholder.webp');
              return (
                <div
                  key={alt.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={altImage}
                      alt={alt.title}
                      className="w-14 h-14 object-contain rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] text-slate-400 truncate">{alt.brand}</span>
                        <span className="text-[10px] font-black text-rally-primary bg-rally-primary/10 px-1.5 py-0.2 rounded">
                          {alt.match_score}٪
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{alt.title}</div>
                      <div className="text-xs font-black text-slate-200 mt-1">
                        {formatPrice(alt.price)} تومان
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectProduct(alt.id)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold text-center cursor-pointer transition-colors"
                  >
                    بررسی این راکت
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* دکمه شروع مجدد */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          تغییر پاسخ‌ها و آزمون مجدد
        </button>
      </div>
    </div>
  );
};

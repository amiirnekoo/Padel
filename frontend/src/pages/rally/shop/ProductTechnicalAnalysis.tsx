import React from 'react';
import { Zap, Disc, Activity, CheckCircle2 } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

interface ProductTechnicalAnalysisProps {
  product: ShopProduct;
}

export const ProductTechnicalAnalysis: React.FC<ProductTechnicalAnalysisProps> = React.memo(({
  product
}) => {
  const powerScore = product.power_index || 9.2;
  const controlScore = product.control_index || 9.8;

  // Streamlined essential specs that matter to the player
  const ESSENTIAL_SPECS = [
    { label: 'شکل هندسی فریم', value: product.shape || 'اشکی قطره‌ای (Teardrop)' },
    { label: 'وزن فیزیکی', value: product.weight || '۳۶۰ الی ۳۷۵ گرم' },
    { label: 'نقطه تعادل', value: product.balance || 'متعادل میانی (Even Balance)' },
    { label: 'جنس رویه و کربن', value: product.surface || 'کربن ۱۸K آلومینایز بافت‌دار 3D' },
    { label: 'هسته فوم داخلی', value: product.core || 'فوم چندلایه فشرده MLD Black EVA' }
  ];

  return (
    <div className="flex flex-col gap-5 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
          <Activity className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900">
            مشخصات فنی و تحلیل عملکرد
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ارزیابی تجربی قدرت و کنترل راکت در کورت
          </p>
        </div>
      </div>

      {/* Modern Power & Control Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        {/* Power */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>شاخص قدرت</span>
              <span className="text-[10px] text-slate-400 font-medium">Power</span>
            </div>
            <span className="text-xs font-black text-amber-600">
              {powerScore} <span className="text-[10px] text-slate-400 font-normal">از ۱۰</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${(powerScore / 10) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500">
            خروج توپ پرسرعت و اسمش‌های انفجاری روی تور
          </span>
        </div>

        {/* Control */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <div className="flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
              <span>شاخص کنترل</span>
              <span className="text-[10px] text-slate-400 font-medium">Control</span>
            </div>
            <span className="text-xs font-black text-sky-600">
              {controlScore} <span className="text-[10px] text-slate-400 font-normal">از ۱۰</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${(controlScore / 10) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500">
            مانورپذیری بالا و کنترل دقیق ضربات دفاعی و لوپ
          </span>
        </div>
      </div>

      {/* Natural, Concise Description */}
      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
        <p className="font-normal text-justify">
          {product.description}
        </p>
      </div>

      {/* Key Innovation Highlights */}
      {product.features && product.features.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-900">
            نوآوری‌ها و مزایای برجسته:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="line-clamp-1">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concise Specs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90">
        <table className="w-full table-fixed text-right border-collapse text-xs">
          <colgroup>
            <col className="w-2/5 sm:w-1/3" />
            <col className="w-3/5 sm:w-2/3" />
          </colgroup>
          <tbody>
            {ESSENTIAL_SPECS.map((spec, idx) => (
              <tr
                key={idx}
                className={`border-b border-slate-100 last:border-b-0 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                <td className="p-3 font-bold text-slate-600 border-l border-slate-100">
                  {spec.label}
                </td>
                <td className="p-3 font-medium text-slate-900">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ProductTechnicalAnalysis.displayName = 'ProductTechnicalAnalysis';

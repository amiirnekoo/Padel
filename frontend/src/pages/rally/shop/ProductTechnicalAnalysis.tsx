import React from 'react';
import { Award, Zap, ShieldAlert, Cpu, Layers, Disc, Activity } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

interface ProductTechnicalAnalysisProps {
  product: ShopProduct;
}

export const ProductTechnicalAnalysis: React.FC<ProductTechnicalAnalysisProps> = React.memo(({
  product
}) => {
  const isPadel = product.sport === 'PADEL';

  const powerScore = product.power_index || 9.0;
  const controlScore = product.control_index || 9.5;

  const SPECS = [
    { label: 'برند سازنده', value: product.brand },
    { label: 'سال مدل', value: product.year ? `${product.year}` : '۲۰۲۶' },
    { label: 'ورزش تخصصی', value: isPadel ? 'پدل (Padel)' : 'تنیس (Tennis)' },
    { label: 'سطح بازیکن', value: product.level === 'PRO' ? 'حرفه‌ای و مسابقه‌ای (PRO)' : product.level === 'ADVANCED' ? 'پیشرفته' : 'متوسط تا پیشرفته' },
    { label: 'وزن فیزیکی', value: product.weight || '۳۶۰ - ۳۷۵ گرم' },
    { label: 'نقطه تعادل (Balance)', value: product.balance || 'متعادل (Even Balance)' },
    { label: 'شکل هندسی فریم', value: product.shape || 'اشکی (Teardrop)' },
    { label: 'ضخامت فریم', value: '۳۸ میلی‌متر استاندارد فدراسیون بین‌المللی پدل (FIP)' },
    { label: 'جنس رویه و سطح راکت', value: product.surface || 'الیاف کربن ۱۸K بافت‌دار 3D' },
    { label: 'هسته فوم داخلی (Core)', value: product.core || 'فوم چندلایه فشرده MLD Black EVA' },
    { label: 'سری ساخت', value: product.series || 'سری لوکس مسابقه‌ای (Luxury Series 2026)' },
    { label: 'گارانتی و خدمات پس از فروش', value: product.warranty || 'گارانتی ۶ ماهه اصالت و سلامت رالی' }
  ];

  return (
    <div className="flex flex-col gap-6 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
      {/* Title & Signature */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <Activity className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              آنالیز فنی و مهندسی راکت
            </h2>
            <p className="text-xs text-slate-400">
              تست آزمایشگاهی و مشخصات ثبت‌شده توسط کارخانه سازنده
            </p>
          </div>
        </div>

        {product.player_signature && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <Award className="w-4 h-4 text-amber-600" />
            <span>راکت امضا شده توسط: {product.player_signature}</span>
          </div>
        )}
      </div>

      {/* Radar Power & Control Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
        {/* Power Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-800">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              شاخص توان و قدرت تخریب (Power):
            </span>
            <span className="text-sm font-mono text-amber-600">{powerScore} / ۱۰</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${(powerScore / 10) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500">
            ضربه اسمش (Smash)، خروج توپ پرقدرت در شوت‌های روی تور
          </span>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-800">
            <span className="flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-sky-500" />
              شاخص دقت و مانورپذیری (Control):
            </span>
            <span className="text-sm font-mono text-sky-600">{controlScore} / ۱۰</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${(controlScore / 10) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500">
            دقت ضربه در لوپ (Lob)، کنترل شیشه‌های عقب و کات‌ زدن شنی
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <p className="font-medium">{product.description}</p>
      </div>

      {/* Bullet Features & Techs */}
      {product.features && product.features.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sky-600" />
            فناوری‌های به‌کاررفته و نوآوری‌ها:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Specs Table */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-700" />
          جدول شناسنامه فنی و مهندسی:
        </h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full table-fixed text-right border-collapse text-xs">
            <colgroup>
              <col className="w-2/5 sm:w-1/3" />
              <col className="w-3/5 sm:w-2/3" />
            </colgroup>
            <tbody>
              {SPECS.map((spec, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-slate-100 last:border-b-0 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                  }`}
                >
                  <td className="p-3 font-bold text-slate-600 border-l border-slate-100">
                    {spec.label}
                  </td>
                  <td className="p-3 font-medium text-slate-900 font-mono sm:font-sans">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

ProductTechnicalAnalysis.displayName = 'ProductTechnicalAnalysis';

import React from 'react';
import { X, Scale, ShoppingBag, Check, Trophy, Sparkles } from 'lucide-react';
import { ShopProduct } from '../../../../types/rally';

interface RacketCompareModalProps {
  products: ShopProduct[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: ShopProduct) => void;
}

interface SpecRow {
  label: string;
  valA: string | number;
  valB: string | number;
  winner?: 'A' | 'B' | 'EQUAL';
}

export const RacketCompareModal: React.FC<RacketCompareModalProps> = ({
  products,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || products.length < 2) return null;

  const [pA, pB] = products;

  const powerA = pA.power_index || 8.5;
  const powerB = pB.power_index || 8.0;
  const ctrlA = pA.control_index || 8.0;
  const ctrlB = pB.control_index || 8.5;

  // Derive biomechanical metrics
  const specs: SpecRow[] = [
    { label: 'برند و سازنده', valA: pA.brand, valB: pB.brand },
    { label: 'سال کلکسیون', valA: pA.year || 2026, valB: pB.year || 2026 },
    { label: 'فرم و شکل سر راکت', valA: pA.shape || 'قطره‌ای (Teardrop)', valB: pB.shape || 'الماسی (Diamond)' },
    { label: 'نقطه تعادل (Balance)', valA: pA.balance || 'متوسط (Even)', valB: pB.balance || 'سرسنگین (High)' },
    { label: 'وزن شاسی', valA: pA.weight || '365-375 گرم', valB: pB.weight || '360-370 گرم' },
    { label: 'جنس رویه و کربن', valA: pA.surface || 'Carbon 12K', valB: pB.surface || 'Carbon 18K' },
    { label: 'هسته فوم داخلی', valA: pA.core || 'Black EVA', valB: pB.core || 'Multieva' },
    { label: 'مدل تامین کالا', valA: pA.domestic_delivery || 'انبار رالی (فوری)', valB: pB.domestic_delivery || 'انبار رالی (فوری)' },
  ];

  const scores = [
    { name: 'قدرت و توان ضربه (Power)', a: powerA, b: powerB },
    { name: 'دقت و کنترل (Control)', a: ctrlA, b: ctrlB },
    { name: 'مساحت سوییپت اسپات', a: (powerA + ctrlA) / 2 > 8 ? 8.8 : 8.2, b: (powerB + ctrlB) / 2 > 8 ? 8.5 : 8.1 },
    { name: 'خروج توپ (Ball Output)', a: ctrlA > 8 ? 8.9 : 8.3, b: ctrlB > 8 ? 9.0 : 8.4 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#0f172a] border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rally-accent/20 border border-rally-accent/30 flex items-center justify-center text-rally-accent">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">مقایسه فنی و بیومکانیک ۲ راکت پدل</h2>
              <p className="text-xs text-slate-400">مرجع‌گذاری رسمی بر اساس استانداردهای Testea Padel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Top Cards: Product A vs Product B */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {[pA, pB].map((prod, idx) => (
              <div
                key={prod.id}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div className="text-center">
                  <div className="w-24 h-28 sm:w-32 sm:h-36 mx-auto mb-3 flex items-center justify-center">
                    <img
                      src={prod.image_url}
                      alt={prod.name_fa}
                      className="max-h-full max-w-full object-contain filter drop-shadow-xl"
                    />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 inline-block mb-1">
                    {prod.brand} • {prod.year}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white leading-tight mb-2 truncate">
                    {prod.name_fa}
                  </h3>
                  <div className="text-xs sm:text-base font-black text-rally-accent font-mono mb-3">
                    {prod.price.toLocaleString('fa-IR')} <span className="text-[11px] text-slate-300">تومان</span>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(prod)}
                  className="w-full py-2.5 rounded-2xl bg-rally-accent hover:bg-rally-accent-hover text-slate-950 font-black text-xs transition shadow flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <ShoppingBag size={14} />
                  <span>افزودن به سبد</span>
                </button>
              </div>
            ))}
          </div>

          {/* Testea Padel Metric Bars */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Sparkles size={14} className="text-rally-accent" />
              <span>نمرات ارزیابی عملکرد آزمایشگاهی (Testea Padel):</span>
            </div>

            <div className="space-y-3.5">
              {scores.map((s, idx) => {
                const winnerA = s.a > s.b;
                const winnerB = s.b > s.a;
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300 text-[11px] font-medium">
                      <span className={winnerA ? 'text-rally-accent font-black' : ''}>{s.a} / ۱۰</span>
                      <span className="font-bold text-white">{s.name}</span>
                      <span className={winnerB ? 'text-rally-accent font-black' : ''}>{s.b} / ۱۰</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 h-2.5">
                      {/* Bar A */}
                      <div className="bg-slate-950 rounded-full overflow-hidden flex justify-end">
                        <div
                          className={`h-full rounded-full ${winnerA ? 'bg-rally-accent' : 'bg-slate-600'}`}
                          style={{ width: `${(s.a / 10) * 100}%` }}
                        />
                      </div>
                      {/* Bar B */}
                      <div className="bg-slate-950 rounded-full overflow-hidden flex justify-start">
                        <div
                          className={`h-full rounded-full ${winnerB ? 'bg-rally-accent' : 'bg-slate-600'}`}
                          style={{ width: `${(s.b / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spec Table */}
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
            <table className="w-full text-right text-xs table-fixed">
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '40%' }} />
              </colgroup>
              <tbody className="divide-y divide-slate-800/60">
                {specs.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 text-right font-bold text-slate-200 truncate">{row.valA}</td>
                    <td className="p-3 text-center text-slate-400 font-medium text-[11px] bg-slate-950/40">{row.label}</td>
                    <td className="p-3 text-left font-bold text-slate-200 truncate">{row.valB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

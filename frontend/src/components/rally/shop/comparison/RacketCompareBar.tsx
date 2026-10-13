import React from 'react';
import { ArrowLeftRight, X, Sparkles, Scale } from 'lucide-react';
import { ShopProduct } from '../../../../types/rally';

interface RacketCompareBarProps {
  comparingProducts: ShopProduct[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onOpenModal: () => void;
}

export const RacketCompareBar: React.FC<RacketCompareBarProps> = ({
  comparingProducts,
  onRemove,
  onClear,
  onOpenModal,
}) => {
  if (comparingProducts.length === 0) return null;

  const isReady = comparingProducts.length === 2;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl p-3 sm:p-4 shadow-2xl text-white"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Product slots */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Scale size={16} className="text-rally-accent" />
            <span className="hidden sm:inline">مقایسه راکت‌ها:</span>
          </div>

          <div className="flex items-center gap-2">
            {[0, 1].map((idx) => {
              const product = comparingProducts[idx];
              return (
                <div
                  key={idx}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all ${
                    product
                      ? 'bg-slate-900 border-slate-700'
                      : 'border-dashed border-slate-700 bg-slate-900/40 text-slate-500 text-[10px]'
                  }`}
                >
                  {product ? (
                    <>
                      <img
                        src={product.image_url}
                        alt={product.name_fa}
                        className="w-10 h-10 object-contain"
                      />
                      <button
                        onClick={() => onRemove(product.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 transition shadow"
                        title="حذف"
                      >
                        <X size={11} />
                      </button>
                    </>
                  ) : (
                    <span>راکت {idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 mr-auto">
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            پاک‌سازی
          </button>

          <button
            onClick={onOpenModal}
            disabled={!isReady}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition shadow-lg active:scale-95 ${
              isReady
                ? 'bg-rally-accent hover:bg-rally-accent-hover text-slate-950 cursor-pointer animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowLeftRight size={14} />
            <span>
              {isReady ? 'شروع مقایسه رودررو (۲ از ۲)' : `انتخاب راکت دوم (${comparingProducts.length}/۲)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

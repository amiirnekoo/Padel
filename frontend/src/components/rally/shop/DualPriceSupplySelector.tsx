import React from 'react';
import { Truck, Globe, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

export type SupplyOrderMode = 'INSTANT' | 'EUROPE';

interface DualPriceSupplySelectorProps {
  product: ShopProduct;
  selectedMode: SupplyOrderMode;
  onSelectMode: (mode: SupplyOrderMode) => void;
}

export const DualPriceSupplySelector: React.FC<DualPriceSupplySelectorProps> = React.memo(({
  product,
  selectedMode,
  onSelectMode
}) => {
  const isAvailableInStock = product.stock > 0;
  const europePrice = product.custom_order_price || Math.round((product.eur_price || 200) * 298310 * 1.4);
  const deliveryEurope = product.custom_order_delivery || '۴ الی ۶ هفته';

  return (
    <div className="flex flex-col gap-3 my-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span className="flex items-center gap-1.5">
          <span>نحوه تامین و قیمت‌گذاری کالا:</span>
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          (دو قیمت: انبار تهران / سفارش اختصاصی اروپا)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Option 1: In Stock (Instant 24h) */}
        <div
          onClick={() => {
            if (isAvailableInStock) onSelectMode('INSTANT');
          }}
          className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
            !isAvailableInStock
              ? 'opacity-50 bg-slate-100 border-dashed border-slate-300 cursor-not-allowed'
              : selectedMode === 'INSTANT'
              ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                تحویل فوری ۲۴ ساعته
              </span>
              {selectedMode === 'INSTANT' && isAvailableInStock && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>

            <div className="text-xs font-black text-slate-900 mt-1">
              موجود در انبار مرکزی تهران
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>ارسال اکسپرس همان‌روز</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
            <span className="text-[11px] text-slate-500 font-medium">قیمت خرید فوری:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-slate-900">
                {product.price.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">تومان</span>
            </div>
          </div>

          {!isAvailableInStock && (
            <div className="absolute inset-0 bg-slate-200/60 rounded-2xl flex items-center justify-center">
              <span className="bg-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                ناموجود در انبار تهران
              </span>
            </div>
          )}
        </div>

        {/* Option 2: Europe Custom Order (FunPadel + 40% margin) */}
        <div
          onClick={() => onSelectMode('EUROPE')}
          className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
            selectedMode === 'EUROPE'
              ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-2 ring-blue-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                سفارش اختصاصی از اروپا 🇪🇺
              </span>
              {selectedMode === 'EUROPE' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>

            <div className="text-xs font-black text-slate-900 mt-1">
              تامین مستقیم از FunPadel پرتغال
            </div>

            <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>زمان تحویل: {deliveryEurope}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
            <span className="text-[11px] text-slate-500 font-medium">قیمت سفارش اروپا:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-blue-900">
                {europePrice.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">تومان</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transparent formula note */}
      {selectedMode === 'EUROPE' && (
        <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 flex flex-col gap-1">
          <div className="flex items-center gap-1 font-bold text-blue-900">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>محاسبه رسمی قیمت سفارش اختصاصی:</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            قیمت بر اساس نرخ خرید روز یورو از FunPadel پرتغال ضربدر نرخ زنده یورو TGJU (۲۹۸,۳۱۰ تومان) به علاوه ۴۰٪ سود بازرگانی، هزینه‌های ترخیص و ارسال بین‌المللی با ضمانت پلمپ فابریک محاسبه شده است.
          </p>
        </div>
      )}
    </div>
  );
});

DualPriceSupplySelector.displayName = 'DualPriceSupplySelector';

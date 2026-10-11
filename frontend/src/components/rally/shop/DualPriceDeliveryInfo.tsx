import React from 'react';
import { Truck, Globe, Clock, ShieldCheck } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

interface DualPriceDeliveryInfoProps {
  product: ShopProduct;
  compact?: boolean;
}

export const DualPriceDeliveryInfo: React.FC<DualPriceDeliveryInfoProps> = React.memo(({
  product,
  compact = false
}) => {
  const isAvailableInStock = product.stock > 0;
  const hasEuropePrice = !!product.custom_order_price;
  const deliveryTime = isAvailableInStock
    ? 'تحویل فوری (۲۴ ساعته)'
    : (product.custom_order_delivery || '۴ الی ۶ هفته');

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-1 text-[11px]">
        {isAvailableInStock ? (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            تحویل فوری ۲۴h (انبار تهران)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
            <Globe className="w-3 h-3 text-blue-600" />
            سفارش اروپا (تحویل {deliveryTime})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-3.5 flex flex-col gap-2.5 transition-all bg-slate-50 border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAvailableInStock ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Truck className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Globe className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="text-xs font-black text-slate-900">
              {isAvailableInStock ? 'موجود در انبار مرکزی تهران' : 'سفارش اختصاصی از اروپا (FunPadel)'}
            </div>
            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>زمان تحویل: {deliveryTime}</span>
            </div>
          </div>
        </div>

        <span
          className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
            isAvailableInStock
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {isAvailableInStock ? 'آماده ارسال' : 'پیش‌سفارش اروپا'}
        </span>
      </div>

      {!isAvailableInStock && (
        <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-blue-100 leading-relaxed flex flex-col gap-1">
          <div className="flex items-center gap-1 font-bold text-blue-900">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>نحوه محاسبه قیمت تامین مستقیم:</span>
          </div>
          <p className="text-[10px] text-slate-500">
            قیمت بر اساس نرخ خرید روز یورو از FunPadel پرتغال به انضمام ۴۰٪ سود بازرگانی، هزینه‌های ترخیص و حمل بین‌المللی محاسبه شده است.
          </p>
          {product.eur_price && (
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-700 pt-1 border-t border-slate-100">
              <span>قیمت مبدا در اروپا:</span>
              <span className="font-bold">€{product.eur_price.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {isAvailableInStock && hasEuropePrice && (
        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
          <span>هزینه سفارش اختصاصی از اروپا:</span>
          <span className="font-bold text-slate-700">
            {(product.custom_order_price || 0).toLocaleString('fa-IR')} تومان ({product.custom_order_delivery || '۴ الی ۶ هفته'})
          </span>
        </div>
      )}
    </div>
  );
});

DualPriceDeliveryInfo.displayName = 'DualPriceDeliveryInfo';

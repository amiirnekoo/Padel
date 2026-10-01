import React, { useState } from 'react';
import { ShoppingCart, Check, Star, ShieldCheck, Truck, RefreshCw, Sparkles, Award } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

interface ProductBuyBoxProps {
  product: ShopProduct;
  onAddToCart: (product: ShopProduct, quantity: number) => void;
  isInCart?: boolean;
}

export const ProductBuyBox: React.FC<ProductBuyBoxProps> = React.memo(({
  product,
  onAddToCart,
  isInCart = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(product.weight || 'استاندارد مسابقه‌ای');

  const isPadel = product.sport === 'PADEL';
  const savings = product.discount_percent > 0
    ? (product.original_price - product.price) * quantity
    : 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
      {/* Brand & Badges Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-xl shadow-xs">
            {product.brand}
          </span>
          {product.year === 2026 && (
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              کلکسیون رسمی ۲۰۲۶
            </span>
          )}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
            isPadel ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {isPadel ? '🎾 پدل مسابقه‌ای' : '🏸 تنیس خاکی و هاردکورت'}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-amber-800 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{product.rating}</span>
          <span className="text-slate-400">({product.reviews_count} نظر)</span>
        </div>
      </div>

      {/* Titles */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {product.name_fa}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono tracking-tight mt-1">
          {product.name_en}
        </p>
      </div>

      {/* Pricing Module */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2">
        {product.discount_percent > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 line-through">
              {(product.original_price * quantity).toLocaleString('fa-IR')} تومان
            </span>
            <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
              ٪{product.discount_percent} تخفیف ویژه
            </span>
          </div>
        )}

        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500 font-medium">قیمت نهایی:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {(product.price * quantity).toLocaleString('fa-IR')}
            </span>
            <span className="text-sm text-slate-500 font-bold">تومان</span>
          </div>
        </div>

        {savings > 0 && (
          <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-lg text-center mt-1">
            سود شما از این سفارش: {savings.toLocaleString('fa-IR')} تومان
          </div>
        )}
      </div>

      {/* Options Selector: Weight & Specs */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>انتخاب رده وزن راکت:</span>
          <span className="text-sky-700 font-normal text-[11px]">{selectedWeight}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['استاندارد مسابقه‌ای (۳۶۵-۳۷۵ گرم)', 'سویینگ سبک سرعتی (۳۵۵-۳۶۵ گرم)'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedWeight(opt)}
              className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                selectedWeight === opt
                  ? isPadel
                    ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
                    : 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity & CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {/* Quantity Counter */}
        <div className="flex items-center justify-between w-full sm:w-auto bg-slate-100 rounded-2xl p-1 border border-slate-200">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            -
          </button>
          <span className="w-12 text-center font-black text-slate-900 text-sm">
            {quantity.toLocaleString('fa-IR')}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAdd}
          className={`flex-1 w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-98 ${
            justAdded || isInCart
              ? 'bg-slate-800 text-white hover:bg-slate-900'
              : isPadel
              ? 'bg-[#0B4278] hover:bg-[#0C4F8D] text-white shadow-sky-900/20'
              : 'bg-[#135d54] hover:bg-[#0e4841] text-white shadow-emerald-900/20'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-5 h-5 text-emerald-400" />
              <span>به سبد خرید اضافه شد</span>
            </>
          ) : isInCart ? (
            <>
              <Check className="w-5 h-5 text-sky-400" />
              <span>موجود در سبد خرید (تغییر تعداد)</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              <span>افزودن به سبد خرید</span>
            </>
          )}
        </button>
      </div>

      {/* Stock Status */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          موجود در انبار مرکزی رالی (آماده تحویل فوری)
        </span>
        <span className="text-slate-400 font-mono text-[11px]">
          کد اصالت: {product.id}
        </span>
      </div>

      {/* Trust & Guarantee Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-700">تضمین ۱۰۰٪ اصالت فیزیکی</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-700">ارسال اکسپرس و بسته‌بندی ایمن</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <RefreshCw className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-700">۷ روز ضمانت بازگشت</span>
        </div>
      </div>
    </div>
  );
});

ProductBuyBox.displayName = 'ProductBuyBox';

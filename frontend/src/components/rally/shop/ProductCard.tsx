import React, { useState } from 'react';
import { ShoppingCart, Check, Star, Zap } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';
import { getRacketVerdict } from '../../../data/racketVerdictData';
import { useProductRating } from '../../../utils/productRatingUtils';

interface ProductCardProps {
  product: ShopProduct;
  onAddToCart: (product: ShopProduct) => void;
  onSelectProduct: (product: ShopProduct) => void;
  isInCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onAddToCart,
  onSelectProduct,
  isInCart = false
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const isPadel = product.sport === 'PADEL';
  const isRacket = product.category === 'PADEL_RACKET' || (isPadel && (product.shape || product.weight));
  const verdict = isRacket ? getRacketVerdict(product) : null;
  const ratingSummary = useProductRating(product.id);

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className={`group bg-white rounded-[24px] border overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isPadel
          ? 'border-sky-100 hover:border-sky-300 hover:shadow-[0_10px_28px_rgba(14,165,233,0.08)]'
          : 'border-emerald-100 hover:border-emerald-300 hover:shadow-[0_10px_28px_rgba(16,185,129,0.08)]'
      }`}
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3 border-b border-gray-100">
          {hasImgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 bg-slate-100/70">
              <span className="text-xs font-black text-slate-700">{product.brand}</span>
              <span className="text-[10px] text-slate-400 mt-1 line-clamp-2 px-2">{product.name_fa}</span>
              <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-2">منتظر عکس</span>
            </div>
          ) : (
            <img
              src={product.image_url}
              alt={product.name_fa}
              onError={() => setHasImgError(true)}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          )}

          {/* Top Badges */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
            {product.year === 2027 && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-amber-200">
                <Zap className="w-3 h-3 fill-slate-950 text-slate-950 flex-shrink-0" />
                <span>NEW ۲۰۲۷</span>
              </span>
            )}
            {product.discount_percent > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                ٪{product.discount_percent} تخفیف
              </span>
            )}
          </div>

          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/95 text-slate-800 text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
              {product.brand}
            </span>
          </div>

          {/* Bottom Overlay with Stock and Verdict Score */}
          <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              {ratingSummary.reviewsCount > 0 && ratingSummary.averageRating !== null && (
                <div className="flex items-center gap-1 bg-slate-900/90 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{ratingSummary.averageRating.toFixed(1)}</span>
                </div>
              )}
              {verdict && (
                <div
                  className="flex items-center gap-1 bg-slate-900/95 text-[#D7ED68] border border-[#D7ED68]/40 text-[10px] px-2 py-0.5 rounded-full font-black shadow-xs pointer-events-auto"
                  title="نمره ارزیابی فنی و آزمایشگاهی (مرجع رسمی: PadelVerdict و لابراتوار Testea Padel)"
                >
                  <span className="text-[8px] text-slate-400 font-mono">VERDICT</span>
                  <span>{verdict.overallScore.toFixed(1)}</span>
                </div>
              )}
            </div>
            {product.stock <= 5 && (
              <span className="bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                تنها {product.stock} عدد در انبار
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="text-[11px] text-slate-400 font-medium tracking-normal mb-1 truncate" dir="ltr" style={{ textAlign: 'right' }}>
            {product.name_en}
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-rally-primary transition-colors">
            {product.name_fa}
          </h3>

          {/* Specs tags */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-gray-600">
            <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium">
              {product.weight}
            </span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium">
              {product.balance}
            </span>
            {product.is_women && (
              <span className="bg-pink-50 text-pink-700 border border-pink-200/60 px-2 py-0.5 rounded-md font-bold">
                بانوان
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="p-4 pt-0 border-t border-gray-100 mt-2">
        <div className="flex items-baseline justify-between mb-3 pt-3">
          <div className="flex flex-col">
            {product.discount_percent > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {product.original_price.toLocaleString('fa-IR')}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-gray-900">
                {product.price.toLocaleString('fa-IR')}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">تومان</span>
            </div>
          </div>

          <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            ارسال سریع
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
            justAdded || isInCart
              ? 'bg-slate-700 text-white hover:bg-slate-800'
              : isPadel
              ? 'bg-[#0B4278] text-white hover:bg-[#0C4F8D]'
              : 'bg-[#135d54] text-white hover:bg-[#0e4841]'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>به سبد اضافه شد</span>
            </>
          ) : isInCart ? (
            <>
              <Check className="w-4 h-4" />
              <span>در سبد خرید موجود است</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>افزودن به سبد خرید</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});
ProductCard.displayName = 'ProductCard';

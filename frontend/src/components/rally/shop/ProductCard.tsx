import React, { useState } from 'react';
import { ShoppingCart, Check, Star, ShieldCheck, Zap } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

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

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-rally-primary hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3 border-b border-gray-100">
          <img
            src={product.image_url}
            alt={product.name_fa}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />

          {/* Top Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            {product.discount_percent > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                ٪{product.discount_percent} تخفیف
              </span>
            )}
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
              {product.sport === 'PADEL' ? 'پدل' : 'تنیس'}
            </span>
          </div>

          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/95 text-slate-800 text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
              {product.brand}
            </span>
          </div>

          {/* Bottom Overlay with Stock */}
          <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1 bg-slate-900/90 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
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
          <div className="text-[11px] text-gray-500 font-mono tracking-tight mb-1 truncate">
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
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-sky-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{product.warranty}</span>
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
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
            justAdded || isInCart
              ? 'bg-sky-600 text-white hover:bg-sky-700'
              : 'bg-rally-primary text-white hover:bg-rally-primary-dark'
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

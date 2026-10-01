import React, { useEffect } from 'react';
import { ArrowRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductBuyBox } from './ProductBuyBox';
import { ProductTechnicalAnalysis } from './ProductTechnicalAnalysis';
import { ProductCard } from '../../../components/rally/shop/ProductCard';

interface RallyProductDetailPageProps {
  product: ShopProduct;
  allProducts: ShopProduct[];
  onBackToShop: () => void;
  onAddToCart: (product: ShopProduct, quantity?: number) => void;
  onSelectProduct: (product: ShopProduct) => void;
  onOpenCart: () => void;
  cartProductIds: Set<string>;
}

export const RallyProductDetailPage: React.FC<RallyProductDetailPageProps> = React.memo(({
  product,
  allProducts,
  onBackToShop,
  onAddToCart,
  onSelectProduct,
  onOpenCart,
  cartProductIds
}) => {
  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const isPadel = product.sport === 'PADEL';

  // Find related complementary products (same brand or complementary category like bags, balls, grips)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.brand === product.brand || p.sport === product.sport))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Top Navigation & Breadcrumbs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar">
          <button
            onClick={onBackToShop}
            className="hover:text-slate-900 transition-colors cursor-pointer flex-shrink-0"
          >
            فروشگاه رالی
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <span className="font-bold text-slate-700 flex-shrink-0">{product.brand}</span>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <span className="text-slate-900 font-bold line-clamp-1 max-w-[200px] sm:max-w-xs">
            {product.name_fa}
          </span>
        </nav>

        {/* Back to Shop Button */}
        <button
          onClick={onBackToShop}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به لیست محصولات</span>
        </button>
      </div>

      {/* Main Showcase Grid (Gallery + Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gallery Column (6 cols on desktop) */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <ProductImageGallery
            images={product.images || [product.image_url]}
            productName={product.name_fa}
            brand={product.brand}
            isPadel={isPadel}
          />
        </div>

        {/* Buy Box & Key Details Column (6 cols on desktop) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <ProductBuyBox
            product={product}
            onAddToCart={(p, qty) => onAddToCart(p, qty)}
            isInCart={cartProductIds.has(product.id)}
          />

          {/* Technical Analysis & Radar Specs */}
          <ProductTechnicalAnalysis product={product} />
        </div>
      </div>

      {/* Related & Complementary Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-600" />
                تجهیزات مکمل و پیشنهادی برند {product.brand}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ساک، اورگریپ و توپ‌های استاندارد سازگار با این محصول
              </p>
            </div>
            <button
              onClick={onBackToShop}
              className="text-xs font-bold text-sky-700 hover:underline cursor-pointer"
            >
              مشاهده همه
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relProd) => (
              <ProductCard
                key={relProd.id}
                product={relProd}
                onAddToCart={(p) => onAddToCart(p, 1)}
                onSelectProduct={(p) => onSelectProduct(p)}
                isInCart={cartProductIds.has(relProd.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

RallyProductDetailPage.displayName = 'RallyProductDetailPage';

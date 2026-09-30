import React from 'react';
import { ShoppingBag, ChevronLeft, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { ShopProduct } from '../../types/rally';
import { MOCK_SHOP_PRODUCTS } from '../../data/mockRallyShopData';

interface ModernShopShowcaseProps {
  onSelectProduct?: (product: ShopProduct) => void;
  onAddToCart?: (product: ShopProduct) => void;
  onViewAllProducts: () => void;
  cartProductIds?: Set<string>;
}

export const ModernShopShowcase: React.FC<ModernShopShowcaseProps> = ({
  onSelectProduct,
  onAddToCart,
  onViewAllProducts,
  cartProductIds = new Set()
}) => {
  // Select top 3 premier rackets
  const featuredProducts = MOCK_SHOP_PRODUCTS.slice(0, 3);

  return (
    <section className="w-full py-12 md:py-16 bg-[#F5F4EF] border-t border-[#E8E6DD]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B4278]" />
              <h2 className="text-2xl sm:text-3xl font-black text-[#172320] tracking-tight">
                فروشگاه تخصصی تجهیزات پدل
              </h2>
            </div>
            <p className="text-sm text-[#66706D] mt-1 font-medium">
              راکت‌های رسمی مسابقات جهانی ۲۰۲۶، کفش و توپ استاندارد با ضمانت اصالت ۱۰۰٪
            </p>
          </div>

          <button
            onClick={onViewAllProducts}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0B4278] hover:text-[#0C4F8D] transition-colors cursor-pointer group self-start sm:self-auto"
          >
            <span>مشاهده همه محصولات فروشگاه</span>
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        {/* 3 Featured Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {featuredProducts.map((product) => {
            const inCart = cartProductIds.has(product.id);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct?.(product)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8E6DD] hover:border-[#0B4278]/40 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Product Image Area */}
                <div className="relative w-full h-64 bg-slate-900/5 p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name_fa}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Brand Tag (Padel Blue) */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#0B4278] text-white text-[11px] font-black">
                    {product.brand}
                  </span>

                  {/* Level Tag (Touch of Turf Green) */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-[#0E3D38] text-[#D7ED68] text-[10px] font-bold border border-[#0E3D38]">
                    {product.level === 'PRO' ? 'حرفه‌ای' : 'نیمه‌حرفه‌ای'}
                  </span>
                </div>

                {/* Product Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#172320] group-hover:text-[#0B4278] transition-colors line-clamp-1 mb-1.5">
                      {product.name_fa}
                    </h3>
                    <p className="text-xs text-[#66706D] font-medium line-clamp-2 leading-relaxed mb-4">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-3 border-t border-[#F5F4EF] flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] text-[#66706D] font-bold">قیمت با گارانتی:</span>
                      <span className="text-base font-black text-[#0B4278]">
                        {(product.price / 10).toLocaleString('fa-IR')} <span className="text-xs font-semibold">تومان</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(product);
                      }}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                        inCart
                          ? 'bg-[#0B4278] text-[#D7ED68]'
                          : 'bg-[#D7ED68] hover:bg-[#c9df5b] text-[#172320]'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>در سبد</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>افزودن</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand Authenticity Guarantee Bar */}
        <div className="mt-8 bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E6DD] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#172320]">
          <div className="flex items-center gap-2 text-[#0B4278]">
            <ShieldCheck className="w-5 h-5 text-[#0E3D38]" />
            <span>تمامی راکت‌ها و توپ‌های پدل دارای هولوگرام و اصالت تضمینی رالی می‌باشند.</span>
          </div>
          <button
            onClick={onViewAllProducts}
            className="text-xs font-black text-[#0B4278] hover:underline cursor-pointer"
          >
            ورود به ویترین کامل فروشگاه ←
          </button>
        </div>

      </div>
    </section>
  );
};

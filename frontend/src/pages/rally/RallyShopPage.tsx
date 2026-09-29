import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, ShieldCheck, Truck, RotateCcw, Filter, Sparkles } from 'lucide-react';
import { ShopProduct, ProductCategory, SportType } from '../../types/rally';
import { ProductCard } from '../../components/rally/shop/ProductCard';
import { ShopCategoryPills } from '../../components/rally/shop/ShopCategoryPills';

interface RallyShopPageProps {
  products: ShopProduct[];
  onAddToCart: (product: ShopProduct) => void;
  onSelectProduct: (product: ShopProduct) => void;
  cartProductIds: Set<string>;
  onOpenCart: () => void;
}

export const RallyShopPage: React.FC<RallyShopPageProps> = ({
  products,
  onAddToCart,
  onSelectProduct,
  cartProductIds,
  onOpenCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('ALL');
  const [selectedSport, setSelectedSport] = useState<'ALL' | SportType>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'DISCOUNT'>('POPULAR');

  const BRANDS = ['ALL', 'Bullpadel', 'Babolat', 'Nox', 'Head', 'Wilson', 'Asics', 'Yonex'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
      if (selectedSport !== 'ALL' && p.sport !== selectedSport) return false;
      if (selectedBrand !== 'ALL' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          p.name_fa.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'DISCOUNT') return b.discount_percent - a.discount_percent;
      return b.rating - a.rating;
    });
  }, [products, selectedCategory, selectedSport, selectedBrand, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Hero Banner Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/images/rally_shop_banner.jpg"
            alt="فروشگاه تجهیزات پدل و تنیس رالی"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-0" />

        <div className="relative z-10 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-10 sm:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rally-accent/20 border border-rally-accent/30 text-rally-accent text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>فروشگاه رسمی و تخصصی تجهیزات رالی</span>
            </div>
            <h1 className="text-2xl sm:text-4xl 2xl:text-5xl font-black text-white leading-tight mb-3">
              راکت‌های اورجینال پدل و تنیس با گارانتی سلامت رالی
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
              مجموعه‌ای دست‌چین از معتبرترین برندهای جهانی با تضمین اصالت ۱۰۰٪، مشاوره تخصصی انتخاب راکت بر اساس سبک بازی و ارسال اکسپرس در سراسر کشور.
            </p>

            {/* Badges bar */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-200 font-medium">ضمانت اصالت فیزیکی</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs">
                <Truck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-200 font-medium">ارسال ۲ ساعته تهران</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs">
                <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-gray-200 font-medium">۷ روز ضمانت بازگشت</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filters */}
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8">
        
        {/* Search & Top Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی مدل راکت، برند یا محصول..."
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rally-primary focus:bg-white"
            />
          </div>

          {/* Sorting & Counter */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-gray-500 font-bold whitespace-nowrap">
              {filteredProducts.length} کالا
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="POPULAR">محبوب‌ترین‌ها</option>
              <option value="PRICE_ASC">ارزان‌ترین</option>
              <option value="PRICE_DESC">گران‌ترین</option>
              <option value="DISCOUNT">بیشترین تخفیف</option>
            </select>
          </div>
        </div>

        {/* Category Pills and Brand Filter */}
        <ShopCategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
          brands={BRANDS}
        />

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.5] text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-800 text-sm">کالایی با این مشخصات یافت نشد</h3>
            <p className="text-xs text-gray-400 mt-1">لطفاً فیلترها را تغییر داده یا دسته‌بندی دیگری را انتخاب کنید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 2xl:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
                isInCart={cartProductIds.has(product.id)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

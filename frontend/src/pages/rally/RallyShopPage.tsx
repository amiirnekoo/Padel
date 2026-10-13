import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, ShieldCheck, Truck, RotateCcw, Filter, Sparkles } from 'lucide-react';
import { ShopProduct, ProductCategory, SportType } from '../../types/rally';
import { ProductCard } from '../../components/rally/shop/ProductCard';
import { ShopCategoryPills } from '../../components/rally/shop/ShopCategoryPills';
import { getLatestCatalogYear } from '../../utils/catalogYearUtils';
import { RacketFinderModal } from '../../components/rally/shop/racketFinder/RacketFinderModal';
import { RacketCompareBar } from '../../components/rally/shop/comparison/RacketCompareBar';
import { RacketCompareModal } from '../../components/rally/shop/comparison/RacketCompareModal';

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
  const [sortBy, setSortBy] = useState<'NEWEST' | 'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'DISCOUNT'>('NEWEST');
  const [isRacketFinderOpen, setIsRacketFinderOpen] = useState(false);
  const [comparingProducts, setComparingProducts] = useState<ShopProduct[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const BRANDS = ['ALL', 'Head', 'Nox'];

  const handleToggleCompare = (product: ShopProduct) => {
    setComparingProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 2) {
        return [prev[0], product];
      }
      return [...prev, product];
    });
  };

  const latestCatalogYear = useMemo(() => getLatestCatalogYear(products), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
      if (selectedSport !== 'ALL' && p.sport !== selectedSport) return false;
      if (selectedBrand !== 'ALL' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(q));
        const yearMatch = (p.year && p.year.toString().includes(q)) || 
          (p.year && q === p.year.toLocaleString('fa-IR', { useGrouping: false }));
        const womenMatch = (q === 'بانوان' || q === 'زنانه' || q === 'women') && p.is_women;
        const newMatch = (q === 'new' || q === 'جدید') && (p.is_new || p.year === latestCatalogYear);
        const match =
          p.name_fa.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          tagMatch ||
          yearMatch ||
          womenMatch ||
          newMatch;
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'DISCOUNT') return b.discount_percent - a.discount_percent;

      // اولویت اول نمایش پیش‌فرض همیشه با راکت‌های جدیدترین سال کاتالوگ است
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      if (yearA !== yearB) {
        return yearB - yearA;
      }
      if (b.is_new !== a.is_new) {
        return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0);
      }
      return b.rating - a.rating;
    });
  }, [products, selectedCategory, selectedSport, selectedBrand, searchQuery, sortBy, latestCatalogYear]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Hero Banner Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-55">
          <img
            src="/images/rally_shop_banner.jpg"
            alt="فروشگاه تخصصی راکت‌های پدل و تجهیزات رالی"
            className="w-full h-full object-cover object-[center_35%]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 z-0" />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950/90 via-slate-950/50 to-transparent z-0" />

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

            {/* Racket Finder CTA in Hero */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsRacketFinderOpen(true)}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-rally-primary hover:bg-lime-400 text-black font-black text-xs sm:text-sm shadow-xl hover:shadow-lime-500/20 transition-all cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>راکت‌سنج هوشمند رالی: کدام راکت مناسب شماست؟</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filters */}
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8">
        
        {/* Banner: Racket Finder Interactive Teaser */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 text-right w-full sm:w-auto">
            <div className="w-11 h-11 rounded-2xl bg-rally-primary/10 border border-rally-primary/20 flex items-center justify-center text-rally-primary shrink-0">
              <Sparkles className="w-5 h-5 text-rally-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">در انتخاب راکت پدل مردد هستید؟</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rally-primary/20 text-rally-primary">
                  ارزیابی بیومکانیک
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                با پاسخ به ۴ سوال کوتاه، راکت ایده‌آل دست خود را منطبق بر داده‌های آزمایشگاهی Testea Padel بیابید.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRacketFinderOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rally-primary hover:bg-lime-400 text-black font-black text-xs whitespace-nowrap transition-all shadow-md cursor-pointer shrink-0"
          >
            شروع تست راکت‌سنج
          </button>
        </div>

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
              <option value="NEWEST">جدیدترین‌ها (کلکسیون {latestCatalogYear.toLocaleString('fa-IR', { useGrouping: false })})</option>
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
                latestCatalogYear={latestCatalogYear}
                onToggleCompare={handleToggleCompare}
                isComparing={comparingProducts.some((p) => p.id === product.id)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Racket Finder Interactive Modal */}
      <RacketFinderModal
        isOpen={isRacketFinderOpen}
        onClose={() => setIsRacketFinderOpen(false)}
        onSelectProduct={(productId) => {
          const product = products.find((p) => p.id === productId);
          if (product) onSelectProduct(product);
        }}
        onAddToCart={(prod) => {
          const product = products.find((p) => p.id === prod.id) || prod;
          onAddToCart(product);
        }}
      />

      {/* Racket Comparison Sticky Bar & Modal */}
      <RacketCompareBar
        comparingProducts={comparingProducts}
        onRemove={(id) => setComparingProducts((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setComparingProducts([])}
        onOpenModal={() => setIsCompareModalOpen(true)}
      />

      {isCompareModalOpen && (
        <RacketCompareModal
          products={comparingProducts}
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};

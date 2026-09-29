import React from 'react';
import { ProductCategory, SportType } from '../../../types/rally';
import { Package, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

interface ShopCategoryPillsProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  selectedSport: 'ALL' | SportType;
  onSelectSport: (sport: 'ALL' | SportType) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  brands: string[];
}

export const CATEGORIES_LIST: { id: ProductCategory; label: string; icon: string }[] = [
  { id: 'ALL', label: 'همه تجهیزات', icon: '🎾' },
  { id: 'PADEL_RACKET', label: 'راکت‌های پدل', icon: '⚡' },
  { id: 'TENNIS_RACKET', label: 'راکت‌های تنیس', icon: '🏆' },
  { id: 'BALLS', label: 'توپ‌های مسابقه', icon: '🟡' },
  { id: 'BAGS', label: 'ساک و کوله‌پشتی', icon: '🎒' },
  { id: 'SHOES', label: 'کفش تخصصی کورت', icon: '👟' },
  { id: 'ACCESSORIES', label: 'اورگریپ و متعلقات', icon: '🎯' }
];

export const ShopCategoryPills: React.FC<ShopCategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSport,
  onSelectSport,
  selectedBrand,
  onSelectBrand,
  brands
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* 1. Sport & Primary Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Categories Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES_LIST.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-rally-primary text-white shadow-md shadow-rally-primary/20 scale-[1.02]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sport Switcher Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 self-start md:self-auto flex-shrink-0">
          <button
            onClick={() => onSelectSport('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedSport === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            همه ورزش‌ها
          </button>
          <button
            onClick={() => onSelectSport('PADEL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              selectedSport === 'PADEL'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>پدل</span>
          </button>
          <button
            onClick={() => onSelectSport('TENNIS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              selectedSport === 'TENNIS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>تنیس</span>
          </button>
        </div>
      </div>

      {/* 2. Authentic Brands Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-extrabold text-gray-400 whitespace-nowrap ml-2 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-rally-primary" />
          <span>برندهای معتبر:</span>
        </span>
        {brands.map((brand) => {
          const isSelected = selectedBrand.toLowerCase() === brand.toLowerCase();
          return (
            <button
              key={brand}
              onClick={() => onSelectBrand(brand)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {brand === 'ALL' ? 'تمامی برندها' : brand}
            </button>
          );
        })}
      </div>
    </div>
  );
};

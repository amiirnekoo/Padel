import React from 'react';
import { Layers, Shield, Sun, Trophy, Building, MapPin, Sparkles } from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sport?: 'ALL' | 'PADEL' | 'TENNIS';
  type?: 'ALL' | 'INDOOR' | 'OUTDOOR';
  city?: string;
  tag?: string;
}

export const APPLE_CATEGORIES: CategoryItem[] = [
  { id: 'ALL', label: 'همه زمین‌ها', icon: Layers, sport: 'ALL', type: 'ALL' },
  { id: 'PADEL_INDOOR', label: 'پدل سرپوشیده', icon: Shield, sport: 'PADEL', type: 'INDOOR', tag: 'محبوب' },
  { id: 'PADEL_OUTDOOR', label: 'پدل پانورامیک', icon: Sun, sport: 'PADEL', type: 'OUTDOOR' },
  { id: 'TENNIS_ALL', label: 'کورت‌های تنیس', icon: Trophy, sport: 'TENNIS', type: 'ALL' },
  { id: 'TEHRAN', label: 'کلوپ‌های تهران', icon: Building, city: 'تهران' },
  { id: 'SHIRAZ', label: 'اسپین شیراز', icon: MapPin, city: 'شیراز' },
  { id: 'ISFAHAN', label: 'پرواز اصفهان', icon: MapPin, city: 'اصفهان' },
  { id: 'KISH', label: 'سنترال کیش', icon: Sparkles, city: 'کیش', tag: 'لوکس' },
];

interface AppleCategoryShelfProps {
  selectedId: string;
  onSelect: (cat: CategoryItem) => void;
}

export const AppleCategoryShelf: React.FC<AppleCategoryShelfProps> = ({
  selectedId,
  onSelect,
}) => {
  return (
    <div className="w-full py-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-start sm:justify-center gap-6 sm:gap-8 min-w-max px-2">
        {APPLE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="flex flex-col items-center gap-2 group transition-all cursor-pointer focus:outline-none"
            >
              {/* Apple Icon Container */}
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-rally-primary text-white shadow-md shadow-rally-primary/20 scale-105'
                    : 'bg-white text-rally-charcoal border border-black/[0.06] hover:border-rally-primary/40 hover:shadow-xs group-hover:scale-102'
                }`}
              >
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${isSelected ? 'text-white' : 'text-rally-primary'}`} />
                {cat.tag && (
                  <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white shadow-xs">
                    {cat.tag}
                  </span>
                )}
              </div>

              {/* Category Label */}
              <span
                className={`text-xs font-bold transition-colors ${
                  isSelected ? 'text-rally-primary font-black' : 'text-rally-charcoal/80 group-hover:text-rally-primary'
                }`}
              >
                {cat.label}
              </span>

              {/* Apple Style Active Dot/Line */}
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isSelected ? 'bg-rally-primary scale-100' : 'bg-transparent scale-0'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { Map, MapPin, Sparkles, ArrowUpDown } from 'lucide-react';

export type CourtSortOption = 'POPULAR' | 'NEAREST' | 'CHEAPEST' | 'NEWEST';

interface CourtsToolbarProps {
  currentSort: CourtSortOption;
  onSelectSort: (option: CourtSortOption) => void;
  onOpenMap: () => void;
  clubsCount: number;
  isLocating?: boolean;
}

export const CourtsToolbar: React.FC<CourtsToolbarProps> = ({
  currentSort,
  onSelectSort,
  onOpenMap,
  clubsCount,
  isLocating
}) => {
  const SORT_ITEMS: { id: CourtSortOption; label: string; icon?: string }[] = [
    { id: 'POPULAR', label: 'محبوب‌ترین', icon: '⭐' },
    { id: 'NEAREST', label: isLocating ? 'تعیین موقعیت...' : 'نزدیک‌ترین به من', icon: '📍' },
    { id: 'CHEAPEST', label: 'ارزان‌ترین', icon: '🏷️' },
    { id: 'NEWEST', label: 'جدیدترین', icon: '✨' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 pb-1" dir="rtl">
      {/* 1. Sorting Pills (Right side) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1 text-xs font-bold text-gray-400 ml-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>مرتب‌سازی:</span>
        </div>

        {SORT_ITEMS.map((item) => {
          const isActive = currentSort === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSort(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer border ${
                isActive
                  ? 'bg-rally-primary text-white border-rally-primary shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-slate-900'
              }`}
            >
              {item.icon && <span className="text-[11px]">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Map Toggle Action Button (Left side) */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5">
        <span className="text-xs font-bold text-gray-400 hidden md:inline">
          {clubsCount} مجموعه معتبر
        </span>

        <button
          onClick={onOpenMap}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-rally-primary/40 text-rally-primary hover:bg-rally-primary hover:text-white transition-all shadow-xs text-xs font-extrabold cursor-pointer group shrink-0"
        >
          <Map className="w-3.5 h-3.5 text-rally-primary group-hover:text-white transition-colors" />
          <span>نمایش روی نقشه</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>
    </div>
  );
};

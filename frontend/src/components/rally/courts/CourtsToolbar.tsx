import React from 'react';
import { Map, ArrowUpDown, Filter } from 'lucide-react';

export type CourtSortOption = 'POPULAR' | 'NEAREST' | 'CHEAPEST' | 'NEWEST';

interface CourtsToolbarProps {
  currentSort: CourtSortOption;
  onSelectSort: (option: CourtSortOption) => void;
  onOpenMap: () => void;
  clubsCount: number;
  isLocating?: boolean;
  typeFilter?: 'ALL' | 'INDOOR' | 'OUTDOOR';
  onSelectTypeFilter?: (type: 'ALL' | 'INDOOR' | 'OUTDOOR') => void;
}

export const CourtsToolbar: React.FC<CourtsToolbarProps> = ({
  currentSort,
  onSelectSort,
  onOpenMap,
  clubsCount,
  isLocating,
  typeFilter = 'ALL',
  onSelectTypeFilter,
}) => {
  const SORT_ITEMS: { id: CourtSortOption; label: string; icon?: string }[] = [
    { id: 'POPULAR', label: 'محبوب‌ترین', icon: '⭐' },
    { id: 'NEAREST', label: isLocating ? 'تعیین موقعیت...' : 'نزدیک‌ترین به من', icon: '📍' },
    { id: 'CHEAPEST', label: 'ارزان‌ترین', icon: '🏷️' },
    { id: 'NEWEST', label: 'جدیدترین', icon: '✨' },
  ];

  const TYPE_ITEMS: { id: 'ALL' | 'INDOOR' | 'OUTDOOR'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'همه کورت‌ها', icon: '🎾' },
    { id: 'INDOOR', label: 'سرپوشیده', icon: '🏠' },
    { id: 'OUTDOOR', label: 'روباز', icon: '☀️' },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1 pb-1" dir="rtl">
      {/* 1. Sorting & Court Type Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        
        {/* Court Type Quick Filter Chips */}
        {onSelectTypeFilter && (
          <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
            <div className="flex items-center gap-1 text-xs font-bold text-gray-400 ml-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>نوع کورت:</span>
            </div>
            {TYPE_ITEMS.map((item) => {
              const isActive = typeFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTypeFilter(item.id)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-slate-900'
                  }`}
                >
                  <span className="text-[11px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Sorting Pills */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400 ml-1 shrink-0">
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
      </div>

      {/* 2. Map Toggle Action Button */}
      <div className="flex items-center justify-between lg:justify-end gap-2.5">
        <span className="text-xs font-bold text-gray-400 hidden sm:inline">
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

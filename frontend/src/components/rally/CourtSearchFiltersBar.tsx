import React from 'react';
import { Search, X } from 'lucide-react';
import { SportType } from '../../types/rally';

export type TimeWindowFilter = 'ALL' | 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type QuickShortcut = 'TODAY' | 'TOMORROW' | 'TONIGHT' | 'FIRST_AVAILABLE' | 'NEAREST' | 'NONE';

export interface CourtSearchFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCity?: string;
  onCityChange?: (c: string) => void;
  sportFilter?: SportType | 'ALL';
  onSportChange?: (s: SportType | 'ALL') => void;
  typeFilter?: 'ALL' | 'INDOOR' | 'OUTDOOR';
  onTypeChange?: (t: 'ALL' | 'INDOOR' | 'OUTDOOR') => void;
  timeWindow?: TimeWindowFilter;
  onTimeWindowChange?: (w: TimeWindowFilter) => void;
  activeShortcut?: QuickShortcut;
  onShortcutSelect?: (sc: QuickShortcut) => void;
  selectedAmenity?: string;
  onAmenityChange?: (a: string) => void;
  isLocating?: boolean;
  locationError?: string | null;
}

export const CourtSearchFiltersBar: React.FC<CourtSearchFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  locationError
}) => {
  return (
    <div className="space-y-3" dir="rtl">
      {/* 1. Main Premium Search Input */}
      <div className="relative w-full group">
        {/* Modern Search Icon Badge */}
        <div className="absolute inset-y-0 right-2.5 sm:right-3 flex items-center pointer-events-none z-10">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-rally-primary to-[#082f55] text-white flex items-center justify-center shadow-md shadow-rally-primary/25 transition-transform duration-300 group-focus-within:scale-105">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="نام باشگاه یا محله را جستجو کنید..."
          style={{ paddingRight: '4.75rem' }}
          className="w-full h-14 sm:h-16 pr-20 sm:pr-24 pl-12 sm:pl-14 rounded-full bg-white border-2 border-slate-200/90 text-sm sm:text-base font-extrabold text-slate-800 placeholder-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(11,66,120,0.07)] hover:border-rally-primary/40 focus:outline-none focus:border-rally-primary focus:ring-4 focus:ring-rally-primary/10 focus:shadow-[0_12px_36px_rgba(11,66,120,0.12)] transition-all duration-300"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 left-3 sm:left-4 my-auto h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 z-10"
            title="پاک کردن جستجو"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {locationError && (
        <div className="w-full text-[11px] font-bold text-amber-800 bg-amber-50/90 border border-amber-200 px-3 py-1.5 rounded-xl">
          {locationError}
        </div>
      )}
    </div>
  );
};


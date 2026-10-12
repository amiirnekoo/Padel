import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, MapPin, Clock, Sun, Moon, Sparkles } from 'lucide-react';
import { SportType } from '../../types/rally';

export type TimeWindowFilter = 'ALL' | 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type QuickShortcut = 'TODAY' | 'TOMORROW' | 'TONIGHT' | 'FIRST_AVAILABLE' | 'NEAREST' | 'NONE';

interface CourtSearchFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCity: string;
  onCityChange: (c: string) => void;
  sportFilter: SportType | 'ALL';
  onSportChange: (s: SportType | 'ALL') => void;
  typeFilter: 'ALL' | 'INDOOR' | 'OUTDOOR';
  onTypeChange: (t: 'ALL' | 'INDOOR' | 'OUTDOOR') => void;
  timeWindow: TimeWindowFilter;
  onTimeWindowChange: (w: TimeWindowFilter) => void;
  activeShortcut: QuickShortcut;
  onShortcutSelect: (sc: QuickShortcut) => void;
  selectedAmenity: string;
  onAmenityChange: (a: string) => void;
  isLocating?: boolean;
  locationError?: string | null;
}

export const CourtSearchFiltersBar: React.FC<CourtSearchFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
  sportFilter,
  onSportChange,
  typeFilter,
  onTypeChange,
  timeWindow,
  onTimeWindowChange,
  activeShortcut,
  onShortcutSelect,
  selectedAmenity,
  onAmenityChange,
  isLocating,
  locationError
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const CITIES = [
    { id: 'تهران', label: 'تهران (۳ مجموعه معتبر)' },
    { id: 'ALL', label: 'همه شهرها' }
  ];

  const SHORTCUTS: { id: QuickShortcut; label: string; icon: string }[] = [
    { id: 'TODAY', label: 'امروز', icon: '⚡' },
    { id: 'TOMORROW', label: 'فردا', icon: '📅' },
    { id: 'TONIGHT', label: 'امشب (۱۹ به بعد)', icon: '🌙' },
    { id: 'FIRST_AVAILABLE', label: 'اولین سانس آزاد', icon: '🎯' },
    { id: 'NEAREST', label: isLocating ? 'در حال تعیین موقعیت...' : 'نزدیک‌ترین زمین (مستقیم)', icon: '📍' }
  ];

  const TIME_WINDOWS: { id: TimeWindowFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'همه ساعات', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'MORNING', label: 'صبح (۰۸ تا ۱۲)', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'AFTERNOON', label: 'عصر (۱۲ تا ۱۸)', icon: <Sun className="w-3.5 h-3.5 text-orange-500" /> },
    { id: 'NIGHT', label: 'شب (۱۸ تا ۲۴)', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> }
  ];

  const AMENITIES = [
    { id: 'ALL', label: 'همه امکانات' },
    { id: 'parking', label: 'پارکینگ اختصاصی' },
    { id: 'shower', label: 'رختکن و دوش' },
    { id: 'racket_rental', label: 'اجاره راکت' },
    { id: 'cafe', label: 'کافه و رستوران' }
  ];

  return (
    <div className="space-y-4" dir="rtl">
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

      {/* 2. Quick Action Shortcuts & City/Sport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-black/[0.05] shadow-xs">
        {/* Quick Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-gray-400 ml-1 shrink-0">میانبرهای سریع:</span>
          {SHORTCUTS.map((sc) => {
            const isActive = activeShortcut === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onShortcutSelect(sc.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-rally-primary text-white shadow-xs'
                    : 'bg-gray-100/90 text-rally-charcoal hover:bg-gray-200'
                }`}
              >
                <span>{sc.icon}</span>
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>

        {/* More Filters Toggle */}
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            showMoreFilters
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>فیلترهای بیشتر</span>
          {showMoreFilters && <span className="w-1.5 h-1.5 rounded-full bg-rally-accent" />}
        </button>
        {locationError && (
          <div className="w-full text-[11px] font-bold text-amber-800 bg-amber-50/90 border border-amber-200 px-3 py-1.5 rounded-xl">
            {locationError}
          </div>
        )}
      </div>

      {/* 3. Time Windows & City Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Time Window Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-gray-400 ml-1 shrink-0">بازه زمانی:</span>
          {TIME_WINDOWS.map((tw) => {
            const isActive = timeWindow === tw.id;
            return (
              <button
                key={tw.id}
                onClick={() => onTimeWindowChange(tw.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-rally-primary/10 text-rally-primary border border-rally-primary/40 font-extrabold'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tw.icon}
                <span>{tw.label}</span>
              </button>
            );
          })}
        </div>

        {/* Padel Exclusive Badge */}
        <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full text-xs font-bold text-sky-800 shrink-0 self-start sm:self-auto">
          <span>🎾 ۳ مجموعه اختصاصی پدل تهران</span>
        </div>
      </div>

      {/* 4. Expandable "More Filters" Drawer */}
      {showMoreFilters && (
        <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Court Structure: Indoor vs Outdoor */}
          <div>
            <label className="block text-gray-400 font-bold mb-1.5">نوع سالن / کورت</label>
            <div className="flex gap-1.5">
              {[
                { id: 'ALL', label: 'همه' },
                { id: 'INDOOR', label: 'مسقف سازه‌ای' },
                { id: 'OUTDOOR', label: 'روباز / پانورامیک' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTypeChange(item.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    typeFilter === item.id
                      ? 'border-rally-primary bg-rally-primary/5 text-rally-primary'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-gray-400 font-bold mb-1.5">شهر یا محدوده</label>
            <div className="flex gap-1.5">
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCityChange(c.id)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    selectedCity === c.id
                      ? 'border-rally-primary bg-rally-primary/5 text-rally-primary'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Filter */}
          <div>
            <label className="block text-gray-400 font-bold mb-1.5">امکانات رفاهی شاخص</label>
            <select
              value={selectedAmenity}
              onChange={(e) => onAmenityChange(e.target.value)}
              className="w-full h-8 px-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-rally-charcoal focus:outline-none focus:border-rally-primary"
            >
              {AMENITIES.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

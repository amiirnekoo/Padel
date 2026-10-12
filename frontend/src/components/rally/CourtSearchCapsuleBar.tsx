import React, { useState } from 'react';
import { Search, X, Calendar, Clock, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { CourtsDatePickerModal } from './courts/CourtsDatePickerModal';
import { TimeWindowFilter } from './CourtSearchFiltersBar';
export type { TimeWindowFilter };

interface CourtSearchCapsuleBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDayOffset: number;
  onSelectDayOffset: (offset: number) => void;
  selectedDateLabel?: string;
  timeWindow: TimeWindowFilter;
  onTimeWindowChange: (w: TimeWindowFilter) => void;
  locationError?: string | null;
}

export const CourtSearchCapsuleBar: React.FC<CourtSearchCapsuleBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedDayOffset,
  onSelectDayOffset,
  selectedDateLabel,
  timeWindow,
  onTimeWindowChange,
  locationError
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const TIME_OPTIONS: { id: TimeWindowFilter; label: string; icon: string }[] = [
    { id: 'ALL', label: 'همه ساعات', icon: '⏱️' },
    { id: 'MORNING', label: 'صبح (۰۸ تا ۱۲)', icon: '🌅' },
    { id: 'AFTERNOON', label: 'عصر (۱۲ تا ۱۸)', icon: '☀️' },
    { id: 'NIGHT', label: 'شب (۱۸ تا ۲۴)', icon: '🌙' },
  ];

  const QUICK_CLUBS = [
    { name: 'مجموعه FGB انقلاب', area: 'خیابان سئول' },
    { name: 'پدل کلاب لفور', area: 'آجودانیه' },
    { name: 'پدل کلاب ویوا', area: 'مینی‌سیتی' },
  ];

  const currentTimeLabel = TIME_OPTIONS.find((t) => t.id === timeWindow)?.label || 'همه ساعات';

  const defaultDateLabel = selectedDayOffset === 0
    ? 'امروز (سه‌شنبه)'
    : selectedDayOffset === 1
    ? 'فردا (چهارشنبه)'
    : selectedDayOffset === 2
    ? 'پس‌فردا (پنجشنبه)'
    : selectedDayOffset === 3
    ? 'آخر هفته (جمعه)'
    : `روز +${selectedDayOffset}`;

  const displayDateText = selectedDateLabel || defaultDateLabel;

  return (
    <div className="relative w-full" dir="rtl">
      {/* 1. Main Luxury Capsule Container (Airbnb / Jabama Style) */}
      <div className="bg-white rounded-3xl sm:rounded-full border-2 border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(11,66,120,0.10)] transition-all p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-gray-100">
        
        {/* Segment 1: Where / Club & Area Search */}
        <div className="relative flex-1 py-1.5 sm:py-0 px-3 sm:px-4">
          <label className="block text-[10px] font-black text-gray-400 mb-0.5">
            کدام مجموعه یا منطقه؟
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rally-primary shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSuggestOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSuggestOpen(true);
              }}
              placeholder="جستجوی انقلاب، آجودانیه، ویوا..."
              className="w-full bg-transparent text-xs sm:text-sm font-extrabold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Suggestions Dropdown */}
          {isSuggestOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsSuggestOpen(false)}
              />
              <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <span className="block text-[10px] font-black text-gray-400 px-2.5 py-1">
                  ۳ مجموعه شاخص پدل تهران:
                </span>
                {QUICK_CLUBS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      onSearchChange(c.name);
                      setIsSuggestOpen(false);
                    }}
                    className="w-full text-right p-2 rounded-xl hover:bg-gray-50 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{c.area}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Segment 2: When / Date Picker Modal Trigger */}
        <div
          onClick={() => setIsDatePickerOpen(true)}
          className="flex-1 py-2 sm:py-0 px-3 sm:px-4 cursor-pointer hover:bg-slate-50/80 rounded-2xl sm:rounded-none transition-colors group"
        >
          <label className="block text-[10px] font-black text-gray-400 mb-0.5 cursor-pointer">
            تاریخ سانس
          </label>
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rally-primary group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                {displayDateText}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Segment 3: What Time / Time Window Dropdown */}
        <div className="relative flex-1 py-2 sm:py-0 px-3 sm:px-4">
          <label className="block text-[10px] font-black text-gray-400 mb-0.5">
            بازه زمانی روز
          </label>
          <button
            type="button"
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="w-full flex items-center justify-between gap-1.5 text-right cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rally-primary shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                {currentTimeLabel}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Time Window Dropdown Menu */}
          {isTimeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsTimeDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-56 mt-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onTimeWindowChange(opt.id);
                      setIsTimeDropdownOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      timeWindow === opt.id
                        ? 'bg-rally-primary text-white'
                        : 'text-slate-800 hover:bg-gray-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span>{opt.icon}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Button: Rounded Gradient Search Button */}
        <div className="pt-2 sm:pt-0 pl-1 sm:pl-1 flex justify-end">
          <button
            type="button"
            className="w-full sm:w-12 sm:h-12 h-11 rounded-full bg-gradient-to-br from-rally-primary to-[#082f55] hover:from-[#093561] hover:to-[#05213d] text-white flex items-center justify-center gap-2 font-black shadow-md shadow-rally-primary/30 transition-all cursor-pointer active:scale-95"
            title="جستجوی کورت‌ها"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span className="inline sm:hidden text-xs">یافتن کورت‌ها</span>
          </button>
        </div>
      </div>

      {/* Location Error alert if applicable */}
      {locationError && (
        <div className="mt-2 text-[11px] font-bold text-amber-800 bg-amber-50/90 border border-amber-200 px-3 py-1.5 rounded-xl">
          {locationError}
        </div>
      )}

      {/* Jabama-Style Persian Date Picker Modal */}
      <CourtsDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedOffset={selectedDayOffset}
        onSelectOffset={(offset) => {
          onSelectDayOffset(offset);
        }}
      />
    </div>
  );
};

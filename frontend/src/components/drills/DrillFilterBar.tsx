import React from 'react';
import { DrillFilters, DrillSport, DrillCategory, DrillLevel, DrillParticipation } from '../../types/drills';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface DrillFilterBarProps {
  filters: DrillFilters;
  onChange: (updates: Partial<DrillFilters>) => void;
  onReset: () => void;
  totalCount?: number;
}

const CATEGORIES: { id: DrillCategory; label: string }[] = [
  { id: 'technique', label: 'تکنیک' },
  { id: 'tactics', label: 'تاکتیک' },
  { id: 'fitness', label: 'آمادگی بدنی' },
  { id: 'mental', label: 'مهارت‌های ذهنی' }
];

const LEVELS: { id: DrillLevel; label: string }[] = [
  { id: 'beginner', label: 'مبتدی' },
  { id: 'intermediate', label: 'متوسط' },
  { id: 'advanced', label: 'پیشرفته' },
  { id: 'pro', label: 'حرفه‌ای' }
];

const PARTICIPATIONS: { id: DrillParticipation; label: string }[] = [
  { id: 'solo', label: 'انفرادی' },
  { id: 'pairs', label: 'دو نفره' },
  { id: 'four', label: 'چهار نفره' },
  { id: 'group', label: 'گروهی' }
];

export const DrillFilterBar: React.FC<DrillFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalCount
}) => {
  const hasActiveFilters = Boolean(
    filters.sport ||
    filters.category ||
    filters.level ||
    filters.participation ||
    filters.query ||
    filters.min_duration ||
    filters.max_duration
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4" dir="rtl">
      {/* Row 1: Sport Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Sport Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChange({ sport: undefined, page: 1 })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !filters.sport
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            همه ورزش‌ها
          </button>
          <button
            type="button"
            onClick={() => onChange({ sport: 'padel', page: 1 })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filters.sport === 'padel'
                ? 'bg-rally-primary text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            پدل (Padel)
          </button>
          <button
            type="button"
            onClick={() => onChange({ sport: 'tennis', page: 1 })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filters.sport === 'tennis'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تنیس (Tennis)
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.query || ''}
            onChange={(e) => onChange({ query: e.target.value, page: 1 })}
            placeholder="جستجوی تمرین، تکنیک (باندخا، والی، سرویس...)"
            className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rally-primary/20 focus:border-rally-primary transition-all"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onChange({ query: '', page: 1 })}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap ml-2">دسته‌بندی:</span>
        <button
          type="button"
          onClick={() => onChange({ category: undefined, page: 1 })}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
            !filters.category
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          همه
        </button>
        {CATEGORIES.map((cat) => {
          const isActive = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange({ category: isActive ? undefined : cat.id, page: 1 })}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-rally-primary text-white border-rally-primary'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Row 3: Dropdowns for Level, Duration & Participation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <select
            value={filters.level || ''}
            onChange={(e) => onChange({ level: (e.target.value as DrillLevel) || undefined, page: 1 })}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-rally-primary cursor-pointer"
          >
            <option value="">سطح: همه سطوح</option>
            {LEVELS.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
            ))}
          </select>

          {/* Duration Filter */}
          <select
            value={filters.max_duration ? String(filters.max_duration) : ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onChange({ max_duration: val, page: 1 });
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-rally-primary cursor-pointer"
          >
            <option value="">مدت اجرا: همه زمان‌ها</option>
            <option value="15">حداکثر ۱۵ دقیقه</option>
            <option value="30">حداکثر ۳۰ دقیقه</option>
            <option value="45">حداکثر ۴۵ دقیقه</option>
            <option value="60">حداکثر ۱ ساعت</option>
          </select>

          {/* Participation Filter */}
          <select
            value={filters.participation || ''}
            onChange={(e) => onChange({ participation: (e.target.value as DrillParticipation) || undefined, page: 1 })}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-rally-primary cursor-pointer"
          >
            <option value="">تعداد نفرات: همه</option>
            {PARTICIPATIONS.map((part) => (
              <option key={part.id} value={part.id}>{part.label}</option>
            ))}
          </select>
        </div>

        {/* Reset & Count */}
        <div className="flex items-center gap-3 mr-auto sm:mr-0">
          {typeof totalCount === 'number' && (
            <span className="text-slate-500 font-medium">
              {totalCount.toLocaleString('fa-IR')} تمرین پیدا شد
            </span>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>پاکسازی فیلترها</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

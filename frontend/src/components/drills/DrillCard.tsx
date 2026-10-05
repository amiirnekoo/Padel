import React from 'react';
import { DrillListItem, DrillSport, DrillCategory, DrillLevel, DrillParticipation } from '../../types/drills';
import { Clock, Users, Eye, CheckCircle2, Bookmark, Flame } from 'lucide-react';

interface DrillCardProps {
  drill: DrillListItem;
  onSelect: (slug: string) => void;
  onToggleBookmark?: (drillId: string) => void;
  isBookmarked?: boolean;
}

const SPORT_LABELS: Record<DrillSport, { label: string; badge: string }> = {
  padel: { label: 'پدل', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  tennis: { label: 'تنیس', badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20' }
};

const CATEGORY_LABELS: Record<DrillCategory, string> = {
  technique: 'تکنیک و ضربه',
  tactics: 'تاکتیک و موقعیت',
  fitness: 'آمادگی بدنی',
  mental: 'مهارت‌های ذهنی'
};

const LEVEL_LABELS: Record<DrillLevel, { label: string; color: string }> = {
  beginner: { label: 'مبتدی', color: 'text-sky-600 bg-sky-50' },
  intermediate: { label: 'متوسط', color: 'text-indigo-600 bg-indigo-50' },
  advanced: { label: 'پیشرفته', color: 'text-purple-600 bg-purple-50' },
  pro: { label: 'حرفه‌ای', color: 'text-rose-600 bg-rose-50' }
};

const PARTICIPATION_LABELS: Record<DrillParticipation, string> = {
  solo: 'انفرادی',
  pairs: 'دو نفره',
  four: 'چهار نفره',
  group: 'گروهی'
};

export const DrillCard: React.FC<DrillCardProps> = React.memo(({
  drill,
  onSelect,
  onToggleBookmark,
  isBookmarked = false
}) => {
  const sportInfo = SPORT_LABELS[drill.sport] || { label: drill.sport, badge: 'bg-slate-100 text-slate-700' };
  const levelInfo = LEVEL_LABELS[drill.level] || { label: drill.level, color: 'text-slate-600 bg-slate-50' };

  return (
    <article
      onClick={() => onSelect(drill.slug)}
      className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-rally-primary/40 transition-all duration-200 cursor-pointer flex flex-col h-full"
      dir="rtl"
    >
      {/* Cover Image Area: Only static cover loaded, NO video preloading in directory */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        {drill.cover_url ? (
          <img
            src={drill.cover_url}
            alt={drill.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-500">
            <Flame className="w-10 h-10 text-slate-700 mb-1" />
            <span className="text-[11px] font-bold text-slate-400">تمرین تخصصی {sportInfo.label}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border backdrop-none ${sportInfo.badge} bg-white shadow-2xs`}>
            {sportInfo.label}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-900/90 text-white shadow-2xs">
            {CATEGORY_LABELS[drill.category] || drill.category}
          </span>
        </div>

        {/* Bookmark Action */}
        {onToggleBookmark && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(drill.id);
            }}
            aria-label={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان کردن تمرین'}
            className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl bg-slate-900/80 text-white hover:bg-slate-900 flex items-center justify-center transition-colors shadow-2xs cursor-pointer z-10"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-rally-accent text-rally-accent' : 'text-slate-300'}`} />
          </button>
        )}

        {/* Execution Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-slate-950/85 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
          <Clock className="w-3 h-3 text-rally-accent" />
          <span>{drill.duration_minutes} دقیقه اجرا</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${levelInfo.color}`}>
              {levelInfo.label}
            </span>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {PARTICIPATION_LABELS[drill.participation_type] || drill.participation_type}
            </span>
          </div>

          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1 group-hover:text-rally-primary transition-colors mb-1.5">
            {drill.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {drill.summary}
          </p>
        </div>

        {/* Card Footer: Social proof & stats */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="تعداد گزارش انجام کاربران">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{drill.completion_count} انجام</span>
            </span>
            <span className="flex items-center gap-1" title="تعداد بازدید">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{drill.view_count}</span>
            </span>
          </div>

          <span className="text-rally-primary font-bold group-hover:underline">
            مشاهده تمرین ←
          </span>
        </div>
      </div>
    </article>
  );
});

DrillCard.displayName = 'DrillCard';

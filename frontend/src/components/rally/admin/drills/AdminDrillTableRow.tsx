import React from 'react';
import { DrillListItem, DrillStatus } from '../../../../types/drills';
import { Edit3, Film, Send, CheckCircle, Archive, Globe } from 'lucide-react';

interface AdminDrillTableRowProps {
  drill: DrillListItem;
  onEdit: (drill: DrillListItem) => void;
  onMedia: (drill: DrillListItem) => void;
  onSubmitReview: (drillId: string) => void;
  onReviewDecision: (drillId: string, decision: 'approved' | 'rejected') => void;
  onPublish: (drillId: string) => void;
  onArchive: (drillId: string) => void;
}

const STATUS_BADGES: Record<DrillStatus, { label: string; cls: string }> = {
  draft: { label: 'پیش‌نویس', cls: 'bg-slate-800 text-slate-300 border-slate-700' },
  in_review: { label: 'در انتظار بازبینی', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  approved: { label: 'تأییدشده', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  published: { label: 'منتشرشده', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  archived: { label: 'بایگانی‌شده', cls: 'bg-rose-500/10 text-rose-300 border-rose-500/20' }
};

export const AdminDrillTableRow: React.FC<AdminDrillTableRowProps> = React.memo(({
  drill,
  onEdit,
  onMedia,
  onSubmitReview,
  onReviewDecision,
  onPublish,
  onArchive
}) => {
  const badge = STATUS_BADGES[drill.status] || { label: drill.status, cls: 'bg-slate-800 text-slate-300' };

  return (
    <tr className="hover:bg-slate-800/40 transition-colors">
      <td className="p-3">
        <div className="font-bold text-white truncate">{drill.title}</div>
        <div className="text-[10px] text-slate-500 font-mono truncate">/drills/{drill.slug}</div>
      </td>
      <td className="p-3">
        <span className="font-bold text-slate-200">{drill.sport === 'padel' ? 'پدل' : 'تنیس'}</span>
        <div className="text-[10px] text-slate-400">{drill.category}</div>
      </td>
      <td className="p-3">
        <div>{drill.level}</div>
        <div className="text-[10px] text-slate-400">{drill.duration_minutes} دقیقه</div>
      </td>
      <td className="p-3">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}>
          {badge.label}
        </span>
      </td>
      <td className="p-3 text-[11px] text-slate-400">
        <div>{drill.completion_count} انجام</div>
        <div>{drill.bookmark_count} نشان</div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onEdit(drill)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            title="ویرایش محتوا و نسخه"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onMedia(drill)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            title="مدیریت رسانه‌ها و جلد"
          >
            <Film className="w-3.5 h-3.5" />
          </button>

          {drill.status === 'draft' && (
            <button
              type="button"
              onClick={() => onSubmitReview(drill.id)}
              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-amber-500/30 cursor-pointer"
              title="ارسال جهت بررسی و تایید بازبین مستقل"
            >
              <Send className="w-3 h-3" />
              <span>ارسال بازبینی</span>
            </button>
          )}

          {drill.status === 'in_review' && (
            <button
              type="button"
              onClick={() => onReviewDecision(drill.id, 'approved')}
              className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-sky-500/30 cursor-pointer"
            >
              <CheckCircle className="w-3 h-3" />
              <span>تأیید</span>
            </button>
          )}

          {drill.status === 'approved' && (
            <button
              type="button"
              onClick={() => onPublish(drill.id)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer"
              title="انتشار عمومی در پلتفرم رالی"
            >
              <Globe className="w-3 h-3" />
              <span>انتشار</span>
            </button>
          )}

          {drill.status === 'published' && (
            <button
              type="button"
              onClick={() => onArchive(drill.id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 cursor-pointer"
              title="بایگانی و خروج از انتشار"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

AdminDrillTableRow.displayName = 'AdminDrillTableRow';

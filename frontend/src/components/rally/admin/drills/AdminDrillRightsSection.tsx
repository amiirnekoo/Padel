import React from 'react';
import { DrillOriginSource } from '../../../../types/drills';

interface AdminDrillRightsSectionProps {
  originSource: DrillOriginSource;
  setOriginSource: (v: DrillOriginSource) => void;
  rightsHolder: string;
  setRightsHolder: (v: string) => void;
  usageRightsConfirmed: boolean;
  setUsageRightsConfirmed: (v: boolean) => void;
}

export const AdminDrillRightsSection: React.FC<AdminDrillRightsSectionProps> = ({
  originSource,
  setOriginSource,
  rightsHolder,
  setRightsHolder,
  usageRightsConfirmed,
  setUsageRightsConfirmed
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3" dir="rtl">
      <h4 className="font-bold text-slate-300">حقوق مؤلف و منشأ محتوا</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1">منشأ اثر</label>
          <select
            value={originSource}
            onChange={(e) => setOriginSource(e.target.value as DrillOriginSource)}
            className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
          >
            <option value="original">تولید اختصاصی و تألیفی رالی</option>
            <option value="licensed">دارای مجوز و لایسنس</option>
            <option value="public_domain">منابع استاندارد آزاد</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">صاحب اثر / لایسنسور</label>
          <input
            type="text"
            value={rightsHolder}
            onChange={(e) => setRightsHolder(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            placeholder="مثال: آکادمی پدل رالی"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={usageRightsConfirmed}
          onChange={(e) => setUsageRightsConfirmed(e.target.checked)}
          className="rounded accent-rally-primary w-4 h-4 cursor-pointer"
        />
        <span className="text-slate-300 font-medium text-xs">
          تأیید می‌کنم که حقوق استفاده و بازنشر این محتوا در رالی احراز شده است.
        </span>
      </label>
    </div>
  );
};

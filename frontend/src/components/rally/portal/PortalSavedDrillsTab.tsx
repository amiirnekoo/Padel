import React, { useState, useEffect } from 'react';
import { Dumbbell, Play, Bookmark, Clock, Award, ExternalLink, RefreshCw } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface DrillItem {
  id: string;
  title: string;
  level: string;
  duration_minutes: number;
  thumbnail_url?: string;
  category?: string;
}

interface PortalSavedDrillsTabProps {
  onNavigateToDrills: () => void;
}

export const PortalSavedDrillsTab: React.FC<PortalSavedDrillsTabProps> = ({ onNavigateToDrills }) => {
  const [drills, setDrills] = useState<DrillItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDrills = async () => {
    setIsLoading(true);
    try {
      const res = await rallyApi.getMySavedDrills();
      if (Array.isArray(res)) {
        setDrills(res);
      }
    } catch {
      // در صورت خطا لیست خالی حفظ می‌شود
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrills();
  }, []);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="bg-[#0B1E30] border border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">تمرینات و دریل‌های نشان‌شده شما</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            مجموعه تمرینات تکنیکی و تاکتیکی پدل که برای ارتقای سطح بازی خود ذخیره کرده‌اید
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDrills}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={onNavigateToDrills}
            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>کاتالوگ کامل تمرینات</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {drills.length === 0 ? (
        <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-8 text-center text-slate-400 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs">هنوز تمرینی را نشان‌گذاری نکرده‌اید.</p>
          <button
            onClick={onNavigateToDrills}
            className="px-4 py-2 bg-rally-primary text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-rally-primary/80"
          >
            مشاهده تمرینات تخصصی پدل
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drills.map((d) => (
            <div key={d.id} className="bg-[#0B1E30] border border-white/10 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors">
              <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-slate-600 relative overflow-hidden">
                <Play className="w-8 h-8 text-white/80" />
              </div>
              <h4 className="font-bold text-white text-sm truncate">{d.title}</h4>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {d.level}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {d.duration_minutes} دقیقه
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

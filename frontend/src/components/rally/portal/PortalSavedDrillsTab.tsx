import React, { useState, useEffect } from 'react';
import { Bookmark, Play, CheckCircle, Clock, Zap, Target, RefreshCw, AlertCircle } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface PortalSavedDrillsTabProps {
  onNavigateToDrills?: () => void;
}

export const PortalSavedDrillsTab: React.FC<PortalSavedDrillsTabProps> = ({ onNavigateToDrills }) => {
  const [drills, setDrills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState<'ALL' | 'PADEL' | 'TENNIS'>('ALL');

  const fetchDrills = async () => {
    setIsLoading(true);
    try {
      const data = await rallyApi.getMySavedDrills();
      setDrills(data || []);
    } catch {
      setDrills([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrills();
  }, []);

  const filteredDrills = drills.filter((d) => {
    if (selectedSport === 'ALL') return true;
    return d.sport === selectedSport;
  });

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'ADVANCED':
        return { text: 'پیشرفته', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'INTERMEDIATE':
        return { text: 'متوسط', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      default:
        return { text: 'مقدماتی', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0B1E30] border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">تمرینات و ویدیوهای نشان‌شده</h3>
            <p className="text-xs text-slate-300">آرشیو تکنیک‌ها و تاکتیک‌های آموزشی ذخیره‌شده جهت مرور و تمرین در زمین</p>
          </div>
        </div>

        {/* Sport Filters */}
        <div className="flex bg-[#07131F] p-1 rounded-xl border border-white/10 text-xs font-bold self-end sm:self-auto">
          <button
            onClick={() => setSelectedSport('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedSport === 'ALL' ? 'bg-[#D7ED68] text-[#07131F] font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setSelectedSport('PADEL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedSport === 'PADEL' ? 'bg-[#D7ED68] text-[#07131F] font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            پدل
          </button>
          <button
            onClick={() => setSelectedSport('TENNIS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedSport === 'TENNIS' ? 'bg-[#D7ED68] text-[#07131F] font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            تنیس
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && drills.length === 0 ? (
        <div className="p-12 text-center text-slate-300 bg-[#0B1E30] border border-white/10 rounded-3xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D7ED68] mb-2" />
          <p className="text-xs">در حال بارگذاری دریل‌های نشان‌شده...</p>
        </div>
      ) : filteredDrills.length === 0 ? (
        <div className="bg-[#0B1E30] border border-white/10 rounded-3xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
            <Target className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-white">هنوز تمرینی را نشان نکرده‌اید</h4>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            می‌توانید از بخش تمرینات و دریل‌های آموزشی رالی، تکنیک‌های مورد نظر را برای مرور در کورت ذخیره کنید.
          </p>
          {onNavigateToDrills && (
            <button
              onClick={onNavigateToDrills}
              className="mt-3 px-4 py-2.5 rounded-xl bg-[#D7ED68] text-[#07131F] font-black text-xs hover:brightness-110 cursor-pointer"
            >
              مشاهده آکادمی تمرینات
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrills.map((drill) => {
            const levelInfo = getLevelLabel(drill.level || 'INTERMEDIATE');
            return (
              <div
                key={drill.drill_id || drill.slug}
                className="bg-[#0B1E30] border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#D7ED68]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#D7ED68] bg-[#D7ED68]/10 px-2.5 py-0.5 rounded-md border border-[#D7ED68]/20">
                      {drill.sport === 'PADEL' ? '🎾 پدل' : '🎾 تنیس'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${levelInfo.color}`}>
                      سطح {levelInfo.text}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{drill.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{drill.duration_minutes || 15} دقیقه</span>
                    </span>
                    {drill.completion_count ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{drill.completion_count} بار تمرین شده</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">دسته‌بندی: {drill.category || 'تکنیک'}</span>
                  <a
                    href={`/drills/${drill.slug}`}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#D7ED68] hover:text-[#07131F] text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>مشاهده و پخش</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

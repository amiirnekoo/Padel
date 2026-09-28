import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { CourtClub, TimeSlotItem, SportType } from '../../types/rally';
import { MOCK_CLUBS } from '../../data/mockRallyData';
import { CourtCard } from '../../components/rally/CourtCard';

interface RallyCourtsPageProps {
  onSelectClub: (club: CourtClub) => void;
  onSelectDirectSlot: (club: CourtClub, slot: TimeSlotItem) => void;
  initialFilters?: { sport?: SportType; area?: string };
}

export const RallyCourtsPage: React.FC<RallyCourtsPageProps> = ({
  onSelectClub,
  onSelectDirectSlot,
  initialFilters
}) => {
  const [sportFilter, setSportFilter] = useState<SportType | 'ALL'>(initialFilters?.sport || 'ALL');
  const [areaFilter, setAreaFilter] = useState<string>(initialFilters?.area || 'ALL');
  const [selectedDay, setSelectedDay] = useState<string>('tomorrow');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INDOOR' | 'OUTDOOR'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const AREAS = [
    { id: 'ALL', label: 'همه محدوده‌ها' },
    { id: 'ونک / خیابان سئول', label: 'ونک / سئول (انقلاب)' },
    { id: 'ولنجک / توچال', label: 'ولنجک / توچال' },
    { id: 'شهرک غرب / دادمان', label: 'شهرک غرب' }
  ];

  const filteredClubs = MOCK_CLUBS.filter((club) => {
    if (sportFilter !== 'ALL' && club.sport !== sportFilter) return false;
    if (areaFilter !== 'ALL' && club.area !== areaFilter) return false;
    if (typeFilter !== 'ALL' && club.courtType !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Quick Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-rally-charcoal">
            رزرو آنلاین زمین پدل و تنیس
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            مشاهده نزدیک‌ترین سانس‌های آزاد، تعرفه شفاف ۹۰ دقیقه و رزرو اتمیک
          </p>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
          
          {/* Sport filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">نوع ورزش</label>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSportFilter('ALL')}
                className={`py-1.5 rounded-lg transition-all ${
                  sportFilter === 'ALL' ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
                }`}
              >
                همه
              </button>
              <button
                type="button"
                onClick={() => setSportFilter('PADEL')}
                className={`py-1.5 rounded-lg transition-all ${
                  sportFilter === 'PADEL' ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
                }`}
              >
                پدل
              </button>
              <button
                type="button"
                onClick={() => setSportFilter('TENNIS')}
                className={`py-1.5 rounded-lg transition-all ${
                  sportFilter === 'TENNIS' ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
                }`}
              >
                تنیس
              </button>
            </div>
          </div>

          {/* Area filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">محدوده باشگاه</label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-rally-charcoal"
            >
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Day selection */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">تاریخ بازی</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'today', label: 'امروز' },
                { id: 'tomorrow', label: 'فردا' },
                { id: 'weekend', label: 'جمعه' }
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDay(d.id)}
                  className={`h-10 rounded-xl text-xs font-bold border transition-all ${
                    selectedDay === d.id
                      ? 'bg-rally-primary text-white border-rally-primary'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Court type */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">پوشش کورت</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-rally-charcoal"
            >
              <option value="ALL">همه زمین‌ها</option>
              <option value="INDOOR">سرپوشیده مجهز</option>
              <option value="OUTDOOR">روباز و پانوراما</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Status */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>نمایش {filteredClubs.length} مجموعه ورزشی معتبر</span>
        <button
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 500);
          }}
          className="flex items-center gap-1 font-bold text-rally-primary hover:underline"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>بروزرسانی وضعیت سانس‌ها</span>
        </button>
      </div>

      {/* Grid of Courts */}
      {filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <CourtCard
              key={club.id}
              club={club}
              onSelectClub={onSelectClub}
              onSelectDirectSlot={onSelectDirectSlot}
            />
          ))}
        </div>
      ) : (
        /* Real-world edge case: Empty state with suggested alternatives */
        <div className="bg-white rounded-3xl p-10 border border-gray-200 text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-extrabold text-rally-charcoal">
            سانس آزادی با این فیلترها یافت نشد
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            می‌توانید روز دیگری را انتخاب کنید یا محدوده جستجو را به «همه محدوده‌ها» تغییر دهید.
          </p>
          <button
            onClick={() => {
              setSportFilter('ALL');
              setAreaFilter('ALL');
              setTypeFilter('ALL');
            }}
            className="px-6 py-2.5 rounded-xl bg-rally-primary text-white text-xs font-bold"
          >
            پاک کردن فیلترها و مشاهده همه کورت‌ها
          </button>
        </div>
      )}
    </div>
  );
};

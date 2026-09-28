import React, { useState } from 'react';
import { Award, Star, MapPin, CheckCircle2, Shield, ChevronLeft } from 'lucide-react';
import { Coach, StudentLevel, SportType } from '../../types/rally';
import { MOCK_COACHES } from '../../data/mockRallyData';

interface RallyCoachesPageProps {
  onSelectCoach: (coach: Coach) => void;
  initialFilters?: { sport?: SportType; level?: string };
}

export const RallyCoachesPage: React.FC<RallyCoachesPageProps> = ({
  onSelectCoach,
  initialFilters
}) => {
  const [levelFilter, setLevelFilter] = useState<string>(initialFilters?.level || 'ALL');

  const filteredCoaches = MOCK_COACHES.filter((c) => {
    if (levelFilter === 'ALL') return true;
    return c.levels.includes(levelFilter as StudentLevel);
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Filter */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-rally-charcoal">
            مربیان رسمی پدل و تنیس
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            رزرو جلسات آموزش خصوصی، اصلاح تکنیک والیه و آموزش پایه برای مبتدیان
          </p>
        </div>

        {/* Level filter tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500 ml-2">سطح مهارت شما:</span>
          {[
            { id: 'ALL', label: 'همه سطوح' },
            { id: 'BEGINNER', label: 'مبتدی (اولین بار)' },
            { id: 'INTERMEDIATE', label: 'متوسط' },
            { id: 'ADVANCED', label: 'پیشرفته و مسابقاتی' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLevelFilter(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                levelFilter === item.id
                  ? 'bg-rally-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCoaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex gap-4">
              <img
                src={coach.avatarUrl || '/images/rally_coach.jpg'}
                alt={coach.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border-2 border-rally-primary/10"
              />

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-rally-charcoal">{coach.name}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{coach.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-medium">{coach.title}</p>
                <p className="text-[11px] text-gray-400 font-medium">{coach.certificate}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {coach.specialties.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rally-primary/5 text-rally-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              {coach.bio}
            </p>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">شهریه هر جلسه:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-rally-primary">
                    {(coach.hourlyRate / 10).toLocaleString('fa-IR')}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">تومان</span>
                </div>
              </div>

              <button
                onClick={() => onSelectCoach(coach)}
                className="px-5 py-2.5 rounded-xl bg-rally-primary hover:bg-rally-primary-light text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[44px]"
              >
                <span>مشاهده و درخواست جلسه</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

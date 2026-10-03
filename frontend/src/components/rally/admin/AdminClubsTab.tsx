import React, { useState } from 'react';
import { Building2, Plus, CheckCircle, XCircle, MapPin, Sliders, Shield } from 'lucide-react';
import { MOCK_CLUBS } from '../../../data/mockRallyData';
import { CourtClub } from '../../../types/rally';

export const AdminClubsTab: React.FC = () => {
  const [clubs, setClubs] = useState<CourtClub[]>(MOCK_CLUBS);
  const [activeStatuses, setActiveStatuses] = useState<Record<string, boolean>>({
    'club-enghelab': true,
    'club-lafour': true,
    'club-viva': true
  });

  const toggleStatus = (clubId: string) => {
    setActiveStatuses((prev) => ({ ...prev, [clubId]: !prev[clubId] }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header and Add Club Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rally-primary" />
            <span>مدیریت باشگاه‌ها و کورت‌های طرف قرارداد</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">تنظیم وضعیت فعالیت کورت‌ها، سانس‌های باز و نظارت بر کیفیت خدمات</p>
        </div>

        <button
          onClick={() => alert('فرم افزودن باشگاه جدید به زودی در اتصال به دیتابیس فعال می‌شود')}
          className="px-4 py-2 bg-rally-primary hover:bg-rally-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن مجموعه یا کورت جدید</span>
        </button>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clubs.map((club) => {
          const isActive = activeStatuses[club.id] ?? true;
          return (
            <div key={club.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                    <img src={club.images[0]} alt={club.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{club.name}</h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {club.city}، {club.area}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(club.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'فعال در رالی' : 'غیرفعال موقت'}</span>
                  </button>
                </div>
              </div>

              {/* Club Quick Specs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">نوع کورت</span>
                  <span className="font-bold text-slate-200">{club.courtType === 'INDOOR' ? 'سرپوشیده' : 'روباز'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">شروع قیمت سانس</span>
                  <span className="font-bold text-[#D7ED68]">{club.startingPrice.toLocaleString('fa-IR')} ت</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">کارمزد رالی</span>
                  <span className="font-bold text-emerald-400">۱۰٪ مصوب</span>
                </div>
              </div>

              {/* Surface & Amenities summary */}
              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                <span className="font-bold text-slate-300">پوشش کف: </span>
                {club.surface}
              </p>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-rally-primary" />
                  دارای تاییدیه فنی استاندارد WPT
                </span>
                <button
                  onClick={() => alert(`تنظیمات سانس‌های ${club.name}`)}
                  className="text-rally-primary hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>مدیریت سانس‌ها ({club.slots.length})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle, XCircle, MapPin, Sliders, Shield } from 'lucide-react';
import { MOCK_CLUBS } from '../../../data/mockRallyData';
import { CourtClub } from '../../../types/rally';
import { applySavedLocationsToClubs } from '../../../utils/clubLocationStorage';
import { AdminClubLocationModal } from './AdminClubLocationModal';

export const AdminClubsTab: React.FC = () => {
  const [clubs, setClubs] = useState<CourtClub[]>(() => applySavedLocationsToClubs(MOCK_CLUBS));
  const [activeStatuses, setActiveStatuses] = useState<Record<string, boolean>>({
    'club-enghelab': true,
    'club-lafour': true,
    'club-viva': true
  });
  const [selectedClubForLocation, setSelectedClubForLocation] = useState<CourtClub | null>(null);

  // Sync saved locations on mount & events
  useEffect(() => {
    const handleUpdate = () => {
      setClubs(applySavedLocationsToClubs(MOCK_CLUBS));
    };
    window.addEventListener('rally_club_locations_updated', handleUpdate);
    return () => {
      window.removeEventListener('rally_club_locations_updated', handleUpdate);
    };
  }, []);

  const toggleStatus = (clubId: string) => {
    setActiveStatuses((prev) => ({ ...prev, [clubId]: !prev[clubId] }));
  };

  const handleLocationSaved = (clubId: string, lat: number, lng: number, address: string) => {
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, latitude: lat, longitude: lng, address } : c))
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header and Add Club Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rally-primary" />
            <span>مدیریت باشگاه‌ها، کورت‌ها و موقعیت مکانی</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            تنظیم وضعیت فعالیت، ثبت و ویرایش لوکیشن دقیق روی نقشه تعاملی رالی
          </p>
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
                  <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
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

              {/* Club Location Info & Map Button */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">موقعیت ثبت‌شده:</span>
                    <span className="font-mono text-[11px] text-emerald-400 font-bold" dir="ltr">
                      {club.latitude ? `${club.latitude.toFixed(4)}, ${club.longitude?.toFixed(4)}` : 'تنظیم‌نشده'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{club.address}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClubForLocation(club)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>تنظیم لوکیشن روی نقشه</span>
                </button>
              </div>

              {/* Club Quick Specs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60 text-center text-xs">
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

      {/* Location Setting Modal */}
      {selectedClubForLocation && (
        <AdminClubLocationModal
          isOpen={!!selectedClubForLocation}
          club={selectedClubForLocation}
          onClose={() => setSelectedClubForLocation(null)}
          onSaveSuccess={handleLocationSaved}
        />
      )}
    </div>
  );
};

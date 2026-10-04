import React from 'react';
import { MapPin, Clock, Star, ChevronLeft } from 'lucide-react';
import { CourtClub, TimeSlotItem } from '../../types/rally';
import { isSlotPast } from '../../utils/persianUtils';

interface CourtCardProps {
  club: CourtClub;
  targetDateStr?: string;
  onSelectClub: (club: CourtClub) => void;
  onSelectDirectSlot: (club: CourtClub, slot: TimeSlotItem) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({
  club,
  targetDateStr,
  onSelectClub,
  onSelectDirectSlot
}) => {
  // فیلتر سانس‌های آزاد و عدم نمایش سانس‌های گذشته بر مبنای ساعت تهران
  const validAvailableSlots = club.slots.filter((s) => {
    if (s.status !== 'AVAILABLE') return false;
    if (targetDateStr && isSlotPast(targetDateStr, s.startTime)) return false;
    return true;
  });

  const displaySlots = validAvailableSlots.slice(0, 4);
  const firstValidSlot = validAvailableSlots[0] || null;
  const isPadel = club.sport === 'PADEL';

  return (
    <div className="bg-white rounded-[28px] border border-sky-100 hover:border-sky-300 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(14,165,233,0.08)] transition-all duration-300 flex flex-col justify-between group">
      
      {/* Top Header Tag & Title */}
      <div className="p-6 sm:p-7 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full text-sky-700 bg-sky-50 border border-sky-200">
            🎾 کورت اختصاصی پدل
          </span>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-rally-charcoal text-[11px] font-bold">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{club.rating.toLocaleString('fa-IR')}</span>
          </div>
        </div>

        <h3
          onClick={() => onSelectClub(club)}
          className="text-xl sm:text-2xl font-black text-rally-charcoal tracking-tight group-hover:text-sky-700 transition-colors cursor-pointer line-clamp-1"
        >
          {club.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="line-clamp-1">{club.area} ({club.city})</span>
          {typeof club.directDistanceKm === 'number' && club.directDistanceKm > 0 && (
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              فاصله مستقیم: {club.directDistanceKm.toLocaleString('fa-IR')} کیلومتر
            </span>
          )}
        </div>
      </div>

      {/* Hero Media Container (Apple Style Centered Visual) */}
      <div
        className="relative mx-6 h-48 sm:h-52 rounded-2xl overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => onSelectClub(club)}
      >
        <img
          src={club.images[0] || '/images/real_padel_hero.jpg'}
          alt={club.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Type pill on image */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-rally-charcoal text-[11px] font-bold shadow-xs">
          <span>{club.courtType === 'INDOOR' ? '🏢 کورت سرپوشیده' : '🌤️ کورت روباز / پانورامیک'}</span>
        </div>

        {firstValidSlot ? (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-bold shadow-xs bg-[#0B4278]">
            <Clock className="w-3 h-3" />
            <span>اولین سانس آزاد: {firstValidSlot.startTime}</span>
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-gray-300 text-[10px] font-medium shadow-xs">
            <span>سانس امروز تکمیل</span>
          </div>
        )}
      </div>

      {/* Slots & Apple Style Footer */}
      <div className="p-6 sm:p-7 pt-4 space-y-4">
        {/* Live Quick Slot Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
            <span>سریع‌ترین سانس‌های آزاد (۹۰ دقیقه):</span>
            <span
              onClick={() => onSelectClub(club)}
              className="text-sky-700 hover:underline cursor-pointer"
            >
              مشاهده همه
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {displaySlots.length > 0 ? (
              displaySlots.map((slot) => (
                <button
                  key={slot.slotId}
                  onClick={() => onSelectDirectSlot(club, slot)}
                  className="px-3 py-1.5 rounded-full border border-sky-600/25 bg-sky-50 text-sky-800 hover:bg-sky-700 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  title={`${slot.startTime} تا ${slot.endTime} - ${slot.price.toLocaleString('fa-IR')} تومان`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{slot.startTime}</span>
                </button>
              ))
            ) : (
              <span className="text-xs text-gray-400 py-1 font-medium">سانس آزادی برای زمان انتخابی موجود نیست</span>
            )}
          </div>
        </div>

        {/* Pricing & Apple Style Pill Button */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">
              {firstValidSlot ? `تعرفه سانس ${firstValidSlot.startTime}` : 'پایه تعرفه هر سانس'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-rally-charcoal tracking-tight">
                {(firstValidSlot ? firstValidSlot.price : club.startingPrice).toLocaleString('fa-IR')}
              </span>
              <span className="text-xs text-gray-500 font-medium">تومان</span>
            </div>
          </div>

          <button
            onClick={() => onSelectClub(club)}
            className="px-5 py-2.5 rounded-full text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 bg-[#0B4278] hover:bg-[#0C4F8D]"
          >
            <span>مشاهده سانس‌ها</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

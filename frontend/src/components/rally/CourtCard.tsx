import React from 'react';
import { MapPin, Clock, Star, Sparkles, ChevronLeft } from 'lucide-react';
import { CourtClub, TimeSlotItem } from '../../types/rally';

interface CourtCardProps {
  club: CourtClub;
  onSelectClub: (club: CourtClub) => void;
  onSelectDirectSlot: (club: CourtClub, slot: TimeSlotItem) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({
  club,
  onSelectClub,
  onSelectDirectSlot
}) => {
  const availableSlots = club.slots.filter((s) => s.status === 'AVAILABLE').slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      
      {/* Top Media: Real image with badges */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onSelectClub(club)}>
        <img
          src={club.images[0] || '/images/rally_hero.jpg'}
          alt={club.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Badges on image */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-rally-primary shadow-xs">
            {club.sport === 'PADEL' ? '🎾 پدل' : '🏸 تنیس'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rally-charcoal/80 text-white backdrop-blur-none">
            {club.courtType === 'INDOOR' ? 'سرپوشیده' : 'فضای باز'}
          </span>
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white text-rally-charcoal shadow-xs">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{club.rating.toLocaleString('fa-IR')}</span>
        </div>

        {/* Nearest slot pill */}
        {club.nearestAvailableSlot && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rally-primary text-rally-accent shadow-sm">
            <Clock className="w-3 h-3" />
            <span>نزدیک‌ترین سانس آزاد: {club.nearestAvailableSlot}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Club Name & Location */}
          <h3
            onClick={() => onSelectClub(club)}
            className="text-base font-extrabold text-rally-charcoal group-hover:text-rally-primary transition-colors cursor-pointer line-clamp-1"
          >
            {club.name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="line-clamp-1">{club.area}</span>
          </div>

          <p className="text-[12px] text-gray-600 mt-2 line-clamp-1">
            {club.surface}
          </p>
        </div>

        {/* Quick Slot selector pills */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
            <span>سانس‌های آزاد امروز/فردا (۹۰ دقیقه):</span>
            <span className="text-rally-primary cursor-pointer hover:underline" onClick={() => onSelectClub(club)}>
              همه سانس‌ها
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <button
                  key={slot.slotId}
                  onClick={() => onSelectDirectSlot(club, slot)}
                  className="px-2.5 py-1.5 rounded-lg border border-rally-primary/30 bg-rally-primary/5 text-rally-primary text-xs font-bold hover:bg-rally-primary hover:text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  <span>{slot.startTime}</span>
                </button>
              ))
            ) : (
              <span className="text-xs text-gray-400 py-1">سانس رزرو سریع تکمیل است</span>
            )}
          </div>
        </div>

        {/* Pricing & Call to Action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">شروع قیمت از (۹۰ دقیقه)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-rally-charcoal">
                {(club.startingPrice / 10).toLocaleString('fa-IR')}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">تومان</span>
            </div>
          </div>

          <button
            onClick={() => onSelectClub(club)}
            className="px-4 py-2 rounded-xl bg-rally-primary hover:bg-rally-primary-light text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span>مشاهده کورت</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

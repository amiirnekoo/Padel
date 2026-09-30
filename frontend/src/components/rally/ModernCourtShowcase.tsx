import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { CourtClub, TimeSlotItem } from '../../types/rally';

interface CourtShowcaseItem {
  id: string;
  name: string;
  area: string;
  city: string;
  imageUrl: string;
  startingPrice: number;
  slots: { id: string; time: string; price: number }[];
}

interface ModernCourtShowcaseProps {
  onSelectClub?: (club: CourtClub) => void;
  onSelectSlot?: (club: CourtClub, slot: TimeSlotItem) => void;
  onViewAllCourts: () => void;
  fallbackClubs?: CourtClub[];
}

export const ModernCourtShowcase: React.FC<ModernCourtShowcaseProps> = ({
  onSelectClub,
  onSelectSlot,
  onViewAllCourts,
  fallbackClubs = []
}) => {
  const [activeSlotMap, setActiveSlotMap] = useState<Record<string, string>>({
    'court-padel-land': 'slot-1',
    'court-narmak': 'slot-2',
    'court-east-tehran': 'slot-1'
  });

  const showcaseCourts: CourtShowcaseItem[] = [
    {
      id: 'court-padel-land',
      name: 'پدل لند تهران',
      area: 'سعادت‌آباد',
      city: 'تهران',
      imageUrl: '/images/court_padel_land.jpg',
      startingPrice: 580000,
      slots: [
        { id: 'slot-1', time: '۱۷:۰۰', price: 580000 },
        { id: 'slot-2', time: '۱۸:۰۰', price: 620000 },
        { id: 'slot-3', time: '۱۹:۰۰', price: 620000 }
      ]
    },
    {
      id: 'court-narmak',
      name: 'باشگاه پدل نارمک',
      area: 'نارمک',
      city: 'تهران',
      imageUrl: '/images/court_narmak.jpg',
      startingPrice: 450000,
      slots: [
        { id: 'slot-1', time: '۱۶:۳۰', price: 450000 },
        { id: 'slot-2', time: '۱۸:۰۰', price: 500000 },
        { id: 'slot-3', time: '۱۹:۳۰', price: 500000 }
      ]
    },
    {
      id: 'court-east-tehran',
      name: 'مجموعه پدل شرق تهران',
      area: 'پیروزی / دماوند',
      city: 'تهران',
      imageUrl: '/images/court_east_tehran.jpg',
      startingPrice: 500000,
      slots: [
        { id: 'slot-1', time: '۱۷:۳۰', price: 500000 },
        { id: 'slot-2', time: '۱۹:۰۰', price: 540000 },
        { id: 'slot-3', time: '۲۰:۳۰', price: 540000 }
      ]
    }
  ];

  const handleCardClick = (court: CourtShowcaseItem) => {
    const match = fallbackClubs.find((c) => c.name.includes(court.name) || c.area.includes(court.area)) || fallbackClubs[0];
    if (match && onSelectClub) {
      onSelectClub(match);
    } else {
      onViewAllCourts();
    }
  };

  const handleSlotClick = (e: React.MouseEvent, court: CourtShowcaseItem, slot: { id: string; time: string; price: number }) => {
    e.stopPropagation();
    setActiveSlotMap((prev) => ({ ...prev, [court.id]: slot.id }));
    const match = fallbackClubs.find((c) => c.name.includes(court.name) || c.area.includes(court.area)) || fallbackClubs[0];
    if (match && onSelectSlot) {
      const timeSlot: TimeSlotItem = {
        slotId: `${court.id}-${slot.id}`,
        startTime: slot.time,
        endTime: '',
        durationMinutes: 90,
        price: slot.price,
        status: 'AVAILABLE'
      };
      onSelectSlot(match, timeSlot);
    }
  };

  return (
    <section className="w-full py-12 md:py-16 bg-[#F5F4EF]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#172320] tracking-tight">
              زمین‌های پیشنهادی در تهران
            </h2>
            <p className="text-sm text-[#66706D] mt-1 font-medium">
              دستچین باشگاه‌های استاندارد با سانس‌های قابل رزرو فوری
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onViewAllCourts}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0E3D38] hover:text-[#0E3D38]/80 transition-colors cursor-pointer group"
            >
              <span>مشاهده همه زمین‌ها</span>
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </button>

            {/* Pagination / Direction Controls */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onViewAllCourts}
                className="w-9 h-9 rounded-full bg-white border border-[#E8E6DD] text-[#172320] flex items-center justify-center hover:bg-[#172320] hover:text-white transition-all cursor-pointer shadow-xs"
                aria-label="قبلی"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onViewAllCourts}
                className="w-9 h-9 rounded-full bg-white border border-[#E8E6DD] text-[#172320] flex items-center justify-center hover:bg-[#172320] hover:text-white transition-all cursor-pointer shadow-xs"
                aria-label="بعدی"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Featured Wide Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {showcaseCourts.map((court) => {
            const currentSelectedSlotId = activeSlotMap[court.id];

            return (
              <div
                key={court.id}
                onClick={() => handleCardClick(court)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8E6DD] hover:border-[#0E3D38]/30 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col"
              >
                {/* Court Image with Subtle Zoom on Hover */}
                <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-slate-900">
                  <img
                    src={court.imageUrl}
                    alt={court.name}
                    className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle Darkening Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-200 group-hover:opacity-90" />

                  {/* Badges on Image (Location & Starting Price) */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-medium bg-black/60 px-2.5 py-1 rounded-lg backdrop-none">
                      <MapPin className="w-3.5 h-3.5 text-[#D7ED68]" />
                      <span>{court.area}</span>
                    </span>
                    <span className="font-bold text-white bg-[#0E3D38]/80 px-2.5 py-1 rounded-lg">
                      شروع از {court.startingPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#172320] group-hover:text-[#0E3D38] transition-colors mb-2">
                      {court.name}
                    </h3>
                    <p className="text-xs text-[#66706D] font-medium mb-4 flex items-center gap-1.5">
                      <span>{court.city}</span>
                      <span>•</span>
                      <span>{court.area}</span>
                    </p>
                  </div>

                  {/* Nearest 3 Selectable Time Slots */}
                  <div className="pt-3 border-t border-[#F5F4EF]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#66706D] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>سانس‌های نزدیک فردا:</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {court.slots.map((slot) => {
                        const isSelected = currentSelectedSlotId === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={(e) => handleSlotClick(e, court, slot)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0E3D38] text-[#D7ED68] shadow-xs'
                                : 'bg-[#F5F4EF] hover:bg-[#D7ED68]/20 text-[#172320] border border-[#E8E6DD]'
                            }`}
                          >
                            <span>{slot.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

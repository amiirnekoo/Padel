import React, { useState } from 'react';
import { X, MapPin, Building2, Sun, Shield, Navigation, ArrowLeft } from 'lucide-react';
import { CourtClub } from '../../../types/rally';
import { formatPersianPrice, toPersianDigits } from '../../../utils/persianUtils';

interface CourtsMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubs: CourtClub[];
  onSelectClub: (club: CourtClub) => void;
}

export const CourtsMapModal: React.FC<CourtsMapModalProps> = ({
  isOpen,
  onClose,
  clubs,
  onSelectClub
}) => {
  const [activeClubId, setActiveClubId] = useState<string>(clubs[0]?.id || 'club-enghelab');

  if (!isOpen) return null;

  const activeClub = clubs.find((c) => c.id === activeClubId) || clubs[0];

  // پین‌های نقشه با موقعیت درصدی روی شماتیک نقشه تهران (شمال و شمال‌شرق)
  const PINS_CONFIG: Record<string, { top: string; left: string; color: string; label: string }> = {
    'club-enghelab': { top: '56%', left: '38%', color: '#0ea5e9', label: 'انقلاب (FGB)' },
    'club-lafour': { top: '32%', left: '68%', color: '#f59e0b', label: 'لفور (آجودانیه)' },
    'club-viva': { top: '42%', left: '82%', color: '#10b981', label: 'ویوا (مینی‌سیتی)' }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden relative shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rally-primary/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                نقشه پراکندگی کورت‌های پدل تهران
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                ۳ مجموعه مجهز استاندارد بین‌المللی با قفل نرخ مصوب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Interactive Map Visual Stage */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[380px] bg-[#0b1329] overflow-hidden select-none">
          {/* Map Grid Pattern & Roads Stylized */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
               style={{
                 backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px)',
                 backgroundSize: '24px 24px, 120px 120px'
               }}
          />

          {/* District Outline Badges */}
          <div className="absolute top-4 right-5 text-[10px] font-bold text-slate-500 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-full">
            شمال و شمال‌شرق تهران (منطقه ۱ و ۳)
          </div>

          {/* Interactive Pins */}
          {clubs.map((club) => {
            const pin = PINS_CONFIG[club.id] || { top: '50%', left: '50%', color: '#38bdf8', label: club.name };
            const isActive = activeClub?.id === club.id;

            return (
              <div
                key={club.id}
                style={{ top: pin.top, left: pin.left }}
                onClick={() => setActiveClubId(club.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Pulse Ring */}
                {isActive && (
                  <span
                    className="absolute -inset-2.5 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: pin.color }}
                  />
                )}

                {/* Marker Button */}
                <div
                  className={`px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5 shadow-lg transition-transform duration-200 ${
                    isActive
                      ? 'scale-110 text-white shadow-xl ring-2 ring-white/80'
                      : 'text-slate-200 bg-slate-800/95 hover:scale-105 border border-slate-700'
                  }`}
                  style={{ backgroundColor: isActive ? pin.color : undefined }}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{pin.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Club Bottom Preview Card */}
        {activeClub && (
          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                <img
                  src={activeClub.images?.[0] || '/images/court_fgb_enghelab.jpg'}
                  alt={activeClub.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {activeClub.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    {activeClub.courtType === 'INDOOR' ? 'مسقف' : 'روباز'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {activeClub.address}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 font-bold">
                  <span>شروع از: {formatPersianPrice(activeClub.startingPrice)} تومان</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-black">⭐ {toPersianDigits(activeClub.rating)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => {
                  onSelectClub(activeClub);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-rally-primary hover:bg-rally-primary/90 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rally-primary/30 cursor-pointer transition-all active:scale-95"
              >
                <span>مشاهده سانس‌های این باشگاه</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Navigation, ArrowLeft } from 'lucide-react';
import { CourtClub } from '../../../types/rally';
import { formatPersianPrice, toPersianDigits } from '../../../utils/persianUtils';
import { LeafletCourtsMap } from './LeafletCourtsMap';
import { MAP_CITIES, MAP_COURTS, MapCityConfig, MapCourtItem } from '../../../data/courtsMapData';
import { getDynamicMapCourts } from '../../../utils/clubLocationStorage';
import { MOCK_CLUBS } from '../../../data/mockRallyData';
import { getClubRichProfile } from '../../../data/clubsRichData';

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
  const [mapCourts, setMapCourts] = useState<MapCourtItem[]>(() => getDynamicMapCourts(MAP_COURTS));
  const [selectedCity, setSelectedCity] = useState<MapCityConfig>(MAP_CITIES[0]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>(MAP_COURTS[0].id);

  // Sync dynamic courts from storage and custom events
  useEffect(() => {
    setMapCourts(getDynamicMapCourts(MAP_COURTS));

    const handleLocationUpdate = () => {
      setMapCourts(getDynamicMapCourts(MAP_COURTS));
    };

    window.addEventListener('rally_club_locations_updated', handleLocationUpdate);
    return () => {
      window.removeEventListener('rally_club_locations_updated', handleLocationUpdate);
    };
  }, []);

  const selectedCourt = mapCourts.find((c) => c.id === selectedCourtId) || mapCourts[0];

  const handleCitySelect = (city: MapCityConfig) => {
    setSelectedCity(city);
    const firstInCity = mapCourts.find((c) => c.cityId === city.id);
    if (firstInCity) {
      setSelectedCourtId(firstInCity.id);
    }
  };

  const handleOpenClub = (courtId: string) => {
    let matchedClub = clubs.find(
      (c) => c.id === courtId || c.id === `club-${courtId}` || c.id.replace('club-', '') === courtId
    );
    if (!matchedClub) {
      matchedClub = MOCK_CLUBS.find(
        (c) => c.id === courtId || c.id === `club-${courtId}` || c.id.replace('club-', '') === courtId
      );
    }
    if (matchedClub) {
      onSelectClub(matchedClub);
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-200 ${
        isOpen
          ? 'opacity-100 pointer-events-auto bg-black/85'
          : 'opacity-0 pointer-events-none invisible'
      }`}
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full overflow-hidden relative shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header - Minimal and Clean */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rally-primary/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              کورت‌های پدل و تنیس
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* City Selector Quick Pills */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-500 ml-1 shrink-0">شهر:</span>
          {MAP_CITIES.map((city) => {
            const isSelected = city.id === selectedCity.id;
            return (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-1 ring-sky-400'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{city.name}</span>
              </button>
            );
          })}
        </div>

        {/* Real Leaflet Map with Fast CDN */}
        <div className="relative flex-1 min-h-[420px] sm:min-h-[500px] p-2 sm:p-3 bg-slate-900 overflow-hidden">
          {isOpen && (
            <LeafletCourtsMap
              courts={mapCourts}
              selectedCity={selectedCity}
              selectedCourtId={selectedCourtId}
              onSelectCourt={(court) => setSelectedCourtId(court.id)}
              onOpenClubDetail={handleOpenClub}
              isVisible={isOpen}
            />
          )}
        </div>

        {/* Selected Court Bottom Preview - Rich Details without duplicate navigation */}
        {selectedCourt && (() => {
          const richProfile = getClubRichProfile(selectedCourt.id);
          const headlineText = richProfile?.headline || selectedCourt.address;
          return (
            <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onClick={() => handleOpenClub(selectedCourt.id)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700 relative cursor-pointer group"
                >
                  <img
                    src={selectedCourt.image}
                    alt={selectedCourt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className={`absolute top-1 right-1 text-[9px] font-black px-1 rounded ${
                    selectedCourt.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                  }`}>
                    {selectedCourt.status === 'ACTIVE' ? 'فعال' : 'به‌زودی'}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      onClick={() => handleOpenClub(selectedCourt.id)}
                      className="text-xs sm:text-sm font-black text-white hover:text-sky-400 cursor-pointer transition-colors"
                    >
                      {selectedCourt.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedCourt.courtType === 'INDOOR' ? 'مسقف' : 'روباز'}
                    </span>
                    <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded">
                      {selectedCourt.area}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {headlineText}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-300 font-bold">
                    {selectedCourt.startingPrice && (
                      <span>شروع سانس: {formatPersianPrice(selectedCourt.startingPrice)} تومان</span>
                    )}
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-black">⭐ {toPersianDigits(selectedCourt.rating)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Navigate directly to club page */}
              <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-end">
                <button
                  onClick={() => handleOpenClub(selectedCourt.id)}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-rally-primary hover:bg-rally-primary/90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-rally-primary/30 cursor-pointer transition-all active:scale-95"
                >
                  <span>مشاهده زمین و رزرو سانس‌ها</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

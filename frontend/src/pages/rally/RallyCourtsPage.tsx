import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { CourtClub, TimeSlotItem, SportType } from '../../types/rally';
import { MOCK_CLUBS } from '../../data/mockRallyData';
import { CourtCard } from '../../components/rally/CourtCard';
import { CourtSearchCapsuleBar, TimeWindowFilter } from '../../components/rally/CourtSearchCapsuleBar';
import { CourtsToolbar, CourtSortOption } from '../../components/rally/courts/CourtsToolbar';
import { CourtsMapModal } from '../../components/rally/courts/CourtsMapModal';
import { CourtsEmptyState } from '../../components/rally/CourtsEmptyState';
import { matchesPersianSearch, parseTimeToMinutes, isSlotPast } from '../../utils/persianUtils';
import { useCourtsDistance } from '../../hooks/useCourtsDistance';
import { rallyApi } from '../../services/rallyApi';
import { applySavedLocationsToClubs } from '../../utils/clubLocationStorage';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('تهران');
  const [sportFilter, setSportFilter] = useState<SportType | 'ALL'>(initialFilters?.sport || 'ALL');
  const [areaFilter, setAreaFilter] = useState<string>(initialFilters?.area || 'ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INDOOR' | 'OUTDOOR'>('ALL');
  const [timeWindow, setTimeWindow] = useState<TimeWindowFilter>('ALL');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('ALL');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>('');
  const [sortOption, setSortOption] = useState<CourtSortOption>('POPULAR');
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [clubsData, setClubsData] = useState<CourtClub[]>(() => applySavedLocationsToClubs(MOCK_CLUBS));

  const {
    isLocating,
    locationError,
    requestLocationAndSort,
    clearDistanceSort,
    applyDistanceToClubs
  } = useCourtsDistance();

  // محاسبه تاریخ بر اساس افست انتخابی
  const targetDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDayOffset);
    return d.toISOString().split('T')[0];
  }, [selectedDayOffset]);

  // واکشی تقویم زنده سانس‌ها از سرور
  const loadLiveCourts = useCallback(async () => {
    setIsLoading(true);
    setNetworkError(null);
    try {
      const updatedClubs = await Promise.all(
        MOCK_CLUBS.map(async (mockClub) => {
          const calendar = await rallyApi.getClubCalendar(mockClub.id, targetDateStr);
          if (calendar && calendar.courts && calendar.courts.length > 0) {
            const allCourtSlots: TimeSlotItem[] = [];
            for (const court of calendar.courts) {
              for (const slot of court.slots || []) {
                allCourtSlots.push({
                  slotId: slot.slot_id,
                  startTime: slot.start_time,
                  endTime: slot.end_time,
                  durationMinutes: 90,
                  price: slot.price,
                  status: slot.status
                });
              }
            }

            if (allCourtSlots.length > 0) {
              const firstAvail = allCourtSlots.find(
                (s) => s.status === 'AVAILABLE' && !isSlotPast(targetDateStr, s.startTime)
              );
              return {
                ...mockClub,
                slots: allCourtSlots,
                nearestAvailableSlot: firstAvail ? `${firstAvail.startTime} تا ${firstAvail.endTime}` : 'تکمیل'
              };
            }
          }
          return mockClub;
        })
      );
      setClubsData(applySavedLocationsToClubs(updatedClubs));
    } catch {
      setNetworkError('اختلال در برقراری ارتباط با سامانه رزرو زنده. در حال نمایش آخرین اطلاعات ذخیره‌شده.');
      setClubsData(applySavedLocationsToClubs(MOCK_CLUBS));
    } finally {
      setIsLoading(false);
    }
  }, [targetDateStr]);

  useEffect(() => {
    loadLiveCourts();

    const handleLocationUpdate = () => {
      setClubsData((prev) => applySavedLocationsToClubs(prev));
    };
    window.addEventListener('rally_club_locations_updated', handleLocationUpdate);
    return () => {
      window.removeEventListener('rally_club_locations_updated', handleLocationUpdate);
    };
  }, [loadLiveCourts]);

  const handleSortSelect = (opt: CourtSortOption) => {
    setSortOption(opt);
    if (opt === 'NEAREST') {
      requestLocationAndSort();
    } else {
      clearDistanceSort();
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCity('ALL');
    setSportFilter('ALL');
    setTypeFilter('ALL');
    setAreaFilter('ALL');
    setTimeWindow('ALL');
    setSelectedAmenity('ALL');
    setSelectedDayOffset(0);
    setSortOption('POPULAR');
    clearDistanceSort();
  };

  // فیلتر هوشمند کورت‌ها بر اساس معیارهای ترکیبی و نرمال‌سازی فارسی
  const filteredClubs = useMemo(() => {
    return clubsData.filter((club) => {
      if (selectedCity !== 'ALL' && club.city !== selectedCity) return false;
      if (sportFilter !== 'ALL' && club.sport !== sportFilter) return false;
      if (typeFilter !== 'ALL' && club.courtType !== typeFilter) return false;

      // فیلتر متنی نرمال‌شده (نام، محله، شهر و آدرس)
      if (searchQuery.trim()) {
        const fullClubText = `${club.name} ${club.area} ${club.city} ${club.address}`;
        if (!matchesPersianSearch(fullClubText, searchQuery)) return false;
      }

      if (areaFilter !== 'ALL') {
        const areaText = `${club.area} ${club.city} ${club.name}`;
        if (!matchesPersianSearch(areaText, areaFilter)) return false;
      }

      // فیلتر امکانات رفاهی
      if (selectedAmenity !== 'ALL') {
        const hasAmenity = club.amenities?.some((a) => a.id === selectedAmenity || a.iconName === selectedAmenity);
        if (!hasAmenity) return false;
      }

      // فیلتر بازه زمانی (صبح/عصر/شب)
      if (timeWindow !== 'ALL') {
        const hasSlotInWindow = club.slots.some((s) => {
          if (s.status !== 'AVAILABLE') return false;
          if (isSlotPast(targetDateStr, s.startTime)) return false;
          const mins = parseTimeToMinutes(s.startTime);
          if (timeWindow === 'MORNING') return mins >= 360 && mins < 720;
          if (timeWindow === 'AFTERNOON') return mins >= 720 && mins < 1080;
          if (timeWindow === 'NIGHT') return mins >= 1080 && mins < 1440;
          return true;
        });
        if (!hasSlotInWindow) return false;
      }

      return true;
    });
  }, [clubsData, selectedCity, sportFilter, typeFilter, searchQuery, areaFilter, selectedAmenity, timeWindow, targetDateStr]);

  const displayClubs = useMemo(() => {
    let list = applyDistanceToClubs(filteredClubs);
    if (sortOption === 'CHEAPEST') {
      return [...list].sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
    }
    if (sortOption === 'POPULAR') {
      return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortOption === 'NEWEST') {
      return [...list].reverse();
    }
    return list;
  }, [applyDistanceToClubs, filteredClubs, sortOption]);

  return (
    <div className="space-y-6 max-w-7xl 2xl:max-w-[1600px] mx-auto pb-16" dir="rtl">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1d1d1f] tracking-tight">
            کورت‌ها و سانس‌ها
          </h1>
        </div>

        <button
          onClick={() => loadLiveCourts()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/[0.08] text-rally-charcoal hover:border-rally-primary/40 hover:text-rally-primary transition-all shadow-xs text-xs font-bold cursor-pointer shrink-0 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rally-primary' : 'text-gray-400'}`} />
          <span>بروزرسانی</span>
        </button>
      </div>

      {/* 2. Jabama-Style Smart Capsule Search Bar */}
      <CourtSearchCapsuleBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDayOffset={selectedDayOffset}
        onSelectDayOffset={(offset, label) => {
          setSelectedDayOffset(offset);
          if (label) setSelectedDateLabel(label);
        }}
        selectedDateLabel={selectedDateLabel}
        timeWindow={timeWindow}
        onTimeWindowChange={setTimeWindow}
        locationError={locationError}
      />

      {/* 3. Toolbar: Sorting & Interactive Map Toggle */}
      <CourtsToolbar
        currentSort={sortOption}
        onSelectSort={handleSortSelect}
        onOpenMap={() => setIsMapModalOpen(true)}
        clubsCount={displayClubs.length}
        isLocating={isLocating}
      />

      {/* 5. Network Error State (تلفیق‌نشده با Empty State) */}
      {networkError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{networkError}</span>
          </div>
          <button
            onClick={() => loadLiveCourts()}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shrink-0 cursor-pointer"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* 6. Grid of Court Cards or Explicit Empty State */}
      {displayClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayClubs.map((club) => (
            <CourtCard
              key={club.id}
              club={club}
              targetDateStr={targetDateStr}
              onSelectClub={onSelectClub}
              onSelectDirectSlot={onSelectDirectSlot}
            />
          ))}
        </div>
      ) : (
        <CourtsEmptyState onResetFilters={resetAllFilters} />
      )}

      {/* 7. Interactive Courts Map Modal */}
      <CourtsMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        clubs={displayClubs}
        onSelectClub={onSelectClub}
      />
    </div>
  );
};

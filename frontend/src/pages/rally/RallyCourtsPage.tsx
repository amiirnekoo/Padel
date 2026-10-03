import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Calendar, MapPin, RefreshCw, AlertCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { CourtClub, TimeSlotItem, SportType } from '../../types/rally';
import { MOCK_CLUBS } from '../../data/mockRallyData';
import { CourtCard } from '../../components/rally/CourtCard';
import { AppleCategoryShelf, CategoryItem, APPLE_CATEGORIES } from '../../components/rally/AppleCategoryShelf';
import { rallyApi } from '../../services/rallyApi';

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
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('تهران');
  const [sportFilter, setSportFilter] = useState<SportType | 'ALL'>(initialFilters?.sport || 'ALL');
  const [areaFilter, setAreaFilter] = useState<string>(initialFilters?.area || 'ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INDOOR' | 'OUTDOOR'>('ALL');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = today, 1 = tomorrow, 2 = day after
  const [isLoading, setIsLoading] = useState(false);
  const [clubsData, setClubsData] = useState<CourtClub[]>(MOCK_CLUBS);

  const CITIES_LIST = [
    { id: 'تهران', label: 'تهران (۳ مجموعه معتبر)' },
    { id: 'ALL', label: 'همه شهرها' },
  ];

  // Compute selected ISO date string
  const targetDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDayOffset);
    return d.toISOString().split('T')[0];
  }, [selectedDayOffset]);

  // Fetch live venues and calendar slots from backend
  const loadLiveCourts = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch public venues from backend
      const venues = await rallyApi.getPublicVenues();
      
      // 2. Map through clubs and fetch real-time calendar slots for the selected date
      const updatedClubs = await Promise.all(
        MOCK_CLUBS.map(async (mockClub) => {
          const calendar = await rallyApi.getClubCalendar(mockClub.id, targetDateStr);
          if (calendar && calendar.courts && calendar.courts.length > 0) {
            // Aggregate all live slots across courts in this club
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
              const firstAvail = allCourtSlots.find((s) => s.status === 'AVAILABLE');
              return {
                ...mockClub,
                slots: allCourtSlots,
                nearestAvailableSlot: firstAvail ? `${firstAvail.startTime} تا ${firstAvail.endTime}` : 'تکمیل',
              };
            }
          }
          return mockClub;
        })
      );

      setClubsData(updatedClubs);
    } catch {
      // Fallback seamlessly to mock data
      setClubsData(MOCK_CLUBS);
    } finally {
      setIsLoading(false);
    }
  }, [targetDateStr]);

  useEffect(() => {
    loadLiveCourts();
  }, [loadLiveCourts]);

  const handleCategorySelect = (cat: CategoryItem) => {
    setSelectedCatId(cat.id);
    if (cat.sport) setSportFilter(cat.sport);
    if (cat.type) setTypeFilter(cat.type);
    if (cat.city) setAreaFilter(cat.city);
    if (cat.id === 'ALL') {
      setSportFilter('ALL');
      setTypeFilter('ALL');
      setAreaFilter('ALL');
    }
  };

  const filteredClubs = useMemo(() => {
    return clubsData.filter((club) => {
      if (selectedCity !== 'ALL' && club.city !== selectedCity) return false;
      if (sportFilter !== 'ALL' && club.sport !== sportFilter) return false;
      if (typeFilter !== 'ALL' && club.courtType !== typeFilter) return false;
      if (areaFilter !== 'ALL') {
        if (!club.area.includes(areaFilter) && !club.city.includes(areaFilter) && !club.name.includes(areaFilter)) return false;
      }
      return true;
    });
  }, [clubsData, selectedCity, sportFilter, typeFilter, areaFilter]);

  const DATE_TABS = [
    { offset: 0, label: 'امروز', sublabel: 'سه‌شنبه' },
    { offset: 1, label: 'فردا', sublabel: 'چهارشنبه' },
    { offset: 2, label: 'پس‌فردا', sublabel: 'پنجشنبه' },
    { offset: 3, label: 'آخر هفته', sublabel: 'جمعه' },
  ];

  return (
    <div className="space-y-8 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto pb-12">
      
      {/* 1. Apple Announcement Banner */}
      <div className="text-center text-xs text-[#86868b] py-1 border-b border-black/[0.04]">
        <span>رزرو آنلاین سانس‌های پدل و تنیس با برابری ۱۰۰٪ نرخ مصوب باشگاه، بدون دریافت هیچ کارمزد مازاد. </span>
        <span className="text-rally-primary font-bold hover:underline cursor-pointer">راهنمای رزرو فوری &gt;</span>
      </div>

      {/* 2. Apple Store Style Display Header */}
      <div className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1d1d1f] tracking-tight">
            کورت‌ها و سانس‌ها
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] mt-2 font-medium max-w-xl">
            سریع‌ترین و شفاف‌ترین شیوه رزرو زمین‌های پدل و تنیس ایران همراه با قفل اتمیک ۱۰ دقیقه‌ای.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-rally-primary">
          <button
            onClick={() => loadLiveCourts()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/[0.06] text-rally-charcoal hover:border-rally-primary/40 hover:text-rally-primary transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rally-primary' : 'text-gray-400'}`} />
            <span>بروزرسانی زنده سانس‌ها</span>
          </button>
        </div>
      </div>

      {/* 3. Apple Horizontal Icon Shelf */}
      <AppleCategoryShelf selectedId={selectedCatId} onSelect={handleCategorySelect} />

      {/* 4. City Filter Pills Bar */}
      <div className="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 text-xs font-black text-gray-500 shrink-0 ml-2">
          <MapPin className="w-3.5 h-3.5 text-rally-primary" />
          <span>شهر:</span>
        </div>
        {CITIES_LIST.map((c) => {
          const isActive = selectedCity === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCity(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-rally-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 5. Apple Sub-Navigation & Date Selector */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Date Tabs (Apple Pill Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-xs font-black text-gray-400 ml-2 shrink-0">تاریخ بازی:</span>
          {DATE_TABS.map((tab) => (
            <button
              key={tab.offset}
              onClick={() => setSelectedDayOffset(tab.offset)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedDayOffset === tab.offset
                  ? 'bg-rally-primary text-white shadow-xs'
                  : 'bg-gray-100/80 text-rally-charcoal hover:bg-gray-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] opacity-80 ${selectedDayOffset === tab.offset ? 'text-white' : 'text-gray-500'}`}>
                ({tab.sublabel})
              </span>
            </button>
          ))}
        </div>

        {/* Quick Sport Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full text-xs font-bold shrink-0">
          {(['ALL', 'PADEL', 'TENNIS'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-4 py-1.5 rounded-full transition-all ${
                sportFilter === s ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
              }`}
            >
              {s === 'ALL' ? 'همه ورزش‌ها' : s === 'PADEL' ? 'پدل' : 'تنیس (خاکی)'}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Section Header */}
      <div className="flex items-baseline justify-between px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1d1d1f] tracking-tight">
            کورت‌های منتخب. <span className="text-[#86868b] font-medium text-lg sm:text-xl">آماده رزرو سانس برای {DATE_TABS.find((t) => t.offset === selectedDayOffset)?.label || 'امروز'}</span>
          </h2>
        </div>
        <span className="text-xs font-bold text-gray-400">
          {filteredClubs.length} مجموعه معتبر
        </span>
      </div>

      {/* 7. Grid of Apple Style Court Cards */}
      {filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-7">
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
        <div className="bg-white rounded-[28px] p-12 border border-black/[0.05] text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-12 h-12 text-rally-primary mx-auto opacity-70" />
          <h3 className="text-lg font-black text-rally-charcoal">
            سانس آزادی با این فیلترها یافت نشد
          </h3>
          <p className="text-xs text-[#86868b] leading-relaxed">
            می‌توانید شهر دیگری را انتخاب کنید یا فیلتر دسته‌بندی را به «همه زمین‌ها» بازگردانید.
          </p>
          <button
            onClick={() => {
              setSelectedCatId('ALL');
              setSelectedCity('ALL');
              setSportFilter('ALL');
              setTypeFilter('ALL');
              setAreaFilter('ALL');
            }}
            className="px-6 py-2.5 rounded-full bg-rally-primary text-white text-xs font-bold shadow-xs hover:bg-rally-primary-light transition-all cursor-pointer"
          >
            مشاهده همه کورت‌ها در سراسر کشور
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, ChevronDown, ArrowLeft, Users, Trophy, ChevronLeft } from 'lucide-react';
import { SportType } from '../../types/rally';

interface RallyBookingSearchProps {
  onSearch: (params: { sport: SportType; city: string; area?: string; date: string }) => void;
  onNavigateToCoaches: () => void;
  onNavigateToTournaments: () => void;
}

export const RallyBookingSearch: React.FC<RallyBookingSearchProps> = ({
  onSearch,
  onNavigateToCoaches,
  onNavigateToTournaments
}) => {
  const [selectedSport, setSelectedSport] = useState<SportType>('PADEL');
  const [selectedCity, setSelectedCity] = useState('تهران');
  const [selectedArea, setSelectedArea] = useState('همه مناطق');
  const [selectedDate, setSelectedDate] = useState('فردا');
  const [dateDetail, setDateDetail] = useState('چهارشنبه ۹ مهر ۱۴۰۵');

  const [openDropdown, setOpenDropdown] = useState<'sport' | 'city' | 'date' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sportOptions: { id: SportType; label: string }[] = [
    { id: 'PADEL', label: 'پدل' },
    { id: 'TENNIS', label: 'تنیس' }
  ];

  const cityOptions = [
    { name: 'تهران', areas: ['همه مناطق', 'سعادت‌آباد', 'انقلاب / سئول', 'نارمک', 'پاسداران', 'نیاوران'] },
    { name: 'کیش', areas: ['همه مناطق', 'مرکز همایش‌ها', 'دامون'] },
    { name: 'شیراز', areas: ['همه مناطق', 'قصردشت', 'عفیف‌آباد'] },
    { name: 'اصفهان', areas: ['همه مناطق', 'چهارباغ', 'مرداویج'] }
  ];

  const dateOptions = [
    { label: 'امروز', detail: 'سه‌شنبه ۸ مهر ۱۴۰۵' },
    { label: 'فردا', detail: 'چهارشنبه ۹ مهر ۱۴۰۵' },
    { label: 'پس‌فردا', detail: 'پنج‌شنبه ۱۰ مهر ۱۴۰۵' },
    { label: 'آخر هفته', detail: 'جمعه ۱۱ مهر ۱۴۰۵' }
  ];

  const handleSearchClick = () => {
    onSearch({
      sport: selectedSport,
      city: selectedCity,
      area: selectedArea !== 'همه مناطق' ? selectedArea : undefined,
      date: selectedDate
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4" dir="rtl" ref={containerRef}>
      
      {/* Main Unified Horizontal Search Box */}
      <div className="w-full bg-[#F5F4EF] border border-[#E8E6DD] rounded-2xl md:rounded-full p-2.5 sm:p-3 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-1 relative z-20">
        
        {/* Field 1: Sport Type */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'sport' ? null : 'sport')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl md:rounded-full text-right transition-all cursor-pointer ${
              openDropdown === 'sport' ? 'bg-white shadow-xs' : 'hover:bg-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#172320]/5 flex items-center justify-center text-[#172320]">
                🎾
              </span>
              <div>
                <span className="block text-[11px] font-bold text-[#66706D]">نوع ورزش</span>
                <span className="text-sm font-black text-[#172320]">
                  {selectedSport === 'PADEL' ? 'پدل' : 'تنیس'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#66706D]" />
          </button>

          {/* Sport Dropdown */}
          {openDropdown === 'sport' && (
            <div className="absolute top-full mt-2 right-0 w-44 bg-white border border-[#E8E6DD] rounded-2xl shadow-xl p-1.5 z-30">
              {sportOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedSport(opt.id);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                    selectedSport === opt.id ? 'bg-[#0E3D38] text-white' : 'text-[#172320] hover:bg-[#F5F4EF]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedSport === opt.id && <span className="w-2 h-2 rounded-full bg-[#D7ED68]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-8 bg-[#E8E6DD]" />

        {/* Field 2: City / Neighborhood */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl md:rounded-full text-right transition-all cursor-pointer ${
              openDropdown === 'city' ? 'bg-white shadow-xs' : 'hover:bg-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#172320]/5 flex items-center justify-center text-[#172320]">
                <MapPin className="w-4 h-4 text-[#0E3D38]" />
              </span>
              <div>
                <span className="block text-[11px] font-bold text-[#66706D]">شهر و منطقه</span>
                <span className="text-sm font-black text-[#172320]">
                  {selectedCity} {selectedArea !== 'همه مناطق' ? `(${selectedArea})` : ''}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#66706D]" />
          </button>

          {/* City Dropdown */}
          {openDropdown === 'city' && (
            <div className="absolute top-full mt-2 right-0 w-60 bg-white border border-[#E8E6DD] rounded-2xl shadow-xl p-2 z-30">
              <span className="block text-[10px] font-bold text-[#66706D] px-2 py-1">انتخاب شهر</span>
              <div className="flex gap-1 mb-2">
                {cityOptions.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedCity(c.name);
                      setSelectedArea('همه مناطق');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedCity === c.name ? 'bg-[#0E3D38] text-white' : 'bg-[#F5F4EF] text-[#172320]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <span className="block text-[10px] font-bold text-[#66706D] px-2 py-1">مناطق فعال</span>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {cityOptions.find((c) => c.name === selectedCity)?.areas.map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      setSelectedArea(area);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      selectedArea === area ? 'bg-[#D7ED68]/20 text-[#0E3D38] font-bold' : 'text-[#172320] hover:bg-[#F5F4EF]'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-px h-8 bg-[#E8E6DD]" />

        {/* Field 3: Date */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl md:rounded-full text-right transition-all cursor-pointer ${
              openDropdown === 'date' ? 'bg-white shadow-xs' : 'hover:bg-black/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#172320]/5 flex items-center justify-center text-[#172320]">
                <Calendar className="w-4 h-4 text-[#0E3D38]" />
              </span>
              <div>
                <span className="block text-[11px] font-bold text-[#66706D]">تاریخ سانس</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-[#172320]">{selectedDate}</span>
                  <span className="text-[10px] text-[#66706D] hidden lg:inline">({dateDetail})</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#66706D]" />
          </button>

          {/* Date Dropdown */}
          {openDropdown === 'date' && (
            <div className="absolute top-full mt-2 left-0 right-0 md:left-auto md:right-0 w-64 bg-white border border-[#E8E6DD] rounded-2xl shadow-xl p-2 z-30">
              <span className="block text-[10px] font-bold text-[#66706D] px-2 py-1">روز مورد نظر</span>
              <div className="space-y-1">
                {dateOptions.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => {
                      setSelectedDate(d.label);
                      setDateDetail(d.detail);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      selectedDate === d.label
                        ? 'bg-[#0E3D38] text-white font-bold'
                        : 'text-[#172320] hover:bg-[#F5F4EF]'
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-[10px] opacity-75">{d.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: مشاهده سانس‌ها */}
        <button
          onClick={handleSearchClick}
          className="w-full md:w-auto px-6 lg:px-8 py-3.5 rounded-xl md:rounded-full bg-[#D7ED68] hover:bg-[#C7DE54] text-[#172320] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#D7ED68]/30 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <span>مشاهده سانس‌ها</span>
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Two Secondary Action Pills below Search Box */}
      <div className="flex items-center gap-3 z-10 w-full sm:w-auto justify-center">
        <button
          onClick={onNavigateToCoaches}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black/45 hover:bg-black/60 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all cursor-pointer backdrop-none"
        >
          <Users className="w-4 h-4 text-[#D7ED68]" />
          <span>پیدا کردن مربی</span>
          <ChevronLeft className="w-3.5 h-3.5 opacity-80" />
        </button>

        <button
          onClick={onNavigateToTournaments}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black/45 hover:bg-black/60 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all cursor-pointer backdrop-none"
        >
          <Trophy className="w-4 h-4 text-[#D7ED68]" />
          <span>مسابقات پیش رو</span>
          <ChevronLeft className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>

    </div>
  );
};

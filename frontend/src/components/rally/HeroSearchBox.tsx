import React, { useState } from 'react';
import {
  CalendarCheck,
  Award,
  Users2,
  Search,
  MapPin,
  ChevronLeft
} from 'lucide-react';
import { SportType } from '../../types/rally';

export type SearchTabType = 'court' | 'coach' | 'tournament';

interface HeroSearchBoxProps {
  onSearchCourts: (filters: { sport: SportType; area: string; date: string; time: string }) => void;
  onSearchCoaches: (filters: { sport: SportType; level: string; goal: string }) => void;
  onSearchTournaments: (filters: { sport: SportType; level: string }) => void;
  selectedCity: string;
}

export const HeroSearchBox: React.FC<HeroSearchBoxProps> = ({
  onSearchCourts,
  onSearchCoaches,
  onSearchTournaments,
  selectedCity
}) => {
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTabType>('court');
  const [sport, setSport] = useState<SportType>('PADEL');
  const [area, setArea] = useState<string>('همه محدوده‌ها');
  const [day, setDay] = useState<string>('tomorrow');
  const [timeOfDay, setTimeOfDay] = useState<string>('evening');
  const [coachLevel, setCoachLevel] = useState<string>('BEGINNER');
  const [coachGoal, setCoachGoal] = useState<string>('یادگیری پایه و تکنیک');
  const [tournamentLevel, setTournamentLevel] = useState<string>('آزاد / سطح ۳');

  const AREAS = ['همه محدوده‌ها', 'مینی‌سیتی (ویوا)', 'آجودانیه (لفور)', 'ونک / سئول (انقلاب)', 'ولنجک / توچال', 'شهرک غرب', 'پاسداران'];

  const handleExecuteSearch = () => {
    if (activeSearchTab === 'court') {
      const dateLabel = day === 'today' ? 'امروز' : day === 'tomorrow' ? 'فردا' : 'آخر هفته';
      onSearchCourts({ sport, area, date: dateLabel, time: timeOfDay });
    } else if (activeSearchTab === 'coach') {
      onSearchCoaches({ sport, level: coachLevel, goal: coachGoal });
    } else {
      onSearchTournaments({ sport, level: tournamentLevel });
    }
  };

  return (
    <div className="mt-8 lg:mt-10 bg-white rounded-2xl p-4 sm:p-5 shadow-xl text-rally-charcoal border border-gray-100">
      {/* 3 Main Action Tabs */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100 overflow-x-auto">
        <button
          onClick={() => setActiveSearchTab('court')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSearchTab === 'court'
              ? 'bg-rally-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>رزرو زمین</span>
        </button>

        <button
          onClick={() => setActiveSearchTab('coach')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSearchTab === 'coach'
              ? 'bg-rally-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>پیدا کردن مربی</span>
        </button>

        <button
          onClick={() => setActiveSearchTab('tournament')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSearchTab === 'tournament'
              ? 'bg-rally-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>مسابقات</span>
        </button>
      </div>

      {/* Dynamic Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1">نوع ورزش</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setSport('PADEL')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                sport === 'PADEL' ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
              }`}
            >
              🎾 پدل
            </button>
            <button
              type="button"
              onClick={() => setSport('TENNIS')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                sport === 'TENNIS' ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
              }`}
            >
              🏸 تنیس
            </button>
          </div>
        </div>

        {activeSearchTab === 'court' && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">شهر و محدوده</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-rally-charcoal"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>{selectedCity} - {a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">روز بازی</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'today', label: 'امروز' },
                  { id: 'tomorrow', label: 'فردا' },
                  { id: 'weekend', label: 'آخر هفته' }
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDay(d.id)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                      day === d.id
                        ? 'bg-rally-primary/10 border-rally-primary text-rally-primary'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">زمان (اختیاری)</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-rally-charcoal"
              >
                <option value="all">تمام ساعات روز</option>
                <option value="morning">صبح (۰۸:۰۰ الی ۱۳:۰۰)</option>
                <option value="evening">عصر و شب (۱۷:۰۰ الی ۲۳:۰۰)</option>
              </select>
            </div>
          </>
        )}

        {activeSearchTab === 'coach' && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">سطح مهارت شما</label>
              <select
                value={coachLevel}
                onChange={(e) => setCoachLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-rally-charcoal"
              >
                <option value="BEGINNER">مبتدی (اولین بار با راکت)</option>
                <option value="INTERMEDIATE">متوسط (آشنا با ضربات)</option>
                <option value="ADVANCED">پیشرفته و مسابقاتی</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">هدف جلسه تمرینی</label>
              <select
                value={coachGoal}
                onChange={(e) => setCoachGoal(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-rally-charcoal"
              >
                <option value="یادگیری پایه و تکنیک">یادگیری پایه، گرفتن راکت و قوانین</option>
                <option value="اصلاح ضربات شیشه">مهارت بازی با دیواره‌های شیشه‌ای (Bandeja)</option>
                <option value="تمرین بازی دونفره و تاکتیک">تاکتیک و جایگیری در مسابقه دونفره</option>
              </select>
            </div>
          </>
        )}

        {activeSearchTab === 'tournament' && (
          <>
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">رده و سطح مسابقه</label>
              <select
                value={tournamentLevel}
                onChange={(e) => setTournamentLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-rally-charcoal"
              >
                <option value="مبتدی و تفریحی">تورنمنت‌های مبتدی و آخر هفته (Starter)</option>
                <option value="آزاد / سطح ۳">مسابقات آزاد امتیازی (سطح ۳ کشوری)</option>
                <option value="رسمی بانوان">مسابقات اختصاصی بانوان</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">شهر رویداد</label>
              <div className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center text-xs font-bold text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-rally-primary ml-1.5" />
                <span>{selectedCity} و حومه</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Search Button */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 hidden sm:block">
          {activeSearchTab === 'court' && 'مشاهده زمین‌های دارای سانس آزاد بدون نیاز به عضویت اولیه'}
          {activeSearchTab === 'coach' && 'مربیان دارای کارت مربیگری تأییدشده فدراسیون'}
          {activeSearchTab === 'tournament' && 'رویدادهای دارای جوایز نقدی و هدایای اسپانسر'}
        </span>

        <button
          onClick={handleExecuteSearch}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-rally-primary hover:bg-rally-primary-light text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Search className="w-4 h-4 text-rally-accent" />
          <span>
            {activeSearchTab === 'court' && 'جستجوی زمین‌های آزاد'}
            {activeSearchTab === 'coach' && 'مشاهده مربیان واجد شرایط'}
            {activeSearchTab === 'tournament' && 'مشاهده جدول مسابقات'}
          </span>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

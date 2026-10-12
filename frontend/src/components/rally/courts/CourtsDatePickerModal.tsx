import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar as CalendarIcon, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../../utils/persianUtils';
import { PERSIAN_MONTH_NAMES, WEEKDAYS, getPersianDate, PersianDateObj } from '../../../utils/persianCalendar';

interface CourtsDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOffset: number;
  onSelectOffset: (offset: number, label: string) => void;
}

export const CourtsDatePickerModal: React.FC<CourtsDatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedOffset,
  onSelectOffset
}) => {
  const [activeMonthTab, setActiveMonthTab] = useState<0 | 1>(0);

  // Build calendar dataset for 2 full consecutive months
  const { currentMonthConfig, nextMonthConfig } = useMemo(() => {
    const today = new Date();
    const todayP = getPersianDate(today);

    const map = new Map<number, { d: Date; p: PersianDateObj; dayOfWeek: number }>();
    for (let offset = -35; offset <= 65; offset++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
      const p = getPersianDate(d);
      const dayOfWeek = (d.getDay() + 1) % 7;
      map.set(offset, { d, p, dayOfWeek });
    }

    const buildMonth = (year: number, month: number) => {
      const days = [];
      for (const [offset, item] of map.entries()) {
        if (item.p.year === year && item.p.month === month) {
          days.push({
            offset,
            dayNum: item.p.day,
            weekdayName: WEEKDAYS[item.dayOfWeek].full,
            dayOfWeek: item.dayOfWeek,
            isPast: offset < 0,
            isToday: offset === 0,
            isFriday: item.dayOfWeek === 6
          });
        }
      }
      days.sort((a, b) => a.dayNum - b.dayNum);
      const startPadding = days.length > 0 ? days[0].dayOfWeek : 0;
      return {
        year,
        month,
        monthName: PERSIAN_MONTH_NAMES[month],
        days,
        startPadding
      };
    };

    const cMonth = buildMonth(todayP.year, todayP.month);
    const nMonthNum = todayP.month === 12 ? 1 : todayP.month + 1;
    const nYear = todayP.month === 12 ? todayP.year + 1 : todayP.year;
    const nMonth = buildMonth(nYear, nMonthNum);

    return { currentMonthConfig: cMonth, nextMonthConfig: nMonth };
  }, []);

  // Sync active month tab when modal opens based on selectedOffset
  useEffect(() => {
    if (isOpen) {
      const inNext = nextMonthConfig.days.some((d) => d.offset === selectedOffset);
      setActiveMonthTab(inNext ? 1 : 0);
    }
  }, [isOpen, selectedOffset, nextMonthConfig]);

  const quickShortcuts = useMemo(() => {
    const today = new Date();
    const todayWeekdayIdx = (today.getDay() + 1) % 7;
    const daysUntilFriday = (6 - todayWeekdayIdx + 7) % 7;
    const fridayOffset = daysUntilFriday === 0 ? 0 : daysUntilFriday;

    return [
      { offset: 0, label: 'امروز', sublabel: WEEKDAYS[todayWeekdayIdx].full },
      { offset: 1, label: 'فردا', sublabel: WEEKDAYS[(todayWeekdayIdx + 1) % 7].full },
      { offset: 2, label: 'پس‌فردا', sublabel: WEEKDAYS[(todayWeekdayIdx + 2) % 7].full },
      { offset: fridayOffset, label: 'آخر هفته', sublabel: 'جمعه' },
    ];
  }, []);

  if (!isOpen) return null;

  const displayedMonth = activeMonthTab === 0 ? currentMonthConfig : nextMonthConfig;

  const handleSelectDay = (offset: number, label: string) => {
    onSelectOffset(offset, label);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 relative shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rally-primary/10 text-rally-primary flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                تقویم رسمی کورت‌های پدل
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                مشاهده موجودی زنده زمین‌ها و قفل ۱۰ دقیقه‌ای نرخ مصوب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick Date Shortcuts */}
        <div className="py-3 border-b border-gray-100 shrink-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {quickShortcuts.map((item) => {
              const isSelected = selectedOffset === item.offset;
              return (
                <button
                  key={item.offset}
                  onClick={() => handleSelectDay(item.offset, `${item.label} (${item.sublabel})`)}
                  className={`py-1.5 px-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center gap-0.5 ${
                    isSelected
                      ? 'bg-rally-primary text-white border-rally-primary shadow-sm shadow-rally-primary/30'
                      : 'bg-gray-50 border-gray-200 text-slate-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    {item.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Month Selector with Tabs & Navigation Arrows */}
        <div className="pt-3 pb-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveMonthTab(0)}
              disabled={activeMonthTab === 0}
              className={`p-1.5 rounded-xl transition-all ${
                activeMonthTab === 0 ? 'text-gray-300 cursor-default' : 'text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer'
              }`}
              title="ماه جاری"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveMonthTab(0)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMonthTab === 0
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-gray-500 hover:text-slate-900'
              }`}
            >
              <span>{currentMonthConfig.monthName} {toPersianDigits(currentMonthConfig.year)}</span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-full font-bold">این ماه</span>
            </button>

            <button
              onClick={() => setActiveMonthTab(1)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMonthTab === 1
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-gray-500 hover:text-slate-900'
              }`}
            >
              <span>{nextMonthConfig.monthName} {toPersianDigits(nextMonthConfig.year)}</span>
              <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full font-bold">ماه بعد</span>
            </button>

            <button
              onClick={() => setActiveMonthTab(1)}
              disabled={activeMonthTab === 1}
              className={`p-1.5 rounded-xl transition-all ${
                activeMonthTab === 1 ? 'text-gray-300 cursor-default' : 'text-slate-700 hover:bg-white hover:shadow-xs cursor-pointer'
              }`}
              title="ماه آینده"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-rally-primary" />
            <span>رزرو زنده</span>
          </div>
        </div>

        {/* Real Calendar Grid Header (Shanbeh to Jomeh) */}
        <div className="grid grid-cols-7 gap-1 text-center py-2 shrink-0 border-b border-gray-100">
          {WEEKDAYS.map((w, idx) => (
            <div
              key={w.full}
              className={`text-xs font-black ${idx === 6 ? 'text-amber-700' : 'text-gray-400'}`}
              title={w.full}
            >
              <span className="hidden sm:inline">{w.full}</span>
              <span className="sm:hidden">{w.short}</span>
            </div>
          ))}
        </div>

        {/* Real Calendar Grid Body */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty Padding Cells before day 1 */}
            {Array.from({ length: displayedMonth.startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="h-10 sm:h-12" />
            ))}

            {/* Month Day Cells */}
            {displayedMonth.days.map((day) => {
              const isSelected = selectedOffset === day.offset;
              const dateLabel = `${day.weekdayName} ${toPersianDigits(day.dayNum)} ${displayedMonth.monthName}`;

              if (day.isPast) {
                return (
                  <div
                    key={day.dayNum}
                    className="h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center text-slate-300 text-xs sm:text-sm font-medium bg-gray-50/50 cursor-not-allowed select-none"
                  >
                    <span>{toPersianDigits(day.dayNum)}</span>
                  </div>
                );
              }

              return (
                <button
                  key={day.dayNum}
                  onClick={() => handleSelectDay(day.offset, dateLabel)}
                  className={`h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-rally-primary text-white border-rally-primary shadow-md shadow-rally-primary/30 scale-102 font-black'
                      : day.isFriday
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100 font-bold'
                      : 'bg-white border-gray-200 text-slate-800 hover:border-rally-primary/60 hover:bg-sky-50/60 hover:text-rally-primary font-bold'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{toPersianDigits(day.dayNum)}</span>
                  {day.isToday && (
                    <span className={`text-[8px] font-black -mt-0.5 ${isSelected ? 'text-white/90' : 'text-emerald-600'}`}>
                      امروز
                    </span>
                  )}
                  {!day.isToday && day.isFriday && (
                    <span className={`text-[8px] font-bold -mt-0.5 ${isSelected ? 'text-white/90' : 'text-amber-700'}`}>
                      تعطیل
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Legend */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>امروز</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>جمعه</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rally-primary" />
              <span>انتخاب‌شده</span>
            </span>
          </div>
          <span>تقویم ۳۰ روزه</span>
        </div>
      </div>
    </div>
  );
};

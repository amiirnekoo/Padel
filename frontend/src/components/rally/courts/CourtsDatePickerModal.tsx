import React, { useState, useMemo } from 'react';
import { X, Calendar as CalendarIcon, ChevronRight, ChevronLeft, Check, RotateCcw } from 'lucide-react';
import { toPersianDigits } from '../../../utils/persianUtils';
import { WEEKDAYS, getPersianDate, getCalendarMonth, CalendarDayItem } from '../../../utils/persianCalendar';

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
  const today = useMemo(() => new Date(), []);
  const todayP = useMemo(() => getPersianDate(today), [today]);
  const [viewYear, setViewYear] = useState<number>(todayP.year);
  const [viewMonth, setViewMonth] = useState<number>(todayP.month);

  const monthConfig = useMemo(() => (
    getCalendarMonth(viewYear, viewMonth, toPersianDigits, today)
  ), [viewYear, viewMonth, today]);

  // Quick shortcuts
  const quickShortcuts = useMemo(() => {
    const todayWeekdayIdx = (today.getDay() + 1) % 7;
    const daysUntilFriday = (6 - todayWeekdayIdx + 7) % 7;
    const fridayOffset = daysUntilFriday === 0 ? 0 : daysUntilFriday;
    return [
      { offset: 0, label: 'امروز', sublabel: WEEKDAYS[todayWeekdayIdx].full },
      { offset: 1, label: 'فردا', sublabel: WEEKDAYS[(todayWeekdayIdx + 1) % 7].full },
      { offset: 2, label: 'پس‌فردا', sublabel: WEEKDAYS[(todayWeekdayIdx + 2) % 7].full },
      { offset: fridayOffset, label: 'آخر هفته', sublabel: 'جمعه' },
    ];
  }, [today]);

  const isCurrentMonth = viewYear === todayP.year && viewMonth === todayP.month;
  const canGoPrev = viewYear > todayP.year || (viewYear === todayP.year && viewMonth > todayP.month);

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleGoToday = () => {
    setViewYear(todayP.year);
    setViewMonth(todayP.month);
    const todayItem = monthConfig.days.find((d) => d.offset === 0);
    if (todayItem) {
      onSelectOffset(0, todayItem.fullDateLabel);
    }
  };

  const handleSelectDay = (day: CalendarDayItem) => {
    if (day.isPast) return;
    onSelectOffset(day.offset, day.fullDateLabel);
    // Modal stays open in-place per user requirement
  };

  const handleSelectShortcut = (offset: number, label: string) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + offset);
    const targetP = getPersianDate(targetDate);
    setViewYear(targetP.year);
    setViewMonth(targetP.month);
    const weekday = WEEKDAYS[(targetDate.getDay() + 1) % 7].full;
    onSelectOffset(offset, `${label} (${weekday})`);
  };

  if (!isOpen) return null;

  const selectedDayItem = monthConfig.days.find((d) => d.offset === selectedOffset);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 relative shadow-2xl border border-gray-100 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rally-primary/10 text-rally-primary flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                تقویم رسمی کورت‌های پدل
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                انتخاب تاریخ دلخواه و مشاهده نرخ پایه زنده (جاباما)
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

        {/* Quick Date Shortcuts (Without Closing Modal) */}
        <div className="py-2.5 border-b border-gray-100 shrink-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {quickShortcuts.map((item) => {
              const isSelected = selectedOffset === item.offset;
              return (
                <button
                  key={item.offset}
                  onClick={() => handleSelectShortcut(item.offset, item.label)}
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

        {/* Multi-Year Bahesab-Style Navigation Header */}
        <div className="pt-2.5 pb-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-extrabold ${
                canGoPrev
                  ? 'border-gray-200 text-slate-700 hover:bg-gray-50 cursor-pointer'
                  : 'border-transparent text-gray-300 cursor-not-allowed opacity-40'
              }`}
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="hidden sm:inline">ماه قبل</span>
            </button>

            {!isCurrentMonth && (
              <button
                onClick={handleGoToday}
                className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                title="بازگشت به امروز"
              >
                <RotateCcw className="w-3 h-3" />
                <span>امروز</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-center">
            <span className="text-sm sm:text-base font-black text-slate-900">
              {monthConfig.monthName} {toPersianDigits(monthConfig.year)}
            </span>
            {isCurrentMonth && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
                این ماه
              </span>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-gray-200 text-slate-700 hover:bg-gray-50 transition-all flex items-center gap-1 text-xs font-extrabold cursor-pointer"
            title="ماه بعد"
          >
            <span className="hidden sm:inline">ماه بعد</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid Header (Shanbeh to Jomeh) */}
        <div className="grid grid-cols-7 gap-1 text-center py-1.5 shrink-0 border-b border-gray-100">
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

        {/* Real Calendar Grid Body with Jabama-Style Price Cells */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty Padding Cells before day 1 */}
            {Array.from({ length: monthConfig.startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="h-12 sm:h-14" />
            ))}

            {/* Day Cells */}
            {monthConfig.days.map((day) => {
              const isSelected = selectedOffset === day.offset;

              if (day.isPast) {
                return (
                  <div
                    key={day.dayNum}
                    className="h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-center text-slate-300 text-xs sm:text-sm font-medium bg-gray-50/40 cursor-not-allowed select-none"
                  >
                    <span>{toPersianDigits(day.dayNum)}</span>
                  </div>
                );
              }

              return (
                <button
                  key={day.dayNum}
                  onClick={() => handleSelectDay(day)}
                  className={`h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-between p-1 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-rally-primary text-white border-rally-primary shadow-md shadow-rally-primary/30 scale-102 font-black'
                      : day.isHoliday
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100 font-bold'
                      : 'bg-white border-gray-200 text-slate-800 hover:border-rally-primary/60 hover:bg-sky-50/50 hover:text-rally-primary font-bold'
                  }`}
                >
                  <div className="w-full flex items-center justify-between px-1">
                    <span className="text-xs sm:text-sm font-black">{toPersianDigits(day.dayNum)}</span>
                    {day.isToday && (
                      <span className={`text-[8px] font-black px-1 rounded-sm ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                        امروز
                      </span>
                    )}
                    {!day.isToday && day.isHoliday && (
                      <span className={`text-[8px] font-black px-1 rounded-sm ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-900'}`}>
                        تعطیل
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] font-extrabold ${
                      isSelected ? 'text-sky-200' : day.isHoliday ? 'text-amber-800' : 'text-emerald-700'
                    }`}
                  >
                    {day.priceLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Summary & Confirm Button (Jabama Style) */}
        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-800">
              {selectedDayItem ? selectedDayItem.fullDateLabel : 'تاریخ انتخاب‌شده'}
            </span>
            <span className="text-[11px] text-emerald-700 font-extrabold">
              {selectedDayItem && !selectedDayItem.isPast ? `نرخ پایه: ${selectedDayItem.priceLabel}` : ''}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-rally-primary hover:bg-[#082f55] text-white text-xs font-black shadow-md shadow-rally-primary/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>تایید و مشاهده سانس‌ها</span>
          </button>
        </div>
      </div>
    </div>
  );
};

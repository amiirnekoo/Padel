import React from 'react';
import { X, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../../utils/persianUtils';

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
  if (!isOpen) return null;

  const QUICK_DATES = [
    { offset: 0, label: 'امروز', sublabel: 'سه‌شنبه' },
    { offset: 1, label: 'فردا', sublabel: 'چهارشنبه' },
    { offset: 2, label: 'پس‌فردا', sublabel: 'پنجشنبه' },
    { offset: 3, label: 'آخر هفته', sublabel: 'جمعه' },
  ];

  // تقویم ۲ هفته‌ای تعاملی با روزهای ماه و نام روزها
  const CALENDAR_DAYS = Array.from({ length: 14 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    const weekdayName = dayNames[d.getDay()];
    // تقریب روز ماه شمسی (مهر/آبان)
    const baseShamsiDay = 22 + index;
    const shamsiDayNumber = baseShamsiDay > 30 ? baseShamsiDay - 30 : baseShamsiDay;
    const monthName = baseShamsiDay > 30 ? 'آبان' : 'مهر';

    return {
      offset: index,
      dayNum: shamsiDayNumber,
      monthName,
      weekday: weekdayName,
      isWeekend: d.getDay() === 5 // جمعه
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 relative shadow-2xl border border-black/[0.08] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rally-primary/10 text-rally-primary flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                انتخاب تاریخ سانس کورت
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                مشاهده موجودی زنده زمین‌ها و قفل ۱۰ دقیقه‌ای نرخ مصوب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick Dates Shortcuts */}
        <div className="py-4">
          <span className="block text-xs font-black text-gray-400 mb-2">میانبرهای سریع:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_DATES.map((item) => {
              const isSelected = selectedOffset === item.offset;
              return (
                <button
                  key={item.offset}
                  onClick={() => {
                    onSelectOffset(item.offset, `${item.label} (${item.sublabel})`);
                    onClose();
                  }}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center gap-0.5 ${
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

        {/* Interactive 2-Week Calendar Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black text-gray-400">تقویم ۱۴ روز آینده:</span>
            <span className="text-[11px] font-bold text-rally-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>مهر و آبان ۱۴۰۵</span>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {CALENDAR_DAYS.map((day) => {
              const isSelected = selectedOffset === day.offset;
              return (
                <button
                  key={day.offset}
                  onClick={() => {
                    onSelectOffset(day.offset, `${day.weekday} ${toPersianDigits(day.dayNum)} ${day.monthName}`);
                    onClose();
                  }}
                  className={`py-2 px-1 rounded-2xl text-center transition-all border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-rally-primary text-white border-rally-primary shadow-md shadow-rally-primary/25 scale-102'
                      : day.isWeekend
                      ? 'bg-amber-50/60 border-amber-200/80 text-amber-900 hover:bg-amber-100/60'
                      : 'bg-white border-gray-200 text-slate-800 hover:border-rally-primary/40 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-white/90' : day.isWeekend ? 'text-amber-700' : 'text-gray-400'}`}>
                    {day.weekday.replace('شنبه', '') || 'ش'}
                  </span>
                  <span className={`text-sm sm:text-base font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {toPersianDigits(day.dayNum)}
                  </span>
                  <span className={`text-[9px] font-bold ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    {day.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

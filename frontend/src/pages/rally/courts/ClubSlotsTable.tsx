import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, Zap } from 'lucide-react';
import { CourtClub, TimeSlotItem } from '../../../types/rally';
import { isSlotPast } from '../../../utils/persianUtils';

interface ClubSlotsTableProps {
  club: CourtClub;
  onProceedBooking: (club: CourtClub, slot: TimeSlotItem) => void;
}

export const ClubSlotsTable: React.FC<ClubSlotsTableProps> = ({
  club,
  onProceedBooking
}) => {
  // Generate next 7 days in Persian calendar
  const dateTabs = useMemo(() => {
    const list: Array<{ label: string; subLabel: string; dateStr: string }> = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const formatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'short', month: 'short', day: 'numeric' });
      const parts = formatter.format(d);
      const isoStr = d.toISOString().split('T')[0];

      let label = parts;
      if (i === 0) label = 'امروز';
      else if (i === 1) label = 'فردا';
      else if (i === 2) label = 'پس‌فردا';

      list.push({
        label,
        subLabel: parts,
        dateStr: isoStr
      });
    }
    return list;
  }, []);

  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'DAY' | 'EVENING' | 'NIGHT'>('ALL');

  const selectedDate = dateTabs[activeDateIndex];

  // Filter slots based on date and time period
  const filteredSlots = useMemo(() => {
    return club.slots.filter((slot) => {
      // Check if slot has already passed today
      if (activeDateIndex === 0 && isSlotPast(selectedDate.dateStr, slot.startTime)) {
        return false;
      }

      if (filterPeriod === 'DAY') return slot.startTime < '17:00';
      if (filterPeriod === 'EVENING') return slot.startTime >= '17:00' && slot.startTime < '20:30';
      if (filterPeriod === 'NIGHT') return slot.startTime >= '20:30';
      return true;
    });
  }, [club.slots, activeDateIndex, selectedDate.dateStr, filterPeriod]);

  return (
    <div id="club-slots-section" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
      
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <span>تقویم و جدول سانس‌های زنده (۹۰ دقیقه‌ای)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            رزرو آنی با تضمین ۱۰۰٪ نرخ مصوب باشگاه، قفل موقت اتمیک ۱۰ دقیقه‌ای و استرداد تضمینی
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL' as const, label: 'همه سانس‌ها' },
            { id: 'DAY' as const, label: '☀️ روز (آف‌پیک)' },
            { id: 'EVENING' as const, label: '🌆 عصر' },
            { id: 'NIGHT' as const, label: '🌙 شب' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterPeriod === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selector Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" dir="rtl">
        {dateTabs.map((d, idx) => {
          const isSelected = activeDateIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveDateIndex(idx)}
              className={`px-4 py-3 rounded-2xl border text-center transition-all cursor-pointer min-w-[105px] shrink-0 ${
                isSelected
                  ? 'bg-[#0B2238] border-[#0B2238] text-white shadow-md'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className={`block text-xs font-black ${isSelected ? 'text-[#D7ED68]' : 'text-slate-900'}`}>
                {d.label}
              </span>
              <span className="block text-[11px] opacity-80 mt-0.5">
                {d.subLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* High-Performance Fixed Table with Colgroup */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full table-fixed text-xs text-right">
          <colgroup>
            <col className="w-4/12 sm:w-3/12" />
            <col className="w-4/12 sm:w-4/12" />
            <col className="hidden sm:table-column sm:w-2/12" />
            <col className="w-4/12 sm:w-3/12" />
          </colgroup>
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
            <tr>
              <th className="py-3 px-3 sm:px-4">ساعت سانس</th>
              <th className="py-3 px-3 sm:px-4">تعرفه مصوب</th>
              <th className="hidden sm:table-cell py-3 px-3 sm:px-4 text-center">وضعیت</th>
              <th className="py-3 px-3 sm:px-4 text-left">عملیات رزرو</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSlots.length > 0 ? (
              filteredSlots.map((slot) => {
                const isAvailable = slot.status === 'AVAILABLE';
                const isDaySlot = slot.startTime < '17:00';

                return (
                  <tr
                    key={slot.slotId}
                    className={`transition-colors ${
                      isAvailable ? 'hover:bg-sky-50/50' : 'bg-slate-50/60 opacity-60'
                    }`}
                  >
                    {/* Time */}
                    <td className="py-3.5 px-3 sm:px-4 font-bold">
                      <div className="flex items-center gap-1.5 text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{slot.startTime} تا {slot.endTime}</span>
                      </div>
                      {isDaySlot && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block mt-1">
                          ☀️ تعرفه ویژه روز (آف‌پیک)
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          {slot.price.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">تومان</span>
                      </div>
                    </td>

                    {/* Status (Desktop) */}
                    <td className="hidden sm:table-cell py-3.5 px-3 sm:px-4 text-center">
                      {isAvailable ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          آماده رزرو
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          رزرو شده
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 sm:px-4 text-left">
                      {isAvailable ? (
                        <button
                          type="button"
                          onClick={() => onProceedBooking(club, slot)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 ml-auto"
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                          <span>رزرو آنلاین</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed ml-auto"
                        >
                          تکمیل
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  هیچ سانسی برای فیلتر و تاریخ انتخابی موجود نیست.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

import React from 'react';
import { PhoneCall, Globe, Lock, Unlock, UserCheck, Award, CreditCard, Sparkles, Plus } from 'lucide-react';
import { GridSlotItem, CourtHeaderItem } from './types';
import { formatSlotTimeString, formatPersianPrice } from '../../../../utils/persianUtils';

interface ClubTimelineGridProps {
  courts: CourtHeaderItem[];
  slots: GridSlotItem[];
  onOpenManualBook: (slot: GridSlotItem, courtName: string) => void;
  onToggleLock: (slotId: string) => void;
}

export const ClubTimelineGrid: React.FC<ClubTimelineGridProps> = ({
  courts,
  slots,
  onOpenManualBook,
  onToggleLock
}) => {
  // Extract unique distinct time rows
  const timeRows = Array.from(new Set(slots.map((s) => s.time)));

  return (
    <div className="bg-[#0F1E2E] border border-white/10 rounded-3xl overflow-hidden" dir="rtl">
      {/* Legend & Guide Bar */}
      <div className="p-4 border-b border-white/10 bg-[#0B1724] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D7ED68]" />
          <span>ماتریس بلادرنگ کورت‌ها (Timeline Grid)</span>
        </span>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            آزاد (آنلاین)
          </span>
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            رزرو رالی
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            رزرو تلفنی
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            مربی / آکادمی
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            قفل / VIP
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs table-fixed">
          <colgroup>
            <col className="w-28" />
            {courts.map((c) => (
              <col key={c.id} className="w-64" />
            ))}
          </colgroup>
          <thead className="bg-[#091420] text-slate-300 font-bold border-b border-white/5">
            <tr>
              <th className="p-3.5 text-center text-slate-400 font-bold text-[11px]">ساعت سانس</th>
              {courts.map((court) => (
                <th key={court.id} className="p-3.5 border-r border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white block font-black text-xs">{court.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {court.type === 'INDOOR' ? 'مسقف' : 'روباز'} • {court.surface}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        court.type === 'INDOOR'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {court.type === 'INDOOR' ? 'مسقف' : 'روباز'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {timeRows.map((time) => (
              <tr key={time} className="hover:bg-white/[0.02] transition-colors">
                {/* Time Column */}
                <td className="p-3 font-bold text-slate-300 text-center text-xs bg-[#091420]/60 border-l border-white/5" dir="rtl">
                  {formatSlotTimeString(time)}
                </td>

                {/* Court Columns */}
                {courts.map((court) => {
                  const slot = slots.find((s) => s.courtId === court.id && s.time === time);
                  if (!slot) {
                    return (
                      <td key={court.id} className="p-2 border-r border-white/5">
                        <div className="h-14 rounded-xl border border-dashed border-white/5 flex items-center justify-center text-slate-600 text-[11px]">
                          تعریف نشده
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={court.id} className="p-2 border-r border-white/5">
                      {/* 1. OPEN SLOT */}
                      {slot.status === 'OPEN' && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all flex items-center justify-between gap-2 group">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 block">آماده رزرو آنلاین</span>
                            <span className="text-xs font-bold text-white">
                              {formatPersianPrice(slot.price)} ت
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onOpenManualBook(slot, court.name)}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                              title="ثبت رزرو تلفنی"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>ثبت تلفنی</span>
                            </button>
                            <button
                              onClick={() => onToggleLock(slot.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="بستن سانس"
                            >
                              <Lock className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. BOOKED ONLINE */}
                      {slot.status === 'BOOKED_ONLINE' && (
                        <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 transition-all flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1 text-sky-400 font-black text-xs">
                              <Globe className="w-3 h-3" />
                              <span>{slot.bookedBy || 'رزرو آنلاین رالی'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {slot.phone || 'پرداخت شاپرک'}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold border border-sky-500/30">
                            تسویه ۹۷٪
                          </span>
                        </div>
                      )}

                      {/* 3. BOOKED MANUAL / PHONE */}
                      {slot.status === 'BOOKED_MANUAL' && (
                        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 transition-all flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1 text-amber-300 font-black text-xs">
                              <PhoneCall className="w-3 h-3 text-amber-400" />
                              <span>{slot.bookedBy || 'رزرو تلفنی'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {slot.paymentMethod === 'POS' ? 'کارتخوان باشگاه' : 'کارت‌به‌کارت'}
                              {slot.racketsCount ? ` • ${slot.racketsCount} راکت` : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => onToggleLock(slot.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="لغو رزرو و بازگشایی"
                          >
                            <Unlock className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* 4. COACH HOLD */}
                      {slot.status === 'COACH_HOLD' && (
                        <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 transition-all flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1 text-purple-300 font-black text-xs">
                              <Award className="w-3 h-3 text-purple-400" />
                              <span>{slot.bookedBy || 'آکادمی مربی'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">تمرین و آموزش خصوصی</span>
                          </div>
                          <button
                            onClick={() => onToggleLock(slot.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="بازگشایی"
                          >
                            <Unlock className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* 5. LOCKED / VIP */}
                      {slot.status === 'LOCKED' && (
                        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 transition-all flex items-center justify-between gap-2">
                          <div>
                            <span className="text-slate-400 font-bold text-xs flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>{slot.notes || 'مسدود شده (VIP)'}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">غیرفعال در سایت</span>
                          </div>
                          <button
                            onClick={() => onToggleLock(slot.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>بازگشایی</span>
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

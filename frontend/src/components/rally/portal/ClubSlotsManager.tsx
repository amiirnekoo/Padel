import React from 'react';
import { PhoneCall, Lock, Unlock, Plus } from 'lucide-react';
import { CourtSlotItem } from './ManualBookingModal';

interface ClubSlotsManagerProps {
  currentCourt: string;
  clubName: string;
  currentSlots: CourtSlotItem[];
  onOpenManualBooking: (slot: CourtSlotItem) => void;
  onToggleSlotLock: (slotId: string) => void;
  onOpenNewCourtModal: () => void;
}

export const ClubSlotsManager: React.FC<ClubSlotsManagerProps> = ({
  currentCourt,
  clubName,
  currentSlots,
  onOpenManualBooking,
  onToggleSlotLock,
  onOpenNewCourtModal,
}) => {
  return (
    <div className="space-y-4">
      {/* Slots Table Card */}
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-white text-xs">
              جدول سانس‌های {currentCourt} ({clubName})
            </h4>
            <span className="text-[11px] text-slate-400">رزرو باجه، بستن سانس و بازگشایی آنی</span>
          </div>
          <button
            onClick={onOpenNewCourtModal}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#D7ED68]" />
            <span>افزودن کورت جدید</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-right text-xs">
            <colgroup>
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-auto" />
              <col className="w-36" />
            </colgroup>
            <thead className="bg-[#091522] text-slate-300 font-extrabold text-xs border-b border-white/10">
              <tr>
                <th className="p-3.5">زمان سانس</th>
                <th className="p-3.5">مبلغ (تومان)</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5">اطلاعات مشتری</th>
                <th className="p-3.5 text-center">عملیات اپراتور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {currentSlots.map((s) => {
                const isOffPeak = s.isOffPeak || (
                  s.time.startsWith('۰۸') || s.time.startsWith('۰۹') ||
                  s.time.startsWith('۱۰') || s.time.startsWith('۱۱') ||
                  s.time.startsWith('۱۲') || s.time.startsWith('۱۳') ||
                  s.time.startsWith('۱۴') || s.time.startsWith('۱۵') ||
                  s.time.startsWith('۱۶')
                );
                return (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold text-white text-xs">
                      <div className="font-extrabold text-slate-100">
                        {s.time.includes(' - ') ? s.time.replace(' - ', ' تا ') : s.time}
                      </div>
                      {isOffPeak && (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md inline-block mt-1">
                          ⚡ ساعت روز (آف‌پیک)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs">
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-[#D7ED68] text-sm">
                          {s.price.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">تومان</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {s.status === 'OPEN' && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block">
                          آماده رزرو
                        </span>
                      )}
                      {s.status === 'BOOKED' && (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block">
                            رزرو قطعی
                          </span>
                          {s.isRecurringVip && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[9px] font-black inline-block">
                              👑 هفتگی VIP
                            </span>
                          )}
                        </div>
                      )}
                      {s.status === 'LOCKED' && (
                        <span className="bg-slate-700/40 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block">
                          بسته شده
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs truncate">
                      {s.bookedBy ? (
                        <div className="space-y-1">
                          <div className="text-white font-extrabold text-xs truncate">{s.bookedBy}</div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {s.phone && (
                              <span dir="ltr" className="text-slate-300 text-[11px] bg-slate-900/90 px-1.5 py-0.5 rounded border border-white/10 font-medium tracking-wide">
                                {s.phone}
                              </span>
                            )}
                            {s.paymentMethod && (
                              <span className="text-amber-300 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                                {s.paymentMethod}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {s.status === 'OPEN' && (
                          <>
                            <button
                              onClick={() => onOpenManualBooking(s)}
                              className="px-2.5 py-1.5 bg-rally-primary/20 hover:bg-rally-primary/30 text-white rounded-xl text-xs font-bold border border-rally-primary/40 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-[#D7ED68]" />
                              <span>ثبت باجه</span>
                            </button>
                            <button
                              onClick={() => onToggleSlotLock(s.id)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer transition-colors"
                              title="بستن سانس"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {s.status === 'LOCKED' && (
                          <button
                            onClick={() => onToggleSlotLock(s.id)}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>بازگشایی</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

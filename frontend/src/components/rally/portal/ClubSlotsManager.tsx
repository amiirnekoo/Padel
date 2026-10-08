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
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-48" />
              <col className="w-36" />
            </colgroup>
            <thead className="bg-[#0B1724] text-slate-400 font-bold border-b border-white/5">
              <tr>
                <th className="p-3">زمان سانس</th>
                <th className="p-3">مبلغ (تومان)</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">اطلاعات مشتری</th>
                <th className="p-3 text-center">عملیات اپراتور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {currentSlots.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-white font-mono">{s.time}</td>
                  <td className="p-3 font-mono text-[#D7ED68]">{s.price.toLocaleString('fa-IR')}</td>
                  <td className="p-3">
                    {s.status === 'OPEN' && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        آماده رزرو
                      </span>
                    )}
                    {s.status === 'BOOKED' && (
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        رزرو قطعی
                      </span>
                    )}
                    {s.status === 'LOCKED' && (
                      <span className="bg-slate-700/40 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        بسته شده
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[11px] truncate">
                    {s.bookedBy ? (
                      <div>
                        <span className="text-white font-bold">{s.bookedBy}</span>
                        {s.phone && <span className="text-slate-400 mr-1 font-mono">({s.phone})</span>}
                        {s.paymentMethod && <span className="text-amber-400 mr-1 text-[10px]">[{s.paymentMethod}]</span>}
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {s.status === 'OPEN' && (
                        <>
                          <button
                            onClick={() => onOpenManualBooking(s)}
                            className="px-2 py-1 bg-rally-primary/20 hover:bg-rally-primary/30 text-white rounded-lg text-[10px] font-bold border border-rally-primary/40 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <PhoneCall className="w-3 h-3 text-[#D7ED68]" />
                            <span>ثبت باجه</span>
                          </button>
                          <button
                            onClick={() => onToggleSlotLock(s.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 cursor-pointer transition-colors"
                            title="بستن سانس"
                          >
                            <Lock className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      {s.status === 'LOCKED' && (
                        <button
                          onClick={() => onToggleSlotLock(s.id)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>بازگشایی</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

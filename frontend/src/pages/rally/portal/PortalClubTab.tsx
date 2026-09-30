import React, { useState } from 'react';
import { Building, Plus, Calendar, DollarSign, Users, Lock, Unlock, PhoneCall } from 'lucide-react';

interface SlotManagerItem {
  id: string;
  time: string;
  price: number;
  status: 'OPEN' | 'BOOKED' | 'LOCKED';
  bookedBy?: string;
}

const INITIAL_SLOTS: SlotManagerItem[] = [
  { id: 's-1', time: '۰۸:۰۰ تا ۰۹:۳۰', price: 1800000, status: 'OPEN' },
  { id: 's-2', time: '۰۹:۳۰ تا ۱۱:۰۰', price: 1800000, status: 'BOOKED', bookedBy: 'امیر نکوزاده (آنلاین)' },
  { id: 's-3', time: '۱۱:۰۰ تا ۱۲:۳۰', price: 1800000, status: 'OPEN' },
  { id: 's-4', time: '۱۶:۳۰ تا ۱۸:۰۰', price: 2400000, status: 'BOOKED', bookedBy: 'رزرو تلفنی باشگاه' },
  { id: 's-5', time: '۱۸:۰۰ تا ۱۹:۳۰', price: 2400000, status: 'OPEN' },
  { id: 's-6', time: '۱۹:۳۰ تا ۲۱:۰۰', price: 2400000, status: 'LOCKED' },
  { id: 's-7', time: '۲۱:۰۰ تا ۲۲:۳۰', price: 2200000, status: 'OPEN' }
];

export const PortalClubTab: React.FC = () => {
  const [slots, setSlots] = useState<SlotManagerItem[]>(INITIAL_SLOTS);
  const [selectedCourt, setSelectedCourt] = useState('کورت ۱ سنترال');

  const toggleSlotLock = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        if (s.status === 'BOOKED') return s;
        return { ...s, status: s.status === 'OPEN' ? 'LOCKED' : 'OPEN' };
      })
    );
  };

  const handleManualBook = (slotId: string) => {
    const name = prompt('نام مشتری جهت ثبت رزرو حضوری/تلفنی را وارد کنید:');
    if (!name) return;
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: 'BOOKED', bookedBy: `${name} (ثبت دستی)` } : s))
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Club KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">درآمد امروز باشگاه</span>
          <p className="text-xl font-black text-[#D7ED68] mt-1">۴,۲۰۰,۰۰۰ تومان</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">پس از کسر ۱۰٪ کارمزد رالی</span>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">سانس‌های پر شده امروز</span>
          <p className="text-xl font-black text-white mt-1">۲ از ۷ سانس</p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">۲۹٪ اشغال</span>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">تعداد کل کورت‌های فعال</span>
          <p className="text-xl font-black text-white mt-1">۳ کورت شیشه‌ای</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">استاندارد WPT</span>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">وضعیت پذیرش آنلاین</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">فعال در رالی</span>
          </div>
        </div>
      </div>

      {/* Court Selection & Action Header */}
      <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-rally-primary" />
          <span className="text-xs font-bold text-white">انتخاب کورت:</span>
          {['کورت ۱ سنترال', 'کورت ۲ پانوراما', 'کورت ۳ تمرینی'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCourt(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCourt === c ? 'bg-rally-primary text-white shadow-xs' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={() => alert('تعریف سانس یا کورت جدید')}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D7ED68]" />
          <span>افزودن سانس گروهی</span>
        </button>
      </div>

      {/* Slots Management Table */}
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h4 className="font-bold text-white text-xs">جدول سانس‌های امروز ({selectedCourt})</h4>
          <span className="text-[11px] text-slate-400">می‌توانید سانس را برای رزرو حضوری ببندید یا رزرو دستی ثبت کنید</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-right text-xs">
            <colgroup>
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-48" />
              <col className="w-44" />
            </colgroup>
            <thead className="bg-[#0B1724] text-slate-400 font-bold border-b border-white/5">
              <tr>
                <th className="p-3.5">ساعت سانس</th>
                <th className="p-3.5">مبلغ تعیین‌شده</th>
                <th className="p-3.5">وضعیت سانس</th>
                <th className="p-3.5">توضیحات رزرو</th>
                <th className="p-3.5 text-center">عملیات مدیر باشگاه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {slots.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-bold text-white">{s.time}</td>
                  <td className="p-3.5 font-mono text-[#D7ED68]">{s.price.toLocaleString('fa-IR')} ت</td>
                  <td className="p-3.5">
                    {s.status === 'OPEN' && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        آزاد برای رزرو
                      </span>
                    )}
                    {s.status === 'BOOKED' && (
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        رزرو قطعی
                      </span>
                    )}
                    {s.status === 'LOCKED' && (
                      <span className="bg-slate-700/40 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        بسته شده توسط باشگاه
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-300 truncate">
                    {s.bookedBy || '—'}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {s.status === 'OPEN' && (
                        <>
                          <button
                            onClick={() => handleManualBook(s.id)}
                            className="px-2.5 py-1 bg-rally-primary/20 hover:bg-rally-primary/30 text-white rounded-lg text-[10px] font-bold border border-rally-primary/40 flex items-center gap-1 cursor-pointer transition-colors"
                            title="ثبت رزرو تلفنی"
                          >
                            <PhoneCall className="w-3 h-3 text-[#D7ED68]" />
                            <span>ثبت حضوری</span>
                          </button>
                          <button
                            onClick={() => toggleSlotLock(s.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 cursor-pointer transition-colors"
                            title="بستن این سانس"
                          >
                            <Lock className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      {s.status === 'LOCKED' && (
                        <button
                          onClick={() => toggleSlotLock(s.id)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>بازگشایی سانس</span>
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

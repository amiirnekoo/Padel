import React, { useState } from 'react';
import { Building, Calendar, DollarSign, Users, Lock, Unlock, PhoneCall, CheckCircle, Clock, X } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface CourtSlotItem {
  id: string;
  time: string;
  price: number;
  status: 'OPEN' | 'BOOKED' | 'LOCKED';
  bookedBy?: string;
  phone?: string;
  paymentMethod?: string;
}

interface ClubInfo {
  id: string;
  name: string;
  address: string;
  courts: string[];
}

const CLUBS: ClubInfo[] = [
  {
    id: 'enghelab',
    name: 'مجموعه پدل انقلاب',
    address: 'تهران، خیابان سئول، جنب درب غربی باشگاه انقلاب',
    courts: ['کورت ۱ سنترال (WPT)', 'کورت ۲ پانوراما', 'کورت ۳ تمرینی'],
  },
  {
    id: 'lavoor',
    name: 'پدل کلاب نیاوران (لفور)',
    address: 'تهران، نیاوران، خیابان باهنر، پدل کلاب لفور',
    courts: ['کورت ۱ VIP شیشه‌ای', 'کورت ۲ پانوراما پرو'],
  },
  {
    id: 'viva',
    name: 'پدل سنتر ویوا (شهرک غرب)',
    address: 'تهران، شهرک غرب، فاز یک، بلوار ایران زمین',
    courts: ['کورت ۱ سنتر چمن آبی', 'کورت ۲ چمپیون', 'کورت ۳ آموزشی'],
  },
];

const DEFAULT_SLOTS: Record<string, CourtSlotItem[]> = {
  'enghelab-0': [
    { id: 'eng-1-1', time: '۰۸:۰۰ - ۰۹:۳۰', price: 1800000, status: 'OPEN' },
    { id: 'eng-1-2', time: '۰۹:۳۰ - ۱۱:۰۰', price: 1800000, status: 'BOOKED', bookedBy: 'امیر نکوزاده', phone: '09121112233', paymentMethod: 'آنلاین درگاه' },
    { id: 'eng-1-3', time: '۱۱:۰۰ - ۱۲:۳۰', price: 1800000, status: 'OPEN' },
    { id: 'eng-1-4', time: '۱۶:۳۰ - ۱۸:۰۰', price: 2400000, status: 'BOOKED', bookedBy: 'رزرو تلفنی باجه', phone: '09355554433', paymentMethod: 'کارت‌خوان باجه' },
    { id: 'eng-1-5', time: '۱۸:۰۰ - ۱۹:۳۰', price: 2400000, status: 'OPEN' },
    { id: 'eng-1-6', time: '۱۹:۳۰ - ۲۱:۰۰', price: 2400000, status: 'LOCKED' },
    { id: 'eng-1-7', time: '۲۱:۰۰ - ۲۲:۳۰', price: 2200000, status: 'OPEN' },
  ],
};

export const PortalClubTab: React.FC = () => {
  const [selectedClubIndex, setSelectedClubIndex] = useState(0);
  const [selectedCourtIndex, setSelectedCourtIndex] = useState(0);
  const currentClub = CLUBS[selectedClubIndex];
  const currentCourt = currentClub.courts[selectedCourtIndex];
  const slotKey = `${currentClub.id}-${selectedCourtIndex}`;

  const [slotsState, setSlotsState] = useState<Record<string, CourtSlotItem[]>>(DEFAULT_SLOTS);
  const currentSlots = slotsState[slotKey] || [
    { id: `${slotKey}-1`, time: '۰۸:۰۰ - ۰۹:۳۰', price: 1800000, status: 'OPEN' },
    { id: `${slotKey}-2`, time: '۰۹:۳۰ - ۱۱:۰۰', price: 1800000, status: 'OPEN' },
    { id: `${slotKey}-3`, time: '۱۶:۳۰ - ۱۸:۰۰', price: 2400000, status: 'OPEN' },
    { id: `${slotKey}-4`, time: '۱۸:۰۰ - ۱۹:۳۰', price: 2400000, status: 'OPEN' },
    { id: `${slotKey}-5`, time: '۱۹:۳۰ - ۲۱:۰۰', price: 2400000, status: 'LOCKED' },
    { id: `${slotKey}-6`, time: '۲۱:۰۰ - ۲۲:۳۰', price: 2200000, status: 'OPEN' },
  ];

  // مودال ثبت دستی
  const [modalSlot, setModalSlot] = useState<CourtSlotItem | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [payMethod, setPayMethod] = useState('POS');

  const toggleSlotLock = async (slotId: string) => {
    const updated = currentSlots.map((s) => {
      if (s.id !== slotId) return s;
      if (s.status === 'BOOKED') return s;
      const nextStatus = s.status === 'OPEN' ? ('LOCKED' as const) : ('OPEN' as const);
      return { ...s, status: nextStatus };
    });
    setSlotsState((prev) => ({ ...prev, [slotKey]: updated }));
    // تلاش برای سینک امن با بک‌اند در صورت وجود
    rallyApi.updateAdminSlot(slotId, { status: updated.find((s) => s.id === slotId)?.status || 'OPEN' }).catch(() => {});
  };

  const handleOpenManualBooking = (slot: CourtSlotItem) => {
    setModalSlot(slot);
    setCustomerName('');
    setCustomerPhone('');
    setPayMethod('POS');
  };

  const handleConfirmManualBooking = () => {
    if (!modalSlot || !customerName.trim()) return;
    const updated = currentSlots.map((s) => {
      if (s.id !== modalSlot.id) return s;
      return {
        ...s,
        status: 'BOOKED' as const,
        bookedBy: customerName.trim(),
        phone: customerPhone.trim() || '—',
        paymentMethod: payMethod === 'POS' ? 'کارت‌خوان باشگاه' : 'نقدی باجه',
      };
    });
    setSlotsState((prev) => ({ ...prev, [slotKey]: updated }));
    setModalSlot(null);
  };

  const bookedSlots = currentSlots.filter((s) => s.status === 'BOOKED');
  const totalRevenue = bookedSlots.reduce((acc, s) => acc + s.price, 0);
  const commission = Math.round(totalRevenue * 0.1);
  const netRevenue = totalRevenue - commission;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Club Selector Bar */}
      <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Building className="w-5 h-5 text-rally-primary" />
          <div>
            <span className="text-xs text-slate-400 block">انتخاب باشگاه تحت مدیریت شما:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {CLUBS.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClubIndex(idx);
                    setSelectedCourtIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedClubIndex === idx
                      ? 'bg-rally-primary text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-left md:text-right text-[11px] text-slate-400">
          <span className="text-white font-bold">{currentClub.name}</span>
          <p className="truncate max-w-xs">{currentClub.address}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">درآمد خالص امروز کورت</span>
          <p className="text-xl font-black text-[#D7ED68] mt-1">{netRevenue.toLocaleString('fa-IR')} تومان</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">ناخالص: {totalRevenue.toLocaleString('fa-IR')} ت (کسر ۱۰٪ رالی)</span>
        </div>
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">ضریب اشغال امروز</span>
          <p className="text-xl font-black text-white mt-1">
            {bookedSlots.length} از {currentSlots.length} سانس
          </p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">
            {currentSlots.length > 0 ? Math.round((bookedSlots.length / currentSlots.length) * 100) : 0}٪ پر شده
          </span>
        </div>
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">کورت‌های فعال مجموعه</span>
          <p className="text-xl font-black text-white mt-1">{currentClub.courts.length} کورت رسمی</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">شیشه سکوریت ۱۲ میل + چمن WPT</span>
        </div>
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">وضعیت رزرو آنلاین</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">سینک زنده با اپ و وب رالی</span>
          </div>
        </div>
      </div>

      {/* Court Selection Tabs */}
      <div className="bg-[#0F1E2E] border border-white/10 p-3 sm:p-4 rounded-2xl flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-300 ml-2 whitespace-nowrap">انتخاب کورت:</span>
        {currentClub.courts.map((courtName, cIdx) => (
          <button
            key={courtName}
            onClick={() => setSelectedCourtIndex(cIdx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCourtIndex === cIdx
                ? 'bg-rally-primary text-white shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {courtName}
          </button>
        ))}
      </div>

      {/* Slots Table */}
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-xs">
              جدول مدیریت سانس‌های {currentCourt} ({currentClub.name})
            </h4>
            <span className="text-[11px] text-slate-400">مدیریت سانس‌های حضوری، بستن برای نگهداری یا بازگشایی آنی</span>
          </div>
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
                <th className="p-3">اطلاعات رزرو</th>
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
                        بسته توسط باشگاه
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
                            onClick={() => handleOpenManualBooking(s)}
                            className="px-2 py-1 bg-rally-primary/20 hover:bg-rally-primary/30 text-white rounded-lg text-[10px] font-bold border border-rally-primary/40 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <PhoneCall className="w-3 h-3 text-[#D7ED68]" />
                            <span>ثبت باجه</span>
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

      {/* Manual Booking Modal */}
      {modalSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-bold text-white text-sm">ثبت رزرو حضوری / تلفنی باجه</h4>
              <button onClick={() => setModalSlot(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>
                سانس انتخابی: <strong className="text-white">{modalSlot.time}</strong>
              </div>
              <div>
                مبلغ سانس: <strong className="text-[#D7ED68]">{modalSlot.price.toLocaleString('fa-IR')} تومان</strong>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">نام و نام خانوادگی مشتری:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: علی محمدی"
                  className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">شماره تماس (اختیاری جهت پیامک):</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="۰۹۱۲..."
                  className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">روش پرداخت:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary"
                >
                  <option value="POS">دستگاه کارت‌خوان باجه (POS)</option>
                  <option value="CASH">نقدی / واریز به کارت باشگاه</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmManualBooking}
                disabled={!customerName.trim()}
                className="flex-1 py-2 bg-rally-primary hover:bg-rally-primary/80 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                تایید و قفل سانس
              </button>
              <button
                onClick={() => setModalSlot(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

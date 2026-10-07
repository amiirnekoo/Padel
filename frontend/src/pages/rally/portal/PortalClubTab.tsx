import React, { useState } from 'react';
import { Building, Lock, Unlock, PhoneCall, Plus, Sparkles } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';
import { ManualBookingModal, CourtSlotItem } from '../../../components/rally/portal/ManualBookingModal';
import { NewCourtModal, NewCourtPayload } from '../../../components/rally/portal/NewCourtModal';

interface ClubInfo {
  id: string;
  name: string;
  address: string;
  courts: string[];
}

const INITIAL_CLUBS: ClubInfo[] = [
  {
    id: 'lavoor',
    name: 'پدل کلاب نیاوران (لفور)',
    address: 'تهران، نیاوران، خیابان باهنر، پدل کلاب لفور',
    courts: ['کورت ۱ VIP شیشه‌ای', 'کورت ۲ پانوراما پرو'],
  },
  {
    id: 'enghelab',
    name: 'مجموعه پدل انقلاب',
    address: 'تهران، خیابان سئول، جنب درب غربی باشگاه انقلاب',
    courts: ['کورت ۱ سنترال (WPT)', 'کورت ۲ پانوراما', 'کورت ۳ تمرینی'],
  },
  {
    id: 'viva',
    name: 'پدل سنتر ویوا (شهرک غرب)',
    address: 'تهران، شهرک غرب، فاز یک، بلوار ایران زمین',
    courts: ['کورت ۱ سنتر چمن آبی', 'کورت ۲ چمپیون', 'کورت ۳ آموزشی'],
  },
];

const DEFAULT_SLOTS: Record<string, CourtSlotItem[]> = {
  'lavoor-0': [
    { id: 'lav-1-1', time: '۰۸:۰۰ - ۰۹:۳۰', price: 2200000, status: 'OPEN' },
    { id: 'lav-1-2', time: '۰۹:۳۰ - ۱۱:۰۰', price: 2200000, status: 'BOOKED', bookedBy: 'امیر نکوزاده', phone: '09121112233', paymentMethod: 'آنلاین درگاه' },
    { id: 'lav-1-3', time: '۱۱:۰۰ - ۱۲:۳۰', price: 2200000, status: 'OPEN' },
    { id: 'lav-1-4', time: '۱۶:۳۰ - ۱۸:۰۰', price: 2800000, status: 'BOOKED', bookedBy: 'رزرو تلفنی باجه', phone: '09355554433', paymentMethod: 'کارت‌خوان باشگاه' },
    { id: 'lav-1-5', time: '۱۸:۰۰ - ۱۹:۳۰', price: 2800000, status: 'OPEN' },
    { id: 'lav-1-6', time: '۱۹:۳۰ - ۲۱:۰۰', price: 2800000, status: 'LOCKED' },
    { id: 'lav-1-7', time: '۲۱:۰۰ - ۲۲:۳۰', price: 2600000, status: 'OPEN' },
  ],
};

export const PortalClubTab: React.FC = () => {
  const [clubs, setClubs] = useState<ClubInfo[]>(INITIAL_CLUBS);
  const [selectedClubIndex, setSelectedClubIndex] = useState(0);
  const [selectedCourtIndex, setSelectedCourtIndex] = useState(0);
  const currentClub = clubs[selectedClubIndex] || clubs[0];
  const currentCourt = currentClub.courts[selectedCourtIndex] || currentClub.courts[0];
  const slotKey = `${currentClub.id}-${selectedCourtIndex}`;

  const [slotsState, setSlotsState] = useState<Record<string, CourtSlotItem[]>>(DEFAULT_SLOTS);
  const currentSlots = slotsState[slotKey] || [
    { id: `${slotKey}-1`, time: '۰۸:۰۰ - ۰۹:۳۰', price: 2200000, status: 'OPEN' },
    { id: `${slotKey}-2`, time: '۰۹:۳۰ - ۱۱:۰۰', price: 2200000, status: 'OPEN' },
    { id: `${slotKey}-3`, time: '۱۶:۳۰ - ۱۸:۰۰', price: 2800000, status: 'OPEN' },
    { id: `${slotKey}-4`, time: '۱۸:۰۰ - ۱۹:۳۰', price: 2800000, status: 'OPEN' },
    { id: `${slotKey}-5`, time: '۱۹:۳۰ - ۲۱:۰۰', price: 2800000, status: 'LOCKED' },
  ];

  // Modals state
  const [modalSlot, setModalSlot] = useState<CourtSlotItem | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [payMethod, setPayMethod] = useState('POS');
  const [isNewCourtModalOpen, setIsNewCourtModalOpen] = useState(false);

  const toggleSlotLock = async (slotId: string) => {
    const updated = currentSlots.map((s) => {
      if (s.id !== slotId) return s;
      if (s.status === 'BOOKED') return s;
      return { ...s, status: (s.status === 'OPEN' ? 'LOCKED' : 'OPEN') as 'OPEN' | 'LOCKED' };
    });
    setSlotsState((prev) => ({ ...prev, [slotKey]: updated }));
    rallyApi.updateAdminSlot(slotId, { status: updated.find((s) => s.id === slotId)?.status || 'OPEN' }).catch(() => {});
  };

  const handleConfirmManualBooking = () => {
    if (!modalSlot || !customerName.trim()) return;
    const updated = currentSlots.map((s) => (s.id === modalSlot.id ? {
      ...s,
      status: 'BOOKED' as const,
      bookedBy: customerName.trim(),
      phone: customerPhone.trim() || '—',
      paymentMethod: payMethod === 'POS' ? 'کارت‌خوان باشگاه' : 'نقدی باجه',
    } : s));
    setSlotsState((prev) => ({ ...prev, [slotKey]: updated }));
    setModalSlot(null);
  };

  const handleAddNewCourt = (payload: NewCourtPayload) => {
    const updatedCourts = [...currentClub.courts, payload.name];
    const newClubs = [...clubs];
    newClubs[selectedClubIndex] = { ...currentClub, courts: updatedCourts };
    setClubs(newClubs);

    // ساخت خودکار سانس‌ها برای کورت جدید
    const newCourtIdx = updatedCourts.length - 1;
    const newKey = `${currentClub.id}-${newCourtIdx}`;
    const generated: CourtSlotItem[] = [
      { id: `${newKey}-1`, time: `${payload.openTime} - ۱۰:۰۰`, price: payload.defaultPrice, status: 'OPEN' },
      { id: `${newKey}-2`, time: '۱۰:۰۰ - ۱۱:۳۰', price: payload.defaultPrice, status: 'OPEN' },
      { id: `${newKey}-3`, time: '۱۶:۳۰ - ۱۸:۰۰', price: Math.round(payload.defaultPrice * 1.2), status: 'OPEN' },
      { id: `${newKey}-4`, time: '۱۸:۰۰ - ۱۹:۳۰', price: Math.round(payload.defaultPrice * 1.2), status: 'OPEN' },
      { id: `${newKey}-5`, time: '۱۹:۳۰ - ۲۱:۰۰', price: Math.round(payload.defaultPrice * 1.2), status: 'OPEN' },
      { id: `${newKey}-6`, time: `۲۱:۰۰ - ${payload.closeTime}`, price: payload.defaultPrice, status: 'OPEN' },
    ];
    setSlotsState((prev) => ({ ...prev, [newKey]: generated }));
    setSelectedCourtIndex(newCourtIdx);
  };

  const bookedSlots = currentSlots.filter((s) => s.status === 'BOOKED');
  const totalRevenue = bookedSlots.reduce((acc, s) => acc + s.price, 0);
  const netRevenue = totalRevenue - Math.round(totalRevenue * 0.1);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Club Selector Bar */}
      <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Building className="w-5 h-5 text-rally-primary" />
          <div>
            <span className="text-xs text-slate-400 block">مجموعه تحت مدیریت شما:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {clubs.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClubIndex(idx); setSelectedCourtIndex(0); }}
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">درآمد خالص امروز کورت</span>
          <p className="text-xl font-black text-[#D7ED68] mt-1 font-mono">{netRevenue.toLocaleString('fa-IR')} ت</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">ناخالص: {totalRevenue.toLocaleString('fa-IR')} ت (کسر ۱۰٪ کارمزد رالی)</span>
        </div>
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">ضریب اشغال امروز</span>
          <p className="text-xl font-black text-white mt-1 font-mono">{bookedSlots.length} از {currentSlots.length} سانس</p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">
            {currentSlots.length > 0 ? Math.round((bookedSlots.length / currentSlots.length) * 100) : 0}٪ اشغال
          </span>
        </div>
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">تعداد کورت‌های مجموعه</span>
          <p className="text-xl font-black text-white mt-1">{currentClub.courts.length} کورت رسمی</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">شیشه سوپر پانورامیک + چمن WPT</span>
        </div>
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">وضعیت درگاه رالی</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">اتصال زنده به شبکه شتاب</span>
          </div>
        </div>
      </div>

      {/* Court Selection and Add Court Header */}
      <div className="bg-[#0F1E2E] border border-white/10 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-300 ml-1 whitespace-nowrap">کورت فعال:</span>
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

        <button
          onClick={() => setIsNewCourtModalOpen(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#D7ED68]" />
          <span>افزودن کورت جدید برای این باشگاه</span>
        </button>
      </div>

      {/* Slots Table */}
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h4 className="font-bold text-white text-xs">
            جدول سانس‌های {currentCourt} ({currentClub.name})
          </h4>
          <span className="text-[11px] text-slate-400">رزرو باجه، بستن سانس و بازگشایی آنی</span>
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
                    ) : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {s.status === 'OPEN' && (
                        <>
                          <button
                            onClick={() => { setModalSlot(s); setCustomerName(''); setCustomerPhone(''); setPayMethod('POS'); }}
                            className="px-2 py-1 bg-rally-primary/20 hover:bg-rally-primary/30 text-white rounded-lg text-[10px] font-bold border border-rally-primary/40 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <PhoneCall className="w-3 h-3 text-[#D7ED68]" />
                            <span>ثبت باجه</span>
                          </button>
                          <button
                            onClick={() => toggleSlotLock(s.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 cursor-pointer transition-colors"
                            title="بستن سانس"
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

      <ManualBookingModal
        isOpen={Boolean(modalSlot)}
        slot={modalSlot}
        customerName={customerName}
        customerPhone={customerPhone}
        payMethod={payMethod}
        onCustomerNameChange={setCustomerName}
        onCustomerPhoneChange={setCustomerPhone}
        onPayMethodChange={setPayMethod}
        onClose={() => setModalSlot(null)}
        onConfirm={handleConfirmManualBooking}
      />

      <NewCourtModal
        isOpen={isNewCourtModalOpen}
        clubName={currentClub.name}
        onClose={() => setIsNewCourtModalOpen(false)}
        onAddCourt={handleAddNewCourt}
      />
    </div>
  );
};

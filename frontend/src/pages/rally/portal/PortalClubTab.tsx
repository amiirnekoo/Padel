import React, { useState } from 'react';
import { Building, Calendar, DollarSign } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';
import { ManualBookingModal, CourtSlotItem } from '../../../components/rally/portal/ManualBookingModal';
import { NewCourtModal, NewCourtPayload } from '../../../components/rally/portal/NewCourtModal';
import { ClubSlotsManager } from '../../../components/rally/portal/ClubSlotsManager';
import { ClubAccountingTab } from '../../../components/rally/portal/accounting/ClubAccountingTab';

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
    { id: 'lav-1-1', time: '۰۸:۰۰ تا ۰۹:۳۰', price: 2200000, status: 'OPEN' },
    { id: 'lav-1-2', time: '۰۹:۳۰ تا ۱۱:۰۰', price: 2200000, status: 'BOOKED', bookedBy: 'امیر نکوزاده', phone: '09121112233', paymentMethod: 'آنلاین درگاه' },
    { id: 'lav-1-3', time: '۱۱:۰۰ تا ۱۲:۳۰', price: 2200000, status: 'OPEN' },
    { id: 'lav-1-4', time: '۱۶:۳۰ تا ۱۸:۰۰', price: 2800000, status: 'BOOKED', bookedBy: 'رزرو تلفنی باجه', phone: '09355554433', paymentMethod: 'کارت‌خوان باشگاه' },
    { id: 'lav-1-5', time: '۱۸:۰۰ تا ۱۹:۳۰', price: 2800000, status: 'OPEN' },
    { id: 'lav-1-6', time: '۱۹:۳۰ تا ۲۱:۰۰', price: 2800000, status: 'LOCKED' },
    { id: 'lav-1-7', time: '۲۱:۰۰ تا ۲۲:۳۰', price: 2600000, status: 'OPEN' },
  ],
};

export const PortalClubTab: React.FC = () => {
  const [clubs, setClubs] = useState<ClubInfo[]>(INITIAL_CLUBS);
  const [selectedClubIndex, setSelectedClubIndex] = useState(0);
  const [selectedCourtIndex, setSelectedCourtIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'SLOTS' | 'ACCOUNTING'>('SLOTS');

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
  const [isVipRecurring, setIsVipRecurring] = useState(false);
  const [sendSms, setSendSms] = useState(true);
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
    const targetSlot = modalSlot;
    const updated = currentSlots.map((s) => (s.id === targetSlot.id ? {
      ...s,
      status: 'BOOKED' as const,
      bookedBy: customerName.trim(),
      phone: customerPhone.trim() || '—',
      paymentMethod: payMethod === 'POS' ? 'کارت‌خوان باشگاه' : 'نقدی باجه',
      isRecurringVip: isVipRecurring,
    } : s));
    setSlotsState((prev) => ({ ...prev, [slotKey]: updated }));
    setModalSlot(null);

    // ارسال به بک‌اند جهت ثبت سند و ارسال پیامک کاوه‌نگار به بازیکن
    rallyApi.createDeskBooking({
      slot_id: targetSlot.id,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      payment_method: payMethod,
      slot_time: targetSlot.time,
      club_name: currentClub.name,
      court_name: currentCourt,
      send_sms: sendSms,
      is_recurring_vip: isVipRecurring,
    }).catch(() => {});
  };

  const handleAddNewCourt = (payload: NewCourtPayload) => {
    const updatedCourts = [...currentClub.courts, payload.name];
    const newClubs = [...clubs];
    newClubs[selectedClubIndex] = { ...currentClub, courts: updatedCourts };
    setClubs(newClubs);

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

  return (
    <div className="space-y-5" dir="rtl">
      {/* Club Selector Bar */}
      <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Building className="w-5 h-5 text-rally-primary shrink-0" />
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

        {/* Section Tabs Switcher */}
        <div className="flex items-center bg-[#07131F] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveSection('SLOTS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'SLOTS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>سانس‌ها و باجه</span>
          </button>
          <button
            onClick={() => setActiveSection('ACCOUNTING')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'ACCOUNTING' ? 'bg-[#D7ED68] text-[#07131F] shadow font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>امور مالی و حسابداری</span>
          </button>
        </div>
      </div>

      {activeSection === 'ACCOUNTING' ? (
        <ClubAccountingTab clubId={currentClub.id} clubName={currentClub.name} />
      ) : (
        <>
          {/* Court Selection Bar */}
          <div className="bg-[#0F1E2E] border border-white/10 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3">
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
          </div>

          <ClubSlotsManager
            currentCourt={currentCourt}
            clubName={currentClub.name}
            currentSlots={currentSlots}
            onOpenManualBooking={(s) => {
              setModalSlot(s);
              setCustomerName('');
              setCustomerPhone('');
              setPayMethod('POS');
              setIsVipRecurring(false);
              setSendSms(true);
            }}
            onToggleSlotLock={toggleSlotLock}
            onOpenNewCourtModal={() => setIsNewCourtModalOpen(true)}
          />
        </>
      )}

      <ManualBookingModal
        isOpen={Boolean(modalSlot)}
        slot={modalSlot}
        customerName={customerName}
        customerPhone={customerPhone}
        payMethod={payMethod}
        isVipRecurring={isVipRecurring}
        sendSms={sendSms}
        onCustomerNameChange={setCustomerName}
        onCustomerPhoneChange={setCustomerPhone}
        onPayMethodChange={setPayMethod}
        onIsVipRecurringChange={setIsVipRecurring}
        onSendSmsChange={setSendSms}
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

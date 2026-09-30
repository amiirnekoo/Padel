import React, { useState } from 'react';
import { Calendar, Wallet, Trophy, Clock, CheckCircle, ArrowUpRight, Plus, MapPin } from 'lucide-react';
import { UserSession } from '../../../components/AuthModal';

interface PortalPlayerTabProps {
  userSession: UserSession;
  walletBalance: number;
  onOpenWallet: () => void;
}

export const PortalPlayerTab: React.FC<PortalPlayerTabProps> = ({
  userSession,
  walletBalance,
  onOpenWallet
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'matches' | 'wallet'>('bookings');

  const myBookings = [
    {
      id: 'RES-881',
      clubName: 'مجموعه ورزشی انقلاب',
      courtName: 'کورت سنترال ۱ (پانورامیک)',
      time: 'فردا ۱۸:۰۰ تا ۱۹:۳۰',
      date: 'پنجشنبه ۱۰ آبان',
      price: 2400000,
      status: 'CONFIRMED'
    },
    {
      id: 'RES-870',
      clubName: 'کلوپ پدل بام ولنجک',
      courtName: 'کورت ۳ (دید کوهستان)',
      time: 'شنبه ۱۲ آبان ۱۹:۳۰ تا ۲۱:۰۰',
      date: 'شنبه ۱۲ آبان',
      price: 2000000,
      status: 'CONFIRMED'
    }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Player Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">موجودی کیف پول رالی</span>
            <p className="text-xl font-black text-[#D7ED68] mt-1">
              {(walletBalance / 10).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-300">تومان</span>
            </p>
          </div>
          <button
            onClick={onOpenWallet}
            className="p-2.5 bg-[#D7ED68] hover:bg-[#c8de5b] text-[#172320] rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>شارژ</span>
          </button>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">سانس‌های فعال پیش‌رو</span>
            <p className="text-xl font-black text-white mt-1">۲ سانس رزرو شده</p>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">سطح پدل و ریتینگ</span>
            <p className="text-xl font-black text-emerald-400 mt-1">سطح ۳.۵ (متوسط به بالا)</p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-white/10 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'bookings' ? 'text-[#D7ED68] border-[#D7ED68]' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          رزروهای کورت من ({myBookings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('matches')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'matches' ? 'text-[#D7ED68] border-[#D7ED68]' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          بازی‌های مچ‌میکینگ
        </button>
        <button
          onClick={() => setActiveSubTab('wallet')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'wallet' ? 'text-[#D7ED68] border-[#D7ED68]' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          تاریخچه تراکنش‌های مالی
        </button>
      </div>

      {/* Bookings List */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-3">
          {myBookings.map((b) => (
            <div key={b.id} className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{b.clubName}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    تایید قطعی
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {b.courtName}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D7ED68]" />
                    {b.time}
                  </span>
                  <span>کد پیگیری: <strong className="font-mono text-white">{b.id}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <span className="text-sm font-black text-[#D7ED68]">
                  {b.price.toLocaleString('fa-IR')} تومان
                </span>
                <button
                  onClick={() => alert(`نمایش بلیت دیجیتال سانس ${b.id}`)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/10"
                >
                  مشاهده بلیت ورود
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'matches' && (
        <div className="bg-[#0F1E2E] border border-white/10 p-8 rounded-2xl text-center text-xs text-slate-400">
          <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p>شما در حال حاضر در صف مچ‌میکینگ فعالی نیستید.</p>
          <span className="text-[11px] text-slate-500 mt-1 block">می‌توانید از تب مسابقات مچ‌میکینگ در صفحه اصلی یک بازی جدید بسازید یا ملحق شوید.</span>
        </div>
      )}

      {activeSubTab === 'wallet' && (
        <div className="bg-[#0F1E2E] border border-white/10 p-5 rounded-2xl space-y-3">
          <h4 className="font-bold text-white text-xs">آخرین تراکنش‌های کیف پول</h4>
          <div className="divide-y divide-white/5 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">پرداخت رزرو کورت سنترال انقلاب</span>
                <span className="text-[10px] text-slate-400">دیروز ۱۷:۴۲ - درگاه شتابی</span>
              </div>
              <span className="font-black text-rose-400">-۲,۴۰۰,۰۰۰ تومان</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">شارژ حساب کاربری</span>
                <span className="text-[10px] text-slate-400">۳ روز پیش - شارژ مستقیم</span>
              </div>
              <span className="font-black text-emerald-400">+۵,۰۰۰,۰۰۰ تومان</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

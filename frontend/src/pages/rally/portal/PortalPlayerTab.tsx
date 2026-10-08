import React, { useState, useEffect } from 'react';
import { Calendar, Wallet, Trophy, Clock, CheckCircle, Plus, MapPin, AlertCircle, RefreshCw, RotateCcw, XCircle } from 'lucide-react';
import { UserSession } from '../../../components/AuthModal';
import { rallyApi } from '../../../services/rallyApi';
import { CancelBookingModal } from '../../../components/rally/portal/CancelBookingModal';
import { PlayerStatsHeader } from '../../../components/rally/portal/PlayerStatsHeader';
import { WaitlistNotificationsSection } from '../../../components/rally/portal/WaitlistNotificationsSection';
import { Bell } from 'lucide-react';

interface PortalPlayerTabProps {
  userSession: UserSession;
  walletBalance: number;
  onOpenWallet: () => void;
  onNavigateToCourts?: () => void;
}

interface UserBookingItem {
  booking_id: string;
  tracking_code: string;
  timeslot_id: string;
  amount_paid: number;
  amount_toman: number;
  status: 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELLED_BY_USER' | 'CANCELLED_BY_CLUB' | 'EXPIRED';
  payment_method: string;
  created_at: string;
  confirmed_at?: string;
  slot_date?: string;
  start_time?: string;
  end_time?: string;
  court_name?: string;
  club_id?: string;
  club_name?: string;
  club_address?: string;
}

export const PortalPlayerTab: React.FC<PortalPlayerTabProps> = ({
  userSession,
  walletBalance,
  onOpenWallet,
  onNavigateToCourts
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'matches' | 'wallet' | 'waitlist'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED'>('ALL');
  const [bookings, setBookings] = useState<UserBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<UserBookingItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await rallyApi.getMyBookings();
      setBookings(data || []);
    } catch {
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setCancellingId(cancelModalItem.booking_id);
    setMessage(null);
    try {
      const res = await rallyApi.cancelBooking(cancelModalItem.booking_id);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `رزرو با کد پیگیری ${cancelModalItem.tracking_code} لغو شد و مبلغ ${(res.data?.refund_amount / 10 || 0).toLocaleString('fa-IR')} تومان به کیف پول شما مسترد گردید.`
        });
        setCancelModalItem(null);
        fetchBookings();
      } else {
        setMessage({ type: 'error', text: res.error || 'خطا در لغو رزرو' });
      }
    } finally {
      setCancellingId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    const isPast = b.slot_date ? b.slot_date < todayStr : false;
    const isCancelled = b.status.includes('CANCELLED');
    if (bookingFilter === 'UPCOMING') return !isPast && !isCancelled;
    if (bookingFilter === 'PAST') return isPast && !isCancelled;
    if (bookingFilter === 'CANCELLED') return isCancelled;
    return true;
  });

  const upcomingCount = bookings.filter((b) => (!b.slot_date || b.slot_date >= todayStr) && !b.status.includes('CANCELLED')).length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Player Quick Stats */}
      <PlayerStatsHeader
        walletBalance={walletBalance}
        upcomingCount={upcomingCount}
        onOpenWallet={onOpenWallet}
      />

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          {message.text}
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-white/10 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'bookings' ? 'text-[#D7ED68] border-[#D7ED68]' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          رزروهای کورت من ({bookings.length})
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
          تراکنش‌های مالی
        </button>
        <button
          onClick={() => setActiveSubTab('waitlist')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'waitlist' ? 'text-[#D7ED68] border-[#D7ED68]' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>لیست انتظار و اعلان‌ها</span>
        </button>
      </div>

      {/* Bookings Sub-Filter Pills */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-[#0B1724] p-1 rounded-xl border border-white/10 text-xs">
              {[
                { id: 'ALL', label: 'همه' },
                { id: 'UPCOMING', label: 'پیش‌رو' },
                { id: 'PAST', label: 'گذشته' },
                { id: 'CANCELLED', label: 'لغوشده' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    bookingFilter === f.id ? 'bg-[#D7ED68] text-[#172320]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchBookings}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="بروزرسانی"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D7ED68]' : ''}`} />
              <span className="hidden sm:inline">بروزرسانی</span>
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="bg-[#0F1E2E] border border-white/10 p-10 rounded-2xl text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">هیچ رکوردی در این بخش یافت نشد.</p>
              <p className="text-xs text-slate-400">می‌توانید همین حالا اولین سانس خود را در کورت‌های معتبر رزرو کنید.</p>
              {onNavigateToCourts && (
                <button
                  onClick={onNavigateToCourts}
                  className="px-5 py-2.5 rounded-xl bg-[#D7ED68] text-[#172320] font-bold text-xs hover:bg-[#c8de5b] transition-all cursor-pointer inline-flex items-center gap-1.5 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>مشاهده کورت‌ها و رزرو سانس</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b) => {
                const isConfirmed = b.status === 'CONFIRMED';
                const isCancelled = b.status.includes('CANCELLED');

                return (
                  <div key={b.booking_id} className="bg-[#0F1E2E] border border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{b.club_name || 'باشگاه پدل رالی'}</span>
                        {b.status === 'CONFIRMED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />تأیید قطعی</span>}
                        {b.status === 'PENDING_PAYMENT' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" />در انتظار پرداخت</span>}
                        {b.status === 'EXPIRED' && <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" />منقضی‌شده (عودت وجه شاپرک)</span>}
                        {b.status === 'CANCELLED_BY_USER' && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" />لغوشده توسط شما</span>}
                        {b.status === 'CANCELLED_BY_CLUB' && <span className="bg-slate-500/10 text-slate-300 border border-slate-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" />لغو اضطراری مجموعه</span>}
                      </div>
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {b.court_name || 'کورت سنترال'} {b.club_address ? `(${b.club_address})` : ''}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#D7ED68]" />
                          {b.slot_date ? `تاریخ: ${b.slot_date} | ` : ''}
                          ساعت: {b.start_time ? `${b.start_time} تا ${b.end_time}` : 'سانس انتخابی'}
                        </span>
                        <span>کد پیگیری: <strong className="text-white font-extrabold" dir="ltr">{b.tracking_code}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <span className="text-sm font-black text-[#D7ED68]">
                        {(b.amount_toman || b.amount_paid / 10).toLocaleString('fa-IR')} تومان
                      </span>

                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => setCancelModalItem(b)}
                          className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
                        >
                          لغو سانس
                        </button>
                      )}

                      {onNavigateToCourts && (
                        <button
                          onClick={onNavigateToCourts}
                          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/10 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3 text-[#D7ED68]" />
                          <span>رزرو دوباره</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Matches Sub Tab */}
      {activeSubTab === 'matches' && (
        <div className="bg-[#0F1E2E] border border-white/10 p-8 rounded-2xl text-center text-xs text-slate-400">
          <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p>شما در حال حاضر در صف مچ‌میکینگ فعالی نیستید.</p>
        </div>
      )}

      {/* Wallet Sub Tab */}
      {activeSubTab === 'wallet' && (
        <div className="bg-[#0F1E2E] border border-white/10 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-xs">موجودی کیف پول: {(walletBalance / 10).toLocaleString('fa-IR')} تومان</h4>
            <button onClick={onOpenWallet} className="px-3 py-1 bg-[#D7ED68] text-[#172320] font-bold text-xs rounded-lg cursor-pointer">افزایش موجودی</button>
          </div>
        </div>
      )}

      {/* Waitlist Notifications Sub Tab */}
      {activeSubTab === 'waitlist' && (
        <WaitlistNotificationsSection />
      )}

      {/* Modular Cancellation Modal */}
      <CancelBookingModal
        item={cancelModalItem}
        onClose={() => setCancelModalItem(null)}
        onConfirm={handleConfirmCancel}
        isCancelling={!!cancellingId}
      />
    </div>
  );
};

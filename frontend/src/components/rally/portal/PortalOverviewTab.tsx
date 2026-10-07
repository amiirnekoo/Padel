import React from 'react';
import { Calendar, Wallet, ShoppingBag, Bookmark, ArrowLeft, Trophy, Clock, MapPin, Zap } from 'lucide-react';
import { UserSession } from '../../AuthModal';
import { PortalActiveTab } from './PortalSidebarNav';

interface PortalOverviewTabProps {
  userSession: UserSession;
  walletBalance: number;
  bookingsCount: number;
  ordersCount: number;
  drillsCount: number;
  nextBooking?: any;
  onOpenWallet: () => void;
  onSelectTab: (tab: PortalActiveTab) => void;
  onNavigateToCourts: () => void;
}

export const PortalOverviewTab: React.FC<PortalOverviewTabProps> = ({
  userSession,
  walletBalance,
  bookingsCount,
  ordersCount,
  drillsCount,
  nextBooking,
  onOpenWallet,
  onSelectTab,
  onNavigateToCourts
}) => {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Banner */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7ED68]/20 border border-[#D7ED68]/30 text-[#D7ED68] text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>پورتال جامع اعضای رالی</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              خوش آمدید، {userSession.fullName || 'ورزشکار گرامی'}! 🎾
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              مرکز کنترل و مدیریت متمرکز رزرو کورت‌ها، کیف پول دیجیتال، خریدهای فروشگاه و برنامه تمرینی شما.
            </p>
          </div>

          <button
            onClick={onNavigateToCourts}
            className="px-5 py-3 rounded-2xl bg-[#D7ED68] text-[#07131F] font-black text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-[#D7ED68]/20 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <span>رزرو سانس جدید</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Wallet Balance Card */}
        <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">موجودی کیف پول</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
              {walletBalance.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-300">تومان</span>
            </div>
            <button
              onClick={onOpenWallet}
              className="mt-2 text-[11px] text-[#D7ED68] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>+ افزایش موجودی</span>
            </button>
          </div>
        </div>

        {/* Active Bookings Card */}
        <div
          onClick={() => onSelectTab('BOOKINGS')}
          className="bg-[#0B1E30] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between cursor-pointer hover:border-[#D7ED68]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">رزروهای فعال</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {bookingsCount.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-300">مورد</span>
            </div>
            <span className="mt-2 text-[11px] text-blue-400 font-bold flex items-center gap-1">
              <span>مشاهده سانس‌ها</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Shop Orders Card */}
        <div
          onClick={() => onSelectTab('ORDERS')}
          className="bg-[#0B1E30] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between cursor-pointer hover:border-[#D7ED68]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">سفارشات تجهیزات</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {ordersCount.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-300">سفارش</span>
            </div>
            <span className="mt-2 text-[11px] text-purple-400 font-bold flex items-center gap-1">
              <span>پیگیری مرسولات</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Saved Drills Card */}
        <div
          onClick={() => onSelectTab('DRILLS')}
          className="bg-[#0B1E30] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between cursor-pointer hover:border-[#D7ED68]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">تمرینات نشان‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {drillsCount.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-300">تمرین</span>
            </div>
            <span className="mt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1">
              <span>مشاهده ویدیوها</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Next Upcoming Match Card or Quick Booking Prompt */}
      {nextBooking ? (
        <div className="bg-[#0B1E30] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <h3 className="text-sm font-bold text-white">سانس رزرو پیش‌روی شما</h3>
            </div>
            <span className="text-xs font-mono text-[#D7ED68] bg-[#D7ED68]/10 px-2.5 py-1 rounded-lg border border-[#D7ED68]/20">
              {nextBooking.tracking_code}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#D7ED68] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-300">تاریخ سانس</div>
                <div className="text-xs sm:text-sm font-bold text-white font-mono">{nextBooking.slot_date || 'امروز'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#D7ED68] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-300">ساعت بازی</div>
                <div className="text-xs sm:text-sm font-bold text-white font-mono">
                  {nextBooking.start_time} تا {nextBooking.end_time}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#D7ED68] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] text-slate-300">مجموعه و کورت</div>
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  {nextBooking.club_name} - {nextBooking.court_name}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0B1E30] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">سانس فعالی برای بازی پیش‌رو ندارید</h3>
            <p className="text-xs text-slate-300 mt-1">
              کورت‌های دارای ظرفیت پدل و تنیس را بررسی و در چند ثانیه سانس خود را قطعی کنید.
            </p>
          </div>
          <button
            onClick={onNavigateToCourts}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition-all cursor-pointer whitespace-nowrap"
          >
            مشاهده جدول زمانی کورت‌ها
          </button>
        </div>
      )}

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Passport Promo Tile */}
        <div
          onClick={() => onSelectTab('PASSPORT')}
          className="bg-gradient-to-l from-[#0B2238] to-[#0B1E30] border border-white/10 rounded-3xl p-5 shadow-lg flex items-center justify-between cursor-pointer hover:border-[#D7ED68]/40 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">شناسنامه ورزشی و کارت مهارت</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                تنظیم دست غالب، سطح بازی (مبتدی تا حرفه‌ای) و امتیاز رنکینگ
              </p>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-300 flex-shrink-0" />
        </div>

        {/* Shop Equipment Promo Tile */}
        <div
          onClick={() => onSelectTab('ORDERS')}
          className="bg-gradient-to-l from-[#0B2238] to-[#0B1E30] border border-white/10 rounded-3xl p-5 shadow-lg flex items-center justify-between cursor-pointer hover:border-[#D7ED68]/40 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-400/10 border border-purple-400/30 text-purple-400 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">فروشگاه تجهیزات و راکت‌های رالی</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                سفارش راکت‌های Nox، Bullpadel و توپ‌های مسابقاتی با ارسال فوری
              </p>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-300 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

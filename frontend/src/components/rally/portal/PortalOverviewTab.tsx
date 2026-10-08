import React from 'react';
import { Calendar, Wallet, ShoppingBag, Dumbbell, ArrowLeft, Building2, UserCheck, CheckCircle2 } from 'lucide-react';
import { UserSession } from '../../AuthModal';
import { PortalActiveTab } from './PortalSidebarNav';

interface PortalOverviewTabProps {
  userSession: UserSession;
  walletBalance: number;
  bookingsCount: number;
  ordersCount: number;
  drillsCount: number;
  nextBooking: any | null;
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
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userSession.role);
  const isClubOwner = ['CLUB_OPERATOR', 'CLUB_MANAGER', 'CLUB_OWNER', 'CLUB_ADMIN'].includes(userSession.role) || isAdmin;
  const isCoach = userSession.role === 'COACH' || isAdmin;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Hero Banner */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white">خوش آمدید، {userSession.fullName || 'ورزشکار رالی'}</h2>
            <span className="text-[10px] font-bold bg-[#D7ED68]/20 text-[#D7ED68] px-2 py-0.5 rounded-md border border-[#D7ED68]/30">
              {isAdmin ? 'مدیر ارشد سامانه (دسترسی کامل)' : isClubOwner ? 'مدیر باشگاه' : isCoach ? 'مربی رسمی' : 'بازیکن رسمی رالی'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            از این بخش می‌توانید تمامی رزروها، سفارشات، تمرینات و در صورت داشتن دسترسی، کورت‌های باشگاه خود را مدیریت فرمایید.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToCourts}
            className="px-4 py-2 bg-rally-primary hover:bg-rally-primary/80 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>رزرو سانس کورت</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">موجودی کیف پول</span>
            <Wallet className="w-4 h-4 text-[#D7ED68]" />
          </div>
          <p className="text-xl font-black text-[#D7ED68] mt-2 font-mono">
            {walletBalance.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
          </p>
          <button
            onClick={onOpenWallet}
            className="text-[10px] font-bold text-sky-400 hover:underline mt-2 inline-block cursor-pointer"
          >
            افزایش اعتبار کیف پول
          </button>
        </div>

        <div
          onClick={() => onSelectTab('BOOKINGS')}
          className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">رزروهای فعال کورت</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-white mt-2 font-mono">{bookingsCount} سانس</p>
          <span className="text-[10px] text-slate-500 mt-2 block">مشاهده جزئیات و رسید</span>
        </div>

        <div
          onClick={() => onSelectTab('ORDERS')}
          className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">سفارشات فروشگاه</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-white mt-2 font-mono">{ordersCount} سفارش</p>
          <span className="text-[10px] text-slate-500 mt-2 block">پیگیری پستی مرسولات</span>
        </div>

        <div
          onClick={() => onSelectTab('DRILLS')}
          className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">تمرینات نشان‌شده</span>
            <Dumbbell className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white mt-2 font-mono">{drillsCount} تمرین</p>
          <span className="text-[10px] text-slate-500 mt-2 block">ویدیوهای تکنیکی اختصاصی</span>
        </div>
      </div>

      {/* Quick Access to Club / Coach Management */}
      {(isClubOwner || isCoach) && (
        <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">دسترسی سریع به پنل‌های مدیریتی</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isClubOwner && (
              <button
                onClick={() => onSelectTab('CLUB_HUB')}
                className="p-4 bg-[#0B1724] border border-white/10 rounded-xl flex items-center justify-between hover:border-emerald-500/40 transition-colors cursor-pointer text-right"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">مدیریت کورت‌ها و سانس‌های باشگاه</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">بستن سانس‌ها، ثبت رزرو حضوری باجه و گزارش فروش</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {isCoach && (
              <button
                onClick={() => onSelectTab('COACH_HUB')}
                className="p-4 bg-[#0B1724] border border-white/10 rounded-xl flex items-center justify-between hover:border-blue-500/40 transition-colors cursor-pointer text-right"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white text-xs">مدیریت شاگردان و پکیج‌های مربیگری</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">تنظیم نرخ جلسات، تایید درخواست‌ها و پکیج‌ها</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Calendar, Wallet, ShoppingBag, Dumbbell, ArrowLeft, Building2, UserCheck } from 'lucide-react';
import { UserSession } from '../../AuthModal';
import { PortalActiveTab, PortalViewRole } from './PortalSidebarNav';
import { toPersianDigits, formatPersianPrice } from '../../../utils/persianUtils';

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
  viewRole: PortalViewRole;
}

export const PortalOverviewTab: React.FC<PortalOverviewTabProps> = ({
  userSession,
  walletBalance,
  bookingsCount,
  ordersCount,
  drillsCount,
  onOpenWallet,
  onSelectTab,
  onNavigateToCourts,
  viewRole
}) => {
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userSession.role);

  const roleTitle =
    viewRole === 'CLUB' ? 'مدیریت باشگاه' :
    viewRole === 'COACH' ? 'مربی رسمی' : 'ورزشکار رالی';

  const roleBadgeColor =
    viewRole === 'CLUB' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
    viewRole === 'COACH' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
    'bg-[#D7ED68]/20 text-[#D7ED68] border-[#D7ED68]/30';

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Hero Banner */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white">خوش آمدید، {userSession.fullName || 'ورزشکار رالی'}</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleBadgeColor}`}>
              {isAdmin ? `مدیر کل (${roleTitle})` : roleTitle}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {viewRole === 'CLUB'
              ? 'داشبورد متمرکز مدیریت کورت‌ها، سانس‌ها، باجه حضوری و دفاتر مالی باشگاه'
              : viewRole === 'COACH'
              ? 'داشبورد اختصاصی مربیگری، هماهنگی جلسات شاگردان و حسابداری درآمد تدریس'
              : 'داشبورد متمرکز رزرو کورت‌ها، سفارشات تجهیزات، ویدیوهای تمرینی و شناسنامه ورزشی'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {viewRole === 'CLUB' ? (
            <button
              onClick={() => onSelectTab('CLUB_HUB')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span>مدیریت کورت‌ها و سانس‌ها</span>
            </button>
          ) : viewRole === 'COACH' ? (
            <button
              onClick={() => onSelectTab('COACH_HUB')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>شاگردان و پکیج‌ها</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToCourts}
              className="px-4 py-2 bg-rally-primary hover:bg-rally-primary/80 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>رزرو سانس کورت</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">موجودی کیف پول</span>
            <Wallet className="w-4 h-4 text-[#D7ED68]" />
          </div>
          <p className="text-xl font-black text-[#D7ED68] mt-2 flex items-baseline gap-1.5">
            <span>{formatPersianPrice(walletBalance)}</span>
            <span className="text-xs font-normal text-slate-300">تومان</span>
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
          <p className="text-xl font-black text-white mt-2 flex items-baseline gap-1.5">
            <span>{toPersianDigits(bookingsCount)}</span>
            <span className="text-xs font-normal text-slate-300">سانس</span>
          </p>
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
          <p className="text-xl font-black text-white mt-2 flex items-baseline gap-1.5">
            <span>{toPersianDigits(ordersCount)}</span>
            <span className="text-xs font-normal text-slate-300">سفارش</span>
          </p>
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
          <p className="text-xl font-black text-white mt-2 flex items-baseline gap-1.5">
            <span>{toPersianDigits(drillsCount)}</span>
            <span className="text-xs font-normal text-slate-300">تمرین</span>
          </p>
          <span className="text-[10px] text-slate-500 mt-2 block">ویدیوهای تکنیکی اختصاصی</span>
        </div>
      </div>

      {/* Role-Specific Quick Access (Strictly isolated by viewRole) */}
      {viewRole === 'CLUB' && (
        <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">دسترسی سریع به امکانات باشگاه</h3>
          <button
            onClick={() => onSelectTab('CLUB_HUB')}
            className="w-full p-4 bg-[#0B1724] border border-white/10 rounded-xl flex items-center justify-between hover:border-emerald-500/40 transition-colors cursor-pointer text-right"
          >
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">مدیریت کورت‌ها، سانس‌ها و باجه حضوری</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">بستن و بازگشایی سانس‌ها، ثبت رزرو باجه و گزارش فروش</p>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {viewRole === 'COACH' && (
        <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">دسترسی سریع به امکانات مربیگری</h3>
          <button
            onClick={() => onSelectTab('COACH_HUB')}
            className="w-full p-4 bg-[#0B1724] border border-white/10 rounded-xl flex items-center justify-between hover:border-blue-500/40 transition-colors cursor-pointer text-right"
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
        </div>
      )}
    </div>
  );
};

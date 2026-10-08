import React from 'react';
import { LayoutDashboard, Calendar, ShoppingBag, Dumbbell, Award, Building2, UserCheck, Sparkles } from 'lucide-react';
import { UserSession } from '../../AuthModal';

export type PortalActiveTab =
  | 'OVERVIEW'
  | 'BOOKINGS'
  | 'ORDERS'
  | 'DRILLS'
  | 'PASSPORT'
  | 'CLUB_HUB'
  | 'COACH_HUB';

export type PortalViewRole = 'CLUB' | 'COACH' | 'PLAYER';

interface PortalSidebarNavProps {
  activeTab: PortalActiveTab;
  onSelectTab: (tab: PortalActiveTab) => void;
  userSession: UserSession;
  onOpenUpgradeModal: () => void;
  viewRole: PortalViewRole;
  onViewRoleChange?: (role: PortalViewRole) => void;
}

export const PortalSidebarNav: React.FC<PortalSidebarNavProps> = ({
  activeTab,
  onSelectTab,
  userSession,
  onOpenUpgradeModal,
  viewRole,
  onViewRoleChange
}) => {
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userSession.role);

  // 1. Items for CLUB View (Strictly club-focused)
  const clubNavItems = [
    { id: 'CLUB_HUB' as PortalActiveTab, label: 'مدیریت کورت‌ها و سانس‌ها', icon: Building2 },
    { id: 'OVERVIEW' as PortalActiveTab, label: 'نمای کلی پرتال', icon: LayoutDashboard },
    { id: 'PASSPORT' as PortalActiveTab, label: 'شناسنامه و مشخصات مدیر', icon: Award },
  ];

  // 2. Items for COACH View (Strictly coach-focused)
  const coachNavItems = [
    { id: 'COACH_HUB' as PortalActiveTab, label: 'شاگردان و پکیج‌های آموزشی', icon: UserCheck },
    { id: 'OVERVIEW' as PortalActiveTab, label: 'نمای کلی پرتال', icon: LayoutDashboard },
    { id: 'PASSPORT' as PortalActiveTab, label: 'شناسنامه و رنکینگ مربی', icon: Award },
  ];

  // 3. Items for PLAYER View (Strictly personal bookings & shop)
  const playerNavItems = [
    { id: 'OVERVIEW' as PortalActiveTab, label: 'نمای کلی پرتال', icon: LayoutDashboard },
    { id: 'BOOKINGS' as PortalActiveTab, label: 'رزروهای کورت من', icon: Calendar },
    { id: 'PASSPORT' as PortalActiveTab, label: 'شناسنامه و رنکینگ', icon: Award },
    { id: 'ORDERS' as PortalActiveTab, label: 'سفارشات فروشگاه', icon: ShoppingBag },
    { id: 'DRILLS' as PortalActiveTab, label: 'تمرینات نشان‌شده', icon: Dumbbell },
  ];

  const currentNavItems =
    viewRole === 'CLUB' ? clubNavItems :
    viewRole === 'COACH' ? coachNavItems : playerNavItems;

  const roleTitle =
    viewRole === 'CLUB' ? 'مدیریت باشگاه' :
    viewRole === 'COACH' ? 'مربی رسمی' : 'ورزشکار رالی';

  const roleBadgeColor =
    viewRole === 'CLUB' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
    viewRole === 'COACH' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
    'bg-[#D7ED68]/20 text-[#D7ED68] border-[#D7ED68]/30';

  return (
    <aside className="w-full lg:w-64 bg-[#0B1E30] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col gap-2 shrink-0 shadow-lg" dir="rtl">
      {/* User Info Header */}
      <div className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            {viewRole === 'CLUB' ? 'پنل اختصاصی باشگاه' : viewRole === 'COACH' ? 'پنل رسمی مربیان' : 'منوی کاربری بازیکن'}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleBadgeColor}`}>
            {roleTitle}
          </span>
        </div>
        <span className="text-xs font-extrabold text-white mt-1.5 block truncate">
          {userSession.fullName || userSession.phoneNumber}
        </span>
      </div>

      {/* Admin Role Switcher (Allows admin to view isolated roles without cross-role clutter) */}
      {isAdmin && onViewRoleChange && (
        <div className="bg-[#07131F] p-2 rounded-xl border border-white/10 mb-1">
          <div className="text-[10px] text-slate-400 font-bold px-1 mb-1.5 flex items-center justify-between">
            <span>نمای نقش (مدیر ارشد):</span>
            <span className="text-amber-400 text-[9px] bg-amber-400/10 px-1 rounded">Super Admin</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[11px] font-bold text-center">
            <button
              onClick={() => { onViewRoleChange('CLUB'); onSelectTab('CLUB_HUB'); }}
              className={`py-1 rounded-lg transition-colors cursor-pointer ${
                viewRole === 'CLUB' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              باشگاه
            </button>
            <button
              onClick={() => { onViewRoleChange('COACH'); onSelectTab('COACH_HUB'); }}
              className={`py-1 rounded-lg transition-colors cursor-pointer ${
                viewRole === 'COACH' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              مربی
            </button>
            <button
              onClick={() => { onViewRoleChange('PLAYER'); onSelectTab('OVERVIEW'); }}
              className={`py-1 rounded-lg transition-colors cursor-pointer ${
                viewRole === 'PLAYER' ? 'bg-rally-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              بازیکن
            </button>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible no-scrollbar">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap text-right ${
                isActive
                  ? viewRole === 'CLUB'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : viewRole === 'COACH'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-rally-primary text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Upgrade Callout for Normal Players */}
      {viewRole === 'PLAYER' && (
        <div className="mt-2 pt-2.5 border-t border-white/10 hidden lg:block">
          <div className="p-3 bg-[#07131F] border border-white/10 rounded-xl space-y-2 text-right">
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#D7ED68]" />
              <span>مربی یا باشگاه‌دار هستید؟</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              با ثبت درخواست، پنل اختصاصی مدیریت سانس‌ها و کلاس‌های خود را فعال کنید.
            </p>
            <button
              onClick={onOpenUpgradeModal}
              className="w-full py-1.5 bg-white/10 hover:bg-white/15 text-[#D7ED68] rounded-lg text-[10px] font-extrabold border border-white/10 transition-colors cursor-pointer"
            >
              درخواست همکاری و ارتقای نقش
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

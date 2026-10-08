import React from 'react';
import { LayoutDashboard, Calendar, ShoppingBag, Dumbbell, Award, Building2, UserCheck, ShieldAlert } from 'lucide-react';
import { UserSession } from '../../AuthModal';

export type PortalActiveTab =
  | 'OVERVIEW'
  | 'BOOKINGS'
  | 'ORDERS'
  | 'DRILLS'
  | 'PASSPORT'
  | 'CLUB_HUB'
  | 'COACH_HUB';

interface PortalSidebarNavProps {
  activeTab: PortalActiveTab;
  onSelectTab: (tab: PortalActiveTab) => void;
  userSession: UserSession;
  onOpenUpgradeModal: () => void;
}

export const PortalSidebarNav: React.FC<PortalSidebarNavProps> = ({
  activeTab,
  onSelectTab,
  userSession,
  onOpenUpgradeModal
}) => {
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userSession.role);
  const isCoach = userSession.role === 'COACH' || isAdmin;
  const isClubOwner = ['CLUB_OPERATOR', 'CLUB_MANAGER', 'CLUB_OWNER', 'CLUB_ADMIN'].includes(userSession.role) || isAdmin;

  const navItems = [
    { id: 'OVERVIEW' as PortalActiveTab, label: 'نمای کلی پرتال', icon: LayoutDashboard },
    { id: 'BOOKINGS' as PortalActiveTab, label: 'رزروهای کورت من', icon: Calendar },
    { id: 'PASSPORT' as PortalActiveTab, label: 'شناسنامه و رنکینگ', icon: Award },
    { id: 'ORDERS' as PortalActiveTab, label: 'سفارشات فروشگاه', icon: ShoppingBag },
    { id: 'DRILLS' as PortalActiveTab, label: 'تمرینات نشان‌شده', icon: Dumbbell },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#0B1E30] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible shrink-0 shadow-lg">
      <div className="hidden lg:block pb-3 mb-2 border-b border-white/10">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">منوی کاربری رالی</span>
        <span className="text-xs font-bold text-white mt-0.5 block truncate">{userSession.fullName || userSession.phoneNumber}</span>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-rally-primary text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}

      <div className="my-2 border-t border-white/10 hidden lg:block" />
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden lg:block px-1">پنل‌های تخصصی</span>

      {/* Club Owner Tab */}
      <button
        onClick={() => onSelectTab('CLUB_HUB')}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'CLUB_HUB'
            ? 'bg-emerald-600 text-white shadow-sm'
            : isClubOwner
            ? 'text-emerald-400 hover:text-white hover:bg-emerald-600/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 shrink-0" />
          <span>مدیریت باشگاه و کورت</span>
        </div>
        {!isClubOwner && (
          <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">نیازمند مجوز</span>
        )}
      </button>

      {/* Coach Tab */}
      <button
        onClick={() => onSelectTab('COACH_HUB')}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'COACH_HUB'
            ? 'bg-blue-600 text-white shadow-sm'
            : isCoach
            ? 'text-blue-400 hover:text-white hover:bg-blue-600/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>پنل مربیان رسمی</span>
        </div>
        {!isCoach && (
          <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">نیازمند مجوز</span>
        )}
      </button>
    </aside>
  );
};

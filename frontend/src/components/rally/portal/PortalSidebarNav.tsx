import React from 'react';
import { LayoutDashboard, Calendar, ShoppingBag, Bookmark, Award, Shield, Sparkles, Building2, UserCheck } from 'lucide-react';
import { UserSession } from '../../AuthModal';

export type PortalActiveTab = 'OVERVIEW' | 'BOOKINGS' | 'ORDERS' | 'DRILLS' | 'PASSPORT' | 'COACH_HUB' | 'CLUB_HUB';

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
  const isCoach = userSession.role === 'COACH';
  const isClubOwner = ['CLUB_OPERATOR', 'CLUB_MANAGER', 'CLUB_OWNER', 'CLUB_ADMIN'].includes(userSession.role);

  const mainNavItems = [
    { id: 'OVERVIEW' as PortalActiveTab, label: 'نمای کلی داشبورد', icon: LayoutDashboard },
    { id: 'BOOKINGS' as PortalActiveTab, label: 'رزروهای کورت من', icon: Calendar },
    { id: 'ORDERS' as PortalActiveTab, label: 'سفارشات فروشگاه', icon: ShoppingBag },
    { id: 'DRILLS' as PortalActiveTab, label: 'تمرینات نشان‌شده', icon: Bookmark },
    { id: 'PASSPORT' as PortalActiveTab, label: 'شناسنامه ورزشی و رنکینگ', icon: Award },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0" dir="rtl">
      {/* Container with solid dark slate theme, strictly ZERO backdrop-blur */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col gap-2">
        {/* User Mini Profile Header */}
        <div className="p-3 bg-[#07131F] border border-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#0C3E6E] border border-white/10 text-[#D7ED68] font-black text-base flex items-center justify-center flex-shrink-0">
            {userSession.fullName?.charAt(0) || 'R'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{userSession.fullName || 'ورزشکار رالی'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D7ED68]"></span>
              <span className="text-[11px] text-slate-300 font-mono">{userSession.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs List */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible py-1 no-scrollbar">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-right whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#D7ED68] text-[#07131F] font-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#07131F]' : 'text-[#D7ED68]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Conditional Role-Gated Management Tabs */}
          {isCoach && (
            <button
              onClick={() => onSelectTab('COACH_HUB')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-right whitespace-nowrap cursor-pointer mt-1 ${
                activeTab === 'COACH_HUB'
                  ? 'bg-amber-400 text-[#07131F] font-black'
                  : 'text-amber-300 hover:text-white hover:bg-amber-400/10 border border-amber-400/20'
              }`}
            >
              <UserCheck className="w-4 h-4 flex-shrink-0" />
              <span>پنل اختصاصی مربی</span>
            </button>
          )}

          {isClubOwner && (
            <button
              onClick={() => onSelectTab('CLUB_HUB')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-right whitespace-nowrap cursor-pointer mt-1 ${
                activeTab === 'CLUB_HUB'
                  ? 'bg-emerald-400 text-[#07131F] font-black'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-400/10 border border-emerald-400/20'
              }`}
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span>پنل مدیریت باشگاه</span>
            </button>
          )}
        </nav>

        {/* Upgrade Banner for Regular Players */}
        {!isCoach && !isClubOwner && (
          <div className="mt-2 pt-3 border-t border-white/10">
            <div className="bg-[#0C2B45] border border-[#D7ED68]/20 rounded-2xl p-3 text-right">
              <div className="flex items-center gap-1.5 text-[#D7ED68] text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مربی یا مدیر باشگاه هستید؟</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                برای مدیریت سانس‌ها و کلاس‌های آموزشی، حساب خود را ارتقا دهید.
              </p>
              <button
                onClick={onOpenUpgradeModal}
                className="w-full mt-2.5 py-2 px-3 rounded-xl bg-[#D7ED68]/20 hover:bg-[#D7ED68] text-[#D7ED68] hover:text-[#07131F] border border-[#D7ED68]/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>درخواست ارتقای نقش</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

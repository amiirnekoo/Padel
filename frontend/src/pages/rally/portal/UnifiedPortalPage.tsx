import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { UserSession } from '../../../components/AuthModal';
import { PortalSidebarNav, PortalActiveTab } from '../../../components/rally/portal/PortalSidebarNav';
import { PortalOverviewTab } from '../../../components/rally/portal/PortalOverviewTab';
import { PortalPlayerTab } from './PortalPlayerTab';
import { PortalShopOrdersTab } from '../../../components/rally/portal/PortalShopOrdersTab';
import { PortalSavedDrillsTab } from '../../../components/rally/portal/PortalSavedDrillsTab';
import { PortalPlayerPassportTab } from '../../../components/rally/portal/PortalPlayerPassportTab';
import { PortalRoleUpgradeModal } from '../../../components/rally/portal/PortalRoleUpgradeModal';
import { PortalClubTab } from './PortalClubTab';
import { PortalCoachTab } from './PortalCoachTab';
import { rallyApi } from '../../../services/rallyApi';

interface UnifiedPortalPageProps {
  userSession: UserSession;
  walletBalance: number;
  onOpenWallet: () => void;
  onExitPortal: () => void;
  onLogout: () => void;
  onNavigateToShop?: () => void;
  onNavigateToDrills?: () => void;
}

export const UnifiedPortalPage: React.FC<UnifiedPortalPageProps> = ({
  userSession,
  walletBalance,
  onOpenWallet,
  onExitPortal,
  onLogout,
  onNavigateToShop,
  onNavigateToDrills
}) => {
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userSession.role);
  const isCoach = userSession.role === 'COACH' || isAdmin;
  const isClubOwner = ['CLUB_OPERATOR', 'CLUB_MANAGER', 'CLUB_OWNER', 'CLUB_ADMIN'].includes(userSession.role) || isAdmin;

  const [activeTab, setActiveTab] = useState<PortalActiveTab>(() => {
    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      if (params?.get('tab') === 'club' || params?.get('demo') === 'club' || params?.get('portal') === 'club' || isClubOwner) {
        if (isClubOwner) return 'CLUB_HUB';
      }
      return 'OVERVIEW';
    } catch { return 'OVERVIEW'; }
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [drillsCount, setDrillsCount] = useState<number>(0);
  const [nextBooking, setNextBooking] = useState<any | null>(null);

  // واکشی شاخص‌های کلی داشبورد
  useEffect(() => {
    const fetchPortalStats = async () => {
      try {
        const [bookingsData, ordersData, drillsData] = await Promise.all([
          rallyApi.getMyBookings(),
          rallyApi.getMyShopOrders(),
          rallyApi.getMySavedDrills()
        ]);

        if (Array.isArray(bookingsData)) {
          const todayStr = new Date().toISOString().split('T')[0];
          const activeBookings = bookingsData.filter(
            (b) => (!b.slot_date || b.slot_date >= todayStr) && !b.status?.includes('CANCELLED')
          );
          setBookingsCount(activeBookings.length);
          if (activeBookings.length > 0) {
            setNextBooking(activeBookings[0]);
          }
        }

        if (Array.isArray(ordersData)) {
          setOrdersCount(ordersData.length);
        }

        if (Array.isArray(drillsData)) {
          setDrillsCount(drillsData.length);
        }
      } catch {
        // خطای شبکه بی‌پاسخ نمی‌ماند و مقادیر امن می‌مانند
      }
    };

    fetchPortalStats();
  }, []);

  // حفاظت از گیت نقش‌ها (Role Guard)
  const handleSelectTab = (tab: PortalActiveTab) => {
    if (tab === 'COACH_HUB' && !isCoach) {
      setIsUpgradeModalOpen(true);
      return;
    }
    if (tab === 'CLUB_HUB' && !isClubOwner) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#07131F] text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Portal Top Navigation Header - Solid, Zero Blur */}
      <header className="bg-[#0B1E30] border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0C3E6E] border border-white/20 text-[#D7ED68] flex items-center justify-center font-black text-sm">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">پورتال اعضای رالی</span>
              <span className="bg-[#D7ED68]/20 text-[#D7ED68] border border-[#D7ED68]/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {userSession.fullName || 'ورزشکار'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">داشبورد متمرکز رزرو، فروشگاه، تمرینات و رنکینگ</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج از حساب</span>
          </button>

          <button
            onClick={onExitPortal}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>بازگشت به سایت</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        {/* Modular Sidebar Navigation */}
        <PortalSidebarNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          userSession={userSession}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        />

        {/* Tab Content Canvas */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'OVERVIEW' && (
            <PortalOverviewTab
              userSession={userSession}
              walletBalance={walletBalance}
              bookingsCount={bookingsCount}
              ordersCount={ordersCount}
              drillsCount={drillsCount}
              nextBooking={nextBooking}
              onOpenWallet={onOpenWallet}
              onSelectTab={handleSelectTab}
              onNavigateToCourts={onExitPortal}
            />
          )}

          {activeTab === 'BOOKINGS' && (
            <PortalPlayerTab
              userSession={userSession}
              walletBalance={walletBalance}
              onOpenWallet={onOpenWallet}
              onNavigateToCourts={onExitPortal}
            />
          )}

          {activeTab === 'ORDERS' && (
            <PortalShopOrdersTab
              onNavigateToShop={onNavigateToShop || onExitPortal}
            />
          )}

          {activeTab === 'DRILLS' && (
            <PortalSavedDrillsTab
              onNavigateToDrills={onNavigateToDrills || onExitPortal}
            />
          )}

          {activeTab === 'PASSPORT' && (
            <PortalPlayerPassportTab
              userSession={userSession}
            />
          )}

          {activeTab === 'COACH_HUB' && isCoach && (
            <PortalCoachTab />
          )}

          {activeTab === 'CLUB_HUB' && isClubOwner && (
            <PortalClubTab />
          )}
        </main>
      </div>

      {/* Role Upgrade Modal */}
      <PortalRoleUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        userSession={userSession}
      />
    </div>
  );
};

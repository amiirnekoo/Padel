import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClubCalendarPage } from './pages/ClubCalendarPage';
import { OperatorPage } from './pages/OperatorPage';
import { VenueOnboardingPage } from './pages/VenueOnboardingPage';
import { CrmCustomersPage } from './pages/CrmCustomersPage';
import { ClubSettlementsPage } from './pages/ClubSettlementsPage';
import { NotificationLogsPage } from './pages/NotificationLogsPage';
import { WalletModal } from './components/WalletModal';
import { AuthModal, UserSession } from './components/AuthModal';
import { AppHeader, TabType } from './components/AppHeader';
import { PlatformHeroBanner } from './components/PlatformHeroBanner';
import { AppFooter } from './components/AppFooter';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('player');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('padel_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const refreshWalletBalance = async () => {
    const uid = userSession?.userId || 'user-1';
    try {
      const res = await fetch(`/api/v1/wallet/balance?user_id=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance);
      }
    } catch {
      // offline / mock mode fallback
    }
  };

  useEffect(() => {
    refreshWalletBalance();
  }, [userSession]);

  const currentUserId = userSession?.userId || 'user-1';

  return (
    <div className="min-h-screen flex flex-col bg-rally-dark-bg text-slate-100 selection:bg-rally-accent selection:text-slate-950">
      {/* High-End Sticky Header */}
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSession={userSession}
        walletBalance={walletBalance}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* Platform Architecture & Hero Pillar */}
      <PlatformHeroBanner />

      {/* Main Dynamic Viewport with Framer Motion Tab Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
            {activeTab === 'player' && (
              <ClubCalendarPage
                userId={currentUserId}
                walletBalance={walletBalance}
                onRefreshWallet={refreshWalletBalance}
              />
            )}
            {activeTab === 'operator' && <OperatorPage />}
            {activeTab === 'venue' && <VenueOnboardingPage />}
            {activeTab === 'settlements' && <ClubSettlementsPage />}
            {activeTab === 'crm' && <CrmCustomersPage />}
            {activeTab === 'notifications' && <NotificationLogsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Interactive Modals */}
      <WalletModal
        userId={currentUserId}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBalanceUpdated={(b) => setWalletBalance(b)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        currentUser={userSession}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => {
          setUserSession(u);
          refreshWalletBalance();
        }}
        onLogout={() => {
          localStorage.removeItem('padel_auth');
          setUserSession(null);
          setWalletBalance(0);
        }}
      />

      {/* Luxury Multi-Column Footer */}
      <AppFooter />
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { ClubCalendarPage } from './pages/ClubCalendarPage';
import { OperatorPage } from './pages/OperatorPage';
import { VenueOnboardingPage } from './pages/VenueOnboardingPage';
import { CrmCustomersPage } from './pages/CrmCustomersPage';
import { ClubSettlementsPage } from './pages/ClubSettlementsPage';
import { NotificationLogsPage } from './pages/NotificationLogsPage';
import { WalletModal } from './components/WalletModal';
import { AuthModal, UserSession } from './components/AuthModal';
import { AppHeader, TabType } from './components/AppHeader';
import { ShieldCheck } from 'lucide-react';

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
      // offline
    }
  };

  useEffect(() => {
    refreshWalletBalance();
  }, [userSession]);

  const currentUserId = userSession?.userId || 'user-1';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Extracted Modular Header */}
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSession={userSession}
        walletBalance={walletBalance}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
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
      </main>

      {/* Modals */}
      <WalletModal
        userId={currentUserId}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBalanceUpdated={b => setWalletBalance(b)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        currentUser={userSession}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={u => { setUserSession(u); refreshWalletBalance(); }}
        onLogout={() => { localStorage.removeItem('padel_auth'); setUserSession(null); setWalletBalance(0); }}
      />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px 16px', background: 'rgba(10, 14, 23, 0.95)', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '#64748b' }}>
          <div>
            <span>© ۲۰۲۶ پدل‌سنتر ایران — تمامی قیمت‌ها مطابق با نرخ مصوب باشگاه (بدون کارمزد مازاد بازیکن) می‌باشد.</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <ShieldCheck size={16} /> تضمین بازگشت وجه طبق قوانین ۲۴ ساعته
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { ClubCalendarPage } from './pages/ClubCalendarPage';
import { OperatorPage } from './pages/OperatorPage';
import { VenueOnboardingPage } from './pages/VenueOnboardingPage';
import { CrmCustomersPage } from './pages/CrmCustomersPage';
import { ClubSettlementsPage } from './pages/ClubSettlementsPage';
import { NotificationLogsPage } from './pages/NotificationLogsPage';
import { WalletModal } from './components/WalletModal';
import { Trophy, CalendarCheck, ShieldCheck, UserCheck, Building2, Users, CreditCard, Wallet, MessageSquare } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'player' | 'operator' | 'venue' | 'crm' | 'settlements' | 'notifications'>('player');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Brand Navigation Header */}
      <header className="app-header">
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Trophy size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  پدل و تنیس سنتر ایران
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
                  نسخه جامع ۲.۱
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>موتور رزرو اتمیک، تسویه خودکار پایا و کیف پول هوشمند</p>
            </div>
          </div>

          {/* Right Header Controls: Wallet + Navigation Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsWalletOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#064e3b',
                border: '1px solid #059669',
                padding: '7px 14px',
                borderRadius: '10px',
                color: '#a7f3d0',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Wallet size={16} color="#34d399" />
              <span>کیف پول: {(walletBalance / 10).toLocaleString('fa-IR')} تومان</span>
            </button>

            {/* Navigation Pill Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '4px'
              }}
            >
              <button
                onClick={() => setActiveTab('player')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: activeTab === 'player' ? '#10b981' : 'transparent',
                  color: activeTab === 'player' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CalendarCheck size={14} />
                رزرو بازیکنان
              </button>
              <button
                onClick={() => setActiveTab('operator')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: activeTab === 'operator' ? '#ef4444' : 'transparent',
                  color: activeTab === 'operator' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserCheck size={14} />
                باجه متصدی
              </button>
              <button
                onClick={() => setActiveTab('venue')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: activeTab === 'venue' ? '#0284c7' : 'transparent',
                  color: activeTab === 'venue' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Building2 size={14} />
                مالکان باشگاه
              </button>
              <button
                onClick={() => setActiveTab('settlements')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: activeTab === 'settlements' ? '#059669' : 'transparent',
                  color: activeTab === 'settlements' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CreditCard size={14} />
                تسویه پایا (۹۷٪)
              </button>
              <button
                onClick={() => setActiveTab('crm')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: activeTab === 'crm' ? '#8b5cf6' : 'transparent',
                  color: activeTab === 'crm' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Users size={14} />
                هوش مشتریان
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: activeTab === 'notifications' ? '#0ea5e9' : 'transparent',
                  color: activeTab === 'notifications' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={14} />
                مانیتورینگ پیامک
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'player' && <ClubCalendarPage />}
        {activeTab === 'operator' && <OperatorPage />}
        {activeTab === 'venue' && <VenueOnboardingPage />}
        {activeTab === 'settlements' && <ClubSettlementsPage />}
        {activeTab === 'crm' && <CrmCustomersPage />}
        {activeTab === 'notifications' && <NotificationLogsPage />}
      </main>

      <WalletModal
        userId="user-1"
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBalanceUpdated={b => setWalletBalance(b)}
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

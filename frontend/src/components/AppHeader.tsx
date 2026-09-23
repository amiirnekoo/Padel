import React from 'react';
import { UserSession } from './AuthModal';
import { Trophy, CalendarCheck, UserCheck, Building2, Users, CreditCard, Wallet, MessageSquare, LogIn } from 'lucide-react';

export type TabType = 'player' | 'operator' | 'venue' | 'crm' | 'settlements' | 'notifications';

interface AppHeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userSession: UserSession | null;
  walletBalance: number;
  onOpenAuth: () => void;
  onOpenWallet: () => void;
}

const NAV_TABS = [
  { id: 'player', label: 'رزرو بازیکنان', icon: CalendarCheck, activeColor: '#10b981' },
  { id: 'operator', label: 'باجه متصدی', icon: UserCheck, activeColor: '#ef4444' },
  { id: 'venue', label: 'مالکان باشگاه', icon: Building2, activeColor: '#0284c7' },
  { id: 'settlements', label: 'تسویه پایا (۹۷٪)', icon: CreditCard, activeColor: '#059669' },
  { id: 'crm', label: 'هوش مشتریان', icon: Users, activeColor: '#8b5cf6' },
  { id: 'notifications', label: 'مانیتورینگ پیامک', icon: MessageSquare, activeColor: '#0ea5e9' },
] as const;

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  setActiveTab,
  userSession,
  walletBalance,
  onOpenAuth,
  onOpenWallet,
}) => {
  return (
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
        {/* Brand & Logo */}
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
                نسخه ۲.۲
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>موتور رزرو اتمیک، تسویه خودکار پایا و ورود پیامکی OTP</p>
          </div>
        </div>

        {/* Right Header Controls: Auth + Wallet + Nav Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: userSession ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: userSession ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
              padding: '7px 12px',
              borderRadius: '10px',
              color: userSession ? '#7dd3fc' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            {userSession ? <UserCheck size={16} color="#38bdf8" /> : <LogIn size={16} />}
            <span>{userSession ? (userSession.fullName || userSession.phoneNumber) : 'ورود / OTP'}</span>
          </button>

          <button
            onClick={onOpenWallet}
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
            <span>کیف پول: {Math.floor(walletBalance / 10).toLocaleString('fa-IR')} تومان</span>
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
            {NAV_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    background: isActive ? tab.activeColor : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { ClubCalendarPage } from './pages/ClubCalendarPage';
import { OperatorPage } from './pages/OperatorPage';
import { VenueOnboardingPage } from './pages/VenueOnboardingPage';
import { CrmCustomersPage } from './pages/CrmCustomersPage';
import { Trophy, CalendarCheck, ShieldCheck, UserCheck, Building2, Users } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'player' | 'operator' | 'venue' | 'crm'>('player');

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
                  نسخه جامع ۲.۰
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>سامانه یکپارچه رزرواسیون، آنبوردینگ مالکان و هوش داده مشتریان سراسر کشور</p>
            </div>
          </div>

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
                padding: '8px 14px',
                borderRadius: '8px',
                background: activeTab === 'player' ? '#10b981' : 'transparent',
                color: activeTab === 'player' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CalendarCheck size={16} />
              رزرو بازیکنان
            </button>
            <button
              onClick={() => setActiveTab('operator')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: activeTab === 'operator' ? '#ef4444' : 'transparent',
                color: activeTab === 'operator' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserCheck size={16} />
              باجه متصدی
            </button>
            <button
              onClick={() => setActiveTab('venue')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: activeTab === 'venue' ? '#0284c7' : 'transparent',
                color: activeTab === 'venue' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Building2 size={16} />
              ثبت و پنل مالکان باشگاه
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: activeTab === 'crm' ? '#8b5cf6' : 'transparent',
                color: activeTab === 'crm' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Users size={16} />
              هوش مشتریان و CRM
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'player' && <ClubCalendarPage />}
        {activeTab === 'operator' && <OperatorPage />}
        {activeTab === 'venue' && <VenueOnboardingPage />}
        {activeTab === 'crm' && <CrmCustomersPage />}
      </main>

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

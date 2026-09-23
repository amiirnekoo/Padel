import React from 'react';
import { motion } from 'framer-motion';
import { UserSession } from './AuthModal';
import {
  Trophy,
  CalendarCheck,
  UserCheck,
  Building2,
  Users,
  CreditCard,
  Wallet,
  MessageSquare,
  LogIn,
  PlusCircle,
  Activity
} from 'lucide-react';

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
  { id: 'player' as const, label: 'رزرو سانس‌ها', icon: CalendarCheck, badge: 'زنده' },
  { id: 'operator' as const, label: 'باجه متصدی', icon: UserCheck, badge: 'مدیریت' },
  { id: 'venue' as const, label: 'مالکان باشگاه', icon: Building2, badge: 'پذیرش' },
  { id: 'settlements' as const, label: 'تسویه پایا (۹۷٪)', icon: CreditCard, badge: 'مالی' },
  { id: 'crm' as const, label: 'هوش مشتریان', icon: Users, badge: 'تحلیل' },
  { id: 'notifications' as const, label: 'مانیتورینگ پیامک', icon: MessageSquare, badge: 'OTP' },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  setActiveTab,
  userSession,
  walletBalance,
  onOpenAuth,
  onOpenWallet,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-rally-dark-bg border-b border-rally-border-subtle shadow-rally-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Identity & Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-lg bg-rally-primary border border-rally-accent/30 flex items-center justify-center shadow-rally-glow cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-rally-accent" />
          </motion.div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white tracking-tight">
                رالی پدل
              </span>
              <span className="text-xs font-bold text-rally-accent bg-rally-accent/10 border border-rally-accent/30 px-2 py-0.5 rounded-pill">
                RALLY ELITE
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-pill">
                <Activity className="w-3 h-3 animate-pulse" />
                آنلاین
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              پلتفرم سراسری رزرواسیون، مدیریت باجه و تسویه آنی کلوپ‌های پدل و تنیس
            </p>
          </div>
        </div>

        {/* Right Controls: Auth + Wallet Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Auth Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAuth}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-colors ${
              userSession
                ? 'bg-sky-950/80 border border-sky-500/50 text-sky-300'
                : 'bg-rally-dark-card border border-rally-border-subtle text-slate-300 hover:text-white hover:border-rally-border-active'
            }`}
          >
            {userSession ? (
              <UserCheck className="w-4 h-4 text-sky-400" />
            ) : (
              <LogIn className="w-4 h-4 text-rally-accent" />
            )}
            <span>{userSession ? (userSession.fullName || userSession.phoneNumber) : 'ورود / عضویت OTP'}</span>
          </motion.button>

          {/* Wallet Balance Widget */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3 py-2 rounded bg-rally-primary/80 border border-rally-accent/40 text-rally-accent hover:bg-rally-primary hover:border-rally-accent transition-colors shadow-rally-glow"
          >
            <Wallet className="w-4 h-4 text-rally-accent" />
            <div className="flex items-center gap-1 text-xs font-extrabold text-white">
              <span>کیف پول:</span>
              <span className="text-rally-accent font-black">
                {Math.floor(walletBalance / 10).toLocaleString('fa-IR')}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">تومان</span>
            </div>
            <PlusCircle className="w-3.5 h-3.5 text-rally-accent ml-0.5" />
          </motion.button>
        </div>
      </div>

      {/* Navigation Segmented Control Bar (8px Grid & Framer Motion Pill) */}
      <div className="w-full bg-slate-950/90 border-t border-rally-border-subtle overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-1 min-w-max">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer select-none ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-rally-primary rounded border border-rally-accent/40 shadow-rally-green"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rally-accent' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-pill font-bold ${
                        isActive
                          ? 'bg-rally-accent/20 text-rally-accent'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

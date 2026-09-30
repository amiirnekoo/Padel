import React, { useState } from 'react';
import { User, Building, Award, ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { UserSession } from '../../../components/AuthModal';
import { PortalPlayerTab } from './PortalPlayerTab';
import { PortalClubTab } from './PortalClubTab';
import { PortalCoachTab } from './PortalCoachTab';

interface UnifiedPortalPageProps {
  userSession: UserSession;
  walletBalance: number;
  onOpenWallet: () => void;
  onExitPortal: () => void;
  onLogout: () => void;
}

export type PortalRoleView = 'PLAYER' | 'CLUB_OWNER' | 'COACH';

export const UnifiedPortalPage: React.FC<UnifiedPortalPageProps> = ({
  userSession,
  walletBalance,
  onOpenWallet,
  onExitPortal,
  onLogout
}) => {
  const [currentRoleView, setCurrentRoleView] = useState<PortalRoleView>(
    userSession.role === 'CLUB_OWNER' ? 'CLUB_OWNER' : userSession.role === 'COACH' ? 'COACH' : 'PLAYER'
  );

  return (
    <div className="min-h-screen bg-[#07131F] text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Portal Top Bar */}
      <header className="bg-[#0B1E30] border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0C3E6E] border border-white/20 text-[#D7ED68] flex items-center justify-center font-black text-sm">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">پورتال اختصاصی اعضای رالی</span>
              <span className="bg-[#D7ED68]/20 text-[#D7ED68] border border-[#D7ED68]/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {userSession.fullName}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">داشبورد متمرکز رزروها، باشگاه‌ها و خدمات ورزشی</span>
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

      {/* Role Navigation Selector Bar */}
      <div className="bg-[#0B2238] border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold">بخش اختصاصی:</span>
            <div className="flex bg-[#07131F] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setCurrentRoleView('PLAYER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRoleView === 'PLAYER' ? 'bg-[#D7ED68] text-[#172320] shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>پنل بازیکن (رزروها و کیف پول)</span>
              </button>

              <button
                onClick={() => setCurrentRoleView('CLUB_OWNER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRoleView === 'CLUB_OWNER' ? 'bg-[#D7ED68] text-[#172320] shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>پنل باشگاه‌دار (کورت‌ها و سانس‌ها)</span>
              </button>

              <button
                onClick={() => setCurrentRoleView('COACH')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRoleView === 'COACH' ? 'bg-[#D7ED68] text-[#172320] shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>پنل مربی (کلاس‌ها و شاگردان)</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            شماره همراه: <strong className="font-mono text-white">{userSession.phoneNumber}</strong>
          </div>
        </div>
      </div>

      {/* Main Role Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentRoleView === 'PLAYER' && (
          <PortalPlayerTab
            userSession={userSession}
            walletBalance={walletBalance}
            onOpenWallet={onOpenWallet}
          />
        )}

        {currentRoleView === 'CLUB_OWNER' && (
          <PortalClubTab />
        )}

        {currentRoleView === 'COACH' && (
          <PortalCoachTab />
        )}
      </main>
    </div>
  );
};

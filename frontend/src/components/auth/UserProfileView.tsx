import React from 'react';
import { User, Shield, Phone, Mail, Award, LogOut, CheckCircle2, ChevronLeft, Building2, UserCheck } from 'lucide-react';
import { UserSession } from '../AuthModal';

interface UserProfileViewProps {
  currentUser: UserSession;
  onLogout: () => void;
  onClose: () => void;
  onNavigateToPortal?: (view?: 'PLAYER' | 'COACH' | 'CLUB_MANAGER' | 'ADMIN') => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onLogout,
  onClose,
  onNavigateToPortal
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'COACH': return 'مربی حرفه‌ای';
      case 'CLUB_MANAGER': return 'مدیر باشگاه';
      case 'CLUB_OPERATOR': return 'متصدی کادر باجه';
      case 'ADMIN': return 'مدیر ارشد سامانه';
      default: return 'ورزشکار رالی';
    }
  };

  const handleOpenDashboard = () => {
    onClose();
    if (onNavigateToPortal) {
      onNavigateToPortal(currentUser.role as any);
    } else {
      window.location.href = currentUser.role === 'COACH' ? '/portal?tab=coach' : currentUser.role === 'CLUB_MANAGER' ? '/portal?tab=club' : '/portal';
    }
  };

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header Info Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0B4278] to-sky-500 flex items-center justify-center text-white font-black text-lg shrink-0">
          {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white truncate">{currentUser.fullName}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D7ED68]/20 text-[#D7ED68] border border-[#D7ED68]/30 shrink-0">
              {getRoleLabel(currentUser.role)}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5" dir="ltr">{currentUser.phoneNumber}</p>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {currentUser.email && (
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block mb-1">ایمیل:</span>
            <span className="text-slate-200 font-mono truncate block" dir="ltr">{currentUser.email}</span>
          </div>
        )}
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block mb-1">ورزش تخصصی:</span>
          <span className="text-sky-400 font-bold">
            {currentUser.preferredSport === 'TENNIS' ? 'تنیس خاکی' : 'پدل'}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block mb-1">دست مسلط:</span>
          <span className="text-slate-200 font-bold">
            {currentUser.dominantHand === 'LEFT' ? 'چپ‌دست' : 'راست‌دست'}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block mb-1">وضعیت حساب:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            فعال و تاییدشده
          </span>
        </div>
      </div>

      {/* Dedicated Portal CTA */}
      <div className="pt-1">
        <button
          onClick={handleOpenDashboard}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm flex items-center justify-between transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {currentUser.role === 'COACH' ? (
              <Award className="w-4 h-4 text-[#D7ED68]" />
            ) : currentUser.role === 'CLUB_MANAGER' ? (
              <Building2 className="w-4 h-4 text-[#D7ED68]" />
            ) : currentUser.role === 'ADMIN' ? (
              <Shield className="w-4 h-4 text-[#D7ED68]" />
            ) : (
              <UserCheck className="w-4 h-4 text-[#D7ED68]" />
            )}
            <span>
              {currentUser.role === 'COACH'
                ? 'ورود به پنل اختصاصی مربی (شاگردان و سانس‌ها)'
                : currentUser.role === 'CLUB_MANAGER'
                ? 'ورود به پنل مدیریت باشگاه (زمین‌ها و سانس‌ها)'
                : currentUser.role === 'ADMIN'
                ? 'ورود به پرتال مدیریت (دسترسی کامل باشگاه و مربی)'
                : 'مشاهده داشبورد بازیکن و سوابق رزرو'}
            </span>
          </div>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Logout Action */}
      <button
        onClick={() => {
          onLogout();
          onClose();
        }}
        className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>خروج از حساب کاربری</span>
      </button>
    </div>
  );
};

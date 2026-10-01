import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { OtpLoginForm } from './auth/OtpLoginForm';
import { UserProfileView } from './auth/UserProfileView';

export interface UserSession {
  userId: string;
  phoneNumber: string;
  role: string;
  fullName: string;
  email?: string;
  preferredSport?: 'PADEL' | 'TENNIS' | 'BOTH';
  dominantHand?: 'RIGHT' | 'LEFT';
  token: string;
}

interface AuthModalProps {
  isOpen: boolean;
  currentUser: UserSession | null;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
  onNavigateToPortal?: (view?: 'PLAYER' | 'COACH' | 'CLUB_MANAGER' | 'ADMIN') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLoginSuccess,
  onLogout,
  onNavigateToPortal
}) => {
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER' | 'OTP'>('LOGIN');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSuccess = (session: UserSession) => {
    setErrorMsg(null);
    onLoginSuccess(session);
    onClose();
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="بستن پنجره"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Bar */}
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-[#D7ED68]/15 border border-[#D7ED68]/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#D7ED68]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {currentUser
                ? 'پروفایل و مدیریت حساب'
                : authView === 'REGISTER'
                ? 'ثبت‌نام عضو جدید در رالی'
                : authView === 'OTP'
                ? 'ورود با پیامک (فراموشی رمز)'
                : 'ورود به سامانه رالی'}
            </h2>
            <p className="text-xs text-slate-400">
              {currentUser
                ? 'اطلاعات کاربری و دسترسی به پنل‌های اختصاصی'
                : 'مرجع رزرواسیون کورت‌ها و مسابقات راکتی'}
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-4 bg-red-950/40 border border-red-800/80 text-red-300 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Content Body */}
        {currentUser ? (
          <UserProfileView
            currentUser={currentUser}
            onLogout={onLogout}
            onClose={onClose}
            onNavigateToPortal={onNavigateToPortal}
          />
        ) : authView === 'REGISTER' ? (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => {
              setErrorMsg(null);
              setAuthView('LOGIN');
            }}
            onError={handleError}
          />
        ) : authView === 'OTP' ? (
          <OtpLoginForm
            onSuccess={handleSuccess}
            onSwitchToPasswordLogin={() => {
              setErrorMsg(null);
              setAuthView('LOGIN');
            }}
            onError={handleError}
          />
        ) : (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => {
              setErrorMsg(null);
              setAuthView('REGISTER');
            }}
            onSwitchToOtp={() => {
              setErrorMsg(null);
              setAuthView('OTP');
            }}
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
};

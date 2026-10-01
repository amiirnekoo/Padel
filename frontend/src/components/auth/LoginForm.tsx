import React, { useState } from 'react';
import { User, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { UserSession } from '../AuthModal';

interface LoginFormProps {
  onSuccess: (session: UserSession) => void;
  onSwitchToRegister: () => void;
  onSwitchToOtp: () => void;
  onError: (msg: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onSwitchToOtp,
  onError
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      onError('لطفاً شماره همراه/ایمیل و کلمه عبور را وارد نمایید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        const session: UserSession = {
          userId: data.user_id,
          phoneNumber: data.phone_number,
          email: data.email,
          role: data.role || 'PLAYER',
          fullName: data.full_name || 'ورزشکار گرامی',
          preferredSport: data.preferred_sport,
          dominantHand: data.dominant_hand,
          token: data.access_token
        };
        localStorage.setItem('padel_auth', JSON.stringify(session));
        onSuccess(session);
      } else {
        onError(data.detail || 'شماره همراه/ایمیل یا کلمه عبور نادرست است.');
      }
    } catch {
      // Local fallback for offline/demo
      const demoSession: UserSession = {
        userId: 'usr-demo',
        phoneNumber: username.startsWith('09') ? username : '۰۹۱۲۳۴۵۶۷۸۹',
        email: username.includes('@') ? username : undefined,
        role: 'PLAYER',
        fullName: 'ورزشکار گرامی',
        token: 'local-jwt-demo'
      };
      localStorage.setItem('padel_auth', JSON.stringify(demoSession));
      onSuccess(demoSession);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">
          شماره همراه یا آدرس ایمیل
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹ یا name@email.com"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#D7ED68] focus:outline-none text-left"
            dir="ltr"
          />
          <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-300">کلمه عبور</label>
          <button
            type="button"
            onClick={onSwitchToOtp}
            className="text-xs text-[#D7ED68] hover:underline cursor-pointer"
          >
            فراموشی رمز / ورود با پیامک
          </button>
        </div>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="کلمه عبور حساب کاربری"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#D7ED68] focus:outline-none text-left"
            dir="ltr"
          />
          <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#172320] font-black text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'در حال ورود...' : 'ورود به پنل کاربری'}
      </button>

      <div className="pt-2 flex flex-col items-center gap-2.5 text-xs text-slate-400 border-t border-slate-800">
        <button
          type="button"
          onClick={onSwitchToOtp}
          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>ورود سریع و بدون رمز با پیامک یکبار مصرف (OTP)</span>
        </button>

        <div>
          <span>حساب کاربری ندارید؟ </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#D7ED68] font-bold hover:underline cursor-pointer"
          >
            ثبت‌نام رایگان
          </button>
        </div>
      </div>
    </form>
  );
};

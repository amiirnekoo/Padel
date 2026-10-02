import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Sparkles, Check, ArrowRight } from 'lucide-react';
import { UserSession } from '../AuthModal';

interface RegisterFormProps {
  onSuccess: (session: UserSession) => void;
  onSwitchToLogin: () => void;
  onError: (msg: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  onError
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sport, setSport] = useState<'PADEL' | 'TENNIS'>('PADEL');
  const [dominantHand, setDominantHand] = useState<'RIGHT' | 'LEFT'>('RIGHT');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || !fullName || !email) {
      onError('لطفاً تمامی فیلدهای الزامی را تکمیل نمایید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phone,
          email,
          password,
          full_name: fullName,
          preferred_sport: sport,
          dominant_hand: dominantHand
        })
      });

      const data = await res.json();
      if (res.ok) {
        const session: UserSession = {
          userId: data.user_id,
          phoneNumber: data.phone_number,
          email: data.email,
          role: data.role || 'PLAYER',
          fullName: data.full_name,
          preferredSport: data.preferred_sport,
          dominantHand: data.dominant_hand,
          token: data.access_token
        };
        localStorage.setItem('padel_auth', JSON.stringify(session));
        onSuccess(session);
      } else {
        onError(data.detail || 'خطا در ثبت‌نام کاربر');
      }
    } catch {
      onError('خطا در برقراری ارتباط با سامانه ثبت‌نام. لطفاً اتصال اینترنت خود را بررسی و مجدداً تلاش فرمایید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">نام و نام خانوادگی</label>
        <div className="relative">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثال: کیان راد"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#D7ED68] focus:outline-none"
          />
          <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">شماره همراه</label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#D7ED68] focus:outline-none text-left"
              dir="ltr"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">آدرس ایمیل</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#D7ED68] focus:outline-none text-left"
              dir="ltr"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">کلمه عبور</label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="حداقل ۶ کاراکتر"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#D7ED68] focus:outline-none text-left"
            dir="ltr"
          />
          <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
      </div>

      {/* Sport Preference and Dominant Hand */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">ورزش تخصصی</label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSport('PADEL')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                sport === 'PADEL'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              پدل
            </button>
            <button
              type="button"
              onClick={() => setSport('TENNIS')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                sport === 'TENNIS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تنیس
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">دست مسلط</label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setDominantHand('RIGHT')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                dominantHand === 'RIGHT'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              راست‌دست
            </button>
            <button
              type="button"
              onClick={() => setDominantHand('LEFT')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                dominantHand === 'LEFT'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              چپ‌دست
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 rounded-xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#172320] font-black text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'در حال ثبت‌نام...' : 'تکمیل ثبت‌نام و ورود به رالی'}
      </button>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs text-slate-400 hover:text-[#D7ED68] transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span>قبلاً ثبت‌نام کرده‌اید؟ ورود به حساب</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </form>
  );
};

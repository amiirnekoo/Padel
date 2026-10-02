import React, { useState } from 'react';
import { Phone, KeyRound, ArrowRight } from 'lucide-react';
import { UserSession } from '../AuthModal';

interface OtpLoginFormProps {
  onSuccess: (session: UserSession) => void;
  onSwitchToPasswordLogin: () => void;
  onError: (msg: string) => void;
}

export const OtpLoginForm: React.FC<OtpLoginFormProps> = ({
  onSuccess,
  onSwitchToPasswordLogin,
  onError
}) => {
  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      onError('لطفاً شماره تلفن همراه معتبر (۱۱ رقمی) را وارد نمایید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setCode('');
        setStep('CODE');
      } else {
        onError(data.detail || 'خطا در ارسال پیامک. لطفاً مجدداً بررسی فرمایید.');
      }
    } catch {
      onError('خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی نمایید.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length < 4) {
      onError('لطفاً کد تأیید دریافتی را به طور کامل وارد نمایید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone.trim(), code: code.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        const session: UserSession = {
          userId: data.user_id,
          phoneNumber: data.phone_number || phone,
          role: data.role || 'PLAYER',
          fullName: data.full_name || 'ورزشکار',
          preferredSport: data.preferred_sport,
          dominantHand: data.dominant_hand,
          token: data.access_token
        };
        localStorage.setItem('padel_auth', JSON.stringify(session));
        onSuccess(session);
      } else {
        onError(data.detail || 'کد وارد شده معتبر نیست یا منقضی شده است.');
      }
    } catch {
      onError('خطا در اعتبارسنجی کد پیامکی. لطفاً اتصال اینترنت خود را بررسی نمایید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl">
      {step === 'PHONE' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              شماره همراه برای دریافت کد پیامکی
            </label>
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
            <p className="text-[11px] text-slate-400 mt-1">
              اگر رمز عبور خود را فراموش کرده‌اید، یک کد تأیید ۵ رقمی به این شماره ارسال خواهد شد.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#172320] font-black text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'در حال ارسال پیامک...' : 'ارسال کد ورود یکبار مصرف'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                کد ۵ رقمی ارسالی به {phone}
              </label>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                ویرایش شماره
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                className="w-full bg-slate-900 border border-emerald-500 rounded-xl py-3 px-3.5 text-center text-xl font-mono font-bold tracking-widest text-emerald-400 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'در حال اعتبارسنجی...' : 'تأیید و ورود فوری'}
          </button>
        </form>
      )}

      <div className="mt-4 pt-3 text-center border-t border-slate-800">
        <button
          type="button"
          onClick={onSwitchToPasswordLogin}
          className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowRight className="w-3 h-3" />
          <span>بازگشت به ورود با نام کاربری و کلمه عبور</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, Phone, KeyRound, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export interface UserSession {
  userId: string;
  phoneNumber: string;
  role: string;
  fullName: string;
  token: string;
}

interface AuthModalProps {
  isOpen: boolean;
  currentUser: UserSession | null;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLoginSuccess,
  onLogout,
}) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState<string>('09121111111');
  const [code, setCode] = useState<string>('12345');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone })
      });
      const data = await res.json();
      if (res.ok) {
        setDevCode(data.dev_code || '12345');
        setCode(data.dev_code || '12345');
        setStep('OTP');
      } else {
        setErrorMsg(data.detail || 'خطا در ارسال پیامک');
      }
    } catch {
      // Local fallback
      setDevCode('12345');
      setCode('12345');
      setStep('OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, code })
      });
      const data = await res.json();
      if (res.ok) {
        const session: UserSession = {
          userId: data.user_id,
          phoneNumber: data.phone_number || phone,
          role: data.role || 'PLAYER',
          fullName: data.full_name || 'ورزشکار',
          token: data.access_token
        };
        localStorage.setItem('padel_auth', JSON.stringify(session));
        onLoginSuccess(session);
        onClose();
      } else {
        setErrorMsg(data.detail || 'کد وارد شده معتبر نیست');
      }
    } catch {
      // Demo session
      const demoSession: UserSession = {
        userId: 'user-demo',
        phoneNumber: phone,
        role: 'PLAYER',
        fullName: 'ورزشکار گرامی',
        token: 'mock-jwt-token'
      };
      localStorage.setItem('padel_auth', JSON.stringify(demoSession));
      onLoginSuccess(demoSession);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 8, 15, 0.85)',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '28px',
          background: '#0f172a',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {currentUser ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={30} color="#34d399" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              حساب کاربری فعال
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>{currentUser.fullName}</p>
            <p style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px' }}>
              {currentUser.phoneNumber} ({currentUser.role})
            </p>
            <button
              onClick={() => { onLogout(); onClose(); }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={18} />
              خروج از حساب
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={24} color="#10b981" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                ورود یا ثبت‌نام با شماره همراه (OTP)
              </h2>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'PHONE' ? (
              <form onSubmit={handleRequestOtp}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
                    شماره همراه معتبر (جهت دریافت پیامک رزرو و ورود)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '10px',
                        background: '#1e293b',
                        border: '1px solid var(--border-subtle)',
                        color: '#f8fafc',
                        fontSize: '1rem',
                        direction: 'ltr',
                        textAlign: 'left'
                      }}
                    />
                    <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'در حال ارسال پیامک...' : 'دریافت کد تایید یکبار مصرف'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>کد ۵ رقمی ارسالی به {phone}:</span>
                    <button type="button" onClick={() => setStep('PHONE')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.8rem' }}>ویرایش شماره</button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      maxLength={6}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '10px',
                        background: '#1e293b',
                        border: '1px solid #10b981',
                        color: '#34d399',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        letterSpacing: '6px',
                        textAlign: 'center'
                      }}
                    />
                    <KeyRound size={18} color="#10b981" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  {devCode && (
                    <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '6px' }}>کد تستی سامانه: {devCode}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'در حال بررسی...' : 'تایید و ورود به سامانه'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

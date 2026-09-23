import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertCircle, ExternalLink, Wallet } from 'lucide-react';
import { Booking } from '../types';

interface HoldTimerProps {
  booking: Booking;
  walletBalance?: number;
  onProceedToPayment: () => void;
  onPayWithWallet?: () => void;
  onCancelHold: () => void;
  isLoading?: boolean;
}

export const HoldTimer: React.FC<HoldTimerProps> = ({
  booking,
  walletBalance = 0,
  onProceedToPayment,
  onPayWithWallet,
  onCancelHold,
  isLoading = false,
}) => {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600); // 10 minutes default

  useEffect(() => {
    const calculateRemaining = () => {
      const expiry = new Date(booking.hold_expires_at).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      return diff;
    };

    setTimeLeftSeconds(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeftSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.hold_expires_at]);

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isExpired = timeLeftSeconds <= 0;
  const isUrgent = timeLeftSeconds < 120; // < 2 minutes

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        border: isUrgent ? '1px solid #ef4444' : '1px solid rgba(245, 158, 11, 0.4)',
        background: 'rgba(15, 23, 42, 0.95)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>کد پیگیری موقت:</span>
          <span style={{ fontWeight: 800, color: '#38bdf8', marginRight: '6px' }}>{booking.tracking_code}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            padding: '6px 14px',
            borderRadius: '9999px',
            color: isUrgent ? '#f87171' : '#fbbf24',
            fontWeight: 800,
            fontSize: '1.1rem',
          }}
        >
          <Clock size={18} />
          <span>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {isExpired ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '8px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertCircle size={20} />
          <span>مهلت ۱۰ دقیقه‌ای پرداخت به پایان رسید. سانس مجدداً آزاد شد.</span>
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '8px' }}>
            <span>مبلغ قابل پرداخت (با برابری کامل قیمت باشگاه):</span>
            <span style={{ fontWeight: 700, color: '#34d399', fontSize: '1.1rem' }}>{formatPrice(booking.amount)}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
            سانس به مدت ۱۰ دقیقه به نام شما قفل اتمیک شد. در صورت عدم پرداخت تا پایان شمارش معکوس، سانس بدون کسر هزینه آزاد می‌شود.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
        {onPayWithWallet && (
          <button
            disabled={isExpired || isLoading || walletBalance < booking.amount}
            onClick={onPayWithWallet}
            title={walletBalance < booking.amount ? 'موجودی کیف پول برای پرداخت این سانس کافی نیست' : 'پرداخت آنی و بدون نیاز به ورود به شاپرک'}
            style={{
              flex: '1 1 200px',
              padding: '12px',
              borderRadius: '10px',
              background: (isExpired || walletBalance < booking.amount)
                ? 'rgba(255, 255, 255, 0.05)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: (isExpired || walletBalance < booking.amount) ? '#64748b' : '#ffffff',
              border: (isExpired || walletBalance < booking.amount) ? '1px solid var(--border-subtle)' : 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: (isExpired || walletBalance < booking.amount) ? 'not-allowed' : 'pointer',
              boxShadow: (isExpired || walletBalance < booking.amount) ? 'none' : '0 4px 14px rgba(5, 150, 105, 0.4)'
            }}
          >
            <Wallet size={18} />
            <span>پرداخت آنی با کیف پول</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>({Math.floor(walletBalance / 10).toLocaleString('fa-IR')} ت)</span>
          </button>
        )}

        <button
          disabled={isExpired || isLoading}
          onClick={onProceedToPayment}
          style={{
            flex: '1 1 200px',
            padding: '12px',
            borderRadius: '10px',
            background: isExpired ? '#475569' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isExpired ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)',
            cursor: isExpired ? 'not-allowed' : 'pointer',
          }}
        >
          <ShieldCheck size={18} />
          {isLoading ? 'در حال اتصال...' : 'درگاه امن شاپرک'}
          <ExternalLink size={16} />
        </button>

        <button
          disabled={isLoading}
          onClick={onCancelHold}
          style={{
            flex: '0 1 100px',
            padding: '12px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#94a3b8',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          انصراف
        </button>
      </div>
    </div>
  );
};

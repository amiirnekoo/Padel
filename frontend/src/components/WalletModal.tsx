import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, PlusCircle, CheckCircle2, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { WalletData, WalletTransactionData } from '../types';

interface WalletModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ userId, isOpen, onClose, onBalanceUpdated }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionData[]>([]);
  const [topupAmountToman, setTopupAmountToman] = useState<number>(500000);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      const [wRes, txRes] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/wallet/balance?user_id=${userId}`),
        fetch(`http://localhost:8000/api/v1/wallet/transactions?user_id=${userId}`)
      ]);
      if (wRes.ok) {
        const wData = await wRes.json();
        setWallet(wData);
        if (onBalanceUpdated) onBalanceUpdated(wData.balance);
      }
      if (txRes.ok) setTransactions(await txRes.json());
    } catch {
      // Fallback demo state
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleTopup = async (amountToman: number) => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          amount: amountToman * 10,
          reference_id: `DEMO_TOPUP_${Date.now()}`
        })
      });
      if (res.ok) {
        setSuccessMsg(`کیف پول با موفقیت به میزان ${amountToman.toLocaleString('fa-IR')} تومان شارژ شد.`);
        fetchWallet();
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} dir="rtl">
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WalletIcon color="#10b981" size={24} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>کیف پول هوشمند بازیکن</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Balance Card */}
        <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', border: '1px solid #059669', borderRadius: '12px', padding: '18px', marginBottom: '18px', color: '#fff' }}>
          <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>موجودی قابل استفاده برای رزرو ۱ کلیکی:</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '6px' }}>
            {(wallet?.balance_toman || 0).toLocaleString('fa-IR')} <span style={{ fontSize: '1rem', fontWeight: 500 }}>تومان</span>
          </div>
        </div>

        {successMsg && (
          <div style={{ background: '#064e3b', border: '1px solid #059669', color: '#a7f3d0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Quick Topup Buttons */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>افزایش اعتبار سریع:</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[300000, 500000, 1000000].map(amt => (
              <button
                key={amt}
                disabled={loading}
                onClick={() => handleTopup(amt)}
                style={{ padding: '10px 6px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                +{(amt / 1000).toLocaleString('fa-IR')} هزار تومان
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>گردش حساب و تراکنش‌های اخیر:</span>
          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', padding: '16px' }}>تراکنشی ثبت نشده است.</div>
            ) : (
              transactions.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020617', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t.transaction_type === 'CREDIT' ? <ArrowDownLeft color="#10b981" size={18} /> : <ArrowUpRight color="#ef4444" size={18} />}
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600 }}>{t.description || t.category}</div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{t.reference_id || 'سیستمی'}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: t.transaction_type === 'CREDIT' ? '#34d399' : '#f87171' }}>
                    {t.transaction_type === 'CREDIT' ? '+' : '-'}{t.amount_toman.toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

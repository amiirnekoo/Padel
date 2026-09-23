import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, Download, RefreshCw, AlertCircle, Building2 } from 'lucide-react';
import { SettlementBatchData } from '../types';

export const ClubSettlementsPage: React.FC = () => {
  const [batches, setBatches] = useState<SettlementBatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [clubId, setClubId] = useState('club-1');
  const [msg, setMsg] = useState<string | null>(null);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/settlements/club/${clubId}`);
      if (res.ok) setBatches(await res.json());
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [clubId]);

  const handleGenerateBatch = async () => {
    setGenerating(true);
    setMsg(null);
    try {
      const res = await fetch('/api/v1/settlements/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ club_id: clubId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'خطا در ایجاد تسویه');
      setMsg(`دسته تسویه جدید با کد ${data.batch_number} با موفقیت ایجاد شد.`);
      fetchSettlements();
    } catch (err: any) {
      setMsg(err.message || 'خطا در ایجاد دسته تسویه');
    } finally {
      setGenerating(false);
    }
  };

  const totalPayout = batches.reduce((sum, b) => sum + b.club_payout_toman, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }} dir="rtl">
      {/* Top Banner */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard color="#10b981" size={26} />
              میز مالی و تسویه حساب دوره‌ای باشگاه‌ها (پایا / شبا)
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
              محاسبه سهم ۹۷٪ خالص مجموعه و ۳٪ کارمزد پلتفرم با صدور خودکار حواله‌های پایا و ساتنا.
            </p>
          </div>
          <button
            disabled={generating}
            onClick={handleGenerateBatch}
            style={{ padding: '10px 18px', background: '#0284c7', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: generating ? 'not-allowed' : 'pointer' }}
          >
            <RefreshCw size={16} /> {generating ? 'در حال تجمیع...' : 'ایجاد دسته تسویه جدید'}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ background: '#064e3b', border: '1px solid #059669', color: '#a7f3d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem' }}>
          {msg}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>مجموع واریزی‌های پایا به حساب باشگاه</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', marginTop: '6px' }}>
            {totalPayout.toLocaleString('fa-IR')} تومان
          </div>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>نرخ کارمزد خدمات زیرساختی پلتفرم</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', marginTop: '6px' }}>
            ۳.۰۰ ٪ <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>(بدون هزینه مازاد بازیکن)</span>
          </div>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>تعداد دوره‌های تسویه‌شده</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', marginTop: '6px' }}>
            {batches.length.toLocaleString('fa-IR')} دوره
          </div>
        </div>
      </div>

      {/* High-Performance Fixed Table */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-fixed" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'right', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '12px 14px' }}>کد دوره تسویه</th>
                <th style={{ padding: '12px 14px' }}>مبلغ خالص واریزی (۹۷٪)</th>
                <th style={{ padding: '12px 14px' }}>وضعیت حواله</th>
                <th style={{ padding: '12px 14px' }}>شماره شبا مقصد</th>
                <th style={{ padding: '12px 14px' }}>تاریخ و زمان ثبت</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>در حال بارگذاری صورت‌حساب‌ها...</td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>هنوز دوره‌ای ایجاد نشده است. با دکمه بالا یک تسویه ایجاد کنید.</td>
                </tr>
              ) : (
                batches.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{b.batch_number}</div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.items_count} سانس رزرو</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#34d399', fontWeight: 800 }}>
                      {b.club_payout_toman.toLocaleString('fa-IR')} تومان
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {b.status === 'PAID' ? (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#064e3b', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> واریز شد (پایا)
                        </span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#78350f', color: '#fde68a', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> در صف انتقال پایا
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#cbd5e1', direction: 'ltr', textAlign: 'right', fontSize: '0.8rem' }}>
                      {b.iban || 'ثبت نشده'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {b.created_at ? new Date(b.created_at).toLocaleDateString('fa-IR') : 'امروز'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

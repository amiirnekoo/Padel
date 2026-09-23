import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle2, AlertTriangle, Search, Radio, Filter, RefreshCw } from 'lucide-react';
import { NotificationLogData } from '../types';

export const NotificationLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [eventType, setEventType] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (recipient) params.append('recipient', recipient);
      if (eventType) params.append('event_type', eventType);

      const res = await fetch(`http://localhost:8000/api/v1/notifications/logs?${params.toString()}`);
      if (res.ok) setLogs(await res.json());
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION_PLAYER':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#064e3b', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>تایید رزرو بازیکن</span>;
      case 'BOOKING_ALERT_OPERATOR':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#7c2d12', color: '#fdba74', fontSize: '0.75rem', fontWeight: 700 }}>هشدار باجه متصدی</span>;
      case 'BOOKING_REMINDER_2H':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#1e3a8a', color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700 }}>یادآور ۲ ساعت قبل</span>;
      case 'BOOKING_CANCELLATION_REFUND':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#701a75', color: '#f0abfc', fontSize: '0.75rem', fontWeight: 700 }}>استرداد کنسلی به کیف پول</span>;
      default:
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#334155', color: '#cbd5e1', fontSize: '0.75rem' }}>{type}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }} dir="rtl">
      {/* Top Banner */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare color="#38bdf8" size={26} />
              مرکز مانیتورینگ و تله‌متری پیامک‌های خدماتی پلتفرم
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
              رصد آنی پیامک‌های پترن خدماتی ارسال‌شده به بازیکنان، متصدیان کلوپ و مالکان با خطوط عبور از بلک‌لیست مخابرات.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <RefreshCw size={16} /> به‌روزرسانی زنده
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="جستجوی شماره همراه گیرنده..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.85rem' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={16} /> جستجو
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            style={{ padding: '8px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.85rem' }}
          >
            <option value="">همه رویدادها</option>
            <option value="BOOKING_CONFIRMATION_PLAYER">تایید رزرو بازیکن</option>
            <option value="BOOKING_ALERT_OPERATOR">هشدار باجه متصدی</option>
            <option value="BOOKING_REMINDER_2H">یادآور ۲ ساعت قبل</option>
            <option value="BOOKING_CANCELLATION_REFUND">استرداد وجه به کیف پول</option>
          </select>
        </div>
      </div>

      {/* High-Performance Fixed Table */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-fixed" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'right', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '12px 14px' }}>شماره گیرنده</th>
                <th style={{ padding: '12px 14px' }}>نوع رویداد</th>
                <th style={{ padding: '12px 14px' }}>وضعیت تحویل</th>
                <th style={{ padding: '12px 14px' }}>شناسه پیگیری مخابراتی</th>
                <th style={{ padding: '12px 14px' }}>زمان ارسال</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>در حال دریافت لاگ‌های پیامک...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>هنوز پیامی با فیلترهای انتخابی ثبت نشده است.</td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f8fafc', direction: 'ltr', textAlign: 'right' }}>
                      {l.recipient}
                    </td>
                    <td style={{ padding: '12px 14px' }}>{getEventBadge(l.event_type)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {l.status === 'DELIVERED' ? (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#064e3b', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> تحویل موفق
                        </span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#7f1d1d', color: '#fca5a5', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> ناموفق
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.78rem', direction: 'ltr', textAlign: 'right' }}>
                      {l.message_id || 'نامشخص'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8rem' }}>
                      {l.created_at ? new Date(l.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'لحظاتی پیش'}
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

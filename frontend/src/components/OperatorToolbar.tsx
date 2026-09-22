import React from 'react';
import { Shield, Calendar, Users, RefreshCw, AlertTriangle } from 'lucide-react';

interface OperatorToolbarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  onEmergencyCancel?: () => void;
  isLoading?: boolean;
}

export const OperatorToolbar: React.FC<OperatorToolbarProps> = ({
  selectedDate,
  onDateChange,
  onRefresh,
  onEmergencyCancel,
  isLoading = false,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '10px', color: '#f87171' }}>
          <Shield size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>پنل کنترل باجه و متصدی باشگاه</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>مسدودسازی سریع برای رزروهای تلفنی و حضوری با همگام‌سازی لحظه‌ای</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: '8px' }}>
          <Calendar size={16} color="#38bdf8" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          />
        </div>

        <button
          disabled={isLoading}
          onClick={onRefresh}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem'
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>

        {onEmergencyCancel && (
          <button
            onClick={onEmergencyCancel}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <AlertTriangle size={14} />
            لغو اضطراری شرایط جوی (استرداد ۱۰۰٪)
          </button>
        )}
      </div>
    </div>
  );
};

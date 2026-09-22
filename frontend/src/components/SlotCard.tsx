import React from 'react';
import { TimeSlot } from '../types';
import { Clock, Tag, Lock, Unlock, Trophy } from 'lucide-react';

interface SlotCardProps {
  slot: TimeSlot;
  isOperator?: boolean;
  onSelectSlot?: (slot: TimeSlot) => void;
  onToggleBlock?: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  isOperator = false,
  onSelectSlot,
  onToggleBlock,
  isLoading = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const getStatusBadge = () => {
    switch (slot.status) {
      case 'AVAILABLE':
        return <span className="badge badge-available">● آزاد برای رزرو</span>;
      case 'HOLD':
        return <span className="badge badge-hold">⏳ در حال رزرو</span>;
      case 'BOOKED':
        return <span className="badge badge-booked">🔒 رزرو شده</span>;
      case 'BLOCKED':
        return <span className="badge badge-blocked">🚫 باجه / مسدود</span>;
      case 'TOURNAMENT_HOLD':
        return (
          <span className="badge badge-tournament">
            <Trophy size={12} /> مسابقات دوره‌ای
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`slot-card ${slot.status.toLowerCase().replace('_', '-')}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
          <Clock size={16} color="#94a3b8" />
          <span>{slot.start_time} - {slot.end_time}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600 }}>
          <Tag size={14} />
          <span>{formatPrice(slot.price)}</span>
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        {isOperator ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            {slot.status === 'AVAILABLE' && (
              <button
                disabled={isLoading}
                onClick={() => onToggleBlock?.(slot)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Lock size={14} />
                مسدودسازی دستی
              </button>
            )}
            {slot.status === 'BLOCKED' && (
              <button
                disabled={isLoading}
                onClick={() => onToggleBlock?.(slot)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: '#10b981',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Unlock size={14} />
                آزادسازی سانس
              </button>
            )}
            {slot.status === 'BOOKED' && (
              <div style={{ textAlign: 'center', width: '100%', fontSize: '0.8rem', color: '#94a3b8', padding: '6px' }}>
                پرداخت آنلاین شده
              </div>
            )}
            {slot.status === 'TOURNAMENT_HOLD' && (
              <div style={{ textAlign: 'center', width: '100%', fontSize: '0.8rem', color: '#c084fc', padding: '6px' }}>
                اختصاص به تورنمنت
              </div>
            )}
          </div>
        ) : (
          <div>
            {slot.status === 'AVAILABLE' && (
              <button
                disabled={isLoading}
                onClick={() => onSelectSlot?.(slot)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                }}
              >
                رزرو آنلاین (۱۰ دقیقه قفل)
              </button>
            )}
            {slot.status === 'HOLD' && (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'not-allowed'
                }}
              >
                کاربر دیگری در حال پرداخت است
              </button>
            )}
            {slot.status === 'BOOKED' && (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  cursor: 'not-allowed'
                }}
              >
                تکمیل ظرفیت
              </button>
            )}
            {slot.status === 'BLOCKED' && (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  cursor: 'not-allowed'
                }}
              >
                رزرو تلفنی / حضوری
              </button>
            )}
            {slot.status === 'TOURNAMENT_HOLD' && (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#c084fc',
                  fontSize: '0.85rem',
                  cursor: 'not-allowed'
                }}
              >
                رزرو ویژه مسابقات
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

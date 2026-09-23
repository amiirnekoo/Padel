import React from 'react';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';
import { VenueData } from '../types';

interface MyVenuesListProps {
  venues: VenueData[];
}

export const MyVenuesList: React.FC<MyVenuesListProps> = ({ venues }) => {
  if (venues.length === 0) {
    return (
      <div style={{ background: '#0f172a', padding: '32px', textAlign: 'center', borderRadius: '12px', color: '#64748b' }}>
        هنوز مجموعه‌ای ثبت نکرده‌اید. از دکمه «ثبت مجموعه جدید» اقدام کنید.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {venues.map(v => (
        <div key={v.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>{v.name}</h3>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {v.city}، {v.province}</span>
              <span>ورزش‌ها: {v.sports_supported}</span>
              <span>تعرفه: {(v.default_hourly_rate / 10).toLocaleString('fa-IR')} تومان/ساعت</span>
            </div>
          </div>
          <div>
            {v.approval_status === 'APPROVED' ? (
              <span style={{ padding: '6px 12px', borderRadius: '6px', background: '#064e3b', color: '#34d399', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> تایید شده و فعال
              </span>
            ) : (
              <span style={{ padding: '6px 12px', borderRadius: '6px', background: '#78350f', color: '#fde68a', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> در حال بررسی توسط پشتیبانی
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

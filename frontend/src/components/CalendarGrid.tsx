import React from 'react';
import { CourtCalendar, TimeSlot } from '../types';
import { SlotCard } from './SlotCard';
import { Trophy, Compass } from 'lucide-react';

interface CalendarGridProps {
  courts: CourtCalendar[];
  isOperator?: boolean;
  onSelectSlot?: (slot: TimeSlot) => void;
  onToggleBlock?: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  courts,
  isOperator = false,
  onSelectSlot,
  onToggleBlock,
  isLoading = false,
}) => {
  if (courts.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <Compass size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3>سانسی برای تاریخ انتخابی یافت نشد</h3>
        <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>لطفاً تاریخ دیگری را انتخاب فرمایید.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`, gap: '24px' }}>
      {courts.map((court) => (
        <div key={court.court_id} className="glass-panel" style={{ padding: '20px' }}>
          {/* Court Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>{court.court_name}</h3>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontWeight: 700
                  }}
                >
                  🎾 پدل استاندارد
                </span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                  {court.is_indoor ? 'سرپوشیده' : 'فضای باز'}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{court.slots.length} سانس</span>
            </div>
          </div>

          {/* Slots list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {court.slots.map((slot) => (
              <SlotCard
                key={slot.slot_id}
                slot={slot}
                isOperator={isOperator}
                onSelectSlot={onSelectSlot}
                onToggleBlock={onToggleBlock}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

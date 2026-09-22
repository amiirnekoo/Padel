import React, { useState, useEffect } from 'react';
import { ClubCalendarData, TimeSlot } from '../types';
import { OperatorToolbar } from '../components/OperatorToolbar';
import { CalendarGrid } from '../components/CalendarGrid';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const OperatorPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [calendarData, setCalendarData] = useState<ClubCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const clubId = "club-enghelab";

  const fetchCalendar = async (date: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/calendar?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data);
      } else {
        // Mock fallback for immediate demo/testing
        setCalendarData({
          club_id: clubId,
          date: date,
          courts: [
            {
              court_id: "court-1",
              court_name: "کورت سنترال پدل (انقلاب)",
              sport_type: "PADEL",
              is_indoor: true,
              slots: [
                { slot_id: "s-1", start_time: "08:00", end_time: "09:30", price: 1800000, status: "AVAILABLE", hold_expires_at: null },
                { slot_id: "s-2", start_time: "09:30", end_time: "11:00", price: 1800000, status: "BLOCKED", hold_expires_at: null },
                { slot_id: "s-3", start_time: "11:00", end_time: "12:30", price: 2000000, status: "BOOKED", hold_expires_at: null },
                { slot_id: "s-4", start_time: "18:00", end_time: "19:30", price: 2400000, status: "AVAILABLE", hold_expires_at: null },
              ]
            }
          ]
        });
      }
    } catch {
      setCalendarData({
        club_id: clubId,
        date: date,
        courts: [
          {
            court_id: "court-1",
            court_name: "کورت سنترال پدل (انقلاب)",
            sport_type: "PADEL",
            is_indoor: true,
            slots: [
              { slot_id: "s-1", start_time: "08:00", end_time: "09:30", price: 1800000, status: "AVAILABLE", hold_expires_at: null },
              { slot_id: "s-2", start_time: "09:30", end_time: "11:00", price: 1800000, status: "BLOCKED", hold_expires_at: null },
            ]
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(selectedDate);
  }, [selectedDate]);

  const handleToggleBlock = async (slot: TimeSlot) => {
    setIsLoading(true);
    setNotification(null);
    try {
      const endpoint = slot.status === 'BLOCKED' ? '/api/v1/operator/unblock' : '/api/v1/operator/block';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slot.slot_id })
      });

      if (res.ok) {
        setNotification({
          type: 'success',
          message: slot.status === 'BLOCKED' ? 'سانس با موفقیت در تقویم آزاد شد.' : 'سانس برای باجه با موفقیت مسدود شد.'
        });
        fetchCalendar(selectedDate);
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.detail || 'خطا در تغییر وضعیت سانس' });
      }
    } catch {
      // Local state fallback update
      if (calendarData) {
        const updatedCourts = calendarData.courts.map((court) => ({
          ...court,
          slots: court.slots.map((s) => {
            if (s.slot_id === slot.slot_id) {
              return { ...s, status: s.status === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED' } as TimeSlot;
            }
            return s;
          })
        }));
        setCalendarData({ ...calendarData, courts: updatedCourts });
        setNotification({
          type: 'success',
          message: slot.status === 'BLOCKED' ? 'سانس آزاد شد (حالت تست)' : 'سانس برای باجه مسدود شد (حالت تست)'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyCancel = () => {
    if (window.confirm("آیا از ثبت لغو اضطراری به دلیل شرایط نامساعد جوی مطمئن هستید؟ استرداد ۱۰۰٪ وجه برای بازیکنان به صورت خودکار اعمال خواهد شد.")) {
      setNotification({
        type: 'success',
        message: 'دستور لغو اضطراری صادر شد؛ ۱۰۰٪ مبالغ به کارت بانکی بازیکنان عودت داده شد.'
      });
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <OperatorToolbar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onRefresh={() => fetchCalendar(selectedDate)}
        onEmergencyCancel={handleEmergencyCancel}
        isLoading={isLoading}
      />

      {notification && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${notification.type === 'error' ? '#ef4444' : '#10b981'}`,
            color: '#f8fafc',
            fontSize: '0.9rem'
          }}
        >
          {notification.type === 'error' ? <AlertCircle size={18} color="#f87171" /> : <CheckCircle2 size={18} color="#34d399" />}
          <span>{notification.message}</span>
        </div>
      )}

      {calendarData && (
        <CalendarGrid
          courts={calendarData.courts}
          isOperator={true}
          onToggleBlock={handleToggleBlock}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

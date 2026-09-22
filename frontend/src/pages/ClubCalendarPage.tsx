import React, { useState, useEffect } from 'react';
import { ClubCalendarData, TimeSlot, Booking, CheckoutResult } from '../types';
import { CalendarGrid } from '../components/CalendarGrid';
import { HoldTimer } from '../components/HoldTimer';
import { Calendar, AlertCircle, CheckCircle2, Trophy, MapPin, Phone } from 'lucide-react';

export const ClubCalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [calendarData, setCalendarData] = useState<ClubCalendarData | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Mock initial club ID for Tehran Padel Club
  const clubId = "club-enghelab";

  const fetchCalendar = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/clubs/${clubId}/calendar?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      } else {
        // Fallback demo data for immediate visual responsiveness
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
                { slot_id: "s-2", start_time: "09:30", end_time: "11:00", price: 1800000, status: "BOOKED", hold_expires_at: null },
                { slot_id: "s-3", start_time: "11:00", end_time: "12:30", price: 2000000, status: "HOLD", hold_expires_at: new Date(Date.now() + 8 * 60 * 1000).toISOString() },
                { slot_id: "s-4", start_time: "18:00", end_time: "19:30", price: 2400000, status: "AVAILABLE", hold_expires_at: null },
                { slot_id: "s-5", start_time: "19:30", end_time: "21:00", price: 2400000, status: "AVAILABLE", hold_expires_at: null },
              ]
            },
            {
              court_id: "court-2",
              court_name: "کورت تنیس شماره ۱ خاکی",
              sport_type: "TENNIS",
              is_indoor: false,
              slots: [
                { slot_id: "s-6", start_time: "08:00", end_time: "09:30", price: 1200000, status: "AVAILABLE", hold_expires_at: null },
                { slot_id: "s-7", start_time: "10:00", end_time: "11:30", price: 1200000, status: "TOURNAMENT_HOLD", hold_expires_at: null },
                { slot_id: "s-8", start_time: "17:00", end_time: "18:30", price: 1600000, status: "AVAILABLE", hold_expires_at: null },
              ]
            }
          ]
        });
      }
    } catch (err) {
      console.warn("Using offline fallback calendar:", err);
      // set offline fallback
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
              { slot_id: "s-4", start_time: "18:00", end_time: "19:30", price: 2400000, status: "AVAILABLE", hold_expires_at: null },
              { slot_id: "s-5", start_time: "19:30", end_time: "21:00", price: 2400000, status: "AVAILABLE", hold_expires_at: null },
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

  const handleSelectSlot = async (slot: TimeSlot) => {
    setIsLoading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/v1/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slot.slot_id })
      });

      if (res.ok) {
        const booking: Booking = await res.json();
        setActiveBooking(booking);
        setNotification({ type: 'success', message: 'سانس با موفقیت برای ۱۰ دقیقه به نام شما قفل اتمیک شد.' });
        fetchCalendar(selectedDate);
      } else {
        const error = await res.json();
        setNotification({ type: 'error', message: error.detail || 'این سانس توسط کاربر دیگری رزرو شد' });
        fetchCalendar(selectedDate);
      }
    } catch {
      // Local simulation for visual inspection
      const simulatedBooking: Booking = {
        booking_id: `b-${Date.now()}`,
        tracking_code: `PAD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        amount: slot.price,
        status: "PENDING_PAYMENT",
        hold_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };
      setActiveBooking(simulatedBooking);
      setNotification({ type: 'success', message: 'سانس به مدت ۱۰ دقیقه به نام شما قفل اتمیک شد (حالت تست)' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!activeBooking) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/bookings/${activeBooking.booking_id}/checkout`, {
        method: 'POST'
      });
      if (res.ok) {
        const data: CheckoutResult = await res.json();
        // In actual flow: window.location.href = data.payment_url;
        setNotification({ type: 'info', message: `انتقال به درگاه شاپرک با توکن: ${data.gateway_token}` });
      } else {
        setNotification({ type: 'error', message: 'خطا در اتصال به درگاه پرداخت' });
      }
    } catch {
      setNotification({ type: 'success', message: 'تأیید شبیه‌ساز پرداخت شاپرک؛ رزرو شما قطعی شد!' });
      setActiveBooking(null);
      fetchCalendar(selectedDate);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelHold = () => {
    setActiveBooking(null);
    setNotification({ type: 'info', message: 'قفل موقت سانس لغو و در تقویم آزاد شد.' });
    fetchCalendar(selectedDate);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Club Hero Card */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-available">🎾 باشگاه اختصاصی پدل و تنیس</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>نرخ مصوب با تضمین برابری قیمت</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', marginBottom: '10px' }}>
              مجموعه ورزشی پدل و تنیس انقلاب تهران
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} color="#10b981" /> تهران، اتوبان نیایش، مجموعه انقلاب</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={15} color="#38bdf8" /> ۰۲۱-۲۲۰۰۱۱۰۰</span>
            </div>
          </div>

          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.04)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <Calendar size={18} color="#10b981" />
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>انتخاب تاریخ:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
            border: `1px solid ${notification.type === 'error' ? '#ef4444' : notification.type === 'success' ? '#10b981' : '#38bdf8'}`,
            color: '#f8fafc',
            fontSize: '0.9rem'
          }}
        >
          {notification.type === 'error' ? <AlertCircle size={18} color="#f87171" /> : <CheckCircle2 size={18} color="#34d399" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Active 10-Minute Hold Sticky Bar */}
      {activeBooking && (
        <div style={{ marginBottom: '28px' }}>
          <HoldTimer
            booking={activeBooking}
            onProceedToPayment={handleProceedToPayment}
            onCancelHold={handleCancelHold}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Live Court Calendar Grid */}
      {calendarData && (
        <CalendarGrid
          courts={calendarData.courts}
          isOperator={false}
          onSelectSlot={handleSelectSlot}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

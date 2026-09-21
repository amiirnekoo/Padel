import React, { useState, useEffect } from 'react';
import rallyLogo from './assets/rally-logo.jpg';
import './App.css';

export type SlotStatus = 'AVAILABLE' | 'HOLD_SINGLE' | 'HOLD_SPLIT' | 'BOOKED' | 'BLOCKED';
export type PaymentType = 'SINGLE_PAYER' | 'SPLIT_PAYMENT';

interface Slot {
  id: string;
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  price: number;
  status: SlotStatus;
  holdExpiresAt?: number;
  bookingId?: string;
  hostUser?: string;
  splitSharesPaid?: number; // 0 to 4
}

interface LogEntry {
  id: string;
  timestamp: string;
  event: string;
  status: string;
  details: string;
}

const INITIAL_SLOTS: Slot[] = [
  {
    id: 'slot-1',
    courtId: 'court-1',
    courtName: 'زمین شیشه‌ای سنتر (Center Court)',
    startTime: '۱۶:۳۰',
    endTime: '۱۸:۰۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-2',
    courtId: 'court-1',
    courtName: 'زمین شیشه‌ای سنتر (Center Court)',
    startTime: '۱۸:۰۰',
    endTime: '۱۹:۳۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-3',
    courtId: 'court-1',
    courtName: 'زمین شیشه‌ای سنتر (Center Court)',
    startTime: '۱۹:۳۰',
    endTime: '۲۱:۰۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-4',
    courtId: 'court-2',
    courtName: 'زمین فضای باز A (Outdoor A)',
    startTime: '۱۸:۰۰',
    endTime: '۱۹:۳۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-5',
    courtId: 'court-2',
    courtName: 'زمین فضای باز A (Outdoor A)',
    startTime: '۱۹:۳۰',
    endTime: '۲۱:۰۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-6',
    courtId: 'court-2',
    courtName: 'زمین فضای باز A (Outdoor A)',
    startTime: '۲۱:۰۰',
    endTime: '۲۲:۳۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
];

export const App: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>(INITIAL_SLOTS);
  const [userRole, setUserRole] = useState<'PLAYER' | 'OPERATOR'>('PLAYER');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalMode, setModalMode] = useState<'NONE' | 'SINGLE_GATEWAY' | 'SPLIT_PAYMENT' | 'CANCELLATION'>('NONE');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addLog = (event: string, status: string, details: string) => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      event,
      status,
      details,
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 29)]);
  };

  // 1. Single Payer Hold (10 min)
  const handleAcquireSingleHold = (slot: Slot) => {
    if (slot.status !== 'AVAILABLE') return;
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const bookingId = `book-${Math.random().toString(36).substring(7)}`;

    setSlots((prev) =>
      prev.map((s) =>
        s.id === slot.id
          ? { ...s, status: 'HOLD_SINGLE', holdExpiresAt: expiresAt, bookingId, hostUser: 'کاربر ۱ (میزبان)' }
          : s
      )
    );

    const updated = { ...slot, status: 'HOLD_SINGLE' as SlotStatus, holdExpiresAt: expiresAt, bookingId };
    setSelectedSlot(updated);
    setModalMode('SINGLE_GATEWAY');

    addLog(
      'قفل موقت یک‌جا (HOLD_SINGLE)',
      'موفق',
      `سانس ${slot.startTime} به مدت ۱۰ دقیقه تا درگاه قفل شد. شناسه رزرو: ${bookingId}`
    );
  };

  // 2. Split Hold (15 min)
  const handleAcquireSplitHold = (slot: Slot) => {
    if (slot.status !== 'AVAILABLE') return;
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const bookingId = `split-${Math.random().toString(36).substring(7)}`;

    setSlots((prev) =>
      prev.map((s) =>
        s.id === slot.id
          ? { ...s, status: 'HOLD_SPLIT', holdExpiresAt: expiresAt, bookingId, hostUser: 'کاربر ۱ (میزبان دنگی)', splitSharesPaid: 0 }
          : s
      )
    );

    const updated = { ...slot, status: 'HOLD_SPLIT' as SlotStatus, holdExpiresAt: expiresAt, bookingId, splitSharesPaid: 0 };
    setSelectedSlot(updated);
    setModalMode('SPLIT_PAYMENT');

    addLog(
      'قفل موقت دنگی (HOLD_SPLIT)',
      'موفق',
      `قفل اتمیک دنگی پیش از پرداخت سهم اول برقرار شد (مهلت: ۱۵ دقیقه). شناسه: ${bookingId}`
    );
  };

  // 3. Complete Single Payer Payment
  const handleCompleteSinglePayment = () => {
    if (!selectedSlot) return;
    setSlots((prev) =>
      prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: 'BOOKED', holdExpiresAt: undefined } : s))
    );
    addLog(
      'تأیید درگاه بانکی (VERIFIED_SUCCESS)',
      'BOOKED',
      `پرداخت کامل ۲۰,۰۰۰,۰۰۰ ریال با موفقیت دریافت شد. سانس قطعی شد.`
    );
    setModalMode('NONE');
    setSelectedSlot(null);
  };

  // 4. Simulate Late Callback (now >= expires_at)
  const handleSimulateLateCallback = () => {
    if (!selectedSlot) return;
    setSlots((prev) =>
      prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: 'AVAILABLE', holdExpiresAt: undefined, bookingId: undefined } : s))
    );
    addLog(
      'کالبک دیرهنگام (LATE_SUCCESS_FLAGGED)',
      'استرداد ۱۰۰٪',
      `پاسخ شاپرک پس از انقضای قفل دریافت شد. تبدیل به BOOKED رد شد؛ رکورد استرداد ۱۰۰٪ به کارت مبدا صادر شد.`
    );
    alert('تراکنش پس از اتمام مهلت قفل دریافت گردید.\nسانس رزرو نشد و مبلغ ۱۰۰٪ به کارت بانکی مبدا مسترد شد.');
    setModalMode('NONE');
    setSelectedSlot(null);
  };

  // 5. Split Share Payment Progression
  const handlePayNextSplitShare = () => {
    if (!selectedSlot) return;
    const currentPaid = selectedSlot.splitSharesPaid || 0;
    const nextPaid = currentPaid + 1;

    if (nextPaid >= 4) {
      // 100% paid -> Finalize to BOOKED
      setSlots((prev) =>
        prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: 'BOOKED', splitSharesPaid: 4, holdExpiresAt: undefined } : s))
      );
      addLog(
        'تکمیل پرداخت‌های دنگی (۴/۴)',
        'BOOKED',
        `هر چهار سهم پرداخت شدند. سانس بلافاصله به BOOKED قطعی تبدیل شد.`
      );
      setSelectedSlot(null);
      setModalMode('NONE');
    } else {
      setSlots((prev) =>
        prev.map((s) => (s.id === selectedSlot.id ? { ...s, splitSharesPaid: nextPaid } : s))
      );
      setSelectedSlot((prev) => (prev ? { ...prev, splitSharesPaid: nextPaid } : null));
      addLog(
        `پرداخت سهم دنگی (${nextPaid}/۴)`,
        'HOLD_SPLIT فعال',
        `سهم ${nextPaid} به مبلغ ۵,۰۰۰,۰۰۰ ریال واریز شد. قفل ۱۵ دقیقه‌ای همچنان فعال است.`
      );
    }
  };

  // 6. Operator Block / Unblock
  const handleToggleOperatorBlock = (slot: Slot) => {
    if (slot.status === 'AVAILABLE') {
      setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: 'BLOCKED' } : s)));
      addLog('مسدودسازی متصدی (OPERATOR_BLOCK)', 'BLOCKED', `متصدی باجه سانس ${slot.startTime} را موقتاً مسدود کرد.`);
    } else if (slot.status === 'BLOCKED') {
      setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: 'AVAILABLE' } : s)));
      addLog('آزادسازی متصدی (OPERATOR_UNBLOCK)', 'AVAILABLE', `متصدی باجه سانس ${slot.startTime} را آزاد کرد.`);
    }
  };

  // Helper: Format Time remaining
  const formatCountdown = (expiresAt?: number) => {
    if (!expiresAt) return '';
    const diff = Math.max(0, Math.floor((expiresAt - currentTime) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand-section">
            <img src={rallyLogo} alt="Rally Padel Logo" className="brand-logo-img" />
            <div>
              <div className="brand-title">رالی پدل | RALLY PADEL</div>
              <div className="brand-subtitle">سامانه هوشمند رزرو اتمیک • برابری نرخ باجه • پرداخت دنگی</div>
            </div>
          </div>

          <div className="controls-section">
            <div className="selector-box">
              <span>باشگاه:</span>
              <strong>مجموعه ورزشی انقلاب (تهران)</strong>
            </div>

            <div className="role-toggle">
              <button
                className={`role-btn ${userRole === 'PLAYER' ? 'active' : ''}`}
                onClick={() => setUserRole('PLAYER')}
              >
                کاربر / بازیکن
              </button>
              <button
                className={`role-btn ${userRole === 'OPERATOR' ? 'active-operator' : ''}`}
                onClick={() => setUserRole('OPERATOR')}
              >
                متصدی باجه
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-text">
            <h1>سانس‌های امروز کورت‌های پدل تهران</h1>
            <p>
              رزرو مستقیم و قطعی در رالی — نرخ اعلامی دقیقاً معادل نرخ حضوری باجه باشگاه است (۲,۰۰۰,۰۰۰ تومان).
            </p>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">۹۰ دقیقه</div>
              <div className="stat-label">مدت زمان سانس استاندارد</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">۱۰ دقیقه</div>
              <div className="stat-label">مهلت قفل یک‌جا</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">۱۵ دقیقه</div>
              <div className="stat-label">مهلت پرداخت دنگی</div>
            </div>
          </div>
        </section>

        {/* Courts and Slots Grid */}
        <section className="courts-container">
          {['court-1', 'court-2'].map((courtId) => {
            const courtSlots = slots.filter((s) => s.courtId === courtId);
            const courtName = courtSlots[0]?.courtName || 'زمین ورزشی';

            return (
              <div key={courtId} className="court-card glass-panel">
                <div className="court-header">
                  <div className="court-title">
                    <span>🎾</span>
                    <span>{courtName}</span>
                  </div>
                  <span className="court-tag">ابعاد استاندارد FIP • شیشه سکوریت ۱۰ میل</span>
                </div>

                <div className="slots-grid">
                  {courtSlots.map((slot) => {
                    const isHolding = slot.status === 'HOLD_SINGLE' || slot.status === 'HOLD_SPLIT';
                    const countdown = formatCountdown(slot.holdExpiresAt);

                    return (
                      <div key={slot.id} className={`slot-card status-${slot.status.toLowerCase()}`}>
                        <div>
                          <div className="slot-top">
                            <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                            <span className={`badge badge-${slot.status.toLowerCase().replace('_', '-')}`}>
                              {slot.status === 'AVAILABLE' && 'آزاد'}
                              {slot.status === 'HOLD_SINGLE' && 'قفل یک‌جا'}
                              {slot.status === 'HOLD_SPLIT' && 'قفل دنگی'}
                              {slot.status === 'BOOKED' && 'رزرو قطعی'}
                              {slot.status === 'BLOCKED' && 'مسدود باجه'}
                            </span>
                          </div>

                          <div className="slot-price-row">
                            <span className="slot-price">{(slot.price / 10).toLocaleString('fa-IR')}</span>
                            <span className="slot-price-unit">تومان</span>
                          </div>
                        </div>

                        {isHolding && (
                          <div className="slot-hold-timer">
                            <span>⏱ زمان باقی‌مانده قفل:</span>
                            <strong>{countdown}</strong>
                          </div>
                        )}

                        <div className="slot-actions">
                          {userRole === 'PLAYER' && (
                            <>
                              <button
                                className="btn btn-primary"
                                disabled={slot.status !== 'AVAILABLE'}
                                onClick={() => handleAcquireSingleHold(slot)}
                              >
                                {slot.status === 'AVAILABLE' ? 'رزرو یک‌جا' : 'غیرقابل رزرو'}
                              </button>

                              <button
                                className="btn btn-split"
                                disabled={slot.status !== 'AVAILABLE'}
                                onClick={() => handleAcquireSplitHold(slot)}
                              >
                                رزرو دنگی (۴ نفره)
                              </button>
                            </>
                          )}

                          {userRole === 'OPERATOR' && (
                            <button
                              className={`btn ${slot.status === 'BLOCKED' ? 'btn-primary' : 'btn-danger'}`}
                              disabled={slot.status !== 'AVAILABLE' && slot.status !== 'BLOCKED'}
                              onClick={() => handleToggleOperatorBlock(slot)}
                            >
                              {slot.status === 'BLOCKED' ? 'آزادسازی سانس' : 'مسدودسازی سانس'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* State Machine Event Log Drawer */}
        <section className="log-panel glass-panel">
          <div className="log-header">
            <h3>رویدادهای ماشین وضعیت و پایگاه داده (بر اساس ADR 0002)</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              قفل اتمیک • Zero-Overbooking • تفکیک مرز اعتماد درگاه
            </span>
          </div>

          <div className="log-list">
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                هنوز رویدادی ثبت نشده است. یکی از گزینه‌های رزرو را امتحان کنید.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="log-entry">
                  <strong style={{ color: 'var(--padel-neon)' }}>[{log.timestamp}]</strong>{' '}
                  <strong style={{ color: '#ffffff' }}>{log.event}:</strong> {log.details}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Modal: Single Payer Gateway Simulation */}
      {modalMode === 'SINGLE_GATEWAY' && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">شبیه‌ساز درگاه شاپرک (Single Payer)</h2>
              <button className="close-btn" onClick={() => setModalMode('NONE')}>✕</button>
            </div>

            <div className="step-card">
              <p><strong>سانس رزرو:</strong> {selectedSlot.courtName} ({selectedSlot.startTime} الی {selectedSlot.endTime})</p>
              <p><strong>مبلغ کل:</strong> {(selectedSlot.price / 10).toLocaleString('fa-IR')} تومان</p>
              <p><strong>وضعیت سانس در دیتابیس:</strong> <span className="badge badge-hold-single">HOLD_SINGLE</span></p>
              <p><strong>مهلت باقی‌مانده قفل:</strong> {formatCountdown(selectedSlot.holdExpiresAt)}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleCompleteSinglePayment}>
                تأیید پرداخت موفق در مهلت مجاز (VERIFIED_SUCCESS)
              </button>

              <button className="btn btn-danger" onClick={handleSimulateLateCallback}>
                شبیه‌سازی کالبک دیرهنگام (now &gt;= expires_at)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Split Payment Flow */}
      {modalMode === 'SPLIT_PAYMENT' && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">فرآیند رزرو دنگی ۴ نفره (Split Payment)</h2>
              <button className="close-btn" onClick={() => setModalMode('NONE')}>✕</button>
            </div>

            <div className="step-card">
              <p><strong>سانس:</strong> {selectedSlot.startTime} الی {selectedSlot.endTime}</p>
              <p><strong>سهم هر بازیکن:</strong> ۵۰۰,۰۰۰ تومان (مجموع: ۲,۰۰۰,۰۰۰ تومان)</p>
              <p><strong>وضعیت سانس:</strong> <span className="badge badge-hold-split">HOLD_SPLIT</span></p>
              <p><strong>مهلت کلی ۱۵ دقیقه‌ای:</strong> {formatCountdown(selectedSlot.holdExpiresAt)}</p>
            </div>

            <div>
              <strong>پیشرفت تسویه دنگی:</strong>
              <div className="split-progress">
                {[1, 2, 3, 4].map((shareIndex) => {
                  const isPaid = (selectedSlot.splitSharesPaid || 0) >= shareIndex;
                  return (
                    <div key={shareIndex} className={`split-player-box ${isPaid ? 'paid' : 'pending'}`}>
                      <div>سهم {shareIndex}</div>
                      <strong>{isPaid ? 'پرداخت شد ✓' : 'در انتظار'}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-split" onClick={handlePayNextSplitShare}>
              پرداخت سهم بعدی ({((selectedSlot.splitSharesPaid || 0) + 1)} از ۴)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

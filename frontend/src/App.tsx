import React, { useState, useEffect } from 'react';
import rallyLogo from './assets/rally-logo.jpg';
import rallyHero from './assets/rally-hero.jpg';
import './App.css';

export type NavTab = 'HOME' | 'BOOKING' | 'SPLIT' | 'OPERATOR' | 'RULES';
export type SlotStatus = 'AVAILABLE' | 'HOLD_SINGLE' | 'HOLD_SPLIT' | 'BOOKED' | 'BLOCKED';

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
    courtName: 'کورت سنتر شیشه‌ای (Center Glass Court)',
    startTime: '۱۶:۳۰',
    endTime: '۱۸:۰۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-2',
    courtId: 'court-1',
    courtName: 'کورت سنتر شیشه‌ای (Center Glass Court)',
    startTime: '۱۸:۰۰',
    endTime: '۱۹:۳۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-3',
    courtId: 'court-1',
    courtName: 'کورت سنتر شیشه‌ای (Center Glass Court)',
    startTime: '۱۹:۳۰',
    endTime: '۲۱:۰۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-4',
    courtId: 'court-2',
    courtName: 'کورت پانورامیک A (Outdoor Panoramic)',
    startTime: '۱۸:۰۰',
    endTime: '۱۹:۳۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-5',
    courtId: 'court-2',
    courtName: 'کورت پانورامیک A (Outdoor Panoramic)',
    startTime: '۱۹:۳۰',
    endTime: '۲۱:۰۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-6',
    courtId: 'court-2',
    courtName: 'کورت پانورامیک A (Outdoor Panoramic)',
    startTime: '۲۱:۰۰',
    endTime: '۲۲:۳۰',
    price: 20000000,
    status: 'AVAILABLE',
  },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('HOME');
  const [slots, setSlots] = useState<Slot[]>(INITIAL_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalMode, setModalMode] = useState<'NONE' | 'SINGLE_GATEWAY' | 'SPLIT_PAYMENT'>('NONE');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [inviteCopied, setInviteCopied] = useState(false);

  // Live timer tick
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
    setLogs((prev) => [newEntry, ...prev.slice(0, 24)]);
  };

  // 1. Single Payer Hold (10 min)
  const handleAcquireSingleHold = (slot: Slot) => {
    if (slot.status !== 'AVAILABLE') return;
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const bookingId = `rally-${Math.random().toString(36).substring(7)}`;

    setSlots((prev) =>
      prev.map((s) =>
        s.id === slot.id
          ? { ...s, status: 'HOLD_SINGLE', holdExpiresAt: expiresAt, bookingId, hostUser: 'کاربر ۱ (رزروکننده)' }
          : s
      )
    );

    const updated = { ...slot, status: 'HOLD_SINGLE' as SlotStatus, holdExpiresAt: expiresAt, bookingId };
    setSelectedSlot(updated);
    setModalMode('SINGLE_GATEWAY');

    addLog(
      'قفل اتمیک یک‌جا (HOLD_SINGLE)',
      'فعال شد',
      `سانس ${slot.startTime} به مدت ۱۰ دقیقه تا تکمیل تراکنش بانکی قفل شد. شناسه رزرو: ${bookingId}`
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
          ? { ...s, status: 'HOLD_SPLIT', holdExpiresAt: expiresAt, bookingId, hostUser: 'میزبان دنگی', splitSharesPaid: 1 }
          : s
      )
    );

    const updated = { ...slot, status: 'HOLD_SPLIT' as SlotStatus, holdExpiresAt: expiresAt, bookingId, splitSharesPaid: 1 };
    setSelectedSlot(updated);
    setModalMode('SPLIT_PAYMENT');
    setActiveTab('SPLIT');

    addLog(
      'قفل اتمیک دنگی (HOLD_SPLIT)',
      'سهم ۱/۴ پرداخت شد',
      `قفل ۱۵ دقیقه‌ای برقرار شد. سهم میزبان (۵۰۰,۰۰۰ تومان) ثبت شد. لینک دعوت برای ۳ هم‌بازی صادر گردید.`
    );
  };

  // 3. Complete Single Payer Payment
  const handleCompleteSinglePayment = () => {
    if (!selectedSlot) return;
    setSlots((prev) =>
      prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: 'BOOKED', holdExpiresAt: undefined } : s))
    );
    addLog(
      'تأیید تراکنش شاپرک (VERIFIED_SUCCESS)',
      'BOOKED',
      `پرداخت کامل ۲,۰۰۰,۰۰۰ تومان تأیید شد. سانس قطعی شد و پیامک برای رزروکننده ارسال گردید.`
    );
    setModalMode('NONE');
    setSelectedSlot(null);
  };

  // 4. Simulate Late Callback
  const handleSimulateLateCallback = () => {
    if (!selectedSlot) return;
    setSlots((prev) =>
      prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: 'AVAILABLE', holdExpiresAt: undefined, bookingId: undefined } : s))
    );
    addLog(
      'پاسخ دیرهنگام درگاه (LATE_SUCCESS_FLAGGED)',
      'استرداد ۱۰۰٪ به کارت مبدأ',
      `پاسخ بانک پس از مهلت ۱۰ دقیقه‌ای واصل شد. ارتقا به BOOKED مسدود شد؛ رکورد بازپرداخت ۱۰۰٪ به کارت مبدا صادر گردید.`
    );
    alert('تراکنش پس از انقضای مهلت ۱۰ دقیقه‌ای دریافت شد.\nرزرو لغو شد و مبلغ ۱۰۰٪ به کارت مبدأ مسترد گردید.');
    setModalMode('NONE');
    setSelectedSlot(null);
  };

  // 5. Pay Next Split Share
  const handlePayNextSplitShare = () => {
    if (!selectedSlot) return;
    const currentPaid = selectedSlot.splitSharesPaid || 1;
    const nextPaid = currentPaid + 1;

    if (nextPaid >= 4) {
      setSlots((prev) =>
        prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: 'BOOKED', splitSharesPaid: 4, holdExpiresAt: undefined } : s))
      );
      addLog(
        'تکمیل کامل پرداخت دنگی (۴/۴)',
        'BOOKED',
        `تمامی ۴ سهم پرداخت شدند. سانس بلافاصله به BOOKED قطعی ارتقا یافت.`
      );
      setSelectedSlot((prev) => (prev ? { ...prev, status: 'BOOKED', splitSharesPaid: 4 } : null));
    } else {
      setSlots((prev) =>
        prev.map((s) => (s.id === selectedSlot.id ? { ...s, splitSharesPaid: nextPaid } : s))
      );
      setSelectedSlot((prev) => (prev ? { ...prev, splitSharesPaid: nextPaid } : null));
      addLog(
        `پرداخت سهم دنگی (${nextPaid}/۴)`,
        'HOLD_SPLIT فعال',
        `سهم شماره ${nextPaid} توسط هم‌بازی واریز شد (۵۰۰,۰۰۰ تومان).`
      );
    }
  };

  // 6. Operator Block / Unblock
  const handleToggleOperatorBlock = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        if (s.status === 'AVAILABLE') {
          addLog('مسدودسازی متصدی (OPERATOR_BLOCK)', 'BLOCKED', `متصدی باجه سانس ${s.startTime} را برای رزرو حضوری/تلفنی مسدود کرد.`);
          return { ...s, status: 'BLOCKED' };
        } else if (s.status === 'BLOCKED') {
          addLog('آزادسازی متصدی (OPERATOR_UNBLOCK)', 'AVAILABLE', `متصدی باجه سانس ${s.startTime} را در دسترس عموم قرار داد.`);
          return { ...s, status: 'AVAILABLE' };
        }
        return s;
      })
    );
  };

  // Helper: Format Countdown
  const formatCountdown = (expiresAt?: number) => {
    if (!expiresAt) return '';
    const diff = Math.max(0, Math.floor((expiresAt - currentTime) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyInviteLink = () => {
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2500);
  };

  return (
    <div>
      {/* Floating Apple-Style Dynamic Island Navbar */}
      <div className="apple-nav-wrapper">
        <header className="apple-nav">
          <div className="nav-brand" onClick={() => setActiveTab('HOME')}>
            <img src={rallyLogo} alt="Rally Logo" className="nav-logo" />
            <span className="nav-title">RALLY</span>
            <span className="nav-tag">پدل تهران</span>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-link ${activeTab === 'HOME' ? 'active' : ''}`}
              onClick={() => setActiveTab('HOME')}
            >
              نمای کلی
            </button>
            <button
              className={`nav-link ${activeTab === 'BOOKING' ? 'active' : ''}`}
              onClick={() => setActiveTab('BOOKING')}
            >
              رزرو سانس
            </button>
            <button
              className={`nav-link ${activeTab === 'SPLIT' ? 'active' : ''}`}
              onClick={() => setActiveTab('SPLIT')}
            >
              دُنگ ۴ نفره
            </button>
            <button
              className={`nav-link ${activeTab === 'OPERATOR' ? 'active' : ''}`}
              onClick={() => setActiveTab('OPERATOR')}
            >
              باجه باشگاه
            </button>
            <button
              className={`nav-link ${activeTab === 'RULES' ? 'active' : ''}`}
              onClick={() => setActiveTab('RULES')}
            >
              شفافیت و قوانین
            </button>
          </nav>

          <button
            className="apple-btn apple-btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
            onClick={() => setActiveTab('BOOKING')}
          >
            رزرو آنلاین
          </button>
        </header>
      </div>

      <main className="page-container container">
        {/* ========================================================
            PAGE 1: HOME / SHOWCASE (Apple Style Showcase)
           ======================================================== */}
        {activeTab === 'HOME' && (
          <div>
            <section className="hero-showcase">
              <div className="hero-tagline-badge">
                <span>🎾</span>
                <span>پلتفرم تخصصی رزرو زمین‌های پدل در تهران</span>
              </div>

              <h1 className="apple-headline hero-title">
                پدل. با تعریف رالی.
              </h1>

              <p className="hero-desc">
                سریع، اتمیک و بدون کارمزد اضافه. نرخ اعلامی در رالی دقیقاً معادل باجه باشگاه است.
                با سیستم اشتراک دُنگی ۴ نفره، سانس‌های خود را بدون دغدغه هماهنگ کنید.
              </p>

              <div className="hero-actions">
                <button
                  className="apple-btn apple-btn-primary"
                  onClick={() => setActiveTab('BOOKING')}
                >
                  مشاهده کورت‌ها و رزرو فوری
                </button>
                <button
                  className="apple-btn apple-btn-glass"
                  onClick={() => setActiveTab('SPLIT')}
                >
                  نحوه پرداخت دنگی رالی
                </button>
              </div>

              {/* Apple Hero Media Showcase */}
              <div className="hero-media-wrapper">
                <img src={rallyHero} alt="Rally Padel Court Experience" className="hero-image" />
                <div className="hero-media-overlay">
                  <div className="overlay-stats-bar">
                    <div className="stat-box">
                      <span className="stat-num">۹۰ دقیقه</span>
                      <span className="stat-lbl">زمان بازی بدون توقف</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">۰ تومان</span>
                      <span className="stat-lbl">کارمزد مازاد بازیکن</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">۱۰ دقیقه</span>
                      <span className="stat-lbl">قفل قطعی درگاه بانکی</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">۴ سهم</span>
                      <span className="stat-lbl">پرداخت مجزا برای هر هم‌بازی</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Apple Bento Grid Features */}
            <section style={{ marginTop: '5rem' }}>
              <div className="section-header">
                <span className="section-eyebrow">نوآوری در هر جزئیات</span>
                <h2 className="apple-headline" style={{ fontSize: '2.4rem' }}>چرا رالی متفاوت است؟</h2>
                <p className="apple-subheadline">
                  طراحی شده برای پایان دادن به تماس‌های تلفنی بی‌پاسخ، گروه‌های شلوغ واتس‌اپ و رزروهای تکراری.
                </p>
              </div>

              <div className="bento-grid">
                <div className="bento-card bento-col-8">
                  <div className="bento-icon">⚡</div>
                  <h3 className="bento-title">قفل اتمیک و تضمین Zero-Overbooking</h3>
                  <p className="bento-text">
                    هنگامی که شما یک سانس را انتخاب می‌کنید، سامانه رالی با قفل مشروط اتمیک پایگاه‌داده مانع هرگونه ثبت هم‌زمان می‌شود. حتی با اختلاف ۱ میلی‌ثانیه، سانس به صورت انحصاری برای شما در وضعیت HOLD قرار می‌گیرد.
                  </p>
                </div>

                <div className="bento-card bento-col-4">
                  <div className="bento-icon">💎</div>
                  <h3 className="bento-title">برابری ۱۰۰٪ نرخ باجه</h3>
                  <p className="bento-text">
                    شفافیت مطلق؛ هیچ مبلغ مازادی روی سانس کشیده نمی‌شود. قیمتی که در رالی می‌پردازید دقیقاً همان ۲ میلیون تومانی است که در باجه باشگاه پرداخت می‌شود.
                  </p>
                </div>

                <div className="bento-card bento-col-4">
                  <div className="bento-icon">🔄</div>
                  <h3 className="bento-title">استرداد مستقیم به کارت</h3>
                  <p className="bento-text">
                    در صورت لغو تا ۲۴ ساعت قبل، ۹۰٪ مبلغ فوراً به شماره کارت مبدأ مسترد می‌شود. کنسلی اضطراری باشگاه مشمول بازپرداخت ۱۰۰٪ بدون کسر حتی یک ریال است.
                  </p>
                </div>

                <div className="bento-card bento-col-8">
                  <div className="bento-icon">👥</div>
                  <h3 className="bento-title">اشتراک دنگی هوشمند (Rally Split)</h3>
                  <p className="bento-text">
                    پدل همیشه ۴ نفره است. میزبان فقط سهم ۵۰۰,۰۰۰ تومانی خود را می‌دهد، سانس ۱۵ دقیقه قفل می‌شود و ۳ لینک اختصاصی برای دوستانش ارسال می‌گردد. بدون نیاز به کارت‌به‌کارت و بدون ریسک.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================
            PAGE 2: LIVE BOOKING & COURTS (رزرو سانس)
           ======================================================== */}
        {activeTab === 'BOOKING' && (
          <div>
            <div className="section-header">
              <span className="section-eyebrow">تقویم زنده سانس‌ها</span>
              <h2 className="apple-headline" style={{ fontSize: '2.2rem' }}>رزرو مستقیم کورت‌های تهران</h2>
              <p className="apple-subheadline">
                سانس مورد نظر خود را انتخاب کنید؛ بلافاصله قفل اتمیک ۱۰ دقیقه‌ای یا ۱۵ دقیقه‌ای دنگی فعال خواهد شد.
              </p>
            </div>

            {/* Booking Toolbar */}
            <div className="booking-toolbar">
              <div className="toolbar-item">
                <span style={{ color: 'var(--text-secondary)' }}>مجموعه ورزشی:</span>
                <strong style={{ color: '#ffffff' }}>باشگاه پدل انقلاب (تهران)</strong>
              </div>
              <div className="toolbar-item">
                <span style={{ color: 'var(--text-secondary)' }}>تاریخ:</span>
                <strong style={{ color: 'var(--rally-neon)' }}>امروز — دوشنبه ۳۱ شهریور</strong>
              </div>
              <div className="toolbar-item">
                <span style={{ color: 'var(--text-secondary)' }}>تضمین:</span>
                <span className="apple-badge badge-available">برابری قطعی با باجه</span>
              </div>
            </div>

            {/* Courts Timeline */}
            <div>
              {['court-1', 'court-2'].map((cId) => {
                const courtSlots = slots.filter((s) => s.courtId === cId);
                const cName = courtSlots[0]?.courtName || 'کورت پدل';

                return (
                  <div key={cId} className="bento-card court-timeline-card">
                    <div className="court-timeline-header">
                      <div className="court-timeline-title">
                        <span>🎾</span>
                        <span>{cName}</span>
                      </div>
                      <span className="apple-badge">استاندارد بین‌المللی FIP</span>
                    </div>

                    <div className="slots-flow-grid">
                      {courtSlots.map((slot) => {
                        const isHold = slot.status === 'HOLD_SINGLE' || slot.status === 'HOLD_SPLIT';
                        const countdown = formatCountdown(slot.holdExpiresAt);

                        return (
                          <div key={slot.id} className={`slot-apple-card status-${slot.status.toLowerCase()}`}>
                            <div className="slot-card-top">
                              <span className="slot-card-time">{slot.startTime} - {slot.endTime}</span>
                              <span className={`apple-badge badge-${slot.status.toLowerCase().replace('_', '-')}`}>
                                {slot.status === 'AVAILABLE' && 'آزاد'}
                                {slot.status === 'HOLD_SINGLE' && 'قفل یک‌جا'}
                                {slot.status === 'HOLD_SPLIT' && 'قفل دنگی'}
                                {slot.status === 'BOOKED' && 'رزرو قطعی'}
                                {slot.status === 'BLOCKED' && 'مسدود باجه'}
                              </span>
                            </div>

                            <div className="slot-price-display">
                              <span className="slot-price-amount">{(slot.price / 10).toLocaleString('fa-IR')}</span>
                              <span className="slot-price-currency">تومان</span>
                            </div>

                            {isHold && (
                              <div className="slot-timer-bar">
                                <span>⏱ مهلت پرداخت:</span>
                                <strong>{countdown}</strong>
                              </div>
                            )}

                            <div className="slot-card-actions">
                              <button
                                className="apple-btn apple-btn-primary"
                                style={{ width: '100%', fontSize: '0.85rem' }}
                                disabled={slot.status !== 'AVAILABLE'}
                                onClick={() => handleAcquireSingleHold(slot)}
                              >
                                {slot.status === 'AVAILABLE' ? 'رزرو یک‌جا (۲ میلیون)' : 'غیرقابل رزرو'}
                              </button>

                              <button
                                className="apple-btn apple-btn-glass"
                                style={{ width: '100%', fontSize: '0.85rem' }}
                                disabled={slot.status !== 'AVAILABLE'}
                                onClick={() => handleAcquireSplitHold(slot)}
                              >
                                رزرو دنگی ۴ نفره (هر نفر ۵۰۰ ت)
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            PAGE 3: RALLY SPLIT EXPERIENCE (پرداخت دنگی)
           ======================================================== */}
        {activeTab === 'SPLIT' && (
          <div>
            <div className="section-header">
              <span className="section-eyebrow">فناوری انحصاری رالی</span>
              <h2 className="apple-headline" style={{ fontSize: '2.2rem' }}>سیستم اشتراک دُنگی ۴ نفره</h2>
              <p className="apple-subheadline">
                دیگر لازم نیست یک نفر هزینه کل زمین را کارت‌به‌کارت کند یا دنبال وصول سهم دوستانش باشد.
              </p>
            </div>

            <div className="bento-card split-experience-panel">
              <div>
                <h3 className="bento-title" style={{ fontSize: '1.4rem' }}>جریان کارکرد دُنگ رالی</h3>
                <ol style={{ paddingRight: '1.25rem', color: 'var(--text-secondary)', lineHeight: '2' }}>
                  <li><strong>قفل آنی ۱۵ دقیقه‌ای:</strong> به محض انتخاب دنگی، سانس قفل می‌شود و هیچ‌کس نمی‌تواند آن را تصاحب کند.</li>
                  <li><strong>پرداخت سهم میزبان:</strong> میزبان صرفاً سهم خود (۵۰۰,۰۰۰ تومان) را پرداخت می‌کند.</li>
                  <li><strong>لینک دعوت هوشمند:</strong> ۳ لینک یکتا برای ۳ هم‌تیمی تولید می‌شود.</li>
                  <li><strong>نهایی‌سازی خودکار:</strong> به محض تکمیل سهم چهارم، سانس فوراً BOOKED قطعی می‌شود.</li>
                  <li><strong>استرداد امن:</strong> در صورت عدم تکمیل ۴ سهم در ۱۵ دقیقه، پول‌های واریزی بلافاصله به کارت‌ها برمی‌گردد.</li>
                </ol>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="apple-btn apple-btn-primary"
                    onClick={() => setActiveTab('BOOKING')}
                  >
                    شروع رزرو دنگی یک سانس
                  </button>

                  <button
                    className="apple-btn apple-btn-glass"
                    onClick={handleCopyInviteLink}
                  >
                    {inviteCopied ? 'لینک کپی شد ✓' : 'کپی لینک نمونه هم‌بازی‌ها'}
                  </button>
                </div>
              </div>

              {/* Interactive Split Simulator Box */}
              <div className="split-card-diagram">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>شبیه‌ساز پیشرفت ۴ سهم</span>
                  <span className="apple-badge badge-hold-split">مهلت ۱۵ دقیقه</span>
                </div>

                <div className="split-shares-visual">
                  {[1, 2, 3, 4].map((idx) => {
                    const sharesPaid = selectedSlot?.splitSharesPaid || (selectedSlot?.status === 'BOOKED' ? 4 : 1);
                    const isPaid = sharesPaid >= idx;
                    const isNext = sharesPaid + 1 === idx;

                    return (
                      <div
                        key={idx}
                        className={`share-player-pill ${isPaid ? 'paid' : isNext ? 'current' : ''}`}
                      >
                        <span style={{ fontSize: '0.75rem' }}>بازیکن {idx}</span>
                        <strong>{isPaid ? 'واریز شد ✓' : '۵۰۰,۰۰۰ ت'}</strong>
                        <span style={{ fontSize: '0.7rem', color: isPaid ? '#34d399' : 'var(--text-tertiary)' }}>
                          {isPaid ? 'تأیید شاپرک' : isNext ? 'در حال پرداخت' : 'در انتظار'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    className="apple-btn apple-btn-primary"
                    style={{ width: '100%' }}
                    onClick={handlePayNextSplitShare}
                  >
                    شبیه‌سازی پرداخت سهم بعدی توسط هم‌تیمی
                  </button>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    این شبیه‌ساز رفتار دقیق ماشین وضعیت بک‌اند رالی (ADR 0002) را اجرا می‌کند.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            PAGE 4: OPERATOR DESK (باجه باشگاه)
           ======================================================== */}
        {activeTab === 'OPERATOR' && (
          <div>
            <div className="section-header">
              <span className="section-eyebrow">پنل اختصاصی پذیرش و باشگاه</span>
              <h2 className="apple-headline" style={{ fontSize: '2.2rem' }}>میز کار باجه و مدیریت سانس‌ها</h2>
              <p className="apple-subheadline">
                دیگر نیازی به ثبت دفتری و کاغذبازی نیست؛ سانس‌های رزرو حضوری و تلفنی را با یک کلیک مسدود یا آزاد کنید.
              </p>
            </div>

            <div className="bento-card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.25rem' }}>سانس‌های جاری کورت سنتر و پانورامیک</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    عملیات مسدودسازی فوراً در اپلیکیشن بازیکنان منعکس شده و امکان رزرو تکراری را به صفر می‌رساند.
                  </p>
                </div>
                <span className="apple-badge badge-blocked">حالت متصدی باجه فعال است</span>
              </div>

              <div className="slots-flow-grid">
                {slots.map((s) => (
                  <div key={s.id} className={`slot-apple-card status-${s.status.toLowerCase()}`}>
                    <div className="slot-card-top">
                      <span className="slot-card-time">{s.startTime} - {s.endTime}</span>
                      <span className={`apple-badge badge-${s.status.toLowerCase().replace('_', '-')}`}>
                        {s.status === 'AVAILABLE' && 'آزاد'}
                        {s.status === 'HOLD_SINGLE' && 'قفل کاربر'}
                        {s.status === 'HOLD_SPLIT' && 'قفل دنگی'}
                        {s.status === 'BOOKED' && 'رزرو قطعی'}
                        {s.status === 'BLOCKED' && 'مسدود باجه'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {s.courtName}
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      {s.status === 'AVAILABLE' && (
                        <button
                          className="apple-btn apple-btn-danger"
                          style={{ width: '100%', fontSize: '0.82rem' }}
                          onClick={() => handleToggleOperatorBlock(s.id)}
                        >
                          مسدودسازی برای مشتری باجه
                        </button>
                      )}

                      {s.status === 'BLOCKED' && (
                        <button
                          className="apple-btn apple-btn-primary"
                          style={{ width: '100%', fontSize: '0.82rem' }}
                          onClick={() => handleToggleOperatorBlock(s.id)}
                        >
                          آزادسازی مجدد سانس
                        </button>
                      )}

                      {s.status !== 'AVAILABLE' && s.status !== 'BLOCKED' && (
                        <button
                          className="apple-btn apple-btn-glass"
                          style={{ width: '100%', fontSize: '0.82rem' }}
                          disabled
                        >
                          قفل توسط فرآیند آنلاین
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            PAGE 5: RULES & TRANSPARENCY (قوانین و شفافیت)
           ======================================================== */}
        {activeTab === 'RULES' && (
          <div>
            <div className="section-header">
              <span className="section-eyebrow">منشور شفافیت رالی</span>
              <h2 className="apple-headline" style={{ fontSize: '2.2rem' }}>قوانین لغو، استرداد و تعهدات</h2>
              <p className="apple-subheadline">
                حقوق بازیکن و باشگاه در رالی بدون تفسیر و با تعهدات فنی صریح تعریف شده است.
              </p>
            </div>

            <div className="rules-grid">
              <div className="bento-card rule-card">
                <span className="rule-tag">قانون شماره ۱</span>
                <h3 className="rule-title">لغو توسط بازیکن (مرز ۲۴ ساعته)</h3>
                <p className="rule-desc">
                  اگر لغو بیش از ۲۴ ساعت پیش از شروع سانس ثبت شود، ۹۰٪ مبلغ کل مستقیماً به کارت بانکی مبدا مسترد و ۱۰٪ به عنوان خسارت به باشگاه تعلق می‌گیرد. لغو کمتر از ۲۴ ساعت غیرقابل استرداد است.
                </p>
              </div>

              <div className="bento-card rule-card">
                <span className="rule-tag">قانون شماره ۲</span>
                <h3 className="rule-title">لغو اضطراری باشگاه (کنسلی ۱۰۰٪)</h3>
                <p className="rule-desc">
                  در صورت بروز هرگونه مشکل فنی، قطعی برق کورت یا شرایط نامساعد آب‌وهوایی از طرف باشگاه، ۱۰۰٪ مبلغ پرداختی فوراً و بدون کسر حتی یک ریال به حساب مبدأ بازیکنان بازگردانده می‌شود.
                </p>
              </div>

              <div className="bento-card rule-card">
                <span className="rule-tag">قانون شماره ۳</span>
                <h3 className="rule-title">عدم اوربوکینگ در کالبک دیرهنگام</h3>
                <p className="rule-desc">
                  اگر پاسخ بانک یا ترافیک شاپرک بعد از پایان مهلت ۱۰ دقیقه‌ای قفل برسد، سیستم رالی با وضعیت LATE_SUCCESS_FLAGGED مانع رزرو تکراری شده و تمام وجه را خودکار مسترد می‌نماید.
                </p>
              </div>

              <div className="bento-card rule-card">
                <span className="rule-tag">قانون شماره ۴</span>
                <h3 className="rule-title">تضمین قطعی برابری قیمت با باجه</h3>
                <p className="rule-desc">
                  بازیکنان ریالی بیشتر از نرخ اعلامی پشت باجه باشگاه پرداخت نمی‌کنند. کارمزد پلتفرم رالی به صورت توافقی و مستقیم از صورت‌حساب تجاری باشگاه‌ها کسر می‌شود.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Engine & State Machine Event Stream (Always Visible Mini-Drawer) */}
        <section style={{ marginTop: '4rem' }}>
          <div className="bento-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rally-neon)', boxShadow: '0 0 8px var(--rally-neon)' }}></span>
                <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>لاگ زنده موتور وضعیت رالی (Rally State Engine)</strong>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>انطباق کامل با ADR 0002</span>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {logs.length === 0 ? (
                <span style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}>
                  رویدادی برای نمایش وجود ندارد. با کلیک بر روی رزرو یک‌جا، دنگی یا باجه، تغییر وضعیت‌ها را زنده مشاهده کنید.
                </span>
              ) : (
                logs.map((l) => (
                  <div key={l.id} style={{ padding: '0.4rem 0.75rem', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '6px', borderRight: '3px solid var(--rally-neon)', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--rally-neon)' }}>[{l.timestamp}]</span> <strong style={{ color: '#ffffff' }}>{l.event}:</strong> {l.details}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modal / Sheet: Single Payer Apple Pay Style Simulation */}
      {modalMode === 'SINGLE_GATEWAY' && selectedSlot && (
        <div className="apple-sheet-overlay">
          <div className="apple-sheet-card">
            <div className="sheet-header">
              <span className="sheet-title">شیت پرداخت امن رالی | شاپرک</span>
              <button
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.25rem', cursor: 'pointer' }}
                onClick={() => setModalMode('NONE')}
              >
                ✕
              </button>
            </div>

            <div className="sheet-details-box">
              <div className="detail-row">
                <span style={{ color: 'var(--text-secondary)' }}>مجموعه ورزشی:</span>
                <strong>باشگاه پدل انقلاب</strong>
              </div>
              <div className="detail-row">
                <span style={{ color: 'var(--text-secondary)' }}>سانس رزرو:</span>
                <strong>{selectedSlot.startTime} الی {selectedSlot.endTime}</strong>
              </div>
              <div className="detail-row">
                <span style={{ color: 'var(--text-secondary)' }}>مبلغ پرداختی:</span>
                <strong style={{ color: 'var(--rally-neon)', fontSize: '1.1rem' }}>{(selectedSlot.price / 10).toLocaleString('fa-IR')} تومان</strong>
              </div>
              <div className="detail-row">
                <span style={{ color: 'var(--text-secondary)' }}>زمان باقی‌مانده قفل اتمیک:</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>{formatCountdown(selectedSlot.holdExpiresAt)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="apple-btn apple-btn-primary" onClick={handleCompleteSinglePayment}>
                تأیید پرداخت موفق شاپرک (VERIFIED_SUCCESS)
              </button>

              <button className="apple-btn apple-btn-danger" onClick={handleSimulateLateCallback}>
                شبیه‌سازی کالبک دیرهنگام (تست استرداد ۱۰۰٪)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple Style Footer */}
      <footer className="apple-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <img src={rallyLogo} alt="Rally" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            <span>RALLY PADEL • رالی پدل تهران</span>
          </div>

          <div>
            <span>کلیه حقوق محفوظ است © ۲۰۲۶ • سامانه هوشمند رالی پدل</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

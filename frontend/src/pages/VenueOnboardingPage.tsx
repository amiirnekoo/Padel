import React, { useState, useEffect } from 'react';
import { Building2, PlusCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { VenueData, VenueOnboardPayload } from '../types';
import { MyVenuesList } from '../components/MyVenuesList';

const POPULAR_CITIES = ['تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز', 'کیش', 'رشت', 'کرج', 'اهواز', 'یزد', 'ساری'];

export const VenueOnboardingPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'my-venues'>('register');
  const [myVenues, setMyVenues] = useState<VenueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('تهران');
  const [province, setProvince] = useState('تهران');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('09121112233');
  const [sports, setSports] = useState('PADEL');
  const [courtsCount, setCourtsCount] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(3000000);
  const [iban, setIban] = useState('IR120120000000001234567890');
  const [amenities, setAmenities] = useState('پارکینگ، کافه، رختکن، نور شب');

  const fetchMyVenues = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/venues/my-venues?owner_id=user-owner-demo');
      if (res.ok) {
        setMyVenues(await res.json());
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    if (activeSubTab === 'my-venues') {
      fetchMyVenues();
    }
  }, [activeSubTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload: VenueOnboardPayload = {
      owner_id: 'user-owner-demo',
      name,
      province,
      city,
      address,
      phone,
      sports_supported: sports,
      amenities,
      courts_count: courtsCount,
      default_hourly_rate: Number(hourlyRate),
      iban
    };

    try {
      const res = await fetch('http://localhost:8000/api/v1/venues/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'خطا در ثبت مجموعه');
      setSuccessMsg(data.message || 'مجموعه با موفقیت ثبت شد.');
      setName('');
      setAddress('');
      setActiveSubTab('my-venues');
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }} dir="rtl">
      {/* Header Banner */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 color="#38bdf8" size={28} />
              سامانه پذیرش و ثبت مالکان مجموعه‌های ورزشی سراسر ایران
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
              باشگاه پدل، تنیس یا سالن ورزشی خود را در کمتر از ۲ دقیقه ثبت کنید؛ بقیه امور هماهنگی، تقویم و جذب بازیکن با ماست.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveSubTab('register')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: activeSubTab === 'register' ? '#0284c7' : '#1e293b',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              ثبت مجموعه جدید
            </button>
            <button
              onClick={() => setActiveSubTab('my-venues')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: activeSubTab === 'my-venues' ? '#0284c7' : '#1e293b',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              مجموعه‌های من
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: '#064e3b', border: '1px solid #059669', color: '#a7f3d0', padding: '14px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#7f1d1d', border: '1px solid #dc2626', color: '#fecaca', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      {activeSubTab === 'register' ? (
        <form onSubmit={handleSubmit} style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle color="#38bdf8" size={20} /> مشخصات اولیه باشگاه ورزشی
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>نام مجموعه ورزشی</label>
              <input
                required
                type="text"
                placeholder="مثال: کلوپ پدل و تنیس اسپین شیراز"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>شهر محل استقرار</label>
              <select
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  setProvince(e.target.value === 'شیراز' ? 'فارس' : e.target.value === 'اصفهان' ? 'اصفهان' : 'تهران');
                }}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              >
                {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>رشته‌های ورزشی مجموعه</label>
              <select
                value={sports}
                onChange={e => setSports(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              >
                <option value="PADEL">پدل (Padel)</option>
                <option value="TENNIS">تنیس خاکی / هارد کورت</option>
                <option value="PADEL,TENNIS">پدل و تنیس همزمان</option>
                <option value="FITNESS,CROSSFIT">سالن بدنسازی و تناسب اندام</option>
                <option value="MULTI_SPORT">مجموعه چندمنظوره ورزشی</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>تعداد زمین‌ها یا سالن‌ها</label>
              <input
                type="number"
                min={1}
                max={15}
                value={courtsCount}
                onChange={e => setCourtsCount(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>تعرفه هر ساعت/سانس (ریال)</label>
              <input
                type="number"
                step={100000}
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>معادل {(hourlyRate / 10).toLocaleString('fa-IR')} تومان در هر ساعت</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>شماره تماس مدیریت جهت هماهنگی</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>آدرس دقیق مجموعه ورزشی</label>
            <input
              required
              type="text"
              placeholder="مثال: شیراز، بلوار چمران، خیابان شقایق، پلاک ۱۲"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>شماره شبا بانکی جهت تسویه خودکار درآمد رزروها</label>
            <input
              type="text"
              value={iban}
              onChange={e => setIban(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', direction: 'ltr' }}
            />
          </div>

          {/* Guarantee Box */}
          <div style={{ background: '#0f172a', border: '1px dashed #0284c7', borderRadius: '10px', padding: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck color="#38bdf8" size={24} />
            <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
              <strong>شما فقط مشخصات و قیمت را وارد کنید؛</strong> کارشناسان فنی ما برنامه هفتگی، سانس‌بندی و بازاریابی باشگاه را تنظیم می‌کنند و وجه رزروها مستقیم به شبای شما واریز می‌گردد.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: '#0284c7',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'در حال ثبت اطلاعات...' : 'ثبت قطعی مجموعه ورزشی و ارسال به پشتیبانی'}
          </button>
        </form>
      ) : (
        <MyVenuesList venues={myVenues} />
      )}
    </div>
  );
};

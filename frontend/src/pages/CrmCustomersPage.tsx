import React, { useState, useEffect } from 'react';
import { Users, Search, DollarSign, Building, Award, Shield, Tag, Filter } from 'lucide-react';
import { CustomerIntelligenceData, PlatformKpisData } from '../types';

export const CrmCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerIntelligenceData[]>([]);
  const [kpis, setKpis] = useState<PlatformKpisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const fetchCrmData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedRole) params.append('role', selectedRole);
      if (selectedCity) params.append('city', selectedCity);

      const [custRes, kpiRes] = await Promise.all([
        fetch(`/api/v1/crm/customers?${params.toString()}`),
        fetch('/api/v1/crm/analytics')
      ]);

      if (custRes.ok) setCustomers(await custRes.json());
      if (kpiRes.ok) setKpis(await kpiRes.json());
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrmData();
  }, [selectedRole, selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCrmData();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'CLUB_MANAGER':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#0284c7', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>مالک مجموعه</span>;
      case 'COACH':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#7c3aed', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>مربی رسمی</span>;
      case 'CLUB_OPERATOR':
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#ea580c', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>متصدی باجه</span>;
      default:
        return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>بازیکن / شاگرد</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }} dir="rtl">
      {/* Top Banner */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users color="#10b981" size={26} />
          پایگاه داده جامع و دسته‌بندی هوشمند مشتریان پلتفرم (CRM مرکزی)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
          مدیریت حرفه‌ای داده‌ها، رتبه‌بندی ارزش مشتریان (LTV)، تفکیک مالکان کلوپ، مربیان و بازیکنان در تمامی شهرهای کشور.
        </p>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} color="#38bdf8" /> کل پرونده مشتریان</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', marginTop: '6px' }}>{kpis.total_customers.toLocaleString('fa-IR')} نفر</div>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} color="#0284c7" /> مجموعه‌های ورزشی</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', marginTop: '6px' }}>{kpis.venues_count.toLocaleString('fa-IR')} کلوپ</div>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={16} color="#a855f7" /> مربیان فعال</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#c084fc', marginTop: '6px' }}>{(kpis.roles_distribution['COACH'] || 0).toLocaleString('fa-IR')} مربی</div>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} color="#10b981" /> گردش پرداختی کل پلتفرم</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', marginTop: '8px' }}>{(kpis.total_platform_revenue / 10).toLocaleString('fa-IR')} تومان</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="جستجوی نام یا شماره همراه مشتری..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.85rem' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#10b981', color: '#fff', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={16} /> جستجو
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            style={{ padding: '8px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.85rem' }}
          >
            <option value="">همه نقش‌ها</option>
            <option value="CLUB_MANAGER">مالکان مجموعه ورزشی</option>
            <option value="COACH">مربیان رسمی</option>
            <option value="PLAYER">بازیکنان و شاگردان</option>
          </select>

          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            style={{ padding: '8px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.85rem' }}
          >
            <option value="">همه شهرها</option>
            <option value="تهران">تهران</option>
            <option value="شیراز">شیراز</option>
            <option value="اصفهان">اصفهان</option>
            <option value="مشهد">مشهد</option>
            <option value="تبریز">تبریز</option>
            <option value="کیش">کیش</option>
          </select>
        </div>
      </div>

      {/* High-Performance Fixed Table */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-fixed" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'right', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '12px 14px' }}>نام و هویت مشتری</th>
                <th style={{ padding: '12px 14px' }}>نقش کاربری</th>
                <th style={{ padding: '12px 14px' }}>شهر / استان</th>
                <th style={{ padding: '12px 14px' }}>تعداد رزروها</th>
                <th style={{ padding: '12px 14px' }}>مجموع ارزش (LTV)</th>
                <th style={{ padding: '12px 14px' }}>برچسب‌ها و دارایی</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>در حال بارگذاری اطلاعات مشتریان...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>هیچ مشتری با مشخصات انتخابی یافت نشد.</td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{c.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', direction: 'ltr', textAlign: 'right' }}>{c.phone_number}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{getRoleBadge(c.role)}</td>
                    <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{c.city}</td>
                    <td style={{ padding: '12px 14px', color: '#f8fafc', fontWeight: 600 }}>{c.total_bookings.toLocaleString('fa-IR')} رزرو</td>
                    <td style={{ padding: '12px 14px', color: '#34d399', fontWeight: 700 }}>
                      {(c.lifetime_value / 10).toLocaleString('fa-IR')} تومان
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {c.tags.map((t, i) => (
                          <span key={i} style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: '#334155', color: '#cbd5e1' }}>
                            {t}
                          </span>
                        ))}
                        {c.owned_venues.length > 0 && (
                          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: '#0369a1', color: '#e0f2fe' }}>
                            باشگاه: {c.owned_venues[0].name}
                          </span>
                        )}
                      </div>
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

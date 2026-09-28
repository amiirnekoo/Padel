import React, { useState } from 'react';
import {
  Building2,
  Award,
  Users2,
  Calendar,
  Clock,
  PhoneCall,
  CheckCircle2,
  Plus,
  AlertCircle
} from 'lucide-react';

export type PartnerRole = 'CLUB' | 'COACH' | 'ORGANIZER';

export const RallyPartnerHubPage: React.FC = () => {
  const [role, setRole] = useState<PartnerRole>('CLUB');
  const [phoneBookingModal, setPhoneBookingModal] = useState(false);
  const [phoneCustomer, setPhoneCustomer] = useState('');
  const [phoneSlot, setPhoneSlot] = useState('۱۸:۰۰ تا ۱۹:۳۰');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreateWalkInBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setPhoneBookingModal(false);
      setPhoneCustomer('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header with Role Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-rally-charcoal">
            پنل یکپارچه مدیریت همکاران رالی
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            مدیریت کارهای روزمره، سانس‌ها، جلسات و مسابقات در یک نگاه
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setRole('CLUB')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'CLUB' ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>مدیر باشگاه</span>
          </button>

          <button
            onClick={() => setRole('COACH')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'COACH' ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>مربی</span>
          </button>

          <button
            onClick={() => setRole('ORGANIZER')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'ORGANIZER' ? 'bg-white text-rally-primary shadow-xs' : 'text-gray-600'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>برگزارکننده</span>
          </button>
        </div>
      </div>

      {/* 1. CLUB VIEW */}
      {role === 'CLUB' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-rally-charcoal">
              تقویم و رزروهای امروز (کورت سنترال انقلاب)
            </h2>
            <button
              onClick={() => setPhoneBookingModal(true)}
              className="px-4 py-2 rounded-xl bg-rally-primary hover:bg-rally-primary-light text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rally-accent" />
              <span>ثبت رزرو تلفنی / حضوری</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { slot: '۰۸:۰۰ - ۰۹:۳۰', player: 'آرش کیانی', status: 'رزرو آنلاین', paid: true },
              { slot: '۱۱:۰۰ - ۱۲:۳۰', player: 'فرهاد نادری', status: 'رزرو تلفنی', paid: true },
              { slot: '۱۸:۰۰ - ۱۹:۳۰', player: 'امیر نکوزاده', status: 'رزرو آنلاین', paid: true },
              { slot: '۱۹:۳۰ - ۲۱:۰۰', player: 'آزاد جهت رزرو', status: 'AVAILABLE', paid: false }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${
                  item.status === 'AVAILABLE'
                    ? 'border-dashed border-gray-300 bg-white'
                    : 'border-gray-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-extrabold text-rally-charcoal">{item.slot}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rally-primary/10 text-rally-primary'
                  }`}>
                    {item.status === 'AVAILABLE' ? 'خالی' : item.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-700">{item.player}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {item.paid ? 'تسویه کامل شاپرک' : 'آماده واگذاری به متقاضی'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. COACH VIEW */}
      {role === 'COACH' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-rally-charcoal">
            جلسات امروز و درخواست‌های در انتظار تأیید
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 divide-y divide-gray-100">
            <div className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-gray-800">نیما صبوری (سطح: مبتدی)</p>
                <p className="text-gray-500 text-[11px]">درخواست برای فردا ساعت ۱۸:۰۰ • هدف: اصلاح ضربات والیه</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">
                  تأیید درخواست
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  پیشنهاد ساعت دیگر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORGANIZER VIEW */}
      {role === 'ORGANIZER' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-rally-charcoal">
            مدیریت رویدادها و نیازمندی‌های اقدام
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-800 text-sm">جام پاییزی پدل رالی (Rally Autumn Master)</p>
                <p className="text-gray-500 mt-0.5">۱۲ از ۱۶ تیم ثبت‌نام کرده‌اند • ۴ ظرفیت باقیمانده</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                ثبت‌نام فعال
              </span>
            </div>
            <p className="text-gray-500">
              قرعه‌کشی خودکار جدول مسابقات پس از تکمیل ظرفیت فعال خواهد شد.
            </p>
          </div>
        </div>
      )}

      {/* Walk-in Booking Modal */}
      {phoneBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rally-charcoal/70">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-rally-charcoal">ثبت سریع سانس حضوری یا تلفنی</h3>
            <form onSubmit={handleCreateWalkInBooking} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">نام مشتری یا تماس‌گیرنده</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: علی رضایی"
                  value={phoneCustomer}
                  onChange={(e) => setPhoneCustomer(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">انتخاب سانس کورت</label>
                <select
                  value={phoneSlot}
                  onChange={(e) => setPhoneSlot(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold"
                >
                  <option value="۱۸:۰۰ تا ۱۹:۳۰">۱۸:۰۰ تا ۱۹:۳۰</option>
                  <option value="۱۹:۳۰ تا ۲۱:۰۰">۱۹:۳۰ تا ۲۱:۰۰</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPhoneBookingModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rally-primary text-white text-xs font-bold"
                >
                  ثبت قطعی در تقویم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Calendar, Search, CheckCircle, Clock, XCircle, AlertCircle, Filter } from 'lucide-react';

export interface AdminBookingRecord {
  id: string;
  userName: string;
  userPhone: string;
  clubName: string;
  courtName: string;
  slotTime: string;
  slotDate: string;
  price: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  paymentRef: string;
}

const INITIAL_BOOKINGS: AdminBookingRecord[] = [
  {
    id: 'BK-9021',
    userName: 'امیر نکوزاده',
    userPhone: '۰۹۱۲۳۴۵۶۷۸۹',
    clubName: 'باشگاه انقلاب (کورت سنترال)',
    courtName: 'کورت ۱ (شیشه‌ای پانورامیک)',
    slotTime: '۱۸:۰۰ تا ۱۹:۳۰',
    slotDate: 'امروز (چهارشنبه)',
    price: 2400000,
    status: 'CONFIRMED',
    paymentRef: 'TXN-781902'
  },
  {
    id: 'BK-9022',
    userName: 'سارا تهرانی',
    userPhone: '۰۹۱۲۹۸۷۶۵۴۳',
    clubName: 'بام ولنجک (Velenjak Arena)',
    courtName: 'کورت ۳ (روباز)',
    slotTime: '۱۹:۳۰ تا ۲۱:۰۰',
    slotDate: 'امروز (چهارشنبه)',
    price: 2000000,
    status: 'CONFIRMED',
    paymentRef: 'TXN-781903'
  },
  {
    id: 'BK-9023',
    userName: 'پویا کریمی',
    userPhone: '۰۹۳۵۱۱۲۲۳۳۴',
    clubName: 'باشگاه تنیس و پدل استقلال',
    courtName: 'کورت ۲ (استاندارد)',
    slotTime: '۱۶:۳۰ تا ۱۸:۰۰',
    slotDate: 'فردا (پنجشنبه)',
    price: 1800000,
    status: 'PENDING',
    paymentRef: 'TXN-781904'
  },
  {
    id: 'BK-9024',
    userName: 'نیما فلاح',
    userPhone: '۰۹۱۲۴۴۵۵۶۶۷',
    clubName: 'باشگاه شاهین پدل',
    courtName: 'کورت سنترال',
    slotTime: '۲۱:۰۰ تا ۲۲:۳۰',
    slotDate: 'دیروز',
    price: 2200000,
    status: 'CANCELLED',
    paymentRef: 'TXN-781890'
  }
];

export const AdminBookingsTab: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBookingRecord[]>(INITIAL_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'>('ALL');

  const filtered = bookings.filter((b) => {
    const matchesSearch = b.userName.includes(searchTerm) || b.clubName.includes(searchTerm) || b.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: 'CONFIRMED' | 'CANCELLED') => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">کل رزروهای فعال امروز</span>
            <p className="text-xl font-black text-white mt-1">۱۲ سانس</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">مجموع ارزش ریالی سانس‌ها</span>
            <p className="text-xl font-black text-[#D7ED68] mt-1">۲۶,۸۰۰,۰۰۰ تومان</p>
          </div>
          <div className="p-3 bg-[#D7ED68]/10 text-[#D7ED68] rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">نرخ اشغال کورت‌ها</span>
            <p className="text-xl font-black text-emerald-400 mt-1">۸۴٪ ظرفیت</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو بر اساس نام رزروکننده، شناسه یا باشگاه..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rally-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'همه' : st === 'CONFIRMED' ? 'تایید شده' : st === 'PENDING' ? 'در انتظار' : 'لغو شده'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-right text-xs">
            <colgroup>
              <col className="w-24" />
              <col className="w-36" />
              <col className="w-48" />
              <col className="w-36" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-36" />
            </colgroup>
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">شناسه</th>
                <th className="p-3.5">رزروکننده</th>
                <th className="p-3.5">مجموعه و کورت</th>
                <th className="p-3.5">زمان سانس</th>
                <th className="p-3.5">مبلغ (تومان)</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5 text-center">عملیات ادمین</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400">{b.id}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-white">{b.userName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{b.userPhone}</span>
                  </td>
                  <td className="p-3.5 truncate">
                    <p className="font-medium text-slate-200 truncate">{b.clubName}</p>
                    <span className="text-[10px] text-slate-400 truncate">{b.courtName}</span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-white">{b.slotTime}</p>
                    <span className="text-[10px] text-slate-400">{b.slotDate}</span>
                  </td>
                  <td className="p-3.5 font-bold text-[#D7ED68]">
                    {b.price.toLocaleString('fa-IR')}
                  </td>
                  <td className="p-3.5">
                    {b.status === 'CONFIRMED' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        تایید شده
                      </span>
                    )}
                    {b.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        در انتظار پرداخت
                      </span>
                    )}
                    {b.status === 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <XCircle className="w-3 h-3" />
                        لغو شده
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {b.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          تایید دستی
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-[10px] font-bold border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          لغو و عودت
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

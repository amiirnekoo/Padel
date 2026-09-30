import React, { useState } from 'react';
import { DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight, CheckCircle2, Download, AlertCircle } from 'lucide-react';

interface PayoutRequest {
  id: string;
  clubName: string;
  accountNumber: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PROCESSING';
}

const MOCK_PAYOUTS: PayoutRequest[] = [
  {
    id: 'PAY-104',
    clubName: 'مجموعه ورزشی انقلاب',
    accountNumber: 'IR8201200000000012345678',
    amount: 14200000,
    date: 'امروز ۱۰:۳۰',
    status: 'PROCESSING'
  },
  {
    id: 'PAY-103',
    clubName: 'کلوپ پدل بام ولنجک',
    accountNumber: 'IR4505600000000098765432',
    amount: 9800000,
    date: 'دیروز ۱۶:۱۵',
    status: 'PAID'
  },
  {
    id: 'PAY-102',
    clubName: 'باشگاه پدل استقلال',
    accountNumber: 'IR1901800000000055443322',
    amount: 7500000,
    date: '۲ روز پیش',
    status: 'PAID'
  }
];

export const AdminFinancesTab: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>(MOCK_PAYOUTS);

  const handleMarkAsPaid = (id: string) => {
    setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'PAID' } : p)));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>گردش مالی کل پلتفرم (GMV)</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-white mt-2">۲۴۸,۵۰۰,۰۰۰ <span className="text-xs font-normal text-slate-400">تومان</span></p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            +۱۸.۴٪ نسبت به ماه گذشته
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>درآمد خالص کارمزد رالی (۱۰٪)</span>
            <div className="p-2 bg-[#D7ED68]/10 text-[#D7ED68] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-[#D7ED68] mt-2">۲۴,۸۵۰,۰۰۰ <span className="text-xs font-normal text-slate-400">تومان</span></p>
          <span className="text-[10px] text-slate-400 mt-1 block">بدون کسر مالیات ارزش افزوده</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>تسویه‌شده با باشگاه‌ها</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-400 mt-2">۲۰۹,۴۵۰,۰۰۰ <span className="text-xs font-normal text-slate-400">تومان</span></p>
          <span className="text-[10px] text-slate-400 mt-1 block">انتقال شبا به حساب مجموعه‌ها</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>در انتظار تسویه هفتگی</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-400 mt-2">۱۴,۲۰۰,۰۰۰ <span className="text-xs font-normal text-slate-400">تومان</span></p>
          <span className="text-[10px] text-amber-300/80 mt-1 block">۱ درخواست در دست اقدام پایا</span>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-sm">لیست تسویه‌حساب‌های هفتگی با باشگاه‌ها</h4>
            <p className="text-[11px] text-slate-400">محاسبه خودکار سهم ۹۰٪ باشگاه‌ها پس از کسر کارمزد ۱۰٪ رالی</p>
          </div>
          <button
            onClick={() => alert('خروجی اکسل در حال آماده‌سازی')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی اکسل</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-right text-xs">
            <colgroup>
              <col className="w-24" />
              <col className="w-48" />
              <col className="w-56" />
              <col className="w-36" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-28" />
            </colgroup>
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">شناسه</th>
                <th className="p-3.5">نام مجموعه</th>
                <th className="p-3.5">شماره شبا مقصد</th>
                <th className="p-3.5">مبلغ واریزی</th>
                <th className="p-3.5">زمان ثبت</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400">{p.id}</td>
                  <td className="p-3.5 font-bold text-white">{p.clubName}</td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-300">{p.accountNumber}</td>
                  <td className="p-3.5 font-bold text-[#D7ED68]">
                    {p.amount.toLocaleString('fa-IR')} ت
                  </td>
                  <td className="p-3.5 text-slate-400">{p.date}</td>
                  <td className="p-3.5">
                    {p.status === 'PAID' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        واریز شده
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        در صف حواله
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {p.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleMarkAsPaid(p.id)}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                      >
                        تایید واریز
                      </button>
                    )}
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

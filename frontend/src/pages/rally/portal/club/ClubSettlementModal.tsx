import React, { useState } from 'react';
import { X, DollarSign, ArrowUpRight, CheckCircle2, Building, ShieldCheck, Clock } from 'lucide-react';

interface SettlementRecord {
  id: string;
  trackingCode: string;
  amount: number;
  date: string;
  iban: string;
  status: 'PAID' | 'PROCESSING';
}

interface ClubSettlementModalProps {
  onClose: () => void;
  clubName?: string;
}

const MOCK_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'SET-901',
    trackingCode: 'PAYA-9812401',
    amount: 14200000,
    date: 'امروز ۱۰:۱۵',
    iban: 'IR82-0120-0000-0000-1234-5678',
    status: 'PROCESSING'
  },
  {
    id: 'SET-900',
    trackingCode: 'PAYA-9765219',
    amount: 21500000,
    date: 'دیروز ۱۶:۳۰',
    iban: 'IR82-0120-0000-0000-1234-5678',
    status: 'PAID'
  },
  {
    id: 'SET-899',
    trackingCode: 'PAYA-9643105',
    amount: 18900000,
    date: '۳ روز پیش',
    iban: 'IR82-0120-0000-0000-1234-5678',
    status: 'PAID'
  }
];

export const ClubSettlementModal: React.FC<ClubSettlementModalProps> = ({
  onClose,
  clubName = 'باشگاه پدل لفور'
}) => {
  const [balance, setBalance] = useState(8700000);
  const [isRequested, setIsRequested] = useState(false);

  const handleRequestPayout = () => {
    if (balance <= 0) return;
    setIsRequested(true);
    setTimeout(() => {
      alert('درخواست تسویه حساب به شماره شبای باشگاه با موفقیت در سیکل پایا ثبت شد.');
      setBalance(0);
      setIsRequested(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" dir="rtl">
      <div className="w-full max-w-xl bg-[#0F1E2E] border border-white/15 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0B1724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">امور مالی و تسویه حساب پایا</h3>
              <p className="text-xs text-slate-400 mt-0.5">{clubName} • حساب رسمی باشگاه</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Balance & Action Box */}
          <div className="p-5 rounded-2xl bg-[#0B1724] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">موجودی آماده تسویه باشگاه:</span>
              <p className="text-2xl font-black text-[#D7ED68] font-mono mt-1">
                {balance.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-300">تومان</span>
              </p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                محاسبه بر مبنای ۹۷٪ خالص سهم باشگاه (۳٪ کارمزد رالی)
              </span>
            </div>

            <button
              onClick={handleRequestPayout}
              disabled={balance <= 0 || isRequested}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isRequested ? 'در حال ثبت...' : 'درخواست واریز به شبا'}</span>
            </button>
          </div>

          {/* IBAN Info */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">شماره شبای تاییدشده باشگاه:</span>
                <span className="text-white font-mono font-bold tracking-wider">
                  IR82 0120 0000 0000 1234 5678
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              تایید شاپرک
            </span>
          </div>

          {/* Past Settlements History */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D7ED68]" />
              <span>تاریخچه آخرین تسویه‌حساب‌ها</span>
            </h4>

            <div className="bg-[#07131F] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs table-fixed">
                <colgroup>
                  <col className="w-28" />
                  <col className="w-36" />
                  <col className="w-32" />
                  <col className="w-24" />
                </colgroup>
                <thead className="bg-[#0B1724] text-slate-400 font-bold border-b border-white/5">
                  <tr>
                    <th className="p-3">کد پایا</th>
                    <th className="p-3">مبلغ تسویه‌شده</th>
                    <th className="p-3">زمان</th>
                    <th className="p-3 text-center">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-[11px]">
                  {MOCK_SETTLEMENTS.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{s.trackingCode}</td>
                      <td className="p-3 font-mono font-bold text-white">
                        {s.amount.toLocaleString('fa-IR')} ت
                      </td>
                      <td className="p-3 text-slate-400">{s.date}</td>
                      <td className="p-3 text-center">
                        {s.status === 'PAID' ? (
                          <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            واریز شد
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold">سیکل بعد</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

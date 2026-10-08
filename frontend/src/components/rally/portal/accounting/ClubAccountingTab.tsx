import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { rallyApi } from '../../../../services/rallyApi';
import { NewTransactionModal, NewTransactionPayload } from './NewTransactionModal';
import { ClubZeroFeeDeskBanner } from './ClubZeroFeeDeskBanner';
import { toPersianDigits, formatPersianPrice } from '../../../../utils/persianUtils';

interface ClubAccountingTabProps {
  clubId: string;
  clubName: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  COURT_BOOKING_ONLINE: 'رزرو آنلاین کورت',
  COURT_BOOKING_MANUAL: 'رزرو باجه و تلفنی',
  BUFFET_CAFE: 'بوفه و کافه',
  EQUIPMENT_RENTAL: 'اجاره راکت و توپ',
  LOCKER_PARKING: 'کمد و پارکینگ',
  COACH_SHARE: 'سهم زمین از مربی',
  OTHER_INCOME: 'درآمد متفرقه',
  UTILITIES: 'قبوض برق و آب',
  RENT_CHARGE: 'اجاره بها و شارژ',
  MAINTENANCE: 'تعمیر و نگهداری چمن',
  SALARY: 'حقوق و دستمزد',
  SUPPLIES: 'خرید تجهیزات مصرفی',
  OTHER_EXPENSE: 'هزینه متفرقه',
};

const PAYMENT_NAMES: Record<string, string> = {
  ONLINE: 'آنلاین',
  POS: 'کارت‌خوان',
  CASH: 'نقد',
  CARD_TO_CARD: 'کارت به کارت',
  WALLET: 'کیف پول',
};

export const ClubAccountingTab: React.FC<ClubAccountingTabProps> = ({ clubId, clubName }) => {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchData = async () => {
    let startDate: string | undefined;
    const now = new Date();
    if (filterPeriod === 'TODAY') {
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    } else if (filterPeriod === 'WEEK') {
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
    } else if (filterPeriod === 'MONTH') {
      startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
    }

    try {
      const [sumData, txData] = await Promise.all([
        rallyApi.getClubAccountingSummary(clubId, startDate),
        rallyApi.getClubTransactions(clubId),
      ]);
      setSummary(sumData);
      setTransactions(txData || []);
    } catch {
      showToast('خطا در بارگذاری داده‌های مالی', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [clubId, filterPeriod]);

  const handleCreateTx = async (payload: NewTransactionPayload) => {
    const res = await rallyApi.createClubTransaction(clubId, payload);
    if (res.success) {
      showToast('سند مالی با موفقیت ثبت شد.');
      fetchData();
    } else {
      showToast(res.error || 'خطا در ثبت سند', 'error');
    }
  };

  const handleDeleteTx = async (txId: string) => {
    if (!window.confirm('آیا از حذف این سند مالی اطمینان دارید؟')) return;
    const res = await rallyApi.deleteClubTransaction(clubId, txId);
    if (res.success) {
      showToast('سند مالی حذف گردید.');
      fetchData();
    } else {
      showToast(res.error || 'خطا در حذف سند', 'error');
    }
  };

  const totalIncome = summary?.total_income || 0;
  const totalExpense = summary?.total_expense || 0;
  const netProfit = summary?.net_profit || 0;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          toastMsg.type === 'success' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1E30] p-4 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#D7ED68]" />
            امور مالی و دفاتر حسابداری: {clubName}
          </h2>
          <span className="text-xs text-slate-400 mt-0.5 block">دفتر کل درآمدهای کورت، باجه، بوفه و هزینه‌های عملیاتی</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Filter */}
          <div className="bg-[#050C14] p-1 rounded-xl border border-white/10 flex items-center gap-1 text-[11px] font-bold">
            <button
              onClick={() => setFilterPeriod('ALL')}
              className={`px-2.5 py-1 rounded-lg ${filterPeriod === 'ALL' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              همه
            </button>
            <button
              onClick={() => setFilterPeriod('MONTH')}
              className={`px-2.5 py-1 rounded-lg ${filterPeriod === 'MONTH' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              ۳۰ روز
            </button>
            <button
              onClick={() => setFilterPeriod('WEEK')}
              className={`px-2.5 py-1 rounded-lg ${filterPeriod === 'WEEK' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              ۷ روز
            </button>
            <button
              onClick={() => setFilterPeriod('TODAY')}
              className={`px-2.5 py-1 rounded-lg ${filterPeriod === 'TODAY' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              امروز
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D7ED68] text-[#07131F] hover:bg-[#c8de5b] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت سند جدید</span>
          </button>
        </div>
      </div>

      {/* 0% Platform Fee Banner for Desk / POS Booking */}
      <ClubZeroFeeDeskBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">درآمد کل دوره</span>
          <p className="text-lg font-black text-emerald-400 mt-1 flex items-baseline gap-1">
            <span>{formatPersianPrice(totalIncome)}</span>
            <span className="text-xs font-normal text-slate-300">تومان</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">آنلاین، باجه و بوفه</span>
        </div>

        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">هزینه‌های کل</span>
          <p className="text-lg font-black text-rose-400 mt-1 flex items-baseline gap-1">
            <span>{formatPersianPrice(totalExpense)}</span>
            <span className="text-xs font-normal text-slate-300">تومان</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">قبوض، نگهداری و حقوق</span>
        </div>

        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">سود خالص عملیاتی (P&L)</span>
          <p className={`text-lg font-black mt-1 flex items-baseline gap-1 ${netProfit >= 0 ? 'text-[#D7ED68]' : 'text-rose-400'}`}>
            <span>{formatPersianPrice(netProfit)}</span>
            <span className="text-xs font-normal text-slate-300">تومان</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">تراز تجاری قطعی دوره</span>
        </div>

        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">تعداد کل تراکنش‌ها</span>
          <p className="text-lg font-black text-white mt-1 flex items-baseline gap-1">
            <span>{toPersianDigits(summary?.transactions_count || transactions.length)}</span>
            <span className="text-xs font-normal text-slate-300">سند</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">ثبت‌شده در دفتر مالی</span>
        </div>
      </div>

      {/* Optimized Fixed Table */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#07131F]">
          <span className="text-xs font-black text-white">دفتر کل و ریز تراکنش‌های مالی</span>
          <span className="text-[11px] text-slate-400">{toPersianDigits(transactions.length)} تراکنش ثبت‌شده</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="bg-[#07131F] text-slate-400 text-[11px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-bold">شرح سند</th>
                <th className="py-3 px-4 font-bold">دسته‌بندی</th>
                <th className="py-3 px-4 font-bold">روش و پیگیری</th>
                <th className="py-3 px-4 font-bold">مبلغ (تومان)</th>
                <th className="py-3 px-4 font-bold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    هیچ سند مالی برای این بازه ثبت نشده است.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'INCOME';
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block truncate">{tx.title}</span>
                        {tx.contact_name && <span className="text-[10px] text-slate-400 block truncate">{tx.contact_name}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isIncome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {CATEGORY_NAMES[tx.category] || tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="block">{PAYMENT_NAMES[tx.payment_method] || tx.payment_method}</span>
                        {tx.reference_id && <span className="text-[10px] text-slate-400 block">کد: {toPersianDigits(tx.reference_id)}</span>}
                      </td>
                      <td className="py-3 px-4 font-black">
                        <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                          {isIncome ? '+' : '-'} {formatPersianPrice(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all"
                          title="حذف سند"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenantType="CLUB"
        onSubmit={handleCreateTx}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { rallyApi } from '../../../../services/rallyApi';
import { NewTransactionModal, NewTransactionPayload } from './NewTransactionModal';

interface CoachAccountingTabProps {
  coachId: string;
  coachName?: string;
}

const COACH_CATEGORY_NAMES: Record<string, string> = {
  PRIVATE_CLASS: 'جلسه آموزش خصوصی',
  PACKAGE_TUITION: 'شهریه پکیج آموزشی',
  SEMI_PRIVATE: 'کلاس دونفره/گروهی',
  OTHER_INCOME: 'درآمد متفرقه تدریس',
  COURT_RENTAL_FEE: 'اجاره کورت به باشگاه',
  EQUIPMENT_BALLS: 'خرید توپ و تجهیزات',
  TRANSPORT: 'ایاب و ذهاب',
  OTHER_EXPENSE: 'سایر هزینه‌های شخصی',
};

const PAYMENT_NAMES: Record<string, string> = {
  ONLINE: 'آنلاین',
  POS: 'کارت‌خوان',
  CASH: 'نقد',
  CARD_TO_CARD: 'کارت به کارت',
  WALLET: 'کیف پول',
};

export const CoachAccountingTab: React.FC<CoachAccountingTabProps> = ({ coachId, coachName }) => {
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
        rallyApi.getCoachAccountingSummary(coachId, startDate),
        rallyApi.getCoachTransactions(coachId),
      ]);
      setSummary(sumData);
      setTransactions(txData || []);
    } catch {
      showToast('خطا در دریافت داده‌های مالی مربی', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [coachId, filterPeriod]);

  const handleCreateTx = async (payload: NewTransactionPayload) => {
    const res = await rallyApi.createCoachTransaction(coachId, payload);
    if (res.success) {
      showToast('سند مالی مربی با موفقیت ثبت شد.');
      fetchData();
    } else {
      showToast(res.error || 'خطا در ثبت سند', 'error');
    }
  };

  const handleDeleteTx = async (txId: string) => {
    if (!window.confirm('آیا از حذف این سند مالی اطمینان دارید؟')) return;
    const res = await rallyApi.deleteCoachTransaction(coachId, txId);
    if (res.success) {
      showToast('سند مالی مربی حذف گردید.');
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
            <Award className="w-5 h-5 text-blue-400" />
            دفتر حساب و درآمد شخصی مربی {coachName ? `(${coachName})` : ''}
          </h2>
          <span className="text-xs text-slate-400 mt-0.5 block">مدیریت دریافتی‌های کلاس‌ها، کسر اجاره کورت و سود خالص تدریس</span>
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
            <span>ثبت درآمد / هزینه جدید</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">کل درآمد تدریس (ناخالص)</span>
          <p className="text-lg font-black text-emerald-400 mt-1">{totalIncome.toLocaleString()} <span className="text-xs font-normal text-slate-300">تومان</span></p>
          <span className="text-[10px] text-slate-400 mt-1 block">خصوصی، پکیج و کارگاه</span>
        </div>

        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">کسورات و هزینه‌های مربی</span>
          <p className="text-lg font-black text-rose-400 mt-1">{totalExpense.toLocaleString()} <span className="text-xs font-normal text-slate-300">تومان</span></p>
          <span className="text-[10px] text-slate-400 mt-1 block">اجاره زمین و خرید توپ</span>
        </div>

        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">دریافتی خالص مربی</span>
          <p className={`text-lg font-black mt-1 ${netProfit >= 0 ? 'text-[#D7ED68]' : 'text-rose-400'}`}>
            {netProfit.toLocaleString()} <span className="text-xs font-normal text-slate-300">تومان</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">سود خالص واریزی</span>
        </div>

        <div className="bg-[#0B1E30] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">تعداد کل اسناد مالی</span>
          <p className="text-lg font-black text-white mt-1">{summary?.transactions_count || transactions.length} <span className="text-xs font-normal text-slate-300">سند</span></p>
          <span className="text-[10px] text-slate-400 mt-1 block">ثبت در دفتر حساب</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#07131F]">
          <span className="text-xs font-black text-white">ریز اسناد مالی و دریافتی از شاگردان</span>
          <span className="text-[11px] text-slate-400">{transactions.length} رکورد مالی</span>
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
                <th className="py-3 px-4 font-bold">عنوان کلاس / سند</th>
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
                    هیچ رکورد مالی برای این بازه ثبت نشده است.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'INCOME';
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block truncate">{tx.title}</span>
                        {tx.contact_name && <span className="text-[10px] text-slate-400 block truncate">شاگرد: {tx.contact_name}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isIncome ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {COACH_CATEGORY_NAMES[tx.category] || tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="block">{PAYMENT_NAMES[tx.payment_method] || tx.payment_method}</span>
                        {tx.reference_id && <span className="text-[10px] text-slate-400 font-mono block">کد: {tx.reference_id}</span>}
                      </td>
                      <td className="py-3 px-4 font-black">
                        <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                          {isIncome ? '+' : '-'} {tx.amount.toLocaleString()}
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
        tenantType="COACH"
        onSubmit={handleCreateTx}
      />
    </div>
  );
};

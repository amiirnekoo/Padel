import React, { useState } from 'react';
import { X, PlusCircle, DollarSign, Tag, Calendar, User, FileText, CreditCard } from 'lucide-react';

export interface NewTransactionPayload {
  transaction_type: 'INCOME' | 'EXPENSE';
  category: string;
  title: string;
  amount: number;
  payment_method: string;
  contact_name?: string;
  reference_id?: string;
  description?: string;
}

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantType: 'CLUB' | 'COACH';
  onSubmit: (payload: NewTransactionPayload) => Promise<void>;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  tenantType,
  onSubmit,
}) => {
  const isClub = tenantType === 'CLUB';
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState(isClub ? 'COURT_BOOKING_MANUAL' : 'PRIVATE_CLASS');
  const [paymentMethod, setPaymentMethod] = useState('POS');
  const [contactName, setContactName] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const clubIncomeCategories = [
    { id: 'COURT_BOOKING_MANUAL', label: 'رزرو باجه و تلفنی' },
    { id: 'BUFFET_CAFE', label: 'بوفه و کافه باشگاه' },
    { id: 'EQUIPMENT_RENTAL', label: 'اجاره راکت و توپ' },
    { id: 'LOCKER_PARKING', label: 'کمد، رختکن و پارکینگ' },
    { id: 'COACH_SHARE', label: 'سهم زمین از کلاس مربی' },
    { id: 'OTHER_INCOME', label: 'سایر درآمدهای متفرقه' },
  ];

  const clubExpenseCategories = [
    { id: 'UTILITIES', label: 'قبوض (برق پروژکتور، آب، گاز)' },
    { id: 'RENT_CHARGE', label: 'اجاره بها و شارژ مجموعه' },
    { id: 'MAINTENANCE', label: 'تعمیر و نگهداری (چمن، شیشه)' },
    { id: 'SALARY', label: 'حقوق پرسنل و متصدیان' },
    { id: 'SUPPLIES', label: 'خرید توپ و اقلام مصرفی' },
    { id: 'OTHER_EXPENSE', label: 'سایر هزینه‌های متفرقه' },
  ];

  const coachIncomeCategories = [
    { id: 'PRIVATE_CLASS', label: 'جلسه آموزش خصوصی' },
    { id: 'PACKAGE_TUITION', label: 'شهریه پکیج آموزشی (۵ یا ۱۰ جلسه)' },
    { id: 'SEMI_PRIVATE', label: 'کلاس دونفره یا گروهی' },
    { id: 'OTHER_INCOME', label: 'سایر درآمدهای مربیگری' },
  ];

  const coachExpenseCategories = [
    { id: 'COURT_RENTAL_FEE', label: 'اجاره کورت به باشگاه' },
    { id: 'EQUIPMENT_BALLS', label: 'خرید توپ و سبد تمرین' },
    { id: 'TRANSPORT', label: 'ایاب و ذهاب و سفر مسابقات' },
    { id: 'OTHER_EXPENSE', label: 'سایر هزینه‌های شخصی' },
  ];

  const currentCategories = isClub
    ? txType === 'INCOME' ? clubIncomeCategories : clubExpenseCategories
    : txType === 'INCOME' ? coachIncomeCategories : coachExpenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setErrorMsg('لطفاً عنوان و مبلغ معتبر را وارد نمایید.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await onSubmit({
        transaction_type: txType,
        category,
        title: title.trim(),
        amount: Number(amount),
        payment_method: paymentMethod,
        contact_name: contactName.trim() || undefined,
        reference_id: referenceId.trim() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در ثبت تراکنش');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" dir="rtl">
      <div className="bg-[#0B1E30] border border-white/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-[#07131F] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#D7ED68]" />
            <h3 className="font-extrabold text-sm text-white">
              ثبت سند مالی جدید ({isClub ? 'باشگاه‌دار' : 'مربی'})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Type Toggle: INCOME vs EXPENSE */}
          <div className="grid grid-cols-2 gap-2 bg-[#050C14] p-1.5 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setTxType('INCOME');
                setCategory(isClub ? 'COURT_BOOKING_MANUAL' : 'PRIVATE_CLASS');
              }}
              className={`py-2 text-xs font-black rounded-lg transition-all ${
                txType === 'INCOME' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              + ثبت درآمد (ورودی)
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('EXPENSE');
                setCategory(isClub ? 'UTILITIES' : 'COURT_RENTAL_FEE');
              }}
              className={`py-2 text-xs font-black rounded-lg transition-all ${
                txType === 'EXPENSE' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              - ثبت هزینه (خروجی)
            </button>
          </div>

          {/* Title & Amount */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold block">شرح یا عنوان سند</label>
            <input
              type="text"
              required
              placeholder={isClub ? 'مثال: قبض برق شهریور یا درآمد بوفه' : 'مثال: جلسه خصوصی یا خرید توپ هد'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#050C14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D7ED68] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">مبلغ (تومان)</label>
              <input
                type="number"
                required
                min={1000}
                placeholder="مبلغ به تومان"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-[#050C14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D7ED68] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">دسته‌بندی</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#050C14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D7ED68] outline-none"
              >
                {currentCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method & Contact Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">روش پرداخت</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#050C14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D7ED68] outline-none"
              >
                <option value="POS">دستگاه کارت‌خوان (POS)</option>
                <option value="CARD_TO_CARD">کارت به کارت</option>
                <option value="CASH">وجه نقد</option>
                <option value="ONLINE">آنلاین / درگاه اینترنتی</option>
                <option value="WALLET">کیف پول رالی</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">نام طرف حساب / شاگرد (اختیاری)</label>
              <input
                type="text"
                placeholder="نام مشتری یا فروشنده"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-[#050C14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D7ED68] outline-none"
              />
            </div>
          </div>

          {/* Reference ID & Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold block">شماره ارجاع / فاکتور (اختیاری)</label>
            <input
              type="text"
              placeholder="کد پیگیری یا شماره فاکتور"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full bg-[#050C14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D7ED68] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold block">توضیحات تکمیلی (اختیاری)</label>
            <textarea
              rows={2}
              placeholder="یادداشت و جزئیات سند..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#050C14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#D7ED68] outline-none resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#D7ED68] text-[#07131F] hover:bg-[#c8de5b] transition-all disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : 'تایید و ثبت در دفتر کل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

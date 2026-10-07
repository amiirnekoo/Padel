import React, { useState } from 'react';
import { X, PhoneCall, Check, CreditCard, Banknote, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import { GridSlotItem } from './types';

interface QuickManualBookingModalProps {
  slot: GridSlotItem;
  courtName: string;
  onClose: () => void;
  onSubmit: (bookingData: {
    slotId: string;
    customerName: string;
    phone: string;
    paymentMethod: 'POS' | 'CARD_TO_CARD' | 'CASH';
    racketsCount: number;
    notes?: string;
  }) => void;
}

export const QuickManualBookingModal: React.FC<QuickManualBookingModalProps> = ({
  slot,
  courtName,
  onClose,
  onSubmit
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'POS' | 'CARD_TO_CARD' | 'CASH'>('POS');
  const [racketsCount, setRacketsCount] = useState<number>(0);
  const [sendSms, setSendSms] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('لطفاً نام مشتری را وارد کنید.');
      return;
    }
    onSubmit({
      slotId: slot.id,
      customerName: customerName.trim(),
      phone: phone.trim(),
      paymentMethod,
      racketsCount,
      notes: sendSms ? 'پیامک تایید ارسال شد' : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" dir="rtl">
      <div className="w-full max-w-lg bg-[#0F1E2E] border border-white/15 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0B1724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rally-primary/20 border border-rally-primary/40 flex items-center justify-center text-[#D7ED68]">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">ثبت سریع رزرو تلفنی / حضوری</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {courtName} • ساعت {slot.time}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Price Badge */}
          <div className="bg-[#0B1724] border border-white/10 p-3.5 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-400">مبلغ سانس ۹۰ دقیقه‌ای:</span>
            <span className="text-sm font-black text-[#D7ED68] font-mono">
              {slot.price.toLocaleString('fa-IR')} تومان
            </span>
          </div>

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                نام و نام خانوادگی مشتری <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="مثال: علیرضا شمس"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7ED68]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شماره همراه (اختیاری جهت پیامک)
              </label>
              <input
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#D7ED68]"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">روش پرداخت در باشگاه:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'POS', label: 'کارتخوان (پوز)', icon: CreditCard },
                { id: 'CARD_TO_CARD', label: 'کارت‌به‌کارت', icon: Smartphone },
                { id: 'CASH', label: 'نقدی', icon: Banknote }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rally-primary/20 border-rally-primary text-white shadow-xs'
                        : 'bg-[#07131F] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D7ED68]' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons: Racket Rental */}
          <div className="bg-[#0B1724] border border-white/10 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">اجاره راکت پدل:</span>
              <span className="text-[10px] text-slate-400">تحویل در باجه پذیرش باشگاه</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRacketsCount(count)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    racketsCount === count
                      ? 'bg-[#D7ED68] text-[#07131F] font-black'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {count === 0 ? 'هیچ' : `${count}`}
                </button>
              ))}
            </div>
          </div>

          {/* SMS Notification Checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
              className="w-4 h-4 rounded text-rally-primary bg-[#07131F] border-white/20 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D7ED68]" />
              ارسال پیامک تایید رسمی با سرشماره و نام باشگاه برای مشتری
            </span>
          </label>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-rally-primary hover:bg-rally-primary/90 text-white flex items-center gap-1.5 shadow-lg shadow-rally-primary/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#D7ED68]" />
              <span>ثبت قطعی در تقویم</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { X, PhoneCall } from 'lucide-react';

export interface CourtSlotItem {
  id: string;
  time: string;
  price: number;
  status: 'OPEN' | 'BOOKED' | 'LOCKED';
  bookedBy?: string;
  phone?: string;
  paymentMethod?: string;
}

interface ManualBookingModalProps {
  isOpen: boolean;
  slot: CourtSlotItem | null;
  customerName: string;
  customerPhone: string;
  payMethod: string;
  onCustomerNameChange: (val: string) => void;
  onCustomerPhoneChange: (val: string) => void;
  onPayMethodChange: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  isOpen,
  slot,
  customerName,
  customerPhone,
  payMethod,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onPayMethodChange,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !slot) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#D7ED68]" />
            <h4 className="font-bold text-white text-sm">ثبت رزرو حضوری / تلفنی باجه</h4>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <div>
            سانس انتخابی: <strong className="text-white font-mono">{slot.time}</strong>
          </div>
          <div>
            مبلغ سانس: <strong className="text-[#D7ED68] font-mono">{slot.price.toLocaleString('fa-IR')} تومان</strong>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-slate-300 block mb-1">نام و نام خانوادگی مشتری:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="مثال: علی رضایی"
              className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-300 block mb-1">شماره تماس (اختیاری جهت پیامک):</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              placeholder="۰۹۱۲..."
              className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-300 block mb-1">روش پرداخت:</label>
            <select
              value={payMethod}
              onChange={(e) => onPayMethodChange(e.target.value)}
              className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary"
            >
              <option value="POS">دستگاه کارت‌خوان باشگاه (POS)</option>
              <option value="CASH">نقدی / واریز به کارت باشگاه</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onConfirm}
            disabled={!customerName.trim()}
            className="flex-1 py-2 bg-rally-primary hover:bg-rally-primary/80 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            تایید و قفل سانس
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs cursor-pointer"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

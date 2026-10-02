import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BookingReceipt } from '../../types/rally';

interface BookingReceiptViewProps {
  receipt: BookingReceipt;
  onClose: () => void;
}

export const BookingReceiptView: React.FC<BookingReceiptViewProps> = ({ receipt, onClose }) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h4 className="text-base font-black text-rally-charcoal">رزرو با موفقیت قطعی شد</h4>
        <p className="text-xs text-gray-500">پیامک تأیید و شناسه ورود به کورت برای شما ارسال گردید.</p>
      </div>

      <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 space-y-3 text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <span className="text-gray-400">شناسه پیگیری (Tracking ID):</span>
          <span className="font-black text-rally-primary font-mono">{receipt.trackingCode}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-400 block text-[10px]">کلوپ:</span>
            <span className="font-bold text-gray-800">{receipt.clubName}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">ساعت سانس:</span>
            <span className="font-bold text-gray-800">{receipt.timeSlot}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-500">مبلغ پرداخت‌شده:</span>
          <span className="font-extrabold text-gray-900">{(receipt.totalAmount / 10).toLocaleString('fa-IR')} تومان</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-rally-primary text-white text-xs font-bold hover:bg-rally-primary-light transition-all cursor-pointer min-h-[44px]"
        >
          بازگشت به سایت
        </button>
      </div>
    </div>
  );
};

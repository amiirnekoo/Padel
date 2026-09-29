import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ShopOrderReceipt } from '../../../types/rally';

interface ShopReceiptModalProps {
  receipt: ShopOrderReceipt | null;
  onClose: () => void;
}

export const ShopReceiptModal: React.FC<ShopReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-200">
        <CheckCircle2 className="w-16 h-16 text-sky-500 mx-auto mb-3" />
        <h3 className="text-lg font-black text-gray-900 mb-1">سفارش شما با موفقیت ثبت شد</h3>
        <p className="text-xs text-gray-500 mb-4">
          کد پیگیری انحصاری مرسوله: <span className="font-mono font-bold text-rally-primary">{receipt.trackingCode}</span>
        </p>
        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1.5 text-right mb-5">
          <div className="flex justify-between font-bold">
            <span>تعداد اقلام:</span>
            <span>{receipt.items.reduce((s, i) => s + i.quantity, 0)} کالا</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>مبلغ پرداخت‌شده:</span>
            <span className="text-sky-600 font-black">{receipt.totalAmount.toLocaleString('fa-IR')} تومان</span>
          </div>
          <div className="flex justify-between">
            <span>روش پرداخت:</span>
            <span>{receipt.paymentMethod === 'WALLET' ? 'کسر از کیف پول رالی' : 'درگاه بانکی شتاب'}</span>
          </div>
          <div className="flex justify-between truncate">
            <span>آدرس تحویل:</span>
            <span className="truncate max-w-[200px]">{receipt.deliveryAddress}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-rally-primary text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
        >
          متوجه شدم و بازگشت به فروشگاه
        </button>
      </div>
    </div>
  );
};

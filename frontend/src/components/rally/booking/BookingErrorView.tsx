import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface BookingErrorViewProps {
  errorMessage: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export const BookingErrorView: React.FC<BookingErrorViewProps> = ({
  errorMessage,
  onRetry,
  onClose,
}) => {
  return (
    <div className="space-y-4 text-center">
      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
      <h4 className="text-base font-bold text-gray-900">نیاز به بررسی وضعیت</h4>
      <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
        {errorMessage || 'خطایی رخ داده است. لطفاً وضعیت سانس را مجدداً بررسی فرمایید.'}
      </p>

      <div className="pt-3 flex gap-2">
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          تلاش مجدد / تغییر سانس
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-rally-primary text-white text-xs font-bold cursor-pointer hover:bg-rally-primary-light"
        >
          پیگیری با پشتیبانی رالی
        </button>
      </div>
    </div>
  );
};

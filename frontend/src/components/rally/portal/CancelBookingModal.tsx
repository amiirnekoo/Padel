import React from 'react';
import { AlertCircle, Clock, X } from 'lucide-react';

interface CancelBookingModalProps {
  item: any | null;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  item,
  onClose,
  onConfirm,
  isCancelling,
}) => {
  if (!item) return null;

  const amountToman = item.amount_toman || item.amount_paid / 10 || 0;
  const refundEstimated = Math.floor(amountToman * 0.9);
  const penaltyEstimated = amountToman - refundEstimated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" dir="rtl">
      <div className="bg-[#0B1724] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>تأیید لغو رزرو سانس</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <div className="bg-white/5 p-3 rounded-xl space-y-1">
            <p className="font-bold text-white">{item.club_name || 'باشگاه پدل رالی'}</p>
            <p className="text-slate-400">زمین: {item.court_name || 'کورت سنترال'}</p>
            <p className="text-slate-400">تاریخ: {item.slot_date} | ساعت: {item.start_time} تا {item.end_time}</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-2 text-amber-200">
            <div className="flex items-center justify-between text-xs">
              <span>مبلغ پرداختی شما:</span>
              <strong className="text-white">{amountToman.toLocaleString('fa-IR')} تومان</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>کسر جریمه قانونی (۱۰٪ کنسلی بالای ۲۴ ساعت):</span>
              <span className="text-rose-300">-{penaltyEstimated.toLocaleString('fa-IR')} تومان</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-amber-500/20 text-[#D7ED68]">
              <span>مبلغ قابل استرداد به کیف پول:</span>
              <span>{refundEstimated.toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            * بر اساس قوانین مصوب مجموعه، لغو کمتر از ۲۴ ساعت مانده به سانس غیرقابل استرداد است و لغو بالای ۲۴ ساعت مشمول ۱۰٪ جریمه کنسلی می‌باشد. وجه مسترد شده بلافاصله به کیف پول رالی شما اضافه خواهد شد.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            انصراف و بازگشت
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isCancelling}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isCancelling ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>در حال لغو...</span>
              </>
            ) : (
              <span>تأیید نهایی لغو و استرداد</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

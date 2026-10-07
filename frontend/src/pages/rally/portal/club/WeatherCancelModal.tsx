import React from 'react';
import { X, CloudRain, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface WeatherCancelModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const WeatherCancelModal: React.FC<WeatherCancelModalProps> = ({
  onClose,
  onConfirm,
  isProcessing = false
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" dir="rtl">
      <div className="w-full max-w-md bg-[#0F1E2E] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0B1724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">کنسلی اضطراری بارندگی و شرایط جوی</h3>
              <p className="text-xs text-amber-300/80 mt-0.5">ویژه کورت‌های روباز و شرایط نامساعد هوا</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 space-y-1">
              <p className="font-bold">با تایید این عملیات، اقدامات زیر به صورت خودکار انجام می‌شوند:</p>
              <ul className="list-disc list-inside text-[11px] text-amber-200/80 space-y-0.5 pt-1">
                <li>تمامی سانس‌های باقی‌مانده کورت‌های روباز امروز مسدود می‌شوند.</li>
                <li>۱۰۰٪ مبلغ رزروهای آنلاین فوراً به کیف پول بازیکنان بازگردانده می‌شود.</li>
                <li>پیامک رسمی پوزش باشگاه با دلیل بارندگی برای همه رزروکنندگان ارسال می‌گردد.</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            این قابلیت مانع از تماس‌های مکرر و اعتراض بازیکنان شده و اعتبار باشگاه شما را در روزهای بارانی ۱۰۰٪ حفظ می‌کند.
          </p>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال لغو و عودت مبالغ...</span>
                </>
              ) : (
                <>
                  <CloudRain className="w-4 h-4" />
                  <span>تایید و اعلام کنسلی جوی</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

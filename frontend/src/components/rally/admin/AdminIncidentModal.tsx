import React, { useState } from 'react';
import { X, AlertTriangle, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface AdminIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminIncidentModal: React.FC<AdminIncidentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('WARNING');
  const [category, setCategory] = useState<'COURT' | 'PAYMENT' | 'SHOP' | 'TECH' | 'DISPUTE'>('COURT');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('ادمین عملیاتی');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('لطفاً عنوان و شرح گزارش را وارد نمایید.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await rallyApi.reportAdminIncident({
      title,
      severity,
      category,
      description,
      reporter_name: reporterName
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setTitle('');
        setDescription('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.error || 'خطا در ثبت گزارش');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">گزارش حادثه / هشدار فوری به مالک</h3>
              <p className="text-[11px] text-slate-400">اطلاع‌رسانی بلادرنگ اختلالات به مدیریت ارشد پلتفرم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="py-10 text-center flex flex-col items-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-3 animate-bounce" />
            <h4 className="font-bold text-base text-emerald-300">گزارش با موفقیت ثبت و ارسال شد</h4>
            <p className="text-xs text-slate-400 mt-1">مالک پلتفرم بلافاصله از این واقعه مطلع خواهد شد.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {errorMsg && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">عنوان حادثه یا مشکل</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً شکستگی شیشه کورت شماره ۲ یا قطعی درگاه"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">سطح فوریت (Severity)</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="CRITICAL">بحرانی (نیازمند اقدام فوری)</option>
                  <option value="WARNING">اخطار / نیمه فوری</option>
                  <option value="INFO">اطلاع‌رسانی عمومی</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">بخش درگیر</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="COURT">زمین و کورت‌ها</option>
                  <option value="PAYMENT">مالی و پرداخت‌ها</option>
                  <option value="SHOP">فروشگاه و انبار کالا</option>
                  <option value="TECH">فنی و سرور</option>
                  <option value="DISPUTE">اعتراض و مغایرت مشتری</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">شرح دقیق واقعه و اقدامات انجام‌شده</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیح دهید چه اتفاقی افتاده و چه اقدام اولیه‌ای توسط شما صورت گرفته است..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">نام ثبت‌کننده گزارش</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'در حال ارسال...' : 'ثبت و ارسال هشدار به مالک'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

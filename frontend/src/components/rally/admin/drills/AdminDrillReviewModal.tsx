import React, { useState } from 'react';
import { DrillDetail } from '../../../../types/drills';
import { drillsApi } from '../../../../services/drillsApi';
import { X, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AdminDrillReviewModalProps {
  drill: DrillDetail;
  onClose: () => void;
  onSuccess: () => void;
  adminToken?: string;
}

export const AdminDrillReviewModal: React.FC<AdminDrillReviewModalProps> = ({
  drill,
  onClose,
  onSuccess,
  adminToken
}) => {
  const [suitabilityApproved, setSuitabilityApproved] = useState(true);
  const [movementClarityApproved, setMovementClarityApproved] = useState(true);
  const [mediaSyncApproved, setMediaSyncApproved] = useState(true);
  const [pedagogicalNotes, setPedagogicalNotes] = useState('');
  const [safetyNotes, setSafetyNotes] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReview = async (action: 'APPROVE' | 'REJECT') => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (action === 'APPROVE') {
        if (!suitabilityApproved || !movementClarityApproved || !mediaSyncApproved) {
          throw new Error('برای تایید نهایی تمرین، تمامی موارد چک‌لیست الزامی (تناسب، وضوح و هماهنگی) باید تایید شوند.');
        }
      }

      const verifiedMediaIds = (drill.media_items || []).map((m: any) => m.id);

      await drillsApi.reviewDrill(
        drill.id,
        action,
        generalNotes,
        {
          suitability_approved: suitabilityApproved,
          movement_clarity_approved: movementClarityApproved,
          media_sync_approved: mediaSyncApproved,
          pedagogical_notes: pedagogicalNotes.trim() || undefined,
          safety_notes: safetyNotes.trim() || undefined,
          verified_media_ids: verifiedMediaIds
        },
        adminToken
      );

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت بازبینی تخصصی');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" dir="rtl">
      <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-2xl p-6 text-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              فرم بازبینی تخصصی ورزشی (v{drill.content_version || 1})
            </h3>
            <p className="text-xs text-slate-400 mt-1">{drill.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-4 space-y-4 text-sm">
          {/* Checklist */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h4 className="font-semibold text-xs text-slate-300">چک‌لیست ارزیابی کیفی و فنی</h4>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={suitabilityApproved}
                onChange={(e) => setSuitabilityApproved(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
              />
              <span className="text-xs text-slate-200">تناسب آموزش با ورزش، سطح مهارتی و هدف تعیین‌شده</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={movementClarityApproved}
                onChange={(e) => setMovementClarityApproved(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
              />
              <span className="text-xs text-slate-200">وضوح نمایش حرکت، زاویه صفحه راکت و استقرار بدن</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mediaSyncApproved}
                onChange={(e) => setMediaSyncApproved(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
              />
              <span className="text-xs text-slate-200">هماهنگی کامل متن گام‌ها، ویدیو و زیرنویس فارسی</span>
            </label>
          </div>

          {/* Pedagogical Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              اشتباه یا ابهام آموزشی (اختیاری):
            </label>
            <input
              type="text"
              value={pedagogicalNotes}
              onChange={(e) => setPedagogicalNotes(e.target.value)}
              placeholder="مثال: در گام ۲، تاکید بیشتری بر چرخش کامل سرشانه نیاز است."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Safety Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              نکات احتیاطی و ایمنی لازم (اختیاری):
            </label>
            <input
              type="text"
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              placeholder="مثال: رعایت حداقل فاصله از شیشه پشت در اجرای ضربات هوایی."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* General Review Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              توضیحات و گزارش کلی بازبین:
            </label>
            <textarea
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="توضیحات مربوط به تایید یا موارد نیازمند اصلاح برای تهیه‌کننده..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-slate-500 resize-none"
            />
          </div>

          {/* Notice */}
          <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              قانون استقلال بازبین: طبق قوانین حاکمیتی رالی، شخص نویسنده یا ویرایشگران این نسخه اجازه بازبینی نسخه خود را ندارند و تایید باید منحصراً توسط بازبین مستقل انجام شود.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => handleReview('REJECT')}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-rose-300 bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded-xl transition flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            نیاز به اصلاح (رد)
          </button>
          <button
            type="button"
            onClick={() => handleReview('APPROVE')}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? 'در حال ثبت...' : 'تایید رسمی نسخه'}
          </button>
        </div>
      </div>
    </div>
  );
};

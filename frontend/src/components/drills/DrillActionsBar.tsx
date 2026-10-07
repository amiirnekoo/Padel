import React, { useState, useRef } from 'react';
import { Bookmark, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { drillsApi } from '../../services/drillsApi';

interface DrillActionsBarProps {
  drillId: string;
  isBookmarked?: boolean;
  bookmarkCount: number;
  completionCount: number;
  userToken?: string | null;
  onRequireAuth: () => void;
  onBookmarkChanged: (newStatus: boolean, newCount: number) => void;
  onCompletionLogged: (newCount: number) => void;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const DrillActionsBar: React.FC<DrillActionsBarProps> = ({
  drillId,
  isBookmarked = false,
  bookmarkCount,
  completionCount,
  userToken,
  onRequireAuth,
  onBookmarkChanged,
  onCompletionLogged
}) => {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [justCompletedMessage, setJustCompletedMessage] = useState<string | null>(null);

  // Dedicated Idempotency Key state. Kept identical on retries, regenerated only upon success.
  const idempotencyKeyRef = useRef<string>(generateUUID());

  const handleToggleBookmark = async () => {
    if (!userToken) {
      onRequireAuth();
      return;
    }
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      const res = await drillsApi.toggleBookmark(drillId, userToken);
      onBookmarkChanged(res.is_bookmarked, res.bookmark_count);
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت نشان');
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleLogCompletion = async () => {
    if (!userToken) {
      onRequireAuth();
      return;
    }
    if (isCompleting) return;

    setIsCompleting(true);
    setCompletionError(null);
    setJustCompletedMessage(null);

    const currentKey = idempotencyKeyRef.current;

    try {
      const res = await drillsApi.logCompletion(
        drillId,
        currentKey,
        { notes: 'گزارش اجرای تمرین توسط کاربر' },
        userToken
      );

      // Only update counter with verified server response
      onCompletionLogged(res.completion_count);
      setJustCompletedMessage('گزارش انجام تمرین با موفقیت ثبت شد.');

      // After successful execution, generate a fresh idempotency key for future attempts
      idempotencyKeyRef.current = generateUUID();
    } catch (err: any) {
      // Keep the current idempotency key so that retrying sends the same key
      setCompletionError(err.message || 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleToggleBookmark}
          disabled={isBookmarking}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            isBookmarked
              ? 'bg-slate-900 text-rally-accent border-slate-900 shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-rally-accent' : ''}`} />
          <span>{isBookmarked ? 'نشان‌شده در تمرینات من' : 'نشان کردن تمرین'}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/20 font-mono">
            {bookmarkCount.toLocaleString('fa-IR')}
          </span>
        </button>

        {/* Log Completion Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogCompletion}
            disabled={isCompleting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isCompleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>ثبت «انجام دادم»</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-emerald-800 text-emerald-100 font-mono">
              {completionCount.toLocaleString('fa-IR')}
            </span>
          </button>
        </div>
      </div>

      {/* Network Error and Retry Notification */}
      {completionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{completionError}</span>
          </div>
          <button
            type="button"
            onClick={handleLogCompletion}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 cursor-pointer shrink-0"
          >
            تلاش مجدد (Retry)
          </button>
        </div>
      )}

      {/* Success Notification */}
      {justCompletedMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{justCompletedMessage}</span>
        </div>
      )}

      {/* Honest User Clarification Notice */}
      <p className="text-[10px] text-slate-400 leading-normal">
        * ثبت انجام صرفاً گزارش خوداظهاری شماست و معیاری برای رتبه‌بندی ورزشی، برآورد کالری یا گواهی مهارت نیست.
      </p>
    </div>
  );
};

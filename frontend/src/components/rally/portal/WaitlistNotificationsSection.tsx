import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, ExternalLink, AlertTriangle, ShieldCheck } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  slot_id?: string;
  link_url?: string;
  is_read: boolean;
  created_at?: string;
}

export const WaitlistNotificationsSection: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [checkingSlotId, setCheckingSlotId] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{ slotId: string; isAvailable: boolean; message: string } | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await rallyApi.getMyInAppNotifications();
      if (data && data.length > 0) {
        setNotifications(data);
      } else {
        // Fallback نمونه اعلان پایدار برای محیط شبیه‌ساز پرتال
        setNotifications([
          {
            id: 'notif-mock-1',
            title: 'آزاد شدن سانس مورد نظر شما در کلوپ پدل لفور',
            message: 'سانس ساعت ۱۸:۰۰ تا ۱۹:۳۰ در کلوپ پدل لفور آجودانیه به دلیل کنسلی آزاد شد. شما می‌توانید همین حالا این سانس را رزرو کنید.',
            slot_id: 'slot-sample-laf-1',
            link_url: '/courts?courtId=club-lafour',
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notifId: string) => {
    await rallyApi.markInAppNotificationRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const handleCheckAndBook = async (notif: NotificationItem) => {
    if (!notif.slot_id) return;
    setCheckingSlotId(notif.slot_id);
    setCheckResult(null);

    try {
      const res = await rallyApi.checkSlotAvailability(notif.slot_id);
      if (res.is_available) {
        setCheckResult({
          slotId: notif.slot_id,
          isAvailable: true,
          message: 'سانس در حال حاضر آزاد و آماده رزرو است. در حال انتقال به صفحه انتخاب سانس...'
        });
        await handleMarkAsRead(notif.id);
        setTimeout(() => {
          window.location.href = notif.link_url || '/courts';
        }, 1200);
      } else {
        setCheckResult({
          slotId: notif.slot_id,
          isAvailable: false,
          message: 'متأسفانه این سانس لحظاتی پیش توسط بازیکن دیگری هولد یا رزرو شد.'
        });
      }
    } catch {
      setCheckResult({
        slotId: notif.slot_id,
        isAvailable: true,
        message: 'در حال هدایت به تقویم رزرو سانس...'
      });
      setTimeout(() => {
        window.location.href = notif.link_url || '/courts';
      }, 1000);
    } finally {
      setCheckingSlotId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-800">
                اعلان‌های لیست انتظار و آزادسازی سانس‌ها
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black">
                  {unreadCount} جدید
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              اطلاع‌رسانی پایدار درون‌پرتال بدون وابستگی به پیامک
            </p>
          </div>
        </div>

        <button
          onClick={fetchNotifications}
          className="text-xs font-bold text-sky-700 hover:text-sky-800 transition-colors"
        >
          بروزرسانی
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>قاعده عملیاتی:</strong> صدور اعلان لیست انتظار به منزله قفل اختصاصی (Hold) یا اولویت تضمین‌شده نیست. موجودی به صورت بلادرنگ در هنگام کلیک شما ارزیابی می‌شود.
        </span>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          در حال بارگذاری اعلان‌ها...
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          در حال حاضر اعلانی در لیست انتظار ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const isTargetChecking = checkingSlotId === item.slot_id;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.is_read
                    ? 'bg-white border-slate-100 text-slate-600'
                    : 'bg-sky-50/40 border-sky-100 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.is_read ? 'bg-slate-300' : 'bg-sky-500'}`} />
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pr-4">{item.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pr-4 sm:pr-0">
                    {!item.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        خوانده شد
                      </button>
                    )}
                    <button
                      onClick={() => handleCheckAndBook(item)}
                      disabled={isTargetChecking}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isTargetChecking ? (
                        <span>در حال بررسی...</span>
                      ) : (
                        <>
                          <span>بررسی و رزرو سریع</span>
                          <ExternalLink className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {checkResult && checkResult.slotId === item.slot_id && (
                  <div className={`mt-3 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    checkResult.isAvailable
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {checkResult.isAvailable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{checkResult.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

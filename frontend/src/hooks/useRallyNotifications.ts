import { useState, useEffect, useCallback } from 'react';
import { RallyNotificationItem } from '../types/notification';

const INITIAL_NOTIFICATIONS: RallyNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'یادآوری سانس رزرو شده',
    message: 'سانس پدل شما امروز ساعت ۲۰:۰۰ در کورت شماره ۱ کلوپ پدل انقلاب رزرو است. لطفاً ۱۵ دقیقه زودتر در مجموعه حضور داشته باشید.',
    type: 'BOOKING_REMINDER',
    timestamp: '۱۰ دقیقه پیش',
    read: false,
    actionUrl: '/courts',
  },
  {
    id: 'notif-2',
    title: 'بازی مچ‌میکینگ متناسب با رده شما',
    message: 'یک مسابقه دابلز جدید در سطح C+ ایجاد شده و به یک بازیکن راست‌دست (Drive) نیاز دارد.',
    type: 'MATCHMAKING_INVITE',
    timestamp: '۴۵ دقیقه پیش',
    read: false,
    actionUrl: '/matchmaking',
  },
  {
    id: 'notif-3',
    title: 'ارتقای ریتینگ Elo مسابقات',
    message: 'نتیجه مسابقه دابلز اخیر شما تایید شد: +۲۸ امتیاز به ریتینگ Elo شما افزوده گردید و به سطح C+ صعود کردید!',
    type: 'ELO_UPDATE',
    timestamp: '۲ ساعت پیش',
    read: false,
    actionUrl: '/rankings',
  },
  {
    id: 'notif-4',
    title: 'افتتاح مسابقات آمریکانو پدل',
    message: 'گردونه و ژنراتور خودکار مسابقات آمریکانو و مکزیکانو در پلتفرم رالی فعال شد. می‌توانید با دوستان خود تورنمنت‌های دوره‌ای برگزار کنید.',
    type: 'AMERICANO_UPDATE',
    timestamp: 'دیروز',
    read: true,
    actionUrl: '/tournaments',
  },
];

export function useRallyNotifications() {
  const [notifications, setNotifications] = useState<RallyNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('rally_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  useEffect(() => {
    try {
      localStorage.setItem('rally_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm === 'granted') {
          new Notification('رالی پدل', {
            body: 'اعلان‌های هوشمند رالی برای سانس‌ها و مسابقات فعال گردید.',
            icon: '/images/rally_icon_192.png',
            dir: 'rtl',
          });
        }
        return perm;
      } catch {
        return 'denied';
      }
    }
    return 'denied';
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    permission,
    markAsRead,
    markAllAsRead,
    requestBrowserPermission,
  };
}

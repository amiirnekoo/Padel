import React, { useState } from 'react';
import { Bell, CheckCheck, Clock, Calendar, Users, Zap, Trophy, X, ShieldCheck } from 'lucide-react';
import { RallyNotificationItem, NotificationType } from '../../../types/notification';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: RallyNotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  permission: NotificationPermission;
  onRequestPermission: () => void;
  onNavigate?: (url: string) => void;
}

const TYPE_ICONS: Record<NotificationType, { icon: React.ReactNode; bg: string; text: string }> = {
  BOOKING_REMINDER: {
    icon: <Calendar size={14} />,
    bg: 'bg-emerald-950/80 border-emerald-500/40',
    text: 'text-emerald-300',
  },
  MATCHMAKING_INVITE: {
    icon: <Users size={14} />,
    bg: 'bg-blue-950/80 border-blue-500/40',
    text: 'text-blue-300',
  },
  ELO_UPDATE: {
    icon: <Zap size={14} />,
    bg: 'bg-amber-950/80 border-amber-500/40',
    text: 'text-amber-300',
  },
  AMERICANO_UPDATE: {
    icon: <Trophy size={14} />,
    bg: 'bg-purple-950/80 border-purple-500/40',
    text: 'text-purple-300',
  },
  SYSTEM: {
    icon: <ShieldCheck size={14} />,
    bg: 'bg-slate-800 border-slate-700',
    text: 'text-slate-300',
  },
};

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  permission,
  onRequestPermission,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!isOpen) return null;

  const displayedList = filter === 'UNREAD' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-6 sm:pt-20 bg-slate-950/80" dir="rtl">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rally-accent/20 text-rally-accent flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white">مرکز اعلان‌های هوشمند</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white font-mono">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] text-slate-400 hover:text-rally-accent font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>خواندن همه</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Browser Permission Banner (if not granted) */}
        {permission !== 'granted' && (
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-300">
              اعلان‌های مرورگر برای یادآوری سانس‌ها غیرفعال است.
            </div>
            <button
              type="button"
              onClick={onRequestPermission}
              className="px-2.5 py-1 rounded-lg bg-rally-accent text-slate-950 font-bold text-[11px] hover:bg-lime-400 cursor-pointer shrink-0"
            >
              فعال‌سازی
            </button>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            همه ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'UNREAD' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            خوانده‌نشده ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {displayedList.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              هیچ اعلانی برای نمایش وجود ندارد.
            </div>
          ) : (
            displayedList.map((notif) => {
              const meta = TYPE_ICONS[notif.type] || TYPE_ICONS.SYSTEM;

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    if (notif.actionUrl && onNavigate) {
                      onNavigate(notif.actionUrl);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80 text-slate-400'
                      : 'bg-slate-900/90 border-slate-700/80 hover:border-rally-accent/40 text-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl border shrink-0 ${meta.bg} ${meta.text}`}>
                      {meta.icon}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-rally-accent shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] leading-relaxed text-slate-400">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1 font-mono">
                        <Clock size={11} />
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

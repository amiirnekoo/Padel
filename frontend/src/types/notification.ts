export type NotificationType =
  | 'BOOKING_REMINDER'
  | 'MATCHMAKING_INVITE'
  | 'ELO_UPDATE'
  | 'AMERICANO_UPDATE'
  | 'SYSTEM';

export interface RallyNotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

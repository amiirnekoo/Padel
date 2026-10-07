export type SlotStatus = 'OPEN' | 'BOOKED_ONLINE' | 'BOOKED_MANUAL' | 'COACH_HOLD' | 'LOCKED';

export interface GridSlotItem {
  id: string;
  courtId: string;
  time: string;
  price: number;
  status: SlotStatus;
  bookedBy?: string;
  phone?: string;
  paymentMethod?: 'POS' | 'CARD_TO_CARD' | 'CASH' | 'ONLINE_RALLY';
  notes?: string;
  racketsCount?: number;
}

export interface CourtHeaderItem {
  id: string;
  name: string;
  type: 'INDOOR' | 'OUTDOOR';
  surface: string;
}

export interface ClubKpis {
  todayRevenue: number;
  occupancyRate: number;
  onlineBookingsCount: number;
  settleableBalance: number;
}

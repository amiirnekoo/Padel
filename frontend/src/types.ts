export type SlotStatus = "AVAILABLE" | "HOLD" | "BOOKED" | "BLOCKED" | "TOURNAMENT_HOLD";

export interface TimeSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  price: number;
  status: SlotStatus;
  hold_expires_at: string | null;
}

export interface CourtCalendar {
  court_id: string;
  court_name: string;
  sport_type: "PADEL" | "TENNIS";
  is_indoor: boolean;
  slots: TimeSlot[];
}

export interface ClubCalendarData {
  club_id: string;
  date: string;
  courts: CourtCalendar[];
}

export interface Booking {
  booking_id: string;
  tracking_code: string;
  amount: number;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED_BY_USER" | "CANCELLED_BY_CLUB" | "EXPIRED";
  hold_expires_at: string;
  created_at?: string;
}

export interface CheckoutResult {
  payment_url: string;
  gateway_token: string;
  idempotency_key: string;
  amount: number;
}

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

export type UserRole = "PLAYER" | "COACH" | "CLUB_MANAGER" | "CLUB_OPERATOR" | "ADMIN";

export interface UserProfile {
  id: string;
  phone_number: string;
  full_name: string | null;
  role: UserRole;
  skill_level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";
  emergency_phone?: string | null;
}

export interface CoachProfileData {
  id: string;
  user_id: string;
  full_name?: string;
  certification_id: string;
  sport_types: string;
  bio?: string | null;
  hourly_rate: number;
  is_verified: boolean;
}

export interface TraineeConnection {
  connection_id: string;
  coach_id: string;
  trainee_id: string;
  trainee_name: string;
  phone_number: string;
  package_type: string;
  total_sessions: number;
  completed_sessions: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface ClubAnalyticsData {
  club_id: string;
  club_name: string;
  date: string;
  total_courts: number;
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  hold_slots: number;
  blocked_slots: number;
  tournament_slots: number;
  commission_rate: number;
}

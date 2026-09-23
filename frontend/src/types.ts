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

export interface VenueOnboardPayload {
  owner_id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  sports_supported: string;
  amenities?: string;
  courts_count: number;
  default_hourly_rate: number;
  iban?: string;
  description?: string;
}

export interface VenueData {
  id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  sports_supported: string;
  default_hourly_rate: number;
  approval_status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  is_active: boolean;
  created_at?: string;
}

export interface CustomerIntelligenceData {
  id: string;
  phone_number: string;
  full_name: string;
  role: UserRole;
  city: string;
  province: string;
  skill_level: string;
  tags: string[];
  kyc_status: "UNVERIFIED" | "PENDING" | "VERIFIED";
  notes: string | null;
  created_at: string | null;
  total_bookings: number;
  lifetime_value: number;
  owned_venues: Array<{ name: string; city: string }>;
  coach_profile?: { is_verified: boolean; hourly_rate: number; sport_types: string } | null;
}

export interface PlatformKpisData {
  total_customers: number;
  roles_distribution: Record<string, number>;
  cities_distribution: Record<string, number>;
  venues_count: number;
  total_platform_revenue: number;
}

export interface WalletData {
  wallet_id: string;
  user_id: string;
  balance: number;
  balance_toman: number;
  currency: string;
  is_locked: boolean;
}

export interface WalletTransactionData {
  id: string;
  amount: number;
  amount_toman: number;
  transaction_type: "CREDIT" | "DEBIT";
  category: "TOPUP" | "BOOKING_PAYMENT" | "REFUND" | "WITHDRAWAL";
  reference_id: string | null;
  description: string | null;
  created_at: string | null;
}

export interface SettlementBatchData {
  id: string;
  batch_number: string;
  total_bookings_amount: number;
  platform_commission: number;
  club_payout_amount: number;
  club_payout_toman: number;
  status: "PROCESSING" | "PAID" | "CANCELLED";
  iban: string;
  paya_reference: string | null;
  paid_at: string | null;
  created_at: string | null;
  items_count: number;
}

export interface NotificationLogData {
  id: string;
  recipient: string;
  event_type: string;
  template_name: string;
  provider: string;
  tokens: string;
  status: "DELIVERED" | "FAILED" | "PENDING";
  message_id: string | null;
  error_message: string | null;
  created_at: string | null;
}

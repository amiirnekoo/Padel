export type SportType = 'PADEL' | 'TENNIS';

export type CourtType = 'INDOOR' | 'OUTDOOR';

export interface TimeSlotItem {
  slotId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  price: number; // in Tomans
  status: 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'MAINTENANCE';
}

export interface Amenity {
  id: string;
  label: string;
  iconName: string;
}

export interface CourtClub {
  id: string;
  name: string;
  sport: SportType;
  city: string;
  area: string;
  address: string;
  courtType: CourtType;
  surface: string;
  rating: number; // e.g. 4.9
  startingPrice: number; // Tomans for 90 min
  images: string[];
  amenities: Amenity[];
  rules: string[];
  cancellationPolicy: string;
  nearestAvailableSlot?: string;
  slots: TimeSlotItem[];
}

export type StudentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';

export interface Coach {
  id: string;
  name: string;
  title: string;
  sport: SportType;
  experienceYears: number;
  certificate: string;
  rating: number;
  sessionsCount: number;
  city: string;
  clubs: string[];
  levels: StudentLevel[];
  hourlyRate: number; // Tomans
  avatarUrl: string;
  bio: string;
  bookingType: 'INSTANT' | 'APPROVAL_REQUIRED';
  specialties: string[];
}

export interface Tournament {
  id: string;
  title: string;
  sport: SportType;
  category: 'MEN' | 'WOMEN' | 'MIXED' | 'OPEN';
  level: string;
  organizer: string;
  isOfficial: boolean;
  city: string;
  venueName: string;
  startDate: string;
  endDate: string;
  entryFee: number; // Tomans
  prizePool: number; // Tomans
  maxTeams: number;
  registeredTeams: number;
  status: 'REGISTRATION_OPEN' | 'CLOSING_SOON' | 'FULL' | 'IN_PROGRESS';
  bannerUrl: string;
  rules: string[];
  format: 'DOUBLES' | 'SINGLES';
}

export interface BookingReceipt {
  bookingId: string;
  trackingCode: string;
  clubName: string;
  courtName: string;
  sport: SportType;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  totalAmount: number;
  taxAmount: number;
  paidAt: string;
  userName: string;
  userPhone: string;
  cancellationTerms: string;
}

export type ProductCategory =
  | 'ALL'
  | 'PADEL_RACKET'
  | 'TENNIS_RACKET'
  | 'BALLS'
  | 'BAGS'
  | 'ACCESSORIES'
  | 'SHOES';

export interface ShopProduct {
  id: string;
  name_fa: string;
  name_en: string;
  brand: string;
  category: ProductCategory;
  sport: SportType;
  level: StudentLevel;
  original_price: number; // Tomans
  discount_percent: number;
  price: number; // Tomans
  stock: number;
  weight: string;
  balance: string;
  shape: string;
  surface: string;
  core: string;
  warranty: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  description: string;
  tags?: string[];
  power_index?: number; // 1 to 10
  control_index?: number; // 1 to 10
  series?: string; // e.g. Luxury Series, Pro Series
  player_signature?: string; // e.g. Agustín Tapia, Miguel Lamperti
  images?: string[]; // Multiple high-res photos
  year?: number; // e.g. 2026
  features?: string[]; // Bullet features / technologies
  colors?: string[];
  sizes?: string[];
  specs_detail?: Record<string, string>;
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
  selectedOption?: string;
}

export interface ShopOrderReceipt {
  orderId: string;
  trackingCode: string;
  items: {
    productId: string;
    nameFa: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  paymentMethod: 'WALLET' | 'SHAPARAK';
  createdAt: string;
}

export interface OwnerCourtItem {
  id: string;
  club_id: string;
  name: string;
  sport_type: SportType;
  surface_type: string;
  is_indoor: boolean;
  has_lighting: boolean;
  hourly_rate: number;
  image_url?: string;
  is_active: boolean;
}

export type CourtPositionType = 'TEAM_A_RIGHT' | 'TEAM_A_LEFT' | 'TEAM_B_RIGHT' | 'TEAM_B_LEFT';

export interface MatchmakingPlayerSlot {
  user_id: string | null;
  user_name: string | null;
  label: string;
}

export interface MatchmakingGameItem {
  id: string;
  title: string;
  skill_level: string; // 'D' | 'D+' | 'C' | 'C+' | 'B' | 'A'
  gender_category: 'OPEN' | 'MALE' | 'FEMALE';
  total_price: number;
  price_per_player: number;
  status: 'OPEN' | 'CONFIRMED' | 'CANCELLED';
  filled_count: number;
  club_name: string;
  club_city: string;
  court_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  positions: {
    team_a_right: MatchmakingPlayerSlot;
    team_a_left: MatchmakingPlayerSlot;
    team_b_right: MatchmakingPlayerSlot;
    team_b_left: MatchmakingPlayerSlot;
  };
}


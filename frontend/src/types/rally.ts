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


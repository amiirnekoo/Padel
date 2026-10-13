export interface MapCityConfig {
  id: string;
  name: string;
  badge: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
}

export interface MapCourtItem {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  status: 'ACTIVE' | 'CONNECTING'; // ACTIVE = رزرو آنی در رالی | CONNECTING = در حال تجهیز و اتصال
  courtType: 'INDOOR' | 'OUTDOOR';
  rating: number;
  startingPrice?: number;
  image: string;
  color: string;
}

export const MAP_CITIES: MapCityConfig[] = [
  { id: 'tehran', name: 'تهران', badge: '۳ باشگاه فعال', center: [35.795, 51.455], zoom: 12 },
  { id: 'mashhad', name: 'مشهد', badge: 'سجاد', center: [36.325, 59.520], zoom: 12 },
  { id: 'isfahan', name: 'اصفهان', badge: 'زاینده‌رود', center: [32.645, 51.685], zoom: 12 },
  { id: 'shiraz', name: 'شیراز', badge: 'چمران', center: [29.635, 52.510], zoom: 12 },
  { id: 'tabriz', name: 'تبریز', badge: 'ائل‌گلی', center: [38.050, 46.350], zoom: 12 },
  { id: 'mazandaran', name: 'مازندران', badge: 'ساحلی', center: [36.685, 51.340], zoom: 11 },
];

export const MAP_COURTS: MapCourtItem[] = [
  // --- تهران (فعال در رالی) ---
  {
    id: 'club-enghelab',
    name: 'مجموعه پدل FGB انقلاب',
    cityId: 'tehran',
    cityName: 'تهران',
    area: 'مجموعه ورزشی انقلاب',
    address: 'تهران، خیابان سئول، اتوبان نیایش، مجموعه فرهنگی ورزشی انقلاب',
    lat: 35.7772,
    lng: 51.4053,
    status: 'ACTIVE',
    courtType: 'INDOOR',
    rating: 4.95,
    startingPrice: 3800000,
    image: '/images/court_fgb_enghelab.jpg',
    color: '#0ea5e9'
  },
  {
    id: 'club-lafour',
    name: 'باشگاه پدل سوپر پانورامیک لفور',
    cityId: 'tehran',
    cityName: 'تهران',
    area: 'آجودانیه',
    address: 'تهران، منطقه ۱، خیابان آجودانیه (سباری)، انتهای کوچه دهم غربی، کلوپ لفور',
    lat: 35.8115,
    lng: 51.4889,
    status: 'ACTIVE',
    courtType: 'OUTDOOR',
    rating: 4.92,
    startingPrice: 3200000,
    image: '/images/court_lafour.jpg',
    color: '#f59e0b'
  },
  {
    id: 'club-viva',
    name: 'باشگاه پدل ویوا (VIVA)',
    cityId: 'tehran',
    cityName: 'تهران',
    area: 'مینی‌سیتی / ارتش',
    address: 'تهران، منطقه ۱، مینی‌سیتی، بلوار ارتش، مجموعه ورزشی و کلوپ پدل ویوا',
    lat: 35.7981,
    lng: 51.5032,
    status: 'ACTIVE',
    courtType: 'INDOOR',
    rating: 4.98,
    startingPrice: 3500000,
    image: '/images/court_viva.jpg',
    color: '#10b981'
  },

  // --- مازندران ---
  {
    id: 'court-namakabrood',
    name: 'کلوپ پدل ساحلی نمک‌آبرود',
    cityId: 'mazandaran',
    cityName: 'مازندران',
    area: 'چالوس / نمک‌آبرود',
    address: 'مازندران، چالوس، شهرک توریستی نمک‌آبرود، کورت‌های اختصاصی ساحلی',
    lat: 36.6710,
    lng: 51.3020,
    status: 'CONNECTING',
    courtType: 'OUTDOOR',
    rating: 4.90,
    startingPrice: 3000000,
    image: '/images/court_lafour.jpg',
    color: '#06b6d4'
  },
  {
    id: 'court-babolsar',
    name: 'آکادمی پدل دریاکنار بابلسر',
    cityId: 'mazandaran',
    cityName: 'مازندران',
    area: 'بابلسر / دریاکنار',
    address: 'مازندران، بابلسر، شهرک دریاکنار، مجموعه ورزشی ساحل پدل',
    lat: 36.7080,
    lng: 52.6120,
    status: 'CONNECTING',
    courtType: 'OUTDOOR',
    rating: 4.88,
    startingPrice: 2800000,
    image: '/images/court_viva.jpg',
    color: '#06b6d4'
  },

  // --- اصفهان ---
  {
    id: 'court-isfahan-parvaz',
    name: 'کلوپ پدل پرواز اصفهان',
    cityId: 'isfahan',
    cityName: 'اصفهان',
    area: 'بلوار مشتاق',
    address: 'اصفهان، بلوار مشتاق دوم، مجموعه ورزشی پرواز، کورت‌های اختصاصی پدل',
    lat: 32.6320,
    lng: 51.7210,
    status: 'CONNECTING',
    courtType: 'OUTDOOR',
    rating: 4.91,
    startingPrice: 2700000,
    image: '/images/court_fgb_enghelab.jpg',
    color: '#8b5cf6'
  },

  // --- شیراز ---
  {
    id: 'court-shiraz-chamran',
    name: 'آکادمی پدل چمران شیراز',
    cityId: 'shiraz',
    cityName: 'شیراز',
    area: 'بلوار چمران',
    address: 'شیراز، بلوار شهید چمران، تپه ورزشی چمران، مجتمع پدل آکادمیک',
    lat: 29.6450,
    lng: 52.5020,
    status: 'CONNECTING',
    courtType: 'OUTDOOR',
    rating: 4.93,
    startingPrice: 2900000,
    image: '/images/court_lafour.jpg',
    color: '#ec4899'
  },

  // --- مشهد ---
  {
    id: 'court-mashhad-sajjad',
    name: 'مجموعه پدل سجاد مشهد',
    cityId: 'mashhad',
    cityName: 'مشهد',
    area: 'بلوار سجاد',
    address: 'مشهد، بلوار سجاد، خیابان بهار، مجموعه ورزشی اختصاصی پدل سجاد',
    lat: 36.3210,
    lng: 59.5480,
    status: 'CONNECTING',
    courtType: 'INDOOR',
    rating: 4.89,
    startingPrice: 2600000,
    image: '/images/court_viva.jpg',
    color: '#14b8a6'
  },

  // --- تبریز ---
  {
    id: 'court-tabriz-elgoli',
    name: 'کورت پدل ائل‌گلی تبریز',
    cityId: 'tabriz',
    cityName: 'تبریز',
    area: 'ائل‌گلی',
    address: 'تبریز، بلوار ائل‌گلی، مجموعه تفریحی و ورزشی کورت‌های پدل تبریز',
    lat: 38.0250,
    lng: 46.3680,
    status: 'CONNECTING',
    courtType: 'OUTDOOR',
    rating: 4.87,
    startingPrice: 2500000,
    image: '/images/court_fgb_enghelab.jpg',
    color: '#f97316'
  }
];

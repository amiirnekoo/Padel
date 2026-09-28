import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Wallet,
  User,
  Building2,
  CalendarCheck,
  Award,
  Users2,
  Handshake,
  ShoppingBag,
  ChevronDown
} from 'lucide-react';

export type RallyPageTab =
  | 'home'
  | 'courts'
  | 'coaches'
  | 'tournaments'
  | 'shop'
  | 'partners'
  | 'sponsors';

interface RallyHeaderProps {
  currentTab: RallyPageTab;
  onSelectTab: (tab: RallyPageTab) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  walletBalance: number;
  onOpenWallet: () => void;
  onOpenAuth: () => void;
  userName?: string;
  cartItemsCount?: number;
  onOpenCart?: () => void;
}

export const RallyHeader: React.FC<RallyHeaderProps> = ({
  currentTab,
  onSelectTab,
  selectedCity,
  onSelectCity,
  walletBalance,
  onOpenWallet,
  onOpenAuth,
  userName,
  cartItemsCount = 0,
  onOpenCart
}) => {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const CITIES = ['تهران', 'کرج', 'شیراز', 'اصفهان', 'کیش'];

  const NAV_ITEMS: { id: RallyPageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'courts', label: 'زمین‌ها', icon: CalendarCheck },
    { id: 'coaches', label: 'مربیان', icon: Award },
    { id: 'tournaments', label: 'مسابقات', icon: Users2 },
    { id: 'shop', label: 'فروشگاه تجهیزات', icon: ShoppingBag },
    { id: 'partners', label: 'پنل همکاران', icon: Building2 },
    { id: 'sponsors', label: 'همکاری با رالی', icon: Handshake }
  ];


  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand identity: Name + Logo motif */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 text-right group focus:outline-none"
          >
            {/* Minimal iconic symbol: Deep Green circle with ball trajectory arc & lime dot */}
            <div className="relative w-10 h-10 rounded-xl bg-rally-primary flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 18 C 9 6, 15 6, 20 18" strokeLinecap="round" />
              </svg>
              {/* Lime trajectory ball */}
              <span className="absolute top-2.5 right-2 w-2.5 h-2.5 rounded-full bg-rally-accent shadow-rally-glow ring-2 ring-rally-primary" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-rally-charcoal tracking-tight">
                  رالی
                </span>
                <span className="text-[11px] font-bold text-rally-primary bg-rally-primary/10 px-2 py-0.5 rounded-full">
                  RALLY
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                سامانه هوشمند رزرو زمین، مربی و مسابقات
              </p>
            </div>
          </button>

          {/* City selector dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-rally-primary" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onSelectCity(c);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-right px-3 py-1.5 text-xs font-medium hover:bg-rally-primary/5 transition-colors ${
                      selectedCity === c ? 'text-rally-primary font-bold bg-rally-primary/10' : 'text-gray-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'text-rally-primary bg-rally-primary/10'
                    : 'text-gray-600 hover:text-rally-charcoal hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rally-primary' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeRallyNavIndicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-rally-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side Actions: Cart + Wallet + Profile/Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart trigger button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:border-rally-primary hover:text-rally-primary transition-all cursor-pointer shadow-sm"
            title="سبد خرید تجهیزات"
          >
            <ShoppingBag className="w-4 h-4 text-rally-primary" />
            <span className="hidden md:inline mr-1.5 text-xs font-bold text-gray-800">سبد</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-sky-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Wallet button */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-rally-charcoal hover:border-rally-primary/40 transition-colors"
          >
            <Wallet className="w-4 h-4 text-rally-primary" />
            <span className="hidden sm:inline text-gray-500 font-normal">موجودی:</span>
            <span className="font-black text-rally-primary">
              {(walletBalance / 10).toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] text-gray-500">تومان</span>
          </button>

          {/* User auth button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              userName
                ? 'bg-rally-primary/10 text-rally-primary border border-rally-primary/20'
                : 'bg-rally-primary text-white hover:bg-rally-primary-light shadow-sm'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{userName ? userName : 'ورود / عضویت'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

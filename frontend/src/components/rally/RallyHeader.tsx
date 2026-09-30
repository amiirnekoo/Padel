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
  ChevronDown,
  Zap,
  ShieldCheck
} from 'lucide-react';

export type RallyPageTab =
  | 'home'
  | 'courts'
  | 'matchmaking'
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
  onOpenAdmin?: () => void;
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
  onOpenCart,
  onOpenAdmin
}) => {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const CITIES = ['تهران', 'کرج', 'شیراز', 'اصفهان', 'کیش'];

  const NAV_ITEMS: { id: RallyPageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'courts', label: 'زمین‌ها', icon: CalendarCheck },
    { id: 'matchmaking', label: 'مچ‌میکینگ (بازی آزاد)', icon: Zap },
    { id: 'coaches', label: 'مربیان', icon: Award },
    { id: 'tournaments', label: 'مسابقات', icon: Users2 },
    { id: 'shop', label: 'فروشگاه تجهیزات', icon: ShoppingBag },
    { id: 'partners', label: 'پنل همکاران', icon: Building2 },
    { id: 'sponsors', label: 'همکاری با رالی', icon: Handshake }
  ];


  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-xs transition-all">
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-12 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand identity: Name + Logo motif */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 sm:gap-3 text-right group focus:outline-none cursor-pointer"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rally-primary flex items-center justify-center shadow-md transition-transform group-hover:scale-105 shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 18 C 9 6, 15 6, 20 18" strokeLinecap="round" />
              </svg>
              <span className="absolute top-2 right-1.5 sm:top-2.5 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rally-accent shadow-rally-glow ring-2 ring-rally-primary" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-rally-charcoal tracking-tight">
                  رالی
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-rally-primary bg-rally-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                  RALLY
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium hidden md:block">
                سامانه هوشمند رزرو زمین، مربی، مسابقات و فروشگاه پدل
              </p>
            </div>
          </button>

          {/* City selector dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
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
                    className={`w-full text-right px-3 py-1.5 text-xs font-medium hover:bg-rally-primary/5 transition-colors cursor-pointer ${
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
                className={`relative px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-rally-primary bg-rally-primary/10'
                    : 'text-gray-600 hover:text-rally-charcoal hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rally-primary' : 'text-gray-400'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
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
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Cart trigger button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:border-rally-primary hover:text-rally-primary transition-all cursor-pointer shadow-2xs"
            title="سبد خرید تجهیزات"
          >
            <ShoppingBag className="w-4 h-4 text-rally-primary" />
            <span className="hidden xl:inline mr-1.5 text-xs font-bold text-gray-800">سبد خرید</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-sky-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Wallet button */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-rally-charcoal hover:border-rally-primary/40 transition-colors cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-rally-primary shrink-0" />
            <span className="hidden md:inline text-gray-500 font-normal">کیف پول:</span>
            <span className="font-black text-rally-primary whitespace-nowrap">
              {(walletBalance / 10).toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] text-gray-500 hidden sm:inline">تومان</span>
          </button>

          {/* User auth button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              userName
                ? 'bg-rally-primary/10 text-rally-primary border border-rally-primary/20'
                : 'bg-rally-primary text-white hover:bg-rally-primary-hover shadow-xs'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
              {userName ? userName : 'ورود'}
            </span>
          </button>

          {/* Admin portal shortcut */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 hover:bg-slate-800 hover:text-amber-300 text-xs font-black transition-all cursor-pointer shadow-2xs shrink-0"
              title="ورود به پنل مدیریت عملیاتی رالی"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden xl:inline">پنل مدیریت</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

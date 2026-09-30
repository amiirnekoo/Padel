import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowLeft, Shield, ShoppingBag } from 'lucide-react';
import { RallyLogo } from './RallyLogo';
import { UserSession } from '../AuthModal';

export type ModernNavTab = 'courts' | 'coaches' | 'tournaments' | 'shop' | 'home';

interface ModernRallyHeaderProps {
  activeTab: ModernNavTab;
  onSelectTab: (tab: ModernNavTab) => void;
  userSession: UserSession | null;
  onOpenAuth: () => void;
  onOpenPortal?: () => void;
  onOpenAdmin?: () => void;
  cartItemsCount?: number;
  onOpenCart?: () => void;
}

export const ModernRallyHeader: React.FC<ModernRallyHeaderProps> = ({
  activeTab,
  onSelectTab,
  userSession,
  onOpenAuth,
  onOpenPortal,
  cartItemsCount = 0,
  onOpenCart
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'courts' as ModernNavTab, label: 'زمین‌ها' },
    { id: 'coaches' as ModernNavTab, label: 'مربیان' },
    { id: 'tournaments' as ModernNavTab, label: 'مسابقات' },
    { id: 'shop' as ModernNavTab, label: 'فروشگاه' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        isScrolled
          ? 'bg-[#0B2238] border-b border-[#0C3E6E]/60 shadow-lg py-3'
          : 'bg-[#0B2238]/85 backdrop-none py-4 sm:py-5 border-b border-white/10'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Right: Main Official Rally Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 text-right group cursor-pointer focus:outline-none"
            title="صفحه اصلی رالی"
          >
            <RallyLogo className="h-8 sm:h-9 md:h-10 w-auto" />
          </button>
        </div>

        {/* Center: Desktop Navigation (Courts, Coaches, Tournaments, Shop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-9">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 text-sm font-bold transition-colors cursor-pointer select-none ${
                  isActive ? 'text-white' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[#D7ED68] rounded-full shadow-[0_0_8px_rgba(215,237,104,0.6)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Left: Actions (Cart, Portal / Login) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Cart Button with Counter */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              title="سبد خرید تجهیزات رالی"
              aria-label="سبد خرید"
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#D7ED68]" />
              <span className="hidden sm:inline text-xs font-bold text-white">سبد</span>
              {cartItemsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D7ED68] text-[#172320] text-[10px] font-black flex items-center justify-center shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}

          {/* User / Portal Button */}
          {userSession ? (
            <button
              onClick={onOpenPortal || onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              title="ورود به پنل کاربری اختصاصی"
            >
              <span className="w-2 h-2 rounded-full bg-[#D7ED68]" />
              <span className="truncate max-w-[120px]">{userSession.fullName || 'پنل کاربری'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2 rounded-xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#172320] text-xs sm:text-sm font-black transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <span>ورود</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="منوی موبایل"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0B2238] border-b border-[#0C3E6E] px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-right text-sm font-bold transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-white/10 text-[#D7ED68]'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              <ArrowLeft className="w-4 h-4 opacity-70" />
            </button>
          ))}
          <div className="pt-2 border-t border-white/10">
            {userSession ? (
              <button
                onClick={() => {
                  if (onOpenPortal) onOpenPortal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 border border-white/10"
              >
                <span className="w-2 h-2 rounded-full bg-[#D7ED68]" />
                <span>ورود به پنل کاربری ({userSession.fullName})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#D7ED68] text-xs font-black text-[#172320] flex items-center justify-center gap-2"
              >
                <span>ورود / عضویت در رالی</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

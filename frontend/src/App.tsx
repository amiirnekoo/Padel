import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RallyPageTab } from './components/rally/RallyHeader';
import { ModernRallyHeader } from './components/rally/ModernRallyHeader';
import { ModernRallyFooter } from './components/rally/ModernRallyFooter';
import { MobileBottomNav } from './components/rally/MobileBottomNav';
import { RallyHomePage } from './pages/rally/RallyHomePage';
import { RallyCourtsPage } from './pages/rally/RallyCourtsPage';
import { RallyMatchmakingPage } from './pages/rally/RallyMatchmakingPage';
import { RallyCoachesPage } from './pages/rally/RallyCoachesPage';
import { RallyTournamentsPage } from './pages/rally/RallyTournamentsPage';
import { RallyRankingsPage } from './pages/rally/RallyRankingsPage';
import { RallyMagazinePage } from './pages/rally/RallyMagazinePage';
import { RallyShopPage } from './pages/rally/RallyShopPage';
import { RallyProductDetailPage } from './pages/rally/shop/RallyProductDetailPage';
import { AppModalsContainer } from './components/rally/AppModalsContainer';
import { UserSession } from './components/AuthModal';
import { CourtClub, Coach, Tournament, TimeSlotItem, SportType, ShopProduct, CartItem, ShopOrderReceipt } from './types/rally';
import { MOCK_SHOP_PRODUCTS } from './data/mockRallyShopData';
import { AdminPortalPage } from './pages/rally/admin/AdminPortalPage';
import { UnifiedPortalPage } from './pages/rally/portal/UnifiedPortalPage';
import { rallyApi } from './services/rallyApi';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RallyPageTab>('home');
  const [selectedCity] = useState('تهران');
  const [walletBalance, setWalletBalance] = useState<number>(35000000);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => window.location.pathname.startsWith('/admin'));
  const [isPortalOpen, setIsPortalOpen] = useState(() => window.location.pathname.startsWith('/portal'));

  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('padel_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedClub, setSelectedClub] = useState<CourtClub | null>(null);
  const [bookingSlot, setBookingSlot] = useState<{ club: CourtClub; slot: TimeSlotItem } | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shopReceipt, setShopReceipt] = useState<ShopOrderReceipt | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rally_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [courtFilterParam, setCourtFilterParam] = useState<{ sport?: SportType; area?: string }>({});
  const [coachFilterParam, setCoachFilterParam] = useState<{ sport?: SportType; level?: string }>({});
  const [productsList, setProductsList] = useState<ShopProduct[]>(() => {
    try {
      const saved = localStorage.getItem('rally_shop_products');
      return saved ? JSON.parse(saved) : MOCK_SHOP_PRODUCTS;
    } catch {
      return MOCK_SHOP_PRODUCTS;
    }
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminOpen(window.location.pathname.startsWith('/admin'));
      setIsPortalOpen(window.location.pathname.startsWith('/portal'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('rally_cart', JSON.stringify(cartItems)); } catch {}
  }, [cartItems]);

  useEffect(() => {
    if (userSession?.userId) {
      rallyApi.getWalletBalance(userSession.userId).then((b) => {
        if (typeof b === 'number') setWalletBalance(b);
      });
    }
  }, [userSession?.userId]);

  const handleUpdateProduct = (productId: string, updates: Partial<ShopProduct>) => {
    setProductsList((prev) => {
      const next = prev.map((p) => p.id === productId ? { ...p, ...updates } : p);
      try { localStorage.setItem('rally_shop_products', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleAddProduct = (newProd: ShopProduct) => {
    setProductsList((prev) => {
      const next = [newProd, ...prev];
      try { localStorage.setItem('rally_shop_products', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleAddToCart = (product: ShopProduct, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    setCartItems((prev) => qty <= 0 ? prev.filter((i) => i.product.id !== productId) : prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  if (isAdminOpen) {
    return (
      <AdminPortalPage
        products={productsList}
        onUpdateProduct={handleUpdateProduct}
        onAddProduct={handleAddProduct}
        onExitAdmin={() => {
          window.history.pushState({}, '', '/');
          setIsAdminOpen(false);
        }}
      />
    );
  }

  if (isPortalOpen) {
    return (
      <UnifiedPortalPage
        userSession={userSession || { userId: 'usr-1', fullName: 'کاربر رالی', phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹', role: 'PLAYER', token: 'mock-jwt-token-2026' }}
        walletBalance={walletBalance}
        onOpenWallet={() => setIsWalletOpen(true)}
        onExitPortal={() => {
          window.history.pushState({}, '', '/');
          setIsPortalOpen(false);
        }}
        onLogout={() => {
          localStorage.removeItem('padel_auth');
          setUserSession(null);
          window.history.pushState({}, '', '/');
          setIsPortalOpen(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-rally-light-bg text-rally-charcoal selection:bg-rally-accent selection:text-rally-charcoal font-sans">
      <ModernRallyHeader
        activeTab={activeTab as any}
        onSelectTab={(tab) => { setSelectedProduct(null); setActiveTab(tab as RallyPageTab); }}
        userSession={userSession}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPortal={() => { window.history.pushState({}, '', '/portal'); setIsPortalOpen(true); }}
        cartItemsCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className={`flex-1 pb-20 lg:pb-12 ${activeTab !== 'home' || selectedProduct ? 'pt-20 sm:pt-24' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedProduct ? `prod-${selectedProduct.id}` : activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            {selectedProduct ? (
              <RallyProductDetailPage
                product={selectedProduct}
                allProducts={productsList}
                onBackToShop={() => setSelectedProduct(null)}
                onAddToCart={(p, qty) => handleAddToCart(p, qty || 1)}
                onSelectProduct={setSelectedProduct}
                onOpenCart={() => setIsCartOpen(true)}
                cartProductIds={new Set(cartItems.map((i) => i.product.id))}
              />
            ) : (
              <>
                {activeTab === 'home' && (
                  <RallyHomePage
                    selectedCity={selectedCity}
                    onSelectClub={setSelectedClub}
                    onSelectDirectSlot={(club, slot) => setBookingSlot({ club, slot })}
                    onSelectCoach={setSelectedCoach}
                    onSelectTournament={setSelectedTournament}
                    onNavigateToCourts={(f) => { if (f) setCourtFilterParam(f); setActiveTab('courts'); }}
                    onNavigateToCoaches={(f) => { if (f) setCoachFilterParam(f); setActiveTab('coaches'); }}
                    onNavigateToTournaments={() => setActiveTab('tournaments')}
                    onNavigateToSponsors={() => {}}
                    onNavigateToShop={() => setActiveTab('shop')}
                    onSelectProduct={setSelectedProduct}
                    onAddToCartProduct={handleAddToCart}
                    cartProductIds={new Set(cartItems.map((i) => i.product.id))}
                  />
                )}
                {activeTab === 'courts' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <RallyCourtsPage initialFilters={courtFilterParam} onSelectClub={setSelectedClub} onSelectDirectSlot={(club, slot) => setBookingSlot({ club, slot })} />
                  </div>
                )}
                {activeTab === 'matchmaking' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <RallyMatchmakingPage userId={userSession?.userId || 'usr-1'} userName={userSession?.fullName || 'کاربر رالی'} walletBalance={walletBalance} />
                  </div>
                )}
                {activeTab === 'coaches' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <RallyCoachesPage initialFilters={coachFilterParam} onSelectCoach={setSelectedCoach} />
                  </div>
                )}
                {activeTab === 'tournaments' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <RallyTournamentsPage onSelectTournament={setSelectedTournament} />
                  </div>
                )}
                {activeTab === 'rankings' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <RallyRankingsPage />
                  </div>
                )}
                {activeTab === 'magazine' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <RallyMagazinePage />
                  </div>
                )}
                {activeTab === 'shop' && (
                  <RallyShopPage
                    products={productsList}
                    onAddToCart={handleAddToCart}
                    onSelectProduct={setSelectedProduct}
                    cartProductIds={new Set(cartItems.map((i) => i.product.id))}
                    onOpenCart={() => setIsCartOpen(true)}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AppModalsContainer
        selectedClub={selectedClub} onCloseClub={() => setSelectedClub(null)}
        onProceedBooking={(club, slot) => { setSelectedClub(null); setBookingSlot({ club, slot }); }}
        bookingSlot={bookingSlot} walletBalance={walletBalance} simulateState="NORMAL"
        onCloseBooking={() => setBookingSlot(null)}
        selectedCoach={selectedCoach} onCloseCoach={() => setSelectedCoach(null)}
        selectedTournament={selectedTournament} onCloseTournament={() => setSelectedTournament(null)}
        selectedProduct={null} onCloseProduct={() => setSelectedProduct(null)}
        onAddToCartProduct={handleAddToCart}
        onOpenCartFromProduct={() => { setSelectedProduct(null); setIsCartOpen(true); }}
        isCartOpen={isCartOpen} onCloseCart={() => setIsCartOpen(false)}
        cartItems={cartItems} onUpdateCartQty={handleUpdateCartQty}
        onRemoveCartItem={(id) => setCartItems((prev) => prev.filter((i) => i.product.id !== id))}
        onClearCart={() => setCartItems([])}
        onOrderComplete={(receipt) => {
          setShopReceipt(receipt);
          if (receipt.paymentMethod === 'WALLET') setWalletBalance((prev) => Math.max(0, prev - receipt.totalAmount * 10));
        }}
        shopReceipt={shopReceipt} onCloseReceipt={() => setShopReceipt(null)}
        isWalletOpen={isWalletOpen} onCloseWallet={() => setIsWalletOpen(false)}
        onBalanceUpdated={setWalletBalance}
        isAuthOpen={isAuthOpen} userSession={userSession}
        onCloseAuth={() => setIsAuthOpen(false)}
        onLoginSuccess={setUserSession}
        onLogout={() => { localStorage.removeItem('padel_auth'); setUserSession(null); }}
        onNavigateToPortal={() => { setIsAuthOpen(false); setIsPortalOpen(true); }}
      />
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={(tab) => { setSelectedProduct(null); setActiveTab(tab); }}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={!!userSession}
      />
      <ModernRallyFooter onNavigateTab={(t) => { setSelectedProduct(null); setActiveTab(t as RallyPageTab); }} />
    </div>
  );
};

export default App;

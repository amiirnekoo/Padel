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
import { DrillsTeaserPage } from './pages/drills/DrillsTeaserPage';
import { RallyTermsPage, RallyAboutPage, RallyContactPage } from './pages/rally/info';
import { AppModalsContainer } from './components/rally/AppModalsContainer';
import { UserSession } from './components/AuthModal';
import { CourtClub, Coach, Tournament, TimeSlotItem, SportType, ShopProduct, CartItem, ShopOrderReceipt } from './types/rally';
import { MOCK_SHOP_PRODUCTS } from './data/mockRallyShopData';
import { AdminPortalPage } from './pages/rally/admin/AdminPortalPage';
import { UnifiedPortalPage } from './pages/rally/portal/UnifiedPortalPage';
import { rallyApi } from './services/rallyApi';
import { useRallyRouter } from './hooks/useRallyRouter';

export const App: React.FC = () => {
  const [selectedCity] = useState('تهران');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('padel_auth');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [selectedClub, setSelectedClub] = useState<CourtClub | null>(null);
  const [bookingSlot, setBookingSlot] = useState<{ club: CourtClub; slot: TimeSlotItem } | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shopReceipt, setShopReceipt] = useState<ShopOrderReceipt | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rally_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [courtFilterParam, setCourtFilterParam] = useState<{ sport?: SportType; area?: string }>({});
  const [coachFilterParam, setCoachFilterParam] = useState<{ sport?: SportType; level?: string }>({});
  const [productsList, setProductsList] = useState<ShopProduct[]>(() => {
    try {
      const saved = localStorage.getItem('rally_shop_products');
      return saved ? JSON.parse(saved) : MOCK_SHOP_PRODUCTS;
    } catch { return MOCK_SHOP_PRODUCTS; }
  });

  const { route, navigateToTab, navigateToDrill, backToDrills, navigateToProduct, backToShop, navigateToPortal, navigateToAdmin, exitSpecialPage } = useRallyRouter(productsList);

  const activeTab = route.tab;
  const isAdminOpen = route.isAdmin;
  const isPortalOpen = route.isPortal;
  const selectedProduct = route.productId
    ? productsList.find((p) => p.id === route.productId) || null
    : null;

  useEffect(() => {
    try { localStorage.setItem('rally_cart', JSON.stringify(cartItems)); } catch {}
  }, [cartItems]);

  useEffect(() => {
    if (userSession?.userId) {
      rallyApi.getWalletBalance(userSession.userId).then((b) => {
        if (typeof b === 'number') setWalletBalance(b);
      });
    } else {
      setWalletBalance(0);
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
        onExitAdmin={exitSpecialPage}
      />
    );
  }

  if (isPortalOpen) {
    if (!userSession) {
      setIsAuthOpen(true);
      exitSpecialPage();
      return null;
    }
    return (
      <UnifiedPortalPage
        userSession={userSession}
        walletBalance={walletBalance}
        onOpenWallet={() => setIsWalletOpen(true)}
        onExitPortal={exitSpecialPage}
        onLogout={() => {
          localStorage.removeItem('padel_auth');
          setUserSession(null);
          setWalletBalance(0);
          exitSpecialPage();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-rally-light-bg text-rally-charcoal selection:bg-rally-accent selection:text-rally-charcoal font-sans">
      <ModernRallyHeader
        activeTab={activeTab as any}
        onSelectTab={(tab) => navigateToTab(tab as RallyPageTab)}
        userSession={userSession}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPortal={navigateToPortal}
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
                onBackToShop={backToShop}
                onAddToCart={(p, qty) => handleAddToCart(p, qty || 1)}
                onSelectProduct={(p) => navigateToProduct(p.id)}
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
                    onNavigateToCourts={(f) => { if (f) setCourtFilterParam(f); navigateToTab('courts'); }}
                    onNavigateToCoaches={(f) => { if (f) setCoachFilterParam(f); navigateToTab('coaches'); }}
                    onNavigateToTournaments={() => navigateToTab('tournaments')}
                    onNavigateToSponsors={() => {}}
                    onNavigateToShop={() => navigateToTab('shop')}
                    onSelectProduct={(p) => navigateToProduct(p.id)}
                    onAddToCartProduct={handleAddToCart}
                    cartProductIds={new Set(cartItems.map((i) => i.product.id))}
                  />
                )}
                {activeTab === 'drills' && (
                  <div className="w-full -mt-20 sm:-mt-24 pt-24 sm:pt-28 pb-12 bg-[#071524] min-h-[90vh]">
                    <DrillsTeaserPage
                      onNavigateToCourts={() => navigateToTab('courts')}
                      onNavigateToTournaments={() => navigateToTab('tournaments')}
                    />
                  </div>
                )}
                {activeTab === 'courts' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <RallyCourtsPage initialFilters={courtFilterParam} onSelectClub={setSelectedClub} onSelectDirectSlot={(club, slot) => setBookingSlot({ club, slot })} />
                  </div>
                )}
                {activeTab === 'matchmaking' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <RallyMatchmakingPage userId={userSession?.userId || ''} userName={userSession?.fullName || 'کاربر گرامی'} walletBalance={walletBalance} />
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
                {activeTab === 'rankings' && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"><RallyRankingsPage /></div>}
                {activeTab === 'magazine' && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"><RallyMagazinePage /></div>}
                {activeTab === 'terms' && <RallyTermsPage />}
                {activeTab === 'about' && <RallyAboutPage />}
                {activeTab === 'contact' && <RallyContactPage />}
                {activeTab === 'shop' && (
                  <RallyShopPage
                    products={productsList}
                    onAddToCart={handleAddToCart}
                    onSelectProduct={(p) => navigateToProduct(p.id)}
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
        onBookingPaymentCompleted={(receipt) => {
          setWalletBalance((prev) => Math.max(0, prev - receipt.totalAmount));
          try {
            const prevBookings = JSON.parse(localStorage.getItem('my_rally_bookings') || '[]');
            localStorage.setItem('my_rally_bookings', JSON.stringify([receipt, ...prevBookings]));
          } catch {}
        }}
        selectedCoach={selectedCoach} onCloseCoach={() => setSelectedCoach(null)}
        selectedTournament={selectedTournament} onCloseTournament={() => setSelectedTournament(null)}
        selectedProduct={null} onCloseProduct={() => {}}
        onAddToCartProduct={handleAddToCart}
        onOpenCartFromProduct={() => setIsCartOpen(true)}
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
        onNavigateToPortal={() => { setIsAuthOpen(false); navigateToPortal(); }}
      />
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={(tab) => navigateToTab(tab)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={!!userSession}
      />
      <ModernRallyFooter onNavigateTab={(t) => navigateToTab(t as RallyPageTab)} />
    </div>
  );
};

export default App;

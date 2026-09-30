import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { RallyHeader, RallyPageTab } from './components/rally/RallyHeader';
import { MobileBottomNav } from './components/rally/MobileBottomNav';
import { RallyHomePage } from './pages/rally/RallyHomePage';
import { RallyCourtsPage } from './pages/rally/RallyCourtsPage';
import { RallyMatchmakingPage } from './pages/rally/RallyMatchmakingPage';
import { RallyCoachesPage } from './pages/rally/RallyCoachesPage';
import { RallyTournamentsPage } from './pages/rally/RallyTournamentsPage';
import { RallyShopPage } from './pages/rally/RallyShopPage';
import { RallyPartnerHubPage } from './pages/rally/RallyPartnerHubPage';
import { RallySponsorsPage } from './pages/rally/RallySponsorsPage';
import { CourtDetailsModal } from './components/rally/CourtDetailsModal';
import { BookingFlowModal } from './components/rally/BookingFlowModal';
import { CoachDetailsModal } from './components/rally/CoachDetailsModal';
import { TournamentDetailsModal } from './components/rally/TournamentDetailsModal';
import { ProductDetailsModal } from './components/rally/shop/ProductDetailsModal';
import { CartDrawer } from './components/rally/shop/CartDrawer';
import { ShopReceiptModal } from './components/rally/shop/ShopReceiptModal';
import { ScenarioTesterBar } from './components/rally/ScenarioTesterBar';
import { WalletModal } from './components/WalletModal';
import { AuthModal, UserSession } from './components/AuthModal';
import { CourtClub, Coach, Tournament, TimeSlotItem, SportType, ShopProduct, CartItem, ShopOrderReceipt } from './types/rally';
import { MOCK_CLUBS, MOCK_COACHES, MOCK_TOURNAMENTS } from './data/mockRallyData';
import { MOCK_SHOP_PRODUCTS } from './data/mockRallyShopData';
import { rallyApi } from './services/rallyApi';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RallyPageTab>('home');
  const [selectedCity, setSelectedCity] = useState('تهران');
  const [walletBalance, setWalletBalance] = useState<number>(35000000);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('padel_auth');
      return saved ? JSON.parse(saved) : { userId: 'usr-1', fullName: 'امیر نکوزاده', phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹', role: 'PLAYER' };
    } catch {
      return null;
    }
  });

  // Modals & Shop State
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
  const [simulateState, setSimulateState] = useState<'NORMAL' | 'SLOT_LOST' | 'PAYMENT_PENDING'>('NORMAL');

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

  return (
    <div className="min-h-screen flex flex-col bg-rally-light-bg text-rally-charcoal selection:bg-rally-accent selection:text-rally-charcoal font-sans">
      <RallyHeader
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        walletBalance={walletBalance}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        userName={userSession?.fullName}
        cartItemsCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 pb-20 lg:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
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
                onNavigateToSponsors={() => setActiveTab('sponsors')}
              />
            )}
            {activeTab === 'courts' && (
              <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6">
                <RallyCourtsPage initialFilters={courtFilterParam} onSelectClub={setSelectedClub} onSelectDirectSlot={(club, slot) => setBookingSlot({ club, slot })} />
              </div>
            )}
            {activeTab === 'matchmaking' && (
              <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6">
                <RallyMatchmakingPage
                  userId={userSession?.userId || 'usr-1'}
                  userName={userSession?.fullName || 'کاربر رالی'}
                  walletBalance={walletBalance}
                />
              </div>
            )}
            {activeTab === 'coaches' && (
              <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6">
                <RallyCoachesPage initialFilters={coachFilterParam} onSelectCoach={setSelectedCoach} />
              </div>
            )}
            {activeTab === 'tournaments' && (
              <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6">
                <RallyTournamentsPage onSelectTournament={setSelectedTournament} />
              </div>
            )}
            {activeTab === 'shop' && (
              <RallyShopPage
                products={MOCK_SHOP_PRODUCTS}
                onAddToCart={handleAddToCart}
                onSelectProduct={setSelectedProduct}
                cartProductIds={new Set(cartItems.map((i) => i.product.id))}
                onOpenCart={() => setIsCartOpen(true)}
              />
            )}
            {activeTab === 'partners' && (
              <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6">
                <RallyPartnerHubPage />
              </div>
            )}
            {activeTab === 'sponsors' && (
              <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6">
                <RallySponsorsPage />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Interactive Modals */}
      {selectedClub && (
        <CourtDetailsModal
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onProceedBooking={(club, slot) => { setSelectedClub(null); setBookingSlot({ club, slot }); }}
        />
      )}
      {bookingSlot && (
        <BookingFlowModal
          club={bookingSlot.club}
          slot={bookingSlot.slot}
          walletBalance={walletBalance}
          simulateState={simulateState}
          onClose={() => setBookingSlot(null)}
          onPaymentCompleted={() => {}}
        />
      )}
      {selectedCoach && (
        <CoachDetailsModal
          coach={selectedCoach}
          onClose={() => setSelectedCoach(null)}
          onRequestSubmitted={() => setSelectedCoach(null)}
        />
      )}
      {selectedTournament && (
        <TournamentDetailsModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
          onRegisterConfirmed={() => setSelectedTournament(null)}
        />
      )}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenCart={() => { setSelectedProduct(null); setIsCartOpen(true); }}
        />
      )}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.product.id !== id))}
        onClearCart={() => setCartItems([])}
        walletBalance={walletBalance}
        userName={userSession?.fullName}
        userPhone={userSession?.phoneNumber}
        onOrderComplete={(receipt) => {
          setShopReceipt(receipt);
          if (receipt.paymentMethod === 'WALLET') {
            setWalletBalance((prev) => Math.max(0, prev - receipt.totalAmount * 10));
          }
        }}
      />

      {/* Shop Order Receipt Modal */}
      <ShopReceiptModal receipt={shopReceipt} onClose={() => setShopReceipt(null)} />

      <WalletModal
        userId={userSession?.userId || 'usr-1'}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBalanceUpdated={setWalletBalance}
      />
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={userSession}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={setUserSession}
        onLogout={() => { localStorage.removeItem('padel_auth'); setUserSession(null); }}
      />
      <ScenarioTesterBar
        onRunScenario1={() => {
          const club = MOCK_CLUBS[0];
          const slot = club.slots.find((s) => s.startTime === '۱۸:۰۰') || club.slots[4];
          setBookingSlot({ club, slot });
        }}
        onRunScenario2={() => setSelectedCoach(MOCK_COACHES[0])}
        onRunScenario3={() => setSelectedTournament(MOCK_TOURNAMENTS[0])}
        currentSimulateState={simulateState}
        onSetSimulateState={setSimulateState}
      />
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={!!userSession}
      />
      <footer className="w-full bg-white border-t border-gray-200 py-8 text-xs text-gray-500">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-rally-charcoal text-sm">رالی</span>
            <span>— سامانه هوشمند رزرو زمین، مربیان، مسابقات و فروشگاه تخصصی پدل و تنیس</span>
          </div>
          <p>© ۱۴۰۵ تمامی حقوق برای پلتفرم ورزشی رالی محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

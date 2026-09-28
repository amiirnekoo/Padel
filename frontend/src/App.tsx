import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RallyHeader, RallyPageTab } from './components/rally/RallyHeader';
import { MobileBottomNav } from './components/rally/MobileBottomNav';
import { RallyHomePage } from './pages/rally/RallyHomePage';
import { RallyCourtsPage } from './pages/rally/RallyCourtsPage';
import { RallyCoachesPage } from './pages/rally/RallyCoachesPage';
import { RallyTournamentsPage } from './pages/rally/RallyTournamentsPage';
import { RallyPartnerHubPage } from './pages/rally/RallyPartnerHubPage';
import { RallySponsorsPage } from './pages/rally/RallySponsorsPage';
import { CourtDetailsModal } from './components/rally/CourtDetailsModal';
import { BookingFlowModal } from './components/rally/BookingFlowModal';
import { CoachDetailsModal } from './components/rally/CoachDetailsModal';
import { TournamentDetailsModal } from './components/rally/TournamentDetailsModal';
import { ScenarioTesterBar } from './components/rally/ScenarioTesterBar';
import { WalletModal } from './components/WalletModal';
import { AuthModal, UserSession } from './components/AuthModal';
import { CourtClub, Coach, Tournament, TimeSlotItem, BookingReceipt, SportType } from './types/rally';
import { MOCK_CLUBS, MOCK_COACHES, MOCK_TOURNAMENTS } from './data/mockRallyData';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RallyPageTab>('home');
  const [selectedCity, setSelectedCity] = useState('تهران');
  const [walletBalance, setWalletBalance] = useState<number>(35000000); // 3,500,000 Tomans
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

  // Modals state
  const [selectedClub, setSelectedClub] = useState<CourtClub | null>(null);
  const [bookingSlot, setBookingSlot] = useState<{ club: CourtClub; slot: TimeSlotItem } | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [courtFilterParam, setCourtFilterParam] = useState<{ sport?: SportType; area?: string }>({});
  const [coachFilterParam, setCoachFilterParam] = useState<{ sport?: SportType; level?: string }>({});

  // Simulation mode
  const [simulateState, setSimulateState] = useState<'NORMAL' | 'SLOT_LOST' | 'PAYMENT_PENDING'>('NORMAL');

  // Scenario 1: Court booking for tomorrow evening
  const handleRunScenario1 = () => {
    const club = MOCK_CLUBS[0]; // Enghelab
    const slot = club.slots.find((s) => s.startTime === '۱۸:۰۰') || club.slots[4];
    setBookingSlot({ club, slot });
  };

  // Scenario 2: Beginner coach request
  const handleRunScenario2 = () => {
    setSelectedCoach(MOCK_COACHES[0]);
  };

  // Scenario 3: Tournament registration review
  const handleRunScenario3 = () => {
    setSelectedTournament(MOCK_TOURNAMENTS[0]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-rally-light-bg text-rally-charcoal selection:bg-rally-accent selection:text-rally-charcoal font-sans">
      
      {/* 1. Sticky Navigation Header */}
      <RallyHeader
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        walletBalance={walletBalance}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        userName={userSession?.fullName}
      />

      {/* 2. Main Viewport */}
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
                onSelectClub={(club) => setSelectedClub(club)}
                onSelectDirectSlot={(club, slot) => setBookingSlot({ club, slot })}
                onSelectCoach={(coach) => setSelectedCoach(coach)}
                onSelectTournament={(t) => setSelectedTournament(t)}
                onNavigateToCourts={(f) => {
                  if (f) setCourtFilterParam(f);
                  setActiveTab('courts');
                }}
                onNavigateToCoaches={(f) => {
                  if (f) setCoachFilterParam(f);
                  setActiveTab('coaches');
                }}
                onNavigateToTournaments={() => setActiveTab('tournaments')}
                onNavigateToSponsors={() => setActiveTab('sponsors')}
              />
            )}

            {activeTab === 'courts' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <RallyCourtsPage
                  initialFilters={courtFilterParam}
                  onSelectClub={(club) => setSelectedClub(club)}
                  onSelectDirectSlot={(club, slot) => setBookingSlot({ club, slot })}
                />
              </div>
            )}

            {activeTab === 'coaches' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <RallyCoachesPage
                  initialFilters={coachFilterParam}
                  onSelectCoach={(coach) => setSelectedCoach(coach)}
                />
              </div>
            )}

            {activeTab === 'tournaments' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <RallyTournamentsPage
                  onSelectTournament={(t) => setSelectedTournament(t)}
                />
              </div>
            )}

            {activeTab === 'partners' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <RallyPartnerHubPage />
              </div>
            )}

            {activeTab === 'sponsors' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <RallySponsorsPage />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Interactive Modals */}
      {selectedClub && (
        <CourtDetailsModal
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onProceedBooking={(club, slot) => {
            setSelectedClub(null);
            setBookingSlot({ club, slot });
          }}
        />
      )}

      {bookingSlot && (
        <BookingFlowModal
          club={bookingSlot.club}
          slot={bookingSlot.slot}
          walletBalance={walletBalance}
          simulateState={simulateState}
          onClose={() => setBookingSlot(null)}
          onPaymentCompleted={(receipt) => {
            // Deduct simulated balance if wallet was used
          }}
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

      <WalletModal
        userId={userSession?.userId || 'usr-1'}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBalanceUpdated={(b) => setWalletBalance(b)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        currentUser={userSession}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setUserSession(u)}
        onLogout={() => {
          localStorage.removeItem('padel_auth');
          setUserSession(null);
        }}
      />

      {/* 4. Interactive Scenario Tester Floating Toolbar */}
      <ScenarioTesterBar
        onRunScenario1={handleRunScenario1}
        onRunScenario2={handleRunScenario2}
        onRunScenario3={handleRunScenario3}
        currentSimulateState={simulateState}
        onSetSimulateState={setSimulateState}
      />

      {/* 5. Mobile 5-Destination Bottom Navigation */}
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={!!userSession}
      />

      {/* 6. Clean Minimalist Luxury Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-rally-charcoal text-sm">رالی</span>
            <span>— سامانه هوشمند رزرو زمین، مربیان و مسابقات پدل و تنیس</span>
          </div>
          <p>© ۱۴۰۵ تمامی حقوق برای پلتفرم ورزشی رالی محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

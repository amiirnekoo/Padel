import React from 'react';
import { CourtDetailsModal } from './CourtDetailsModal';
import { BookingFlowModal } from './BookingFlowModal';
import { CoachDetailsModal } from './CoachDetailsModal';
import { TournamentDetailsModal } from './TournamentDetailsModal';
import { ProductDetailsModal } from './shop/ProductDetailsModal';
import { CartDrawer } from './shop/CartDrawer';
import { ShopReceiptModal } from './shop/ShopReceiptModal';
import { WalletModal } from '../WalletModal';
import { AuthModal, UserSession } from '../AuthModal';
import { CourtClub, Coach, Tournament, TimeSlotItem, ShopProduct, CartItem, ShopOrderReceipt, BookingReceipt } from '../../types/rally';

interface AppModalsContainerProps {
  selectedClub: CourtClub | null;
  onCloseClub: () => void;
  onProceedBooking: (club: CourtClub, slot: TimeSlotItem) => void;
  bookingSlot: { club: CourtClub; slot: TimeSlotItem } | null;
  walletBalance: number;
  simulateState?: 'NORMAL' | 'SLOT_LOST' | 'PAYMENT_PENDING';
  onCloseBooking: () => void;
  onBookingPaymentCompleted?: (receipt: BookingReceipt) => void;
  selectedCoach: Coach | null;
  onCloseCoach: () => void;
  selectedTournament: Tournament | null;
  onCloseTournament: () => void;
  selectedProduct: ShopProduct | null;
  onCloseProduct: () => void;
  onAddToCartProduct: (p: ShopProduct) => void;
  onOpenCartFromProduct: () => void;
  isCartOpen: boolean;
  onCloseCart: () => void;
  cartItems: CartItem[];
  onUpdateCartQty: (productId: string, qty: number) => void;
  onRemoveCartItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderComplete: (receipt: ShopOrderReceipt) => void;
  shopReceipt: ShopOrderReceipt | null;
  onCloseReceipt: () => void;
  isWalletOpen: boolean;
  onCloseWallet: () => void;
  onBalanceUpdated: (newBal: number) => void;
  isAuthOpen: boolean;
  userSession: UserSession | null;
  onCloseAuth: () => void;
  onLoginSuccess: (session: UserSession) => void;
  onLogout: () => void;
  onNavigateToPortal?: (view?: 'PLAYER' | 'COACH' | 'CLUB_MANAGER' | 'ADMIN') => void;
}

export const AppModalsContainer: React.FC<AppModalsContainerProps> = ({
  selectedClub,
  onCloseClub,
  onProceedBooking,
  bookingSlot,
  walletBalance,
  simulateState,
  onCloseBooking,
  onBookingPaymentCompleted,
  selectedCoach,
  onCloseCoach,
  selectedTournament,
  onCloseTournament,
  selectedProduct,
  onCloseProduct,
  onAddToCartProduct,
  onOpenCartFromProduct,
  isCartOpen,
  onCloseCart,
  cartItems,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onOrderComplete,
  shopReceipt,
  onCloseReceipt,
  isWalletOpen,
  onCloseWallet,
  onBalanceUpdated,
  isAuthOpen,
  userSession,
  onCloseAuth,
  onLoginSuccess,
  onLogout,
  onNavigateToPortal
}) => {
  return (
    <>
      {selectedClub && (
        <CourtDetailsModal
          club={selectedClub}
          onClose={onCloseClub}
          onProceedBooking={onProceedBooking}
        />
      )}
      {bookingSlot && (
        <BookingFlowModal
          club={bookingSlot.club}
          slot={bookingSlot.slot}
          walletBalance={walletBalance}
          simulateState={simulateState}
          userSession={userSession}
          onClose={onCloseBooking}
          onPaymentCompleted={onBookingPaymentCompleted || (() => {})}
        />
      )}
      {selectedCoach && (
        <CoachDetailsModal
          coach={selectedCoach}
          onClose={onCloseCoach}
          onRequestSubmitted={onCloseCoach}
        />
      )}
      {selectedTournament && (
        <TournamentDetailsModal
          tournament={selectedTournament}
          onClose={onCloseTournament}
          onRegisterConfirmed={onCloseTournament}
        />
      )}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={onCloseProduct}
          onAddToCart={onAddToCartProduct}
          onOpenCart={onOpenCartFromProduct}
        />
      )}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={onCloseCart}
        items={cartItems}
        onUpdateQty={onUpdateCartQty}
        onRemoveItem={onRemoveCartItem}
        onClearCart={onClearCart}
        walletBalance={walletBalance}
        userName={userSession?.fullName}
        userPhone={userSession?.phoneNumber}
        onOrderComplete={onOrderComplete}
      />
      <ShopReceiptModal receipt={shopReceipt} onClose={onCloseReceipt} />
      <WalletModal
        userId={userSession?.userId || 'usr-1'}
        isOpen={isWalletOpen}
        onClose={onCloseWallet}
        onBalanceUpdated={onBalanceUpdated}
      />
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={userSession}
        onClose={onCloseAuth}
        onLoginSuccess={onLoginSuccess}
        onLogout={onLogout}
        onNavigateToPortal={onNavigateToPortal}
      />
    </>
  );
};

import React from 'react';
import { ModernRallyHero } from '../../components/rally/ModernRallyHero';
import { ModernCourtShowcase } from '../../components/rally/ModernCourtShowcase';
import { ModernShopShowcase } from '../../components/rally/ModernShopShowcase';
import { ModernFeaturedBanners } from '../../components/rally/ModernFeaturedBanners';
import { CourtClub, Coach, Tournament, TimeSlotItem, SportType, ShopProduct } from '../../types/rally';
import { MOCK_CLUBS, MOCK_TOURNAMENTS } from '../../data/mockRallyData';

interface RallyHomePageProps {
  selectedCity: string;
  onSelectClub: (club: CourtClub) => void;
  onSelectDirectSlot: (club: CourtClub, slot: TimeSlotItem) => void;
  onSelectCoach: (coach: Coach) => void;
  onSelectTournament: (tournament: Tournament) => void;
  onNavigateToCourts: (filter?: { sport?: SportType; area?: string }) => void;
  onNavigateToCoaches: (filter?: { sport?: SportType; level?: string }) => void;
  onNavigateToTournaments: (filter?: { sport?: SportType; level?: string }) => void;
  onNavigateToSponsors: () => void;
  onNavigateToShop?: () => void;
  onSelectProduct?: (product: ShopProduct) => void;
  onAddToCartProduct?: (product: ShopProduct) => void;
  cartProductIds?: Set<string>;
}

export const RallyHomePage: React.FC<RallyHomePageProps> = ({
  selectedCity,
  onSelectClub,
  onSelectDirectSlot,
  onSelectCoach,
  onSelectTournament,
  onNavigateToCourts,
  onNavigateToCoaches,
  onNavigateToTournaments,
  onNavigateToSponsors,
  onNavigateToShop,
  onSelectProduct,
  onAddToCartProduct,
  cartProductIds
}) => {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section with Brand Visual Identity & Unified Search */}
      <ModernRallyHero
        onSearchCourts={(filters) => {
          onNavigateToCourts({ sport: filters.sport, area: filters.area });
        }}
        onNavigateToCoaches={() => {
          onNavigateToCoaches();
        }}
        onNavigateToTournaments={() => {
          onNavigateToTournaments();
        }}
      />

      {/* 2. Suggested Courts Showcase (3 Cards matching design reference) */}
      <ModernCourtShowcase
        onSelectClub={onSelectClub}
        onSelectSlot={onSelectDirectSlot}
        onViewAllCourts={() => onNavigateToCourts()}
        fallbackClubs={MOCK_CLUBS}
      />

      {/* 3. Specialized Equipment Shop Showcase (Premier Rackets & Balls) */}
      <ModernShopShowcase
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCartProduct}
        onViewAllProducts={() => onNavigateToShop?.()}
        cartProductIds={cartProductIds}
      />

      {/* 4. Featured Tournament & Commercial Partnership Side-by-Side */}
      <ModernFeaturedBanners
        onSelectTournament={onSelectTournament}
        onNavigateToTournaments={() => onNavigateToTournaments()}
        onNavigateToPartners={() => onNavigateToSponsors()}
        fallbackTournament={MOCK_TOURNAMENTS[0]}
      />
    </div>
  );
};

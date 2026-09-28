import React from 'react';
import { RallyHeroBanner } from '../../components/rally/RallyHeroBanner';
import { FeaturedSections } from '../../components/rally/FeaturedSections';
import { CourtClub, Coach, Tournament, TimeSlotItem, SportType } from '../../types/rally';
import { MOCK_CLUBS, MOCK_COACHES, MOCK_TOURNAMENTS } from '../../data/mockRallyData';

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
  onNavigateToSponsors
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Dynamic Hero Banner with Integrated 3-Tab Search Box */}
      <RallyHeroBanner
        selectedCity={selectedCity}
        onSearchCourts={(filters) => {
          onNavigateToCourts({ sport: filters.sport, area: filters.area });
        }}
        onSearchCoaches={(filters) => {
          onNavigateToCoaches({ sport: filters.sport, level: filters.level });
        }}
        onSearchTournaments={(filters) => {
          onNavigateToTournaments({ sport: filters.sport, level: filters.level });
        }}
      />

      {/* Curated Recommendations and Trust Elements */}
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <FeaturedSections
          featuredClubs={MOCK_CLUBS}
          coaches={MOCK_COACHES}
          tournaments={MOCK_TOURNAMENTS}
          onSelectClub={onSelectClub}
          onSelectDirectSlot={onSelectDirectSlot}
          onSelectCoach={onSelectCoach}
          onSelectTournament={onSelectTournament}
          onNavigateToCourts={onNavigateToCourts}
          onNavigateToCoaches={onNavigateToCoaches}
          onNavigateToTournaments={onNavigateToTournaments}
          onNavigateToSponsors={onNavigateToSponsors}
        />
      </div>
    </div>
  );
};

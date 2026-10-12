import React, { useEffect, useMemo } from 'react';
import { CourtClub, TimeSlotItem } from '../../../types/rally';
import { getClubRichProfile } from '../../../data/clubsRichData';
import { ClubHeroGallery } from './ClubHeroGallery';
import { ClubSpecsAndAmenities } from './ClubSpecsAndAmenities';
import { ClubSlotsTable } from './ClubSlotsTable';
import { ClubLocationMap } from './ClubLocationMap';
import { ClubFaqSection } from './ClubFaqSection';

interface RallyClubDetailPageProps {
  club: CourtClub;
  onBackToCourts: () => void;
  onProceedBooking: (club: CourtClub, slot: TimeSlotItem) => void;
}

export const RallyClubDetailPage: React.FC<RallyClubDetailPageProps> = React.memo(({
  club,
  onBackToCourts,
  onProceedBooking
}) => {
  // Scroll to top on club change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [club.id]);

  const richProfile = useMemo(() => getClubRichProfile(club.id), [club.id]);

  const handleScrollToSlots = () => {
    const el = document.getElementById('club-slots-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8" dir="rtl">
      {/* 1. Hero & Image Showcase */}
      <ClubHeroGallery
        club={club}
        richProfile={richProfile}
        onBackToCourts={onBackToCourts}
        onScrollToSlots={handleScrollToSlots}
      />

      {/* 2. Interactive Timetable & Live Slots */}
      <ClubSlotsTable
        club={club}
        onProceedBooking={onProceedBooking}
      />

      {/* 3. Technical Specifications & Club Amenities */}
      <ClubSpecsAndAmenities
        club={club}
        richProfile={richProfile}
      />

      {/* 4. Interactive Location Map & 4-App Navigation */}
      <ClubLocationMap
        club={club}
        richProfile={richProfile}
      />

      {/* 5. Frequently Asked Questions & Resident Coaches */}
      <ClubFaqSection
        richProfile={richProfile}
      />
    </div>
  );
});

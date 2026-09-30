import React from 'react';
import { RallyBookingSearch } from './RallyBookingSearch';
import { SportType } from '../../types/rally';

interface ModernRallyHeroProps {
  onSearchCourts: (filters: { sport: SportType; city: string; area?: string; date: string }) => void;
  onNavigateToCoaches: () => void;
  onNavigateToTournaments: () => void;
}

export const ModernRallyHero: React.FC<ModernRallyHeroProps> = ({
  onSearchCourts,
  onNavigateToCoaches,
  onNavigateToTournaments
}) => {
  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[640px] pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden flex flex-col justify-center items-center text-center" dir="rtl">
      {/* Background Court Photo with Controlled Deep Mineral Teal Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/rally_hero_clean.jpg"
          alt="زمین پدل رالی"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Deep Mineral Teal Tonal Overlays (No backdrop-blur per performance rules) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E3D38]/85 via-[#0E3D38]/75 to-[#0E3D38]/95" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#0E3D38]/90" />
      </div>

      {/* Electric Lime Ball Trajectory Line (مسیر حرکت توپ) as Brand Signature */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          className="w-full h-full min-w-[1000px] opacity-40 md:opacity-50"
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M -100 480 C 350 560, 600 220, 1100 240 C 1300 250, 1420 180, 1540 120"
            stroke="#D7ED68"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="motion-safe:animate-[pulse_4s_ease-in-out_infinite]"
          />
          {/* Subtle ball endpoint highlight */}
          <circle cx="1100" cy="240" r="5" fill="#D7ED68" />
          <circle cx="1100" cy="240" r="10" stroke="#D7ED68" strokeWidth="1" opacity="0.4" />
        </svg>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight lg:leading-tight mb-4 select-none">
          مرجع بازی‌های <span className="text-[#D7ED68] inline-block">راکتی</span> ایران
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-[#F5F4EF]/90 font-medium max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          زمین مناسب را پیدا کن، مربی انتخاب کن و در رقابت بعدی حاضر شو.
        </p>

        {/* Unified Booking Search Component */}
        <div className="w-full">
          <RallyBookingSearch
            onSearch={onSearchCourts}
            onNavigateToCoaches={onNavigateToCoaches}
            onNavigateToTournaments={onNavigateToTournaments}
          />
        </div>

      </div>
    </section>
  );
};

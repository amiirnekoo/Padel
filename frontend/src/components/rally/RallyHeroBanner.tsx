import React from 'react';
import { SportType } from '../../types/rally';
import { HeroSearchBox } from './HeroSearchBox';

interface RallyHeroBannerProps {
  onSearchCourts: (filters: { sport: SportType; area: string; date: string; time: string }) => void;
  onSearchCoaches: (filters: { sport: SportType; level: string; goal: string }) => void;
  onSearchTournaments: (filters: { sport: SportType; level: string }) => void;
  selectedCity: string;
}

export const RallyHeroBanner: React.FC<RallyHeroBannerProps> = ({
  onSearchCourts,
  onSearchCoaches,
  onSearchTournaments,
  selectedCity
}) => {
  return (
    <section className="relative w-full bg-rally-primary text-white overflow-hidden py-10 lg:py-16">
      {/* Subtle court lines watermark background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="0" x2="10%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="90%" y1="0" x2="90%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="2" />
          <circle cx="50%" cy="50%" r="120" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Right Column: Hero Headline & Value proposition */}
          <div className="lg:col-span-6 space-y-5 text-right">
            
            {/* Brand badge with lime dot */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-rally-accent">
              <span className="w-2 h-2 rounded-full bg-rally-accent shadow-rally-glow animate-pulse" />
              <span>پلتفرم تخصصی پدل و تنیس ایران</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              بازی بعدی‌ات از <span className="text-rally-accent underline decoration-rally-accent/40 decoration-4 underline-offset-8">رالی</span> شروع میشه.
            </h1>

            <p className="text-sm sm:text-base text-gray-200 font-normal leading-relaxed max-w-xl">
              زمین رزرو کن، مربی مناسب سطحت رو پیدا کن و به جمع رقابت‌های مسابقاتی بپیوند؛ سریع، شفاف و مطمئن.
            </p>

            {/* Quick trust metrics */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rally-accent" />
                <span>تضمین قطعی سانس بدون کنسلی یک‌طرفه</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rally-accent" />
                <span>استرداد آنلاین وجه طبق قوانین مشخص</span>
              </div>
            </div>
          </div>

          {/* Left Column: Real Action Sports Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 aspect-[16/10] group">
              <img
                src="/images/rally_hero.jpg"
                alt="مسابقه پرهیجان پدل در کورت شیشه‌ای"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rally-primary-dark/80 via-transparent to-transparent" />
              
              {/* Bottom floating badge on image */}
              <div className="absolute bottom-3 right-3 left-3 bg-rally-primary-dark/90 border border-white/20 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rally-accent text-rally-charcoal flex items-center justify-center font-black">
                    WPT
                  </div>
                  <div>
                    <p className="font-bold text-white">کورت‌های شیشه‌ای و چمن استاندارد</p>
                    <p className="text-[11px] text-gray-300">مجموعه انقلاب، لفور آجودانیه و بام ولنجک</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-rally-accent bg-white/10 px-2 py-1 rounded-lg">
                  آماده رزرو
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Central Search Box Component */}
        <HeroSearchBox
          selectedCity={selectedCity}
          onSearchCourts={onSearchCourts}
          onSearchCoaches={onSearchCoaches}
          onSearchTournaments={onSearchTournaments}
        />
      </div>
    </section>
  );
};

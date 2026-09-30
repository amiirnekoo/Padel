import React from 'react';
import { Calendar, MapPin, Trophy, Handshake, ChevronLeft } from 'lucide-react';
import { Tournament } from '../../types/rally';

interface ModernFeaturedBannersProps {
  onSelectTournament?: (tournament: Tournament) => void;
  onNavigateToTournaments: () => void;
  onNavigateToPartners: () => void;
  fallbackTournament?: Tournament;
}

export const ModernFeaturedBanners: React.FC<ModernFeaturedBannersProps> = ({
  onSelectTournament,
  onNavigateToTournaments,
  onNavigateToPartners,
  fallbackTournament
}) => {
  const handleTournamentClick = () => {
    if (fallbackTournament && onSelectTournament) {
      onSelectTournament(fallbackTournament);
    } else {
      onNavigateToTournaments();
    }
  };

  return (
    <section className="w-full py-12 md:py-16 bg-white border-t border-[#E8E6DD]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Featured Tournament (Padel Blue Court Atmosphere) */}
          <div className="relative rounded-2xl overflow-hidden bg-[#0B2B4E] text-white flex flex-col justify-between shadow-xl min-h-[380px] group border border-[#0C4F8D]/50">
            {/* Background Tournament Image with Controlled Padel Blue Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="/images/tournament_player_crop.jpg"
                alt="مسابقات پدل جام پاییز"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 opacity-40"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B2F] via-[#0B2B4E]/85 to-[#0C4F8D]/50" />
            </div>

            {/* Top Label */}
            <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#D7ED68] text-[#0A1B2F] text-xs font-black">
                <Trophy className="w-4 h-4" />
                <span>رویداد شاخص کشوری</span>
              </span>
              <span className="text-xs text-white/70 font-bold">پاییز ۱۴۰۵</span>
            </div>

            {/* Content Details */}
            <div className="relative z-10 p-6 sm:p-8 pt-0">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                جام پاییز تهران
              </h3>
              
              <div className="space-y-2 mb-6 text-xs sm:text-sm text-[#F5F4EF]/85 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D7ED68]" />
                  <span>۱۲ تا ۱۵ آبان ۱۴۰۵</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D7ED68]" />
                  <span>آکادمی پدل انقلاب تهران</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-[#D7ED68]">●</span>
                  <span>رده مسابقات: دوبل آزاد آقایان و بانوان (سطح طلایی)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTournamentClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#0A1B2F] text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
              >
                <span>اطلاعات و ثبت‌نام</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Commercial Partnership (Deliberate Turf Green Accent) */}
          <div className="relative rounded-2xl overflow-hidden bg-[#0E3D38] text-white flex flex-col justify-between shadow-xl min-h-[380px] group border border-[#14574F]">
            {/* Background Partnership Image with Controlled Turf Green Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="/images/partnership_court_crop.jpg"
                alt="همکاری با رالی پدل"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 opacity-30"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082522] via-[#0E3D38]/85 to-[#14574F]/50" />
            </div>

            {/* Top Label */}
            <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-[#F5F4EF] border border-white/15 text-xs font-bold">
                <Handshake className="w-4 h-4 text-[#D7ED68]" />
                <span>همکاری تجاری</span>
              </span>
              <span className="text-xs text-white/50 font-bold">B2B & Sponsorship</span>
            </div>

            {/* Content Details */}
            <div className="relative z-10 p-6 sm:p-8 pt-0">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                در کنار رشد ورزش‌های راکتی در ایران
              </h3>
              
              <p className="text-xs sm:text-sm text-[#F5F4EF]/85 font-medium leading-relaxed mb-6 max-w-lg">
                فرصت همکاری اختصاصی برای باشگاه‌ها، برگزارکنندگان مسابقات و برندهای ورزشی جهت ارتقای زیرساخت و دسترسی بازیکنان سراسر کشور.
              </p>

              <button
                type="button"
                onClick={onNavigateToPartners}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
              >
                <span>اطلاعات همکاری</span>
                <ChevronLeft className="w-4 h-4 text-[#D7ED68]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

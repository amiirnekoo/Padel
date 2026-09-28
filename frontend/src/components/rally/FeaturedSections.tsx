import React from 'react';
import {
  CalendarCheck,
  Award,
  Users2,
  ChevronLeft,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Handshake
} from 'lucide-react';
import { CourtClub, Coach, Tournament, TimeSlotItem } from '../../types/rally';
import { CourtCard } from './CourtCard';

interface FeaturedSectionsProps {
  featuredClubs: CourtClub[];
  coaches: Coach[];
  tournaments: Tournament[];
  onSelectClub: (club: CourtClub) => void;
  onSelectDirectSlot: (club: CourtClub, slot: TimeSlotItem) => void;
  onSelectCoach: (coach: Coach) => void;
  onSelectTournament: (tournament: Tournament) => void;
  onNavigateToCourts: () => void;
  onNavigateToCoaches: () => void;
  onNavigateToTournaments: () => void;
  onNavigateToSponsors: () => void;
}

export const FeaturedSections: React.FC<FeaturedSectionsProps> = ({
  featuredClubs,
  coaches,
  tournaments,
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
    <div className="space-y-12 py-8">
      
      {/* 1. Featured Courts Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rally-accent ring-2 ring-rally-primary" />
              <h2 className="text-xl sm:text-2xl font-black text-rally-charcoal">زمین‌های برگزیده و آماده بازی</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">دارای سانس‌های آزاد و تأییدیه استانداردهای فدراسیون</p>
          </div>

          <button
            onClick={onNavigateToCourts}
            className="flex items-center gap-1 text-xs font-bold text-rally-primary hover:text-rally-primary-light"
          >
            <span>مشاهده همه کورت‌ها</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredClubs.slice(0, 3).map((club) => (
            <CourtCard
              key={club.id}
              club={club}
              onSelectClub={onSelectClub}
              onSelectDirectSlot={onSelectDirectSlot}
            />
          ))}
        </div>
      </section>

      {/* 2. Upcoming Tournaments */}
      <section className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rally-primary" />
              <h2 className="text-xl font-black text-rally-charcoal">مسابقات پیش رو (آخر هفته‌ها)</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">رقابت در سطوح مختلف مبتدی تا پیشرفته با جوایز نقدی</p>
          </div>

          <button
            onClick={onNavigateToTournaments}
            className="flex items-center gap-1 text-xs font-bold text-rally-primary hover:text-rally-primary-light"
          >
            <span>تقویم کامل رویدادها</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tournaments.slice(0, 2).map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTournament(t)}
              className="group border border-gray-200 rounded-2xl p-4 flex gap-4 hover:border-rally-primary/40 hover:shadow-sm transition-all cursor-pointer bg-gray-50/50"
            >
              <img
                src={t.bannerUrl || '/images/rally_tournament.jpg'}
                alt={t.title}
                className="w-28 h-28 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rally-primary/10 text-rally-primary">
                    {t.level}
                  </span>
                  <h3 className="text-sm font-extrabold text-rally-charcoal mt-1 line-clamp-1 group-hover:text-rally-primary transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">محل: {t.venueName} • تاریخ: {t.startDate}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                  <span className="text-[11px] font-bold text-gray-600">
                    ظرفیت: {t.registeredTeams}/{t.maxTeams} تیم
                  </span>
                  <span className="font-extrabold text-rally-primary text-xs">
                    {(t.entryFee / 10).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Verified Coaches Spotlight */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rally-accent ring-2 ring-rally-primary" />
              <h2 className="text-xl sm:text-2xl font-black text-rally-charcoal">مربیان تأییدشده رالی</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">آموزش گام‌به‌گام از مبتدی تا مسابقات زیر نظر مربیان رسمی فدراسیون</p>
          </div>

          <button
            onClick={onNavigateToCoaches}
            className="flex items-center gap-1 text-xs font-bold text-rally-primary hover:text-rally-primary-light"
          >
            <span>فهرست همه مربیان</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {coaches.slice(0, 2).map((coach) => (
            <div
              key={coach.id}
              onClick={() => onSelectCoach(coach)}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:border-rally-primary/40 hover:shadow-md transition-all cursor-pointer flex gap-4"
            >
              <img
                src={coach.avatarUrl || '/images/rally_coach.jpg'}
                alt={coach.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-gray-100"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-extrabold text-rally-charcoal">{coach.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{coach.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{coach.title}</p>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{coach.bio}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-[11px] text-gray-500 font-medium">تعرفه جلسه اختصاصی:</span>
                  <span className="font-extrabold text-rally-primary text-xs">
                    از {(coach.hourlyRate / 10).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Partner with Rally Banner & Transparent Sponsor Spotlight */}
      <section className="bg-rally-primary text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-rally-accent">
            <Handshake className="w-3.5 h-3.5" />
            <span>همکاری با رالی برای باشگاه‌ها و برندها</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">مدیریت سانس کلوپ یا حامی رویدادهای کشوری</h3>
          <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
            کلوپ خود را به سامانه آنلاین متصل کنید یا برندتان را به عنوان حامی مالی رسمی تورنمنت‌های برتر معرفی نمایید.
          </p>
        </div>

        <button
          onClick={onNavigateToSponsors}
          className="px-6 py-3 rounded-xl bg-rally-accent hover:bg-rally-accent-hover text-rally-charcoal font-black text-xs shadow-md transition-all shrink-0 cursor-pointer min-h-[44px]"
        >
          درخواست همکاری تجاری
        </button>
      </section>
    </div>
  );
};

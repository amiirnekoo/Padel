import React, { useState } from 'react';
import { ArrowRight, MapPin, Star, Share2, Check, ShieldCheck, ChevronLeft, Calendar } from 'lucide-react';
import { CourtClub } from '../../../types/rally';
import { ClubRichProfile } from '../../../data/clubsRichData';

interface ClubHeroGalleryProps {
  club: CourtClub;
  richProfile: ClubRichProfile | null;
  onBackToCourts: () => void;
  onScrollToSlots: () => void;
}

export const ClubHeroGallery: React.FC<ClubHeroGalleryProps> = ({
  club,
  richProfile,
  onBackToCourts,
  onScrollToSlots
}) => {
  const [copied, setCopied] = useState(false);
  const images = richProfile?.galleryImages?.length ? richProfile.galleryImages : club.images;
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const isIndoor = club.courtType === 'INDOOR';

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb Navigation & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar">
          <button
            onClick={onBackToCourts}
            className="hover:text-slate-900 transition-colors cursor-pointer flex-shrink-0 font-medium"
          >
            کورت‌ها و سانس‌ها
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <span className="font-bold text-slate-700 flex-shrink-0">{club.city}</span>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <span className="text-slate-900 font-bold line-clamp-1 max-w-[220px] sm:max-w-xs">
            {club.name}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="اشتراک‌گذاری لینک مستقیم باشگاه"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">لینک کپی شد</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>اشتراک‌گذاری</span>
              </>
            )}
          </button>

          {/* Back Button */}
          <button
            onClick={onBackToCourts}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>همه زمین‌ها</span>
          </button>
        </div>
      </div>

      {/* Main Hero Card with Visual Showcase */}
      <div className="bg-[#0B2238] rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-700/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left/Main Column: Image and Gallery Switcher (lg: 7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-800 shadow-md border border-white/10">
              <img
                src={images[activeImgIndex] || images[0] || '/images/real_padel_hero.jpg'}
                alt={club.name}
                className="w-full h-full object-cover transition-all duration-300"
                decoding="async"
                fetchPriority="high"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('real_padel_hero.jpg')) {
                    target.src = '/images/real_padel_hero.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2238]/90 via-transparent to-black/20" />

              {/* Badges on Hero Image */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#D7ED68] text-[#0B2238] shadow-sm">
                  🎾 کورت اختصاصی پدل
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-none border border-white/30">
                  {isIndoor ? '🏢 مسقف سازه‌ای' : '🌤️ روباز سوپر پانورامیک'}
                </span>
              </div>

              {/* Rating on Image */}
              <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold border border-white/20">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{club.rating.toLocaleString('fa-IR')}</span>
              </div>

              <div className="absolute bottom-3 right-3 left-3 text-white">
                <p className="text-xs text-slate-300 font-medium line-clamp-1">
                  {richProfile?.headline || club.surface}
                </p>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImgIndex === idx
                        ? 'border-[#D7ED68] scale-102 shadow-md'
                        : 'border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`تصویر ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Quick Specs & Booking CTA (lg: 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full gap-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>باشگاه همکار رسمی و تأییدشده رالی</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {club.name}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-[#D7ED68] shrink-0" />
                <span>{club.address}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 line-clamp-4">
                {richProfile?.descriptionFa || club.surface}
              </p>
            </div>

            {/* CTA Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">پایه تعرفه هر سانس ۹۰ دقیقه‌ای:</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-[#D7ED68]">
                      {club.startingPrice.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-slate-300">تومان</span>
                  </div>
                </div>

                <div className="text-left text-xs text-slate-300">
                  <span className="text-slate-400 block text-[10px]">نزدیک‌ترین سانس آزاد:</span>
                  <span className="font-bold text-white">{club.nearestAvailableSlot || 'امروز'}</span>
                </div>
              </div>

              <button
                onClick={onScrollToSlots}
                className="w-full py-3.5 rounded-xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#0B2238] font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98"
              >
                <Calendar className="w-4 h-4" />
                <span>مشاهده تقویم و رزرو آنلاین سانس‌ها</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

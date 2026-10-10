import React, { useState } from 'react';
import { Award, Sparkles, CheckCircle2, X } from 'lucide-react';
import { ProPlayerProfile } from '../../../data/proPlayersData';

interface ProPlayerGalleryBadgeProps {
  player?: ProPlayerProfile | null;
}

export const ProPlayerGalleryBadge: React.FC<ProPlayerGalleryBadgeProps> = ({ player }) => {
  const [showModal, setShowModal] = useState(false);

  if (!player) return null;

  return (
    <>
      {/* Floating Corner Badge on Main Product Stage (Zero Blur, RTL) */}
      <div
        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-2.5 bg-slate-950/95 border border-amber-400/50 rounded-2xl p-1.5 sm:p-2 shadow-xl hover:border-amber-400 transition-all cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        title={`مشاهده مشخصات و افتخارات ${player.name_fa}`}
      >
        {/* Player Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={player.avatar_url}
            alt={player.name_fa}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border-2 border-amber-400 bg-slate-900 shadow-md group-hover:scale-105 transition-transform"
            draggable={false}
          />
          <span className="absolute -bottom-1 -left-1 text-[11px] bg-slate-900 rounded-full px-1 shadow border border-slate-700">
            {player.country_flag}
          </span>
        </div>

        {/* Text Info */}
        <div className="flex flex-col text-right pl-2 sm:pl-3">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-amber-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              راکت رسمی مسابقات
            </span>
            <CheckCircle2 className="w-3 h-3 text-sky-400 flex-shrink-0" />
          </div>
          <span className="text-xs sm:text-sm font-black text-white leading-tight mt-0.5">
            {player.name_fa}
          </span>
          <span className="text-[10px] text-slate-300 font-medium">
            {player.ranking_label_fa}
          </span>
        </div>
      </div>

      {/* Pro Player Profile Modal (On click) */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="bg-slate-900 border border-amber-400/40 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-white relative text-right flex flex-col gap-4"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Photo & Badge */}
            <div className="flex items-center gap-3.5 pt-1">
              <img
                src={player.avatar_url}
                alt={player.name_fa}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 bg-slate-800 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                    {player.country_flag} {player.ranking_label_fa}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">{player.name_fa}</h3>
                <span className="text-xs text-slate-400 font-mono" dir="ltr">
                  {player.name_en}
                </span>
              </div>
            </div>

            {/* Nickname & Titles */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">لقب در تور جهانی:</span>
              <span className="font-bold text-amber-300">{player.nickname_fa}</span>
            </div>

            {/* Bio */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
              {player.bio_fa}
            </p>

            {/* Quote */}
            {player.endorsement_quote_fa && (
              <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-r-2 border-amber-400 p-3 rounded-l-2xl text-xs text-amber-100 italic leading-relaxed">
                {player.endorsement_quote_fa}
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-400">دست بازی</span>
                <span className="font-bold text-slate-200">{player.hand}</span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-400">عناوین قهرمانی</span>
                <span className="font-bold text-amber-400">+{player.titles_count} جام</span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-slate-400">برند راکت</span>
                <span className="font-bold text-sky-400">{player.brand}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

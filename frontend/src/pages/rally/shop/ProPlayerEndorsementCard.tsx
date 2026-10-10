import React from 'react';
import { Sparkles, Trophy, Award, CheckCircle2 } from 'lucide-react';
import { ProPlayerProfile } from '../../../data/proPlayersData';

interface ProPlayerEndorsementCardProps {
  player?: ProPlayerProfile | null;
}

export const ProPlayerEndorsementCard: React.FC<ProPlayerEndorsementCardProps> = ({ player }) => {
  if (!player) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-4 sm:p-5 border border-amber-400/40 shadow-sm text-white select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Player Avatar & Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <img
              src={player.avatar_url}
              alt={player.name_fa}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-400 bg-slate-800 shadow-md"
            />
            <span className="absolute -bottom-1 -left-1 text-xs bg-slate-900 rounded-full px-1 shadow border border-slate-700">
              {player.country_flag}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                <Sparkles className="w-2.5 h-2.5" />
                راکت رسمی مسابقات جهانی
              </span>
              <span className="text-[10px] text-slate-300 font-medium">
                {player.ranking_label_fa}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-base sm:text-lg font-black text-white">
                {player.name_fa}
              </h3>
              <span className="text-xs text-amber-300/80 font-medium hidden xs:inline">
                ({player.nickname_fa})
              </span>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {player.position_fa} • {player.racket_series_fa}
            </p>
          </div>
        </div>

        {/* Badge Pill */}
        <div className="flex items-center gap-2 self-end sm:self-center bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">عناوین قهرمانی</span>
            <span className="font-black text-amber-400 text-xs">+{player.titles_count} کاپ رسمی</span>
          </div>
        </div>
      </div>

      {/* Quote */}
      {player.endorsement_quote_fa && (
        <div className="mt-3.5 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-xl">
          {player.endorsement_quote_fa}
        </div>
      )}
    </div>
  );
};

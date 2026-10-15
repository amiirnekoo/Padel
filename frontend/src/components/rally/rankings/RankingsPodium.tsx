import React from 'react';
import { RankingPlayer } from '../../../data/mockRankingsData';

interface RankingsPodiumProps {
  topThree: RankingPlayer[];
}

export const RankingsPodium: React.FC<RankingsPodiumProps> = ({ topThree }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-[#FFD700]', text: 'text-amber-950' };
    if (rank === 2) return { bg: 'bg-[#C0C0C0]', text: 'text-slate-900' };
    if (rank === 3) return { bg: 'bg-[#CD7F32]', text: 'text-amber-950' };
    return { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {topThree.map((player) => {
        const badge = getRankBadge(player.rank);
        return (
          <div
            key={player.id}
            className={`bg-white rounded-2xl p-4 border relative overflow-hidden flex flex-col items-center text-center shadow-xs transition-transform hover:-translate-y-1 ${
              player.rank === 1 ? 'border-amber-300 ring-2 ring-amber-300/40 order-first md:order-2' : 'border-gray-200 order-2 md:order-1'
            }`}
          >
            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${badge.bg} ${badge.text}`}>
                رتبه {player.rank.toLocaleString('fa-IR')}
              </span>
            </div>

            <div className="relative mt-2 mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#172320]/10 to-[#172320]/25 border-2 border-white shadow-md flex items-center justify-center text-2xl font-black text-rally-charcoal overflow-hidden">
                {player.avatarUrl ? (
                  <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{player.name.slice(0, 2)}</span>
                )}
              </div>
              <span className="absolute -bottom-1 -left-1 text-base">{player.countryFlag}</span>
            </div>

            <h3 className="text-base font-black text-rally-charcoal">{player.name}</h3>
            <p className="text-[11px] text-gray-400 font-medium mb-3">{player.englishName} • {player.club}</p>

            <div className="w-full grid grid-cols-2 gap-2 bg-[#F5F4EF] p-2.5 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block">امتیاز کل</span>
                <span className="font-black text-rally-primary">{player.points.toLocaleString('fa-IR')}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">درصد برد</span>
                <span className="font-black text-emerald-700">{player.winRate}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

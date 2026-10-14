import React from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { AmericanoPlayerStanding } from '../../../../types/americano';

interface AmericanoLeaderboardProps {
  leaderboard: AmericanoPlayerStanding[];
  isFinished?: boolean;
}

export const AmericanoLeaderboard: React.FC<AmericanoLeaderboardProps> = ({
  leaderboard,
  isFinished = false,
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-[#FFD700]', text: 'text-amber-950', label: '🥇 طلا' };
    if (rank === 2) return { bg: 'bg-[#C0C0C0]', text: 'text-slate-950', label: '🥈 نقره' };
    if (rank === 3) return { bg: 'bg-[#CD7F32]', text: 'text-amber-950', label: '🥉 برنز' };
    return { bg: 'bg-slate-800', text: 'text-slate-300', label: `#${rank}` };
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl" dir="rtl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h4 className="font-extrabold text-sm sm:text-base text-white">
            جدول رده‌بندی زنده آمریکانو (Leaderboard)
          </h4>
        </div>
        {isFinished && (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
            🏆 تورنمنت به پایان رسید
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-xs text-right">
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '17%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold text-[11px]">
              <th className="py-2.5 px-2 text-center">رتبه</th>
              <th className="py-2.5 px-2">نام بازیکن</th>
              <th className="py-2.5 px-2 text-center">برد / بازی</th>
              <th className="py-2.5 px-2 text-center">مجموع پوئن</th>
              <th className="py-2.5 px-2 text-center">تفاضل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {leaderboard.map((player) => {
              const badge = getRankBadge(player.rank);
              const isTop = player.rank <= 3;

              return (
                <tr
                  key={player.player_name}
                  className={`transition-colors ${
                    isTop ? 'bg-slate-900/40 hover:bg-slate-900/80' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${badge.bg} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 font-bold text-white truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      {player.rank === 1 && (
                        <Award size={13} className="text-amber-400 shrink-0" />
                      )}
                      <span className="truncate">{player.player_name}</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-2 text-center text-slate-300 font-mono">
                    <span className="text-emerald-400 font-bold">{player.matches_won}</span>
                    <span className="text-slate-500"> / </span>
                    <span>{player.matches_played}</span>
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-black font-mono text-sm bg-rally-accent/15 text-rally-accent border border-rally-accent/30">
                      {player.total_points}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 text-center font-mono font-bold">
                    <span
                      className={
                        player.point_difference > 0
                          ? 'text-emerald-400'
                          : player.point_difference < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }
                    >
                      {player.point_difference > 0 ? `+${player.point_difference}` : player.point_difference}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

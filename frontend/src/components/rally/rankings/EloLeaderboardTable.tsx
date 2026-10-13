import React from 'react';
import { Zap } from 'lucide-react';
import { EloPlayerLeaderboardItem } from '../../../types/rally';

interface EloLeaderboardTableProps {
  players: EloPlayerLeaderboardItem[];
}

const getTierBadgeStyle = (tier: string) => {
  if (tier.startsWith('A')) return 'bg-rose-950/80 text-rose-300 border-rose-500/40';
  if (tier.startsWith('B')) return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
  if (tier.startsWith('C')) return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40';
  return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
};

export const EloLeaderboardTable: React.FC<EloLeaderboardTableProps> = ({ players }) => {
  return (
    <table className="w-full text-right text-xs table-fixed">
      <colgroup>
        <col style={{ width: '8%' }} />
        <col style={{ width: '36%' }} />
        <col style={{ width: '18%' }} />
        <col style={{ width: '18%' }} />
        <col style={{ width: '20%' }} />
      </colgroup>
      <thead className="bg-[#F5F4EF] text-[#66706D] font-bold border-b border-gray-200">
        <tr>
          <th className="py-3 px-3 text-center">رتبه</th>
          <th className="py-3 px-3">نام بازیکن و شهر</th>
          <th className="py-3 px-3 text-center">سطح مهارتی</th>
          <th className="py-3 px-3 text-center">بازی‌ها / برد</th>
          <th className="py-3 px-3 text-center">ریتینگ زنده Elo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {players.map((player) => (
          <tr key={player.user_id} className="hover:bg-amber-50/40 transition-colors">
            <td className="py-3 px-3 text-center">
              <span className="font-black text-sm text-rally-charcoal">
                {player.rank.toLocaleString('fa-IR')}
              </span>
            </td>
            <td className="py-3 px-3">
              <div className="font-black text-xs text-rally-charcoal">{player.full_name}</div>
              <div className="text-[10px] text-gray-400 font-medium">
                {player.city} • نرخ برد: {player.win_rate}٪
              </div>
            </td>
            <td className="py-3 px-3 text-center">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${getTierBadgeStyle(player.skill_tier)}`}>
                سطح {player.skill_tier}
              </span>
            </td>
            <td className="py-3 px-3 text-center font-bold text-gray-600">
              {player.matches_won} برد از {player.matches_played} بازی
            </td>
            <td className="py-3 px-3 text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                <Zap size={11} className="text-amber-600" />
                {player.elo_rating.toLocaleString('fa-IR')} Elo
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

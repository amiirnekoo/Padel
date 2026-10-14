import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Calendar, MapPin, Users } from 'lucide-react';
import { PlayerRecentMatch } from '../../../types/rally';

interface PlayerMatchHistoryListProps {
  matches: PlayerRecentMatch[];
}

export const PlayerMatchHistoryList: React.FC<PlayerMatchHistoryListProps> = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-xl p-8 text-center text-slate-400 text-xs">
        <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        هنوز مسابقه رسمی برای این بازیکن ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => {
        const isWin = m.won;
        return (
          <div
            key={m.game_id}
            className={`border rounded-xl p-3.5 transition-all ${
              isWin
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Club & Court Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 ${
                      isWin
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isWin ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {isWin ? 'پیروزی' : 'شکست'}
                  </span>
                  <span className="text-white text-xs font-bold">{m.title}</span>
                  <span className="bg-slate-800 text-slate-300 border border-white/10 text-[10px] font-bold px-1.5 py-0.2 rounded">
                    سطح {m.skill_level}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-slate-500" />
                    {m.club_name} • {m.court_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-slate-500" />
                    {m.date}
                  </span>
                </div>
              </div>

              {/* Set Scores & Elo Change */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-left" dir="ltr">
                  <span className="font-mono font-black text-xs sm:text-sm text-white tracking-wider bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg block text-center">
                    {m.score_summary}
                  </span>
                </div>
                <div
                  className={`text-center px-2.5 py-1 rounded-lg text-xs font-black min-w-[70px] ${
                    isWin ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}
                >
                  {isWin ? `+${m.rating_change}` : m.rating_change} Elo
                </div>
              </div>
            </div>

            {/* Players in Doubles */}
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <Users size={12} className="text-rally-accent shrink-0" />
                <span className="text-slate-300 font-bold">هم‌تیمی:</span>
                <span className="text-white truncate">{m.partner_name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 truncate">
                <span className="font-bold text-slate-400">حریفان:</span>
                <span className="text-slate-300 truncate">{m.opponents.join(' و ')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

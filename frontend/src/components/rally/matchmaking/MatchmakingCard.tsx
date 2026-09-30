import React from 'react';
import { Calendar, Clock, MapPin, Users, Zap, ShieldCheck } from 'lucide-react';
import { MatchmakingGameItem, CourtPositionType } from '../../../types/rally';
import { CourtPositionsGrid } from './CourtPositionsGrid';

interface MatchmakingCardProps {
  game: MatchmakingGameItem;
  onJoinClick: (game: MatchmakingGameItem) => void;
  currentUserId?: string;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'D': { bg: 'bg-emerald-950/80 border-emerald-500/40', text: 'text-emerald-300', label: 'مبتدی (D)' },
  'D+': { bg: 'bg-blue-950/80 border-blue-500/40', text: 'text-blue-300', label: 'نیمه‌مبتدی (D+)' },
  'C': { bg: 'bg-indigo-950/80 border-indigo-500/40', text: 'text-indigo-300', label: 'متوسط (C)' },
  'C+': { bg: 'bg-purple-950/80 border-purple-500/40', text: 'text-purple-300', label: 'نیمه‌پیشرفته (C+)' },
  'B': { bg: 'bg-amber-950/80 border-amber-500/40', text: 'text-amber-300', label: 'پیشرفته (B)' },
  'A': { bg: 'bg-rose-950/80 border-rose-500/40', text: 'text-rose-300', label: 'حرفه‌ای (A)' },
};

export const MatchmakingCard: React.FC<MatchmakingCardProps> = ({
  game,
  onJoinClick,
  currentUserId,
}) => {
  const isFull = game.filled_count >= 4;
  const isConfirmed = game.status === 'CONFIRMED' || isFull;
  const levelMeta = LEVEL_COLORS[game.skill_level] || LEVEL_COLORS['D+'];

  const isUserJoined = [
    game.positions.team_a_right.user_id,
    game.positions.team_a_left.user_id,
    game.positions.team_b_right.user_id,
    game.positions.team_b_left.user_id,
  ].includes(currentUserId || '');

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all duration-200">
      <div>
        {/* Header Tags & Level */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${levelMeta.bg} ${levelMeta.text}`}>
              سطح {game.skill_level} • {levelMeta.label}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              ۴ نفره (۲×۲)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {isConfirmed ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60 text-[11px]">
                <ShieldCheck size={12} />
                تکمیل و نهایی
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/60 text-[11px]">
                <Users size={12} />
                {game.filled_count} از ۴ نفر تکمیل
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-white mb-2 leading-snug">
          {game.title}
        </h3>

        {/* Club & Time Info */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80 mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={13} className="text-rally-accent shrink-0" />
            <span className="truncate">{game.club_name} • {game.court_name}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Clock size={13} className="text-blue-400 shrink-0" />
            <span className="font-mono">{game.start_time} تا {game.end_time}</span>
          </div>
        </div>

        {/* Visual 4-Player Court */}
        <div className="mb-4">
          <CourtPositionsGrid positions={game.positions} readOnly={true} />
        </div>
      </div>

      {/* Footer Pricing & Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-400">سهم هر بازیکن (۱/۴):</div>
          <div className="text-base font-black text-rally-accent font-mono">
            {(game.price_per_player / 10).toLocaleString('fa-IR')} <span className="text-xs font-sans text-slate-300">تومان</span>
          </div>
        </div>

        <div>
          {isUserJoined ? (
            <button
              disabled
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-900/60 text-blue-300 border border-blue-700/60 cursor-default"
            >
              شما عضو هستید
            </button>
          ) : isConfirmed ? (
            <button
              disabled
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
            >
              ظرفیت پر شد
            </button>
          ) : (
            <button
              onClick={() => onJoinClick(game)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-rally-accent hover:bg-rally-accent-hover text-slate-950 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Zap size={13} />
              انتخاب صندلی و ورود
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

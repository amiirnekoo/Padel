import React, { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, MapPin, Trophy } from 'lucide-react';
import { AmericanoRound, AmericanoMatch } from '../../../../types/americano';

interface AmericanoRoundCardProps {
  round: AmericanoRound;
  pointsPerMatch: number;
  onRecordScores: (roundIndex: number, scores: Array<{ court_number: number; score_a: number; score_b: number }>) => void;
  isCurrentRound: boolean;
}

export const AmericanoRoundCard: React.FC<AmericanoRoundCardProps> = ({
  round,
  pointsPerMatch,
  onRecordScores,
  isCurrentRound,
}) => {
  const [matchScores, setMatchScores] = useState<Record<number, { score_a: number | ''; score_b: number | '' }>>(() => {
    const initial: Record<number, { score_a: number | ''; score_b: number | '' }> = {};
    round.matches.forEach((m) => {
      initial[m.court_number] = {
        score_a: m.score_a !== null ? m.score_a : '',
        score_b: m.score_b !== null ? m.score_b : '',
      };
    });
    return initial;
  });

  const handleScoreAChange = (courtNum: number, valStr: string) => {
    const val = valStr === '' ? '' : parseInt(valStr, 10);
    if (val === '' || isNaN(val)) {
      setMatchScores((prev) => ({ ...prev, [courtNum]: { score_a: '', score_b: '' } }));
      return;
    }
    const clampedA = Math.max(0, Math.min(pointsPerMatch, val));
    const autoB = pointsPerMatch - clampedA;
    setMatchScores((prev) => ({ ...prev, [courtNum]: { score_a: clampedA, score_b: autoB } }));
  };

  const handleScoreBChange = (courtNum: number, valStr: string) => {
    const val = valStr === '' ? '' : parseInt(valStr, 10);
    if (val === '' || isNaN(val)) {
      setMatchScores((prev) => ({ ...prev, [courtNum]: { score_a: '', score_b: '' } }));
      return;
    }
    const clampedB = Math.max(0, Math.min(pointsPerMatch, val));
    const autoA = pointsPerMatch - clampedB;
    setMatchScores((prev) => ({ ...prev, [courtNum]: { score_a: autoA, score_b: clampedB } }));
  };

  const handleSave = () => {
    const payload = round.matches.map((m) => ({
      court_number: m.court_number,
      score_a: Number(matchScores[m.court_number]?.score_a || 0),
      score_b: Number(matchScores[m.court_number]?.score_b || 0),
    }));
    onRecordScores(round.round_index, payload);
  };

  const canSave = round.matches.every(
    (m) => matchScores[m.court_number]?.score_a !== '' && matchScores[m.court_number]?.score_b !== ''
  );

  return (
    <div
      className={`border rounded-2xl p-4 transition-all duration-200 ${
        isCurrentRound
          ? 'bg-[#0f172a] border-rally-accent/60 shadow-lg ring-1 ring-rally-accent/30'
          : round.is_completed
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-slate-900/50 border-slate-800/60 opacity-80'
      }`}
      dir="rtl"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rally-accent" />
          <h4 className="font-extrabold text-white text-sm sm:text-base">{round.round_name}</h4>
          <span className="text-[11px] text-slate-400 font-mono">
            (سقف {pointsPerMatch} پوئن)
          </span>
        </div>

        {round.is_completed ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={12} />
            تکمیل شد
          </span>
        ) : isCurrentRound ? (
          <span className="text-[11px] font-black text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2.5 py-0.5 rounded-full animate-pulse">
            راند جاری
          </span>
        ) : (
          <span className="text-[11px] text-slate-500 font-medium">در انتظار</span>
        )}
      </div>

      <div className="space-y-3">
        {round.matches.map((match) => {
          const scores = matchScores[match.court_number] || { score_a: '', score_b: '' };

          return (
            <div
              key={match.court_number}
              className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Court Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-blue-950 border border-blue-800/60 text-blue-300">
                  کورت {match.court_number}
                </span>
              </div>

              {/* Matchup & Score Inputs */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 items-center gap-2 text-xs">
                {/* Team A */}
                <div className="sm:col-span-2 text-right">
                  <div className="font-bold text-white truncate">{match.team_a[0]}</div>
                  <div className="text-[11px] text-slate-400 truncate">{match.team_a[1]}</div>
                </div>

                {/* Score Controls */}
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 font-mono">
                  <input
                    type="number"
                    min="0"
                    max={pointsPerMatch}
                    value={scores.score_a}
                    onChange={(e) => handleScoreAChange(match.court_number, e.target.value)}
                    placeholder="۰"
                    className="w-12 h-9 text-center bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:border-rally-accent focus:outline-hidden"
                  />
                  <span className="text-slate-500 font-bold">:</span>
                  <input
                    type="number"
                    min="0"
                    max={pointsPerMatch}
                    value={scores.score_b}
                    onChange={(e) => handleScoreBChange(match.court_number, e.target.value)}
                    placeholder="۰"
                    className="w-12 h-9 text-center bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:border-rally-accent focus:outline-hidden"
                  />
                </div>

                {/* Team B */}
                <div className="sm:col-span-2 text-left">
                  <div className="font-bold text-white truncate">{match.team_b[0]}</div>
                  <div className="text-[11px] text-slate-400 truncate">{match.team_b[1]}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button for active round */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            canSave
              ? 'bg-rally-accent text-slate-950 hover:bg-lime-400 shadow-md cursor-pointer active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 size={14} />
          <span>{round.is_completed ? 'ویرایش و بازمحاسبه امتیاز راند' : 'ثبت نتایج و محاسبه راند ➔'}</span>
        </button>
      </div>
    </div>
  );
};

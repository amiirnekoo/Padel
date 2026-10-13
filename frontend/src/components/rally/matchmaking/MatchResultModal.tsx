import React, { useState } from 'react';
import { Trophy, CheckCircle2, AlertCircle, X, Shield, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { MatchmakingGameItem } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';

interface MatchResultModalProps {
  game: MatchmakingGameItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  game,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [s1A, setS1A] = useState<number>(6);
  const [s1B, setS1B] = useState<number>(4);
  const [s2A, setS2A] = useState<number>(6);
  const [s2B, setS2B] = useState<number>(3);
  const [hasSet3, setHasSet3] = useState<boolean>(false);
  const [s3A, setS3A] = useState<number>(6);
  const [s3B, setS3B] = useState<number>(4);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultSuccess, setResultSuccess] = useState<any | null>(null);

  if (!isOpen) return null;

  // Calculate winner preview
  const setsA = (s1A > s1B ? 1 : 0) + (s2A > s2B ? 1 : 0) + (hasSet3 && s3A > s3B ? 1 : 0);
  const setsB = (s1B > s1A ? 1 : 0) + (s2B > s2A ? 1 : 0) + (hasSet3 && s3B > s3A ? 1 : 0);
  const isTeamAWinner = setsA > setsB;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const scores = [[s1A, s1B], [s2A, s2B]];
    if (hasSet3) {
      scores.push([s3A, s3B]);
    }

    if (setsA === setsB) {
      setErrorMsg('تعداد ست‌های برده شده برابر است؛ مسابقه پدل باید یک برنده قطعی داشته باشد.');
      return;
    }

    setLoading(true);
    const res = await rallyApi.submitMatchResult(game.id, scores);
    setLoading(false);

    if (res.success) {
      setResultSuccess(res.data);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3500);
    } else {
      setErrorMsg(res.error || 'خطا در ثبت نتیجه مسابقه');
    }
  };

  const teamAName = `${game.positions.team_a_right.user_name || 'تیم ۱ راست'} و ${game.positions.team_a_left.user_name || 'تیم ۱ چپ'}`;
  const teamBName = `${game.positions.team_b_right.user_name || 'تیم ۲ راست'} و ${game.positions.team_b_left.user_name || 'تیم ۲ چپ'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85" dir="rtl">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f172a] border border-slate-800 shadow-2xl overflow-hidden p-6 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">ثبت رسمی نتیجه و ریتینگ مسابقه</h2>
              <p className="text-xs text-slate-400">محاسبه زنده تغییرات ریتینگ Elo برای ۴ بازیکن</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resultSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-black text-white">نتیجه مسابقه با موفقیت ثبت شد!</h3>
            <p className="text-xs text-slate-300">
              برنده بازی: <span className="font-black text-rally-accent">{resultSuccess.winning_team === 'TEAM_A' ? teamAName : teamBName}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto pt-2">
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">تیم برنده</span>
                <span className="text-base font-black text-emerald-400 flex items-center justify-center gap-1">
                  <ArrowUpRight size={16} />
                  +{Math.abs(resultSuccess.team_a_rating_change)} Elo
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">تیم بازنده</span>
                <span className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                  <ArrowDownRight size={16} />
                  -{Math.abs(resultSuccess.team_a_rating_change)} Elo
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Teams Label */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block mb-0.5">تیم شماره ۱ (الف)</span>
                <span className="font-bold text-white text-xs truncate block">{teamAName}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block mb-0.5">تیم شماره ۲ (ب)</span>
                <span className="font-bold text-white text-xs truncate block">{teamBName}</span>
              </div>
            </div>

            {/* Set 1 */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-300">ست اول:</span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={s1A}
                  onChange={(e) => setS1A(parseInt(e.target.value) || 0)}
                  className="w-14 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center text-sm font-black text-white focus:border-rally-accent outline-none"
                />
                <span className="text-xs text-slate-500 font-bold">-</span>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={s1B}
                  onChange={(e) => setS1B(parseInt(e.target.value) || 0)}
                  className="w-14 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center text-sm font-black text-white focus:border-rally-accent outline-none"
                />
              </div>
            </div>

            {/* Set 2 */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs font-bold text-slate-300">ست دوم:</span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={s2A}
                  onChange={(e) => setS2A(parseInt(e.target.value) || 0)}
                  className="w-14 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center text-sm font-black text-white focus:border-rally-accent outline-none"
                />
                <span className="text-xs text-slate-500 font-bold">-</span>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={s2B}
                  onChange={(e) => setS2B(parseInt(e.target.value) || 0)}
                  className="w-14 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center text-sm font-black text-white focus:border-rally-accent outline-none"
                />
              </div>
            </div>

            {/* Set 3 Toggle */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setHasSet3(!hasSet3)}
                className="text-xs text-rally-accent hover:underline flex items-center gap-1 font-bold"
              >
                <Sparkles size={13} />
                <span>{hasSet3 ? 'حذف ست سوم (تای‌بریک)' : '+ افزودن ست سوم (تای‌بریک نهایی)'}</span>
              </button>
            </div>

            {hasSet3 && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-xs font-bold text-slate-300">ست سوم (نهایی):</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={s3A}
                    onChange={(e) => setS3A(parseInt(e.target.value) || 0)}
                    className="w-14 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center text-sm font-black text-white focus:border-rally-accent outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={s3B}
                    onChange={(e) => setS3B(parseInt(e.target.value) || 0)}
                    className="w-14 h-10 rounded-xl bg-slate-950 border border-slate-700 text-center text-sm font-black text-white focus:border-rally-accent outline-none"
                  />
                </div>
              </div>
            )}

            {/* Preview Banner */}
            <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">پیش‌نمایش برنده:</span>
              <span className="font-black text-emerald-400">
                {isTeamAWinner ? `تیم ۱ (${setsA} - ${setsB})` : `تیم ۲ (${setsB} - ${setsA})`}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-rally-accent hover:bg-rally-accent-hover text-slate-950 font-black text-xs sm:text-sm shadow-xl transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'در حال محاسبه ریتینگ و ثبت...' : 'ثبت قطعی نتیجه و اعمال ریتینگ Elo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

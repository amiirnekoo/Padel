import React from 'react';
import { Play } from 'lucide-react';

interface AmericanoSetupStepProps {
  step: 'SETUP' | 'PLAYERS';
  setStep: (s: 'SETUP' | 'PLAYERS') => void;
  title: string;
  setTitle: (t: string) => void;
  clubName: string;
  setClubName: (c: string) => void;
  playerCount: 8 | 4;
  onPlayerCountChange: (c: 8 | 4) => void;
  pointsPerMatch: number;
  setPointsPerMatch: (p: number) => void;
  players: string[];
  onPlayerNameChange: (idx: number, name: string) => void;
  onStartTournament: () => void;
  loading: boolean;
}

export const AmericanoSetupStep: React.FC<AmericanoSetupStepProps> = ({
  step,
  setStep,
  title,
  setTitle,
  clubName,
  setClubName,
  playerCount,
  onPlayerCountChange,
  pointsPerMatch,
  setPointsPerMatch,
  players,
  onPlayerNameChange,
  onStartTournament,
  loading,
}) => {
  if (step === 'SETUP') {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان مسابقه</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-rally-accent focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">باشگاه برگزارکننده</label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-rally-accent focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">تعداد بازیکنان و زمین‌ها</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPlayerCountChange(8)}
              className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                playerCount === 8
                  ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-extrabold text-sm mb-1 text-white">۸ بازیکن (۲ زمین پدل)</div>
              <div className="text-[11px] text-slate-400">۷ راند مسابقه • هر بازیکن با همه پارتنر می‌شود</div>
            </button>
            <button
              type="button"
              onClick={() => onPlayerCountChange(4)}
              className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                playerCount === 4
                  ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-extrabold text-sm mb-1 text-white">۴ بازیکن (۱ زمین پدل)</div>
              <div className="text-[11px] text-slate-400">۳ راند مسابقه دوره‌ای تک‌کورت</div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">سقف امتیاز در هر بازی (پوئن)</label>
          <div className="flex gap-2">
            {[32, 24, 21].map((pts) => (
              <button
                key={pts}
                type="button"
                onClick={() => setPointsPerMatch(pts)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                  pointsPerMatch === pts
                    ? 'bg-rally-accent text-slate-950 border-rally-accent font-black'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {pts} پوئن
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setStep('PLAYERS')}
            className="px-6 py-2.5 rounded-xl bg-rally-accent text-slate-950 font-black text-xs hover:bg-lime-400 transition-all cursor-pointer"
          >
            ورود اسامی بازیکنان ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300">اسامی {playerCount} بازیکن شرکت‌کننده:</span>
        <span className="text-[11px] text-slate-400 font-mono">اسامی پیش‌فرض را می‌توانید ویرایش کنید</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {players.map((name, i) => (
          <div key={i} className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => onPlayerNameChange(i, e.target.value)}
              className="bg-transparent text-xs text-white font-bold w-full focus:outline-hidden"
            />
          </div>
        ))}
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-slate-800">
        <button
          type="button"
          onClick={() => setStep('SETUP')}
          className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
        >
          ← بازگشت به تنظیمات
        </button>
        <button
          type="button"
          onClick={onStartTournament}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Play size={14} className="fill-current" />
          <span>{loading ? 'در حال قرعه‌کشی...' : 'تولید گردونه و شروع تورنمنت'}</span>
        </button>
      </div>
    </div>
  );
};

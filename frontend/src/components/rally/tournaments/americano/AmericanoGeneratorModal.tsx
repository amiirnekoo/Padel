import React, { useState } from 'react';
import { X, Trophy, Users, Play, Plus, RefreshCw, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { AmericanoTournamentState } from '../../../../types/americano';
import { AmericanoLeaderboard } from './AmericanoLeaderboard';
import { AmericanoRoundCard } from './AmericanoRoundCard';
import { rallyApi } from '../../../../services/rallyApi';

interface AmericanoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PLAYERS_8 = [
  'آرتین قهرمان',
  'سهراب محمدی',
  'امیرحسین نکوزاده',
  'کیان رضایی',
  'بردیا تهرانی',
  'پویا کریمی',
  'نیما یوسفی',
  'فرهاد شمس',
];

export const AmericanoGeneratorModal: React.FC<AmericanoGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'SETUP' | 'PLAYERS' | 'TOURNAMENT'>('SETUP');
  const [title, setTitle] = useState('جام آخر هفته آمریکانو پدل رالی');
  const [clubName, setClubName] = useState('باشگاه پدل انقلاب تهران');
  const [playerCount, setPlayerCount] = useState<8 | 4>(8);
  const [pointsPerMatch, setPointsPerMatch] = useState<number>(32);
  const [players, setPlayers] = useState<string[]>(DEFAULT_PLAYERS_8);
  const [tournament, setTournament] = useState<AmericanoTournamentState | null>(null);
  const [activeTab, setActiveTab] = useState<'ROUNDS' | 'LEADERBOARD'>('ROUNDS');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePlayerCountChange = (count: 8 | 4) => {
    setPlayerCount(count);
    setPlayers(DEFAULT_PLAYERS_8.slice(0, count));
  };

  const handlePlayerNameChange = (index: number, val: string) => {
    setPlayers((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleStartTournament = async () => {
    setLoading(true);
    const validPlayers = players.map((p, i) => (p.trim() ? p.trim() : `بازیکن ${i + 1}`));
    const created = await rallyApi.generateAmericanoTournament({
      title,
      players: validPlayers,
      points_per_match: pointsPerMatch,
      club_name: clubName,
    });

    if (created) {
      setTournament(created);
      setStep('TOURNAMENT');
    }
    setLoading(false);
  };

  const handleRecordScores = async (
    roundIndex: number,
    scores: Array<{ court_number: number; score_a: number; score_b: number }>
  ) => {
    if (!tournament) return;
    const updated = await rallyApi.recordAmericanoRoundScore(tournament.id, roundIndex, scores);
    if (updated) {
      setTournament(updated);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80" dir="rtl">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  ژنراتور و گردونه مسابقات آمریکانو پدل
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rally-accent/20 text-rally-accent font-bold">
                  Americano Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                قرعه‌کشی دوره‌ای خودکار، چرخش پارتنرها و محاسبه زنده امتیازات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {step === 'SETUP' && (
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
                    onClick={() => handlePlayerCountChange(8)}
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
                    onClick={() => handlePlayerCountChange(4)}
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
          )}

          {step === 'PLAYERS' && (
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
                      onChange={(e) => handlePlayerNameChange(i, e.target.value)}
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
                  onClick={handleStartTournament}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play size={14} className="fill-current" />
                  <span>{loading ? 'در حال قرعه‌کشی...' : 'تولید گردونه و شروع تورنمنت'}</span>
                </button>
              </div>
            </div>
          )}

          {step === 'TOURNAMENT' && tournament && (
            <div className="space-y-5">
              {/* Tabs Switcher */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
                  <button
                    onClick={() => setActiveTab('ROUNDS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'ROUNDS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    راندها و ثبت نتایج ({tournament.rounds.length} راند)
                  </button>
                  <button
                    onClick={() => setActiveTab('LEADERBOARD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'LEADERBOARD' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    جدول امتیازات زنده (Leaderboard)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={13} />
                    <span>{copied ? 'لینک کپی شد' : 'اشتراک‌گذاری'}</span>
                  </button>
                  <button
                    onClick={() => setStep('SETUP')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>تورنمنت جدید</span>
                  </button>
                </div>
              </div>

              {activeTab === 'ROUNDS' && (
                <div className="space-y-4">
                  {tournament.rounds.map((r) => (
                    <AmericanoRoundCard
                      key={r.round_index}
                      round={r}
                      pointsPerMatch={tournament.points_per_match}
                      isCurrentRound={r.round_index === tournament.current_round_index}
                      onRecordScores={handleRecordScores}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'LEADERBOARD' && (
                <AmericanoLeaderboard
                  leaderboard={tournament.leaderboard}
                  isFinished={tournament.is_finished}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

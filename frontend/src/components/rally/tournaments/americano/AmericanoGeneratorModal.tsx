import React, { useState } from 'react';
import { X, Trophy, RefreshCw, Share2, Printer, Tv } from 'lucide-react';
import { AmericanoTournamentState } from '../../../../types/americano';
import { AmericanoLeaderboard } from './AmericanoLeaderboard';
import { AmericanoRoundCard } from './AmericanoRoundCard';
import { AmericanoSetupStep } from './AmericanoSetupStep';
import { AmericanoPrintAndTvModal } from './AmericanoPrintAndTvModal';
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
  const [isPrintTvOpen, setIsPrintTvOpen] = useState(false);

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
          {step !== 'TOURNAMENT' ? (
            <AmericanoSetupStep
              step={step}
              setStep={setStep}
              title={title}
              setTitle={setTitle}
              clubName={clubName}
              setClubName={setClubName}
              playerCount={playerCount}
              onPlayerCountChange={handlePlayerCountChange}
              pointsPerMatch={pointsPerMatch}
              setPointsPerMatch={setPointsPerMatch}
              players={players}
              onPlayerNameChange={handlePlayerNameChange}
              onStartTournament={handleStartTournament}
              loading={loading}
            />
          ) : tournament && (
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
                    راندها و نتایج ({tournament.rounds.length} راند)
                  </button>
                  <button
                    onClick={() => setActiveTab('LEADERBOARD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'LEADERBOARD' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    جدول امتیازات زنده
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPrintTvOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>برگه چاپی و نمایشگر TV</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={13} />
                    <span>{copied ? 'لینک کپی شد' : 'اشتراک'}</span>
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

              {/* Print and TV Modal */}
              <AmericanoPrintAndTvModal
                tournament={tournament}
                isOpen={isPrintTvOpen}
                onClose={() => setIsPrintTvOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

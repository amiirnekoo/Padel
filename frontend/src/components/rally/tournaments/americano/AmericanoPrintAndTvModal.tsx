import React, { useState } from 'react';
import { X, Printer, Tv, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { AmericanoTournamentState } from '../../../../types/americano';

interface AmericanoPrintAndTvModalProps {
  tournament: AmericanoTournamentState;
  isOpen: boolean;
  onClose: () => void;
}

export const AmericanoPrintAndTvModal: React.FC<AmericanoPrintAndTvModalProps> = ({
  tournament,
  isOpen,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'PRINT' | 'TV'>('PRINT');

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80" dir="rtl">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header & Controls */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('PRINT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'PRINT' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>برگه چاپی داوری A4</span>
            </button>
            <button
              onClick={() => setViewMode('TV')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'TV' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>نمایشگر زنده تماشاگران (TV Mode)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'PRINT' && (
              <button
                onClick={handleTriggerPrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فوری برگه (Print)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {viewMode === 'PRINT' ? (
            /* Printable Sheet (clean white background format for printer) */
            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-sm space-y-6 max-w-3xl mx-auto print:p-0 print:shadow-none">
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    پلتفرم رسمی پدل رالی • جدول مسابقات آمریکانو
                  </span>
                  <h1 className="text-xl font-black text-slate-900 mt-2">{tournament.title}</h1>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    باشگاه: {tournament.club_name} | سقف امتیاز هر مسابقه: {tournament.points_per_match} پوئن
                  </p>
                </div>
                <div className="text-left font-mono text-xs text-slate-400">
                  <div>تاریخ: {new Date().toLocaleDateString('fa-IR')}</div>
                  <div>کد پیگیری: AM-{tournament.id.slice(-6)}</div>
                </div>
              </div>

              {/* Rounds Table */}
              <div className="space-y-4">
                <h3 className="font-black text-sm text-slate-900">برنامه زمان‌بندی راندها و جفت‌بندی بازیکنان:</h3>
                <div className="space-y-3">
                  {tournament.rounds.map((r) => (
                    <div key={r.round_index} className="border border-slate-300 rounded-xl p-3">
                      <div className="font-black text-xs text-slate-800 mb-2 bg-slate-100 px-2 py-1 rounded-md inline-block">
                        راند {r.round_index} از {tournament.rounds.length}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {r.matches.map((m, mIdx) => (
                          <div key={mIdx} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">کورت شماره {m.court_number}:</span>
                              <span className="font-bold text-slate-900">{m.team_a.join(' و ')}</span>
                              <span className="mx-1 text-slate-400 font-normal">در برابر</span>
                              <span className="font-bold text-slate-900">{m.team_b.join(' و ')}</span>
                            </div>
                            <div className="w-16 h-8 border border-dashed border-slate-400 rounded-md bg-white flex items-center justify-center font-mono font-black text-slate-700 text-xs shrink-0">
                              {(m.score_a != null && m.score_b != null && (m.score_a > 0 || m.score_b > 0))
                                ? `${m.score_a} - ${m.score_b}`
                                : '___ / ___'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referee signature */}
              <div className="pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                <span>تایید سرداور مسابقات: ____________________</span>
                <span>امضای مسئول کلوپ: ____________________</span>
              </div>
            </div>
          ) : (
            /* TV Spectator Mode */
            <div className="space-y-6 text-white text-center">
              <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 p-6 rounded-3xl border border-amber-500/30">
                <span className="text-amber-400 font-mono text-xs uppercase tracking-widest block mb-1">
                  LIVE SPECTATOR BOARD • آمریکانو زنده
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white">{tournament.title}</h2>
                <div className="mt-2 text-sm text-slate-400 font-bold">
                  {tournament.club_name} • راند فعلی: {tournament.current_round_index} از {tournament.rounds.length}
                </div>
              </div>

              {/* Live Leaderboard for Spectators */}
              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800">
                <h3 className="text-lg font-black text-amber-400 flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>جدول رده‌بندی زنده امتیازات</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                  {tournament.leaderboard.map((item, idx) => (
                    <div
                      key={item.player_name}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        idx === 0
                          ? 'bg-amber-500/20 border-amber-500 text-white font-black'
                          : 'bg-slate-800/80 border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm">{item.player_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">بردها: {item.matches_won}</span>
                        <span className="text-base font-black text-amber-400 font-mono">{item.total_points} پوئن</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

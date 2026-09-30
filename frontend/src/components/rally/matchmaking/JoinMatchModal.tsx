import React, { useState } from 'react';
import { X, CheckCircle2, Wallet, AlertCircle, ShieldCheck } from 'lucide-react';
import { MatchmakingGameItem, CourtPositionType } from '../../../types/rally';
import { CourtPositionsGrid } from './CourtPositionsGrid';
import { rallyApi } from '../../../services/rallyApi';

interface JoinMatchModalProps {
  game: MatchmakingGameItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName: string;
  walletBalance: number;
}

export const JoinMatchModal: React.FC<JoinMatchModalProps> = ({
  game,
  isOpen,
  onClose,
  onSuccess,
  userId,
  userName,
  walletBalance,
}) => {
  const [selectedPos, setSelectedPos] = useState<CourtPositionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const costToman = game.price_per_player / 10;
  const hasEnoughBalance = walletBalance >= costToman;

  const handleJoinSubmit = async () => {
    if (!selectedPos) {
      setErrorMsg('لطفاً یکی از جایگاه‌های خالی زمین را انتخاب کنید.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await rallyApi.joinMatchmakingGame(game.id, userId, selectedPos);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'خطا در ثبت نام در مچ‌میکینگ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-white" dir="rtl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 font-bold mb-2 inline-block">
            ورود به بازی مچ‌میکینگ • سطح {game.skill_level}
          </span>
          <h2 className="text-lg font-black text-white">{game.title}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {game.club_name} • {game.court_name} • ساعت {game.start_time} تا {game.end_time}
          </p>
        </div>

        {/* Interactive Court Positions Selection */}
        <div className="mb-5">
          <div className="text-xs font-bold text-slate-300 mb-2">
            ۱. جایگاه بازی خود در کورت را انتخاب کنید (راست یا چپ):
          </div>
          <CourtPositionsGrid
            positions={game.positions}
            onSelectPosition={(pos) => {
              setSelectedPos(pos);
              setErrorMsg(null);
            }}
            selectedPos={selectedPos}
            readOnly={false}
          />
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>کل بهای سانس:</span>
            <span className="font-mono">{(game.total_price / 10).toLocaleString('fa-IR')} تومان</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-rally-accent mb-3 pb-3 border-b border-slate-800">
            <span>سهم پرداختی شما (۱/۴):</span>
            <span className="font-mono text-base">{costToman.toLocaleString('fa-IR')} تومان</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Wallet size={14} className="text-blue-400" />
              <span>موجودی کیف پول شما:</span>
            </div>
            <span className={`font-mono font-bold ${hasEnoughBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
              {walletBalance.toLocaleString('fa-IR')} تومان
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs mb-4">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            انصراف
          </button>

          <button
            type="button"
            disabled={loading || !selectedPos}
            onClick={handleJoinSubmit}
            className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              loading || !selectedPos
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-rally-accent hover:bg-rally-accent-hover text-slate-950 shadow-lg active:scale-95'
            }`}
          >
            {loading ? 'در حال ثبت جایگاه...' : 'تایید نهایی و پرداخت سهم'}
          </button>
        </div>
      </div>
    </div>
  );
};

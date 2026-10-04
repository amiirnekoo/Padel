import React from 'react';
import { Calendar, Plus, Trophy } from 'lucide-react';

interface PlayerStatsHeaderProps {
  walletBalance: number;
  upcomingCount: number;
  onOpenWallet: () => void;
}

export const PlayerStatsHeader: React.FC<PlayerStatsHeaderProps> = ({
  walletBalance,
  upcomingCount,
  onOpenWallet
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">موجودی کیف پول</span>
          <p className="text-xl font-black text-[#D7ED68] mt-1">
            {(walletBalance / 10).toLocaleString('fa-IR')}{' '}
            <span className="text-xs font-normal text-slate-300">تومان</span>
          </p>
        </div>
        <button
          onClick={onOpenWallet}
          className="p-2.5 bg-[#D7ED68] hover:bg-[#c8de5b] text-[#172320] rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>شارژ</span>
        </button>
      </div>

      <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">سانس‌های فعال پیش‌رو</span>
          <p className="text-xl font-black text-white mt-1">{upcomingCount} سانس فعال</p>
        </div>
        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">سطح پدل و ریتینگ</span>
          <p className="text-xl font-black text-emerald-400 mt-1">سطح ۳.۵ (متوسط)</p>
        </div>
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <Trophy className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

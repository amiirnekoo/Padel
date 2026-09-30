import React from 'react';
import { User, Plus } from 'lucide-react';
import { MatchmakingPlayerSlot, CourtPositionType } from '../../../types/rally';

interface CourtPositionsGridProps {
  positions: {
    team_a_right: MatchmakingPlayerSlot;
    team_a_left: MatchmakingPlayerSlot;
    team_b_right: MatchmakingPlayerSlot;
    team_b_left: MatchmakingPlayerSlot;
  };
  onSelectPosition?: (pos: CourtPositionType) => void;
  selectedPos?: CourtPositionType | null;
  readOnly?: boolean;
}

export const CourtPositionsGrid: React.FC<CourtPositionsGridProps> = ({
  positions,
  onSelectPosition,
  selectedPos,
  readOnly = false,
}) => {
  const renderSlot = (
    posKey: CourtPositionType,
    slotData: MatchmakingPlayerSlot,
    sideLabel: string
  ) => {
    const isOccupied = !!slotData.user_id;
    const isSelected = selectedPos === posKey;

    return (
      <button
        type="button"
        disabled={readOnly || isOccupied}
        onClick={() => onSelectPosition && onSelectPosition(posKey)}
        className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all duration-150 min-h-[72px] w-full ${
          isOccupied
            ? 'bg-rally-charcoal/90 border-slate-700/80 text-white cursor-default'
            : isSelected
            ? 'bg-rally-accent/20 border-rally-accent text-rally-accent ring-2 ring-rally-accent/40 font-bold'
            : readOnly
            ? 'bg-slate-900/60 border-dashed border-slate-700 text-slate-400'
            : 'bg-slate-900/80 hover:bg-slate-800 border-dashed border-slate-600 hover:border-rally-accent text-slate-300 hover:text-white cursor-pointer active:scale-95'
        }`}
      >
        <span className="text-[10px] text-slate-400 mb-1">{sideLabel}</span>
        {isOccupied ? (
          <div className="flex items-center gap-1 font-semibold text-rally-light-bg truncate max-w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">{slotData.user_name || 'بازیکن'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 font-medium text-slate-400">
            <Plus size={13} className={isSelected ? 'text-rally-accent' : 'text-slate-500'} />
            <span>{isSelected ? 'انتخاب شما' : 'رزرو جایگاه'}</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-[#0a192f] border border-blue-900/50 rounded-2xl p-3 relative overflow-hidden">
      {/* Court Outer Boundary Header */}
      <div className="flex items-center justify-between text-[11px] text-blue-300/80 pb-2 border-b border-blue-900/40 px-1 font-mono">
        <span>زمین پدل (Doubles 2v2)</span>
        <span className="text-rally-accent font-sans text-[10px] bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
          چمن آبی موندو WPT
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 relative">
        {/* Center Net Line (Visual Divider) */}
        <div className="col-span-2 flex items-center justify-center my-0.5 relative">
          <div className="w-full border-t border-dashed border-white/20" />
          <span className="absolute px-2.5 py-0.5 text-[9px] bg-slate-900 border border-slate-700 text-slate-400 rounded-full font-mono">
            تور وسط (NET)
          </span>
        </div>

        {/* Team A Side (Top) */}
        <div className="col-span-2 grid grid-cols-2 gap-2">
          {renderSlot('TEAM_A_RIGHT', positions.team_a_right, 'تیم ۱ • راست (Drive)')}
          {renderSlot('TEAM_A_LEFT', positions.team_a_left, 'تیم ۱ • چپ (Backhand)')}
        </div>

        {/* Team B Side (Bottom) */}
        <div className="col-span-2 grid grid-cols-2 gap-2">
          {renderSlot('TEAM_B_RIGHT', positions.team_b_right, 'تیم ۲ • راست (Drive)')}
          {renderSlot('TEAM_B_LEFT', positions.team_b_left, 'تیم ۲ • چپ (Backhand)')}
        </div>
      </div>
    </div>
  );
};

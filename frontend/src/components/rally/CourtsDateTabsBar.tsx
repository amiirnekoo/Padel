import React from 'react';

interface DateTabItem {
  offset: number;
  label: string;
  sublabel: string;
}

interface CourtsDateTabsBarProps {
  tabs: DateTabItem[];
  selectedOffset: number;
  onSelectOffset: (offset: number) => void;
  clubsCount: number;
}

export const CourtsDateTabsBar: React.FC<CourtsDateTabsBarProps> = ({
  tabs,
  selectedOffset,
  onSelectOffset,
  clubsCount
}) => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-xs flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-bold text-gray-400 ml-2">تاریخ سانس:</span>
        {tabs.map((tab) => {
          const isTabActive = selectedOffset === tab.offset;
          return (
            <button
              key={tab.offset}
              onClick={() => onSelectOffset(tab.offset)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isTabActive
                  ? 'bg-rally-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] ${isTabActive ? 'text-white/80' : 'text-gray-400'}`}>
                ({tab.sublabel})
              </span>
            </button>
          );
        })}
      </div>

      <span className="text-xs font-bold text-gray-400 shrink-0 hidden sm:inline">
        {clubsCount} مجموعه آماده رزرو
      </span>
    </div>
  );
};

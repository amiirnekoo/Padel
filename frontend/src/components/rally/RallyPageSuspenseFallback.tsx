import React from 'react';

export const RallyPageSuspenseFallback: React.FC = () => {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8" dir="rtl">
      <div className="relative flex items-center justify-center">
        {/* Kinetic Neon Pulse Ring */}
        <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-[#0B4278] animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-[#CCFF00]/20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0B4278]" />
        </div>
      </div>
      <p className="mt-4 text-xs font-bold text-slate-500 animate-pulse">
        در حال بارگذاری سریع...
      </p>
    </div>
  );
};

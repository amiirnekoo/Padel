import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, AlertTriangle, Layers, ChevronUp, ChevronDown } from 'lucide-react';

interface ScenarioTesterBarProps {
  onRunScenario1: () => void; // Court booking for tomorrow evening
  onRunScenario2: () => void; // Beginner coach request
  onRunScenario3: () => void; // Tournament registration review
  currentSimulateState: 'NORMAL' | 'SLOT_LOST' | 'PAYMENT_PENDING';
  onSetSimulateState: (state: 'NORMAL' | 'SLOT_LOST' | 'PAYMENT_PENDING') => void;
}

export const ScenarioTesterBar: React.FC<ScenarioTesterBarProps> = ({
  onRunScenario1,
  onRunScenario2,
  onRunScenario3,
  currentSimulateState,
  onSetSimulateState
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-16 sm:bottom-14 lg:bottom-4 left-3 sm:left-4 z-40 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-rally-charcoal text-white rounded-2xl shadow-2xl border border-white/20 p-3 sm:p-4 text-xs select-none">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 font-bold text-rally-accent">
          <Sparkles className="w-4 h-4 text-rally-accent" />
          <span>جعبه‌ابزار تست ۳ سناریوی کلیدی رالی</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-3">
          <p className="text-[11px] text-gray-300">
            برای آزمایش مسیرهای کامل تعاملی، یکی از گزینه‌های زیر را انتخاب کنید:
          </p>

          <div className="space-y-1.5">
            <button
              onClick={onRunScenario1}
              className="w-full text-right p-2 rounded-xl bg-white/10 hover:bg-rally-primary hover:text-white transition-all flex items-center justify-between font-bold text-[11px]"
            >
              <span>۱. رزرو زمین فردا عصر (کورت سنترال)</span>
              <Play className="w-3.5 h-3.5 text-rally-accent shrink-0" />
            </button>

            <button
              onClick={onRunScenario2}
              className="w-full text-right p-2 rounded-xl bg-white/10 hover:bg-rally-primary hover:text-white transition-all flex items-center justify-between font-bold text-[11px]"
            >
              <span>۲. درخواست جلسه مربی سطح مبتدی</span>
              <Play className="w-3.5 h-3.5 text-rally-accent shrink-0" />
            </button>

            <button
              onClick={onRunScenario3}
              className="w-full text-right p-2 rounded-xl bg-white/10 hover:bg-rally-primary hover:text-white transition-all flex items-center justify-between font-bold text-[11px]"
            >
              <span>۳. بررسی قوانین و ثبت‌نام در مسابقه</span>
              <Play className="w-3.5 h-3.5 text-rally-accent shrink-0" />
            </button>
          </div>

          {/* Real-world State Simulators */}
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <span className="text-[10px] text-gray-400 font-bold block">شبیه‌سازی حالت‌های واقعی پرداخت:</span>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => onSetSimulateState('NORMAL')}
                className={`py-1 rounded-lg border text-center transition-all ${
                  currentSimulateState === 'NORMAL'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                عادی / موفق
              </button>

              <button
                type="button"
                onClick={() => onSetSimulateState('SLOT_LOST')}
                className={`py-1 rounded-lg border text-center transition-all ${
                  currentSimulateState === 'SLOT_LOST'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                از دست رفتن سانس
              </button>

              <button
                type="button"
                onClick={() => onSetSimulateState('PAYMENT_PENDING')}
                className={`py-1 rounded-lg border text-center transition-all ${
                  currentSimulateState === 'PAYMENT_PENDING'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                پرداخت نامشخص
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ArrowLeft, Users, Lock, Zap, Plus, Clock, MapPin } from 'lucide-react';

interface ModernMatchmakingShowcaseProps {
  onViewAllMatches: () => void;
  onCreateMatch?: () => void;
}

const SHOWCASE_MATCHES = [
  {
    id: 'sc-match-1',
    title: 'بازی پرانرژی عصرگاهی پدل',
    club: 'مجموعه پدل FGB انقلاب',
    area: 'انقلاب • کورت ۱',
    time: 'امروز • ۱۸:۳۰',
    level: 'D+',
    levelLabel: 'نیمه‌مبتدی',
    levelBg: 'bg-blue-950/80 border-blue-500/40 text-blue-300',
    levelLock: true,
    minElo: 950,
    maxElo: 1200,
    filled: 3,
    pricePerPerson: 400000,
    players: ['امیرحسین', 'کیان ر.', 'بردیا ت.']
  },
  {
    id: 'sc-match-2',
    title: 'چلنج مچ پدل دابلز متوازن',
    club: 'پدل سنتر پالادیوم',
    area: 'زعفرانیه • کورت VIP',
    time: 'امشب • ۲۰:۳۰',
    level: 'C-',
    levelLabel: 'متوسط مقدماتی',
    levelBg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300',
    levelLock: true,
    minElo: 1050,
    maxElo: 1300,
    filled: 2,
    pricePerPerson: 500000,
    players: ['سهراب م.', 'ماهان پ.']
  },
  {
    id: 'sc-match-3',
    title: 'مچ سرعتی رنکینگی پدل',
    club: 'باشگاه پدل لفور',
    area: 'آجودانیه • کورت ۲',
    time: 'فردا • ۱۷:۰۰',
    level: 'B-',
    levelLabel: 'پیشرفته مقدماتی',
    levelBg: 'bg-yellow-950/80 border-yellow-500/40 text-yellow-300',
    levelLock: true,
    minElo: 1500,
    maxElo: 1750,
    filled: 3,
    pricePerPerson: 450000,
    players: ['آرتین ق.', 'نیما الف.', 'فرهاد ک.']
  }
];

export const ModernMatchmakingShowcase: React.FC<ModernMatchmakingShowcaseProps> = ({
  onViewAllMatches,
  onCreateMatch
}) => {
  return (
    <section className="w-full bg-[#081829] py-14 sm:py-20 text-[#F5F4EF] border-t border-[#0B3356]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[#D7ED68]/20 text-[#D7ED68] border border-[#D7ED68]/30">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-black text-[#D7ED68] tracking-wider uppercase">
                سیستم زنده مسابقات و ریتینگ پدل (Elo)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              بازی‌های باز و مسابقات در حال تکمیل
            </h2>
            <p className="text-sm text-[#F5F4EF]/70 mt-1 max-w-xl">
              به مچ‌های نیازمند بازیکن بپیوندید، با هم‌سطح‌های خود بازی کنید و پس از مسابقه ریتینگ رسمی دریافت نمایید.
            </p>
          </div>

          <button
            onClick={onViewAllMatches}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all cursor-pointer group"
          >
            <span>مشاهده همه مچ‌ها</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        {/* 3 Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {SHOWCASE_MATCHES.map((match) => (
            <div
              key={match.id}
              className="bg-[#0B2238] border border-[#0C3E6E]/60 hover:border-[#D7ED68]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 group"
            >
              <div>
                {/* Level Badge and Lock */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 text-xs font-black rounded-lg border ${match.levelBg}`}>
                    سطح {match.level} • {match.levelLabel}
                  </span>
                  {match.levelLock && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                      <Lock size={10} />
                      قفل سطح ({match.minElo}-{match.maxElo})
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white group-hover:text-[#D7ED68] transition-colors mb-2">
                  {match.title}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{match.club} ({match.area})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#D7ED68] shrink-0" />
                    <span>{match.time}</span>
                  </div>
                </div>

                {/* Player Slots */}
                <div className="bg-[#07192A] border border-[#0C3E6E]/40 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      ظرفیت کورت:
                    </span>
                    <span className="font-bold text-white font-mono">{match.filled} از ۴ بازیکن</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const isFilled = slotIdx < match.filled;
                      const playerName = isFilled ? match.players[slotIdx] : 'خالی';
                      return (
                        <div
                          key={slotIdx}
                          className={`p-1.5 rounded-lg text-center text-[10px] font-bold border transition ${
                            isFilled
                              ? 'bg-blue-950/60 border-blue-800 text-blue-200'
                              : 'bg-emerald-950/40 border-dashed border-emerald-500/60 text-emerald-300 animate-pulse'
                          }`}
                        >
                          <div className="truncate">{playerName}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-[#0C3E6E]/40">
                <div>
                  <span className="text-[10px] text-slate-400 block">سهم پرداختی شما:</span>
                  <span className="text-sm font-black text-[#D7ED68]">
                    {match.pricePerPerson.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <button
                  onClick={onViewAllMatches}
                  className="px-4 py-2 rounded-xl bg-[#D7ED68] hover:bg-[#c9df5b] text-[#0B2238] text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  پیوستن به بازی
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Match Banner */}
        <div className="bg-gradient-to-r from-[#0C2D4A] to-[#0A233A] border border-[#0F4270] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-[#D7ED68]/20 border border-[#D7ED68]/40 flex items-center justify-center text-[#D7ED68] shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">زمین رزرو کرده‌اید و به هم‌بازی نیاز دارید؟</h4>
              <p className="text-xs text-[#F5F4EF]/70">
                سانس خود را در مچ‌میکینگ ثبت کنید، قفل سطح بگذارید و هزینه را به صورت ۴ نفره تسهیم نمایید.
              </p>
            </div>
          </div>
          <button
            onClick={onCreateMatch || onViewAllMatches}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-[#0B2238] hover:bg-slate-100 text-xs font-black transition-all cursor-pointer shrink-0 shadow-sm"
          >
            ایجاد بازی جدید
          </button>
        </div>

      </div>
    </section>
  );
};

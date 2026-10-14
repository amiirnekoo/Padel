import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Users2, ChevronLeft, ShieldAlert, Sparkles, Play } from 'lucide-react';
import { Tournament, SportType } from '../../types/rally';
import { MOCK_TOURNAMENTS } from '../../data/mockRallyData';
import { AmericanoGeneratorModal } from '../../components/rally/tournaments/americano/AmericanoGeneratorModal';

interface RallyTournamentsPageProps {
  onSelectTournament: (tournament: Tournament) => void;
  initialFilters?: { sport?: SportType; level?: string };
}

export const RallyTournamentsPage: React.FC<RallyTournamentsPageProps> = ({
  onSelectTournament,
  initialFilters
}) => {
  const [filterSport, setFilterSport] = useState<SportType | 'ALL'>('ALL');
  const [isAmericanoOpen, setIsAmericanoOpen] = useState(false);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-rally-primary" />
          <h1 className="text-xl sm:text-2xl font-black text-rally-charcoal">
            مسابقات و تورنمنت‌های رسمی رالی
          </h1>
        </div>
        <p className="text-xs text-gray-500">
          جدول مسابقات تک‌حذفی و امتیازی، استانداردهای بین‌المللی و جوایز نقدی معتبر
        </p>
      </div>

      {/* Americano Generator Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0f172a] to-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
            <Sparkles size={12} />
            <span>فرمت اختصاصی و پرطرفدار پدل در جهان</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            ژنراتور تورنمنت‌های آمریکانو (Americano Tournament Engine)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            برگزاری مسابقات تفریحی ۸ یا ۴ نفره با قرعه‌کشی خودکار راندها، چرخش پارتنرها، ثبت امتیازات زنده و لیدربورد لحظه‌ای. مناسب کلوپ‌ها و دورهمی‌های دوستانه.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAmericanoOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Play size={16} className="fill-current" />
          <span>راه‌اندازی مسابقه آمریکانو ➔</span>
        </button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_TOURNAMENTS.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[16/8] bg-gray-100">
              <img
                src={t.bannerUrl || '/images/rally_tournament.jpg'}
                alt={t.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rally-charcoal/80 via-transparent to-transparent" />
              
              <div className="absolute top-3 right-3 flex gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-rally-primary">
                  {t.format === 'DOUBLES' ? '👥 دونفره (تیمی)' : '👤 انفرادی'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rally-accent text-rally-charcoal">
                  {t.level}
                </span>
              </div>

              <div className="absolute bottom-3 right-3 text-white">
                <h3 className="text-base sm:text-lg font-black">{t.title}</h3>
                <p className="text-xs text-gray-200">{t.venueName} • {t.startDate}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Capacity Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-500">ظرفیت جدول:</span>
                  <span className="text-rally-primary">{t.registeredTeams} از {t.maxTeams} تیم</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rally-primary rounded-full"
                    style={{ width: `${(t.registeredTeams / t.maxTeams) * 100}%` }}
                  />
                </div>
              </div>

              {/* Prize and fee */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px]">مجموع جوایز:</span>
                  <span className="font-extrabold text-rally-primary text-sm">
                    {(t.prizePool / 10).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">ورودی هر تیم:</span>
                  <span className="font-extrabold text-rally-charcoal text-sm">
                    {(t.entryFee / 10).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">برگزارکننده: {t.organizer}</span>
                <button
                  onClick={() => onSelectTournament(t)}
                  className="px-5 py-2.5 rounded-xl bg-rally-primary hover:bg-rally-primary-light text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                >
                  <Trophy className="w-4 h-4 text-rally-accent" />
                  <span>مشاهده شرایط و ثبت‌نام</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AmericanoGeneratorModal
        isOpen={isAmericanoOpen}
        onClose={() => setIsAmericanoOpen(false)}
      />
    </div>
  );
};

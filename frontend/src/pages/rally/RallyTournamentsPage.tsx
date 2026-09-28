import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Users2, ChevronLeft, ShieldAlert } from 'lucide-react';
import { Tournament, SportType } from '../../types/rally';
import { MOCK_TOURNAMENTS } from '../../data/mockRallyData';

interface RallyTournamentsPageProps {
  onSelectTournament: (tournament: Tournament) => void;
  initialFilters?: { sport?: SportType; level?: string };
}

export const RallyTournamentsPage: React.FC<RallyTournamentsPageProps> = ({
  onSelectTournament,
  initialFilters
}) => {
  const [filterSport, setFilterSport] = useState<SportType | 'ALL'>('ALL');

  return (
    <div className="space-y-6">
      
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
    </div>
  );
};

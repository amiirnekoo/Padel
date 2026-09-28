import React, { useState } from 'react';
import {
  X,
  Trophy,
  Calendar,
  MapPin,
  Users2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Tournament } from '../../types/rally';

interface TournamentDetailsModalProps {
  tournament: Tournament;
  onClose: () => void;
  onRegisterConfirmed: (tournament: Tournament, teamName: string, partnerName: string) => void;
}

export const TournamentDetailsModal: React.FC<TournamentDetailsModalProps> = ({
  tournament,
  onClose,
  onRegisterConfirmed
}) => {
  const [teamName, setTeamName] = useState('شاهین پدل');
  const [partnerName, setPartnerName] = useState('سروش پارسا');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) return;
    setIsSuccess(true);
    setTimeout(() => {
      onRegisterConfirmed(tournament, teamName, partnerName);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-rally-charcoal/70 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col text-rally-charcoal">
        
        {/* Banner */}
        <div className="relative aspect-[16/7] w-full bg-gray-100 shrink-0">
          <img
            src={tournament.bannerUrl || '/images/rally_tournament.jpg'}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rally-charcoal/90 via-rally-charcoal/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 right-4 left-4 text-white">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rally-accent text-rally-charcoal mb-1 inline-block">
              {tournament.level}
            </span>
            <h3 className="text-base sm:text-xl font-black">{tournament.title}</h3>
            <p className="text-xs text-gray-200 mt-0.5">برگزارکننده: {tournament.organizer}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          
          {/* Details Overview Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px]">مجموع جوایز نقدی:</span>
              <span className="font-extrabold text-rally-primary text-sm">
                {(tournament.prizePool / 10).toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px]">ظرفیت تورنمنت:</span>
              <span className="font-bold text-gray-800">
                {tournament.registeredTeams} از {tournament.maxTeams} تیم تکمیل شده
              </span>
            </div>
          </div>

          {/* Tournament Rules */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-2">
            <p className="font-bold text-gray-700">قوانین و شرایط برگزاری:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {tournament.rules.map((rule, idx) => (
                <li key={idx} className="leading-relaxed">{rule}</li>
              ))}
            </ul>
          </div>

          {/* Registration Form */}
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">نام تیم</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">نام هم‌تیمی (یار دوم)</label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-rally-charcoal"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="rounded text-rally-primary focus:ring-rally-primary"
                />
                <span className="text-xs text-gray-600 font-medium">
                  قوانین و شرایط قرعه‌کشی مسابقات را مطالعه کرده و می‌پذیرم.
                </span>
              </label>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">ورودی هر تیم:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-rally-primary">
                      {(tournament.entryFee / 10).toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">تومان</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!acceptedTerms}
                  className="px-6 py-2.5 rounded-xl bg-rally-primary hover:bg-rally-primary-light disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer min-h-[44px]"
                >
                  <Trophy className="w-4 h-4 text-rally-accent" />
                  <span>تأیید و ثبت‌نام در جدول</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-base font-black text-rally-charcoal">تیم شما با موفقیت در جدول ثبت شد!</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                جدول زمان‌بندی بازی‌ها و قرعه‌کشی ۴۸ ساعت پیش از شروع ارسال خواهد شد.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

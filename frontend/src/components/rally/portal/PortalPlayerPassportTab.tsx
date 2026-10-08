import React, { useState } from 'react';
import { Award, Trophy, User, ShieldCheck, Star, Activity, CheckCircle2 } from 'lucide-react';
import { UserSession } from '../../AuthModal';
import { rallyApi } from '../../../services/rallyApi';

interface PortalPlayerPassportTabProps {
  userSession: UserSession;
}

export const PortalPlayerPassportTab: React.FC<PortalPlayerPassportTabProps> = ({ userSession }) => {
  const [dominantHand, setDominantHand] = useState<'RIGHT' | 'LEFT'>(userSession.dominantHand || 'RIGHT');
  const [preferredSport, setPreferredSport] = useState(userSession.preferredSport || 'PADEL');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await rallyApi.updateUserProfile({
        dominant_hand: dominantHand,
        preferred_sport: preferredSport,
      });
      if (res && res.success) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
      }
    } catch {
      // در صورت خطا
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Passport Card Header */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0C3E6E] border-2 border-[#D7ED68] text-[#D7ED68] flex items-center justify-center font-black text-2xl shadow-lg">
              {userSession.fullName ? userSession.fullName.charAt(0) : 'R'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{userSession.fullName || 'ورزشکار رسمی'}</h3>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  احراز هویت شده
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1" dir="ltr">{userSession.phoneNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block">رنکینگ استانی</span>
              <span className="text-base font-extrabold text-[#D7ED68]">#۴۲</span>
            </div>
            <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block">امتیاز رالی (RP)</span>
              <span className="text-base font-extrabold text-white">۱,۴۸۰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes Form */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-6 space-y-5">
        <h4 className="font-bold text-white text-sm">مشخصات فنی و ورزشی بازیکن</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-2">دست غالب در ضربات:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDominantHand('RIGHT')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  dominantHand === 'RIGHT'
                    ? 'bg-rally-primary text-white border-rally-primary shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                راست‌دست (Right-handed)
              </button>
              <button
                type="button"
                onClick={() => setDominantHand('LEFT')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  dominantHand === 'LEFT'
                    ? 'bg-rally-primary text-white border-rally-primary shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                چپ‌دست (Left-handed)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-2">رشته ورزشی اصلی:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreferredSport('PADEL')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  preferredSport === 'PADEL'
                    ? 'bg-rally-primary text-white border-rally-primary shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                پدل (Padel)
              </button>
              <button
                type="button"
                onClick={() => setPreferredSport('BOTH')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  preferredSport === 'BOTH'
                    ? 'bg-rally-primary text-white border-rally-primary shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                پدل و تنیس
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-6 py-2.5 bg-rally-primary hover:bg-rally-primary/80 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات شناسنامه'}
          </button>
          {savedNotice && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              مشخصات با موفقیت ذخیره گردید
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Award, Trophy, ShieldCheck, Zap, Star, Activity, CheckCircle2, Share2, Check } from 'lucide-react';
import { UserSession } from '../../AuthModal';
import { rallyApi } from '../../../services/rallyApi';
import { PlayerProfileData } from '../../../types/rally';
import { PlayerMatchHistoryList } from '../player/PlayerMatchHistoryList';

interface PortalPlayerPassportTabProps {
  userSession: UserSession;
}

export const PortalPlayerPassportTab: React.FC<PortalPlayerPassportTabProps> = ({ userSession }) => {
  const [dominantHand, setDominantHand] = useState<'RIGHT' | 'LEFT'>(userSession.dominantHand || 'RIGHT');
  const [preferredSport, setPreferredSport] = useState(userSession.preferredSport || 'PADEL');
  const [preferredSide, setPreferredSide] = useState<'RIGHT' | 'LEFT' | 'BOTH'>('BOTH');
  const [racketName, setRacketName] = useState('NOX AT10 Genius 18K 2026');
  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    rallyApi.getPlayerProfile(userSession.userId).then((data) => {
      if (data) {
        setProfile(data);
        if (data.dominant_hand) setDominantHand(data.dominant_hand);
        if (data.preferred_side) setPreferredSide(data.preferred_side);
        if (data.racket_name) setRacketName(data.racket_name);
      }
    });
  }, [userSession.userId]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await rallyApi.updateSportsProfile({
        dominant_hand: dominantHand,
        preferred_side: preferredSide,
        racket_name: racketName,
      });
      await rallyApi.updateUserProfile({
        dominant_hand: dominantHand,
        preferred_sport: preferredSport,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch {
      // Error handling
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/player/${userSession.userId}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Passport Card Header */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
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

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold">رتبه کشوری</span>
              <span className="text-base font-extrabold text-[#D7ED68]">#{profile?.rank || 42}</span>
            </div>
            <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold">ریتینگ زنده Elo</span>
              <span className="text-base font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <Zap size={14} className="fill-amber-400" />
                {profile?.elo_rating.toLocaleString('fa-IR') || '۱,۴۸۰'}
              </span>
            </div>
            <button
              onClick={handleShare}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
              title="اشتراک‌گذاری کارت شناسنامه"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? 'کپی شد' : 'اشتراک کارت'}</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">سطح مهارتی</span>
            <span className="text-xs sm:text-sm font-black text-amber-300">سطح {profile?.skill_tier || 'C+'}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">کل بازی‌ها</span>
            <span className="text-xs sm:text-sm font-black text-white">{profile?.matches_played || 0}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">پیروزی‌ها</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400">{profile?.matches_won || 0}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">نرخ برد</span>
            <span className="text-xs sm:text-sm font-black text-rally-accent">{profile?.win_rate || 0}٪</span>
          </div>
        </div>
      </div>

      {/* Attributes Form */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
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
            <label className="text-xs text-slate-300 font-bold block mb-2">پوزیشن تخصصی در کورت دابلز:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPreferredSide('RIGHT')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  preferredSide === 'RIGHT'
                    ? 'bg-rally-primary text-white border-rally-primary shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                راست (درایو)
              </button>
              <button
                type="button"
                onClick={() => setPreferredSide('LEFT')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  preferredSide === 'LEFT'
                    ? 'bg-rally-primary text-white border-rally-primary shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                چپ (حمله)
              </button>
              <button
                type="button"
                onClick={() => setPreferredSide('BOTH')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  preferredSide === 'BOTH'
                    ? 'bg-rally-primary text-white border-rally-primary shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                هر دو سمت
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-2">راکت تخصصی مورد استفاده:</label>
            <input
              type="text"
              value={racketName}
              onChange={(e) => setRacketName(e.target.value)}
              placeholder="مثلا NOX AT10 Genius 18K"
              className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-rally-accent font-medium"
            />
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

      {/* Match History Section */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Trophy size={16} className="text-rally-accent" />
            <span>تاریخچه و لاگ مسابقات رسمی من</span>
          </h4>
          <span className="text-xs text-slate-400">ثبت‌شده بر اساس نتایج رسمی رالی</span>
        </div>
        <PlayerMatchHistoryList matches={profile?.recent_matches || []} />
      </div>
    </div>
  );
};

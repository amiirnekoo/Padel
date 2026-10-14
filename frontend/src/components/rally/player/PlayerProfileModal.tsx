import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Zap, Trophy, Award, Star, Share2, Check, Flame, Activity } from 'lucide-react';
import { PlayerProfileData } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';
import { PlayerMatchHistoryList } from './PlayerMatchHistoryList';

interface PlayerProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  initialData?: PlayerProfileData | null;
}

const getTierColor = (tier: string) => {
  if (tier.startsWith('A')) return { text: 'text-rose-400', bg: 'bg-rose-950/80', border: 'border-rose-500/40' };
  if (tier.startsWith('B')) return { text: 'text-amber-400', bg: 'bg-amber-950/80', border: 'border-amber-500/40' };
  if (tier.startsWith('C')) return { text: 'text-indigo-400', bg: 'bg-indigo-950/80', border: 'border-indigo-500/40' };
  return { text: 'text-emerald-400', bg: 'bg-emerald-950/80', border: 'border-emerald-500/40' };
};

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  initialData,
}) => {
  const [profile, setProfile] = useState<PlayerProfileData | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'MATCHES' | 'BADGES'>('MATCHES');

  useEffect(() => {
    if (isOpen && userId) {
      if (initialData && initialData.id === userId) {
        setProfile(initialData);
      } else {
        setLoading(true);
        rallyApi.getPlayerProfile(userId).then((data) => {
          setProfile(data);
          setLoading(false);
        });
      }
    }
  }, [isOpen, userId, initialData]);

  if (!isOpen || !userId) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/player/${userId}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tier = profile?.skill_tier || 'C';
  const tierStyle = getTierColor(tier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0B1E30] border border-white/10 rounded-2xl shadow-2xl text-right overflow-hidden my-auto" dir="rtl">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#071524]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rally-accent/10 border border-rally-accent/30 text-rally-accent flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">شناسنامه رسمی بازیکن پدل</h2>
              <span className="text-[10px] text-slate-400">سیستم ریتینگ و نتایج رسمی رالی (Elo)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copied ? 'کپی شد' : 'اشتراک کارت'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {loading || !profile ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-rally-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            در حال بارگذاری شناسنامه بازیکن...
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Header Passport Card */}
            <div className="bg-gradient-to-r from-slate-900 to-[#0e273f] border border-white/10 rounded-2xl p-4 sm:p-5 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-800 border-2 ${tierStyle.border} text-white flex items-center justify-center font-black text-2xl shadow-lg relative`}>
                    {profile.full_name.charAt(0)}
                    <span className="absolute -bottom-2 -left-2 bg-slate-950 border border-white/20 px-1.5 py-0.2 rounded text-[10px] font-black text-rally-accent">
                      {profile.dominant_hand === 'LEFT' ? 'چپ‌دست' : 'راست‌دست'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">{profile.full_name}</h3>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck size={11} />
                        احراز هویت
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                      <span>{profile.city}</span>
                      <span>•</span>
                      <span>پوزیشن: {profile.preferred_side === 'RIGHT' ? 'سمت راست (کنترل)' : profile.preferred_side === 'LEFT' ? 'سمت چپ (حمله)' : 'هر دو سمت'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[260px]">
                      راکت: <span className="text-slate-200 font-bold">{profile.racket_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end">
                  <div className="bg-slate-950/80 border border-white/10 px-3.5 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">رتبه پلتفرم</span>
                    <span className="text-sm font-black text-[#D7ED68]">#{profile.rank.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className={`px-3.5 py-2 rounded-xl text-center border ${tierStyle.bg} ${tierStyle.border}`}>
                    <span className="text-[10px] text-slate-300 block font-bold">سطح مهارتی</span>
                    <span className={`text-sm font-black ${tierStyle.text}`}>{profile.skill_tier}</span>
                  </div>
                </div>
              </div>

              {/* Stats Highlights Bar */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block">ریتینگ Elo</span>
                  <span className="text-xs sm:text-sm font-black text-amber-400 flex items-center justify-center gap-0.5">
                    <Zap size={11} className="fill-amber-400" />
                    {profile.elo_rating.toLocaleString('fa-IR')}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block">بازی‌ها</span>
                  <span className="text-xs sm:text-sm font-black text-white">{profile.matches_played}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block">پیروزی</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400">{profile.matches_won}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block">نرخ برد</span>
                  <span className="text-xs sm:text-sm font-black text-rally-accent">{profile.win_rate}٪</span>
                </div>
              </div>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveSubTab('MATCHES')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'MATCHES'
                    ? 'bg-rally-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame size={14} />
                <span>لاگ مسابقات اخیر ({profile.recent_matches.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('BADGES')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'BADGES'
                    ? 'bg-rally-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award size={14} />
                <span>نشان‌ها و افتخارات ({profile.badges.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeSubTab === 'MATCHES' ? (
              <PlayerMatchHistoryList matches={profile.recent_matches} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.badges.map((b) => (
                  <div key={b.id} className="bg-slate-900 border border-white/10 p-3.5 rounded-xl flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      {b.icon === 'Zap' && <Zap size={18} />}
                      {b.icon === 'Shield' && <ShieldCheck size={18} />}
                      {b.icon === 'Trophy' && <Trophy size={18} />}
                      {b.icon === 'Star' && <Star size={18} />}
                      {b.icon === 'Award' && <Award size={18} />}
                      {b.icon === 'CheckCircle2' && <Check size={18} />}
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-black">{b.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Award, Trophy, UserCheck, Shield, Check, Save, AlertCircle, Sparkles } from 'lucide-react';
import { UserSession } from '../../AuthModal';
import { rallyApi } from '../../../services/rallyApi';

interface PortalPlayerPassportTabProps {
  userSession: UserSession;
}

export const PortalPlayerPassportTab: React.FC<PortalPlayerPassportTabProps> = ({ userSession }) => {
  const [fullName, setFullName] = useState(userSession.fullName || '');
  const [preferredSport, setPreferredSport] = useState<'PADEL' | 'TENNIS' | 'BOTH'>(userSession.preferredSport || 'PADEL');
  const [dominantHand, setDominantHand] = useState<'RIGHT' | 'LEFT'>(userSession.dominantHand || 'RIGHT');
  const [skillLevel, setSkillLevel] = useState('INTERMEDIATE');
  const [city, setCity] = useState('تهران');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // بارگذاری مشخصات کامل از بک‌اند
    const loadProfile = async () => {
      const data = await rallyApi.getUserProfile();
      if (data) {
        if (data.full_name) setFullName(data.full_name);
        if (data.preferred_sport) setPreferredSport(data.preferred_sport as 'PADEL' | 'TENNIS' | 'BOTH');
        if (data.dominant_hand) setDominantHand(data.dominant_hand as 'RIGHT' | 'LEFT');
        if (data.skill_level) setSkillLevel(data.skill_level);
        if (data.city) setCity(data.city);
        if (data.emergency_phone) setEmergencyPhone(data.emergency_phone);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await rallyApi.updateUserProfile({
        full_name: fullName,
        preferred_sport: preferredSport,
        dominant_hand: dominantHand,
        skill_level: skillLevel,
        city: city,
        emergency_phone: emergencyPhone
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'شناسنامه ورزشی شما با موفقیت به‌روزرسانی شد.' });
      } else {
        setMessage({ type: 'error', text: res.error || 'خطا در ثبت اطلاعات' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Passport Preview Card - Strictly solid colors, NO backdrop-blur */}
      <div className="bg-gradient-to-br from-[#0C3050] via-[#0B1E30] to-[#07131F] border border-[#D7ED68]/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0C3E6E] border border-[#D7ED68]/40 text-[#D7ED68] font-black text-xl flex items-center justify-center shadow-lg">
              {fullName?.charAt(0) || 'R'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{fullName || 'ورزشکار رالی'}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D7ED68] text-[#07131F] font-mono">
                  VERIFIED
                </span>
              </div>
              <span className="text-xs text-slate-300 font-mono mt-0.5 block">{userSession.phoneNumber}</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[10px] text-slate-300">رنکینگ استانی و سطح</div>
            <div className="text-sm font-black text-[#D7ED68] flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>امتیاز ۱۴۲۰ (رده طلایی)</span>
            </div>
          </div>
        </div>

        {/* Passport Traits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-3 bg-[#07131F]/80 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-300 block">رشته ورزشی اصلی</span>
            <span className="text-xs font-bold text-white mt-1 block">
              {preferredSport === 'PADEL' ? '🎾 پدل (Padel)' : preferredSport === 'TENNIS' ? '🎾 تنیس خاکی' : 'هر دو رشته'}
            </span>
          </div>

          <div className="p-3 bg-[#07131F]/80 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-300 block">دست غالب</span>
            <span className="text-xs font-bold text-white mt-1 block">
              {dominantHand === 'RIGHT' ? 'راست‌دست (Right-Handed)' : 'چپ‌دست (Left-Handed)'}
            </span>
          </div>

          <div className="p-3 bg-[#07131F]/80 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-300 block">سطح ارزیابی مهارتی</span>
            <span className="text-xs font-bold text-[#D7ED68] mt-1 block font-mono">
              {skillLevel}
            </span>
          </div>

          <div className="p-3 bg-[#07131F]/80 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-300 block">شهر سکونت</span>
            <span className="text-xs font-bold text-white mt-1 block">{city || 'تهران'}</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-[#0B1E30] border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
          <Sparkles className="w-5 h-5 text-[#D7ED68]" />
          <h4 className="text-sm font-bold text-white">ویرایش شناسنامه و اطلاعات فنی بازی</h4>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">نام و نام خانوادگی</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D7ED68]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">رشته ورزشی اصلی</label>
              <select
                value={preferredSport}
                onChange={(e) => setPreferredSport(e.target.value as 'PADEL' | 'TENNIS' | 'BOTH')}
                className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D7ED68]"
              >
                <option value="PADEL">پدل (Padel)</option>
                <option value="TENNIS">تنیس خاکی (Tennis)</option>
                <option value="BOTH">هر دو رشته</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">دست غالب در بازی</label>
              <select
                value={dominantHand}
                onChange={(e) => setDominantHand(e.target.value as 'RIGHT' | 'LEFT')}
                className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D7ED68]"
              >
                <option value="RIGHT">راست‌دست</option>
                <option value="LEFT">چپ‌دست</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">سطح مهارت ورزشی</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D7ED68]"
              >
                <option value="BEGINNER">مقدماتی (آموزش‌دیده)</option>
                <option value="INTERMEDIATE">متوسط (بازی‌های منظم هفتگی)</option>
                <option value="ADVANCED">پیشرفته (آماده مسابقات رالی)</option>
                <option value="PRO">حرفه‌ای / دارای رنکینگ فدراسیون</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">شهر محل بازی</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D7ED68]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">شماره تماس اضطراری</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="0912..."
                className="w-full bg-[#07131F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D7ED68] font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#D7ED68] text-[#07131F] font-black text-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات شناسنامه'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

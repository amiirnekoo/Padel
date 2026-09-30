import React, { useState } from 'react';
import { X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { CourtPositionType } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName: string;
}

const SKILL_LEVELS = [
  { id: 'D', label: 'سطح D (مبتدی)', desc: 'آشنایی اولیه با قوانین و بازی تفریحی' },
  { id: 'D+', label: 'سطح D+ (نیمه‌مبتدی)', desc: 'مسلط به سرویس، رالی ساده و شیشه اول' },
  { id: 'C', label: 'سطح C (متوسط)', desc: 'کنترل ضربات والِی، بانجیا و دفاع شیشه' },
  { id: 'C+', label: 'سطح C+ (نیمه‌پیشرفته)', desc: 'بازی سرعتی، اسمش موثر و جاگیری تیمی' },
  { id: 'B', label: 'سطح B (پیشرفته)', desc: 'تسلط تاکتیکی و حضور در مسابقات باشگاهی' },
  { id: 'A', label: 'سطح A (حرفه‌ای)', desc: 'رنکینگ استانی و کشوری فدراسیون' },
];

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userName,
}) => {
  const [title, setTitle] = useState('مچ آزاد پدل آخر هفته');
  const [skillLevel, setSkillLevel] = useState('D+');
  const [genderCategory, setGenderCategory] = useState<'OPEN' | 'MALE' | 'FEMALE'>('OPEN');
  const [totalPrice, setTotalPrice] = useState(16000000); // 1,600,000 Tomans in Rials
  const [creatorPos, setCreatorPos] = useState<CourtPositionType>('TEAM_A_RIGHT');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const costPerPersonToman = (totalPrice / 4) / 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      club_id: 'club-1',
      court_id: 'court-1',
      timeslot_id: 'slot-1',
      skill_level: skillLevel,
      creator_id: userId,
      creator_position: creatorPos,
      title,
      gender_category: genderCategory,
    };

    const res = await rallyApi.createMatchmakingGame(payload);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'خطا در ایجاد بازی مچ‌میکینگ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-white" dir="rtl">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-rally-accent font-bold mb-1">
            <Sparkles size={14} />
            <span>ایجاد بازی آزاد ۴ نفره (Open Match)</span>
          </div>
          <h2 className="text-lg font-black text-white">برگزاری بازی مچ‌میکینگ پدل</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">عنوان بازی:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rally-accent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">سطح مهارت مجاز (Skill Level):</label>
            <div className="grid grid-cols-2 gap-2">
              {SKILL_LEVELS.map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setSkillLevel(lvl.id)}
                  className={`p-2.5 rounded-xl border text-right transition ${
                    skillLevel === lvl.id
                      ? 'bg-blue-950/80 border-rally-accent text-rally-accent font-bold ring-1 ring-rally-accent/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رده مسابقه:</label>
              <select
                value={genderCategory}
                onChange={(e) => setGenderCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="OPEN">آزاد / مختلط (Open)</option>
                <option value="MALE">آقایان</option>
                <option value="FEMALE">بانوان</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">جایگاه شما در کورت:</label>
              <select
                value={creatorPos}
                onChange={(e) => setCreatorPos(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="TEAM_A_RIGHT">تیم ۱ - راست (Drive)</option>
                <option value="TEAM_A_LEFT">تیم ۱ - چپ (Backhand)</option>
                <option value="TEAM_B_RIGHT">تیم ۲ - راست (Drive)</option>
                <option value="TEAM_B_LEFT">تیم ۲ - چپ (Backhand)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">سهم پرداختی هر نفر (تسهیم ۴ نفره):</span>
            <span className="font-mono font-bold text-rally-accent text-sm">
              {costPerPersonToman.toLocaleString('fa-IR')} تومان
            </span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-rally-accent hover:bg-rally-accent-hover text-slate-950 shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} />
              {loading ? 'در حال انتشار بازی...' : 'ایجاد و انتشار در مچ‌میکینگ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

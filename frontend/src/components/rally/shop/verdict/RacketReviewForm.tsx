import React, { useState } from 'react';
import { CheckCircle, Send, X } from 'lucide-react';

interface RacketReviewFormProps {
  onClose: () => void;
  onSubmitReview: (review: {
    userName: string;
    playerLevel: string;
    scores: { power: number; control: number; comfort: number };
    comment: string;
    rating: number;
  }) => void;
}

export const RacketReviewForm: React.FC<RacketReviewFormProps> = ({
  onClose,
  onSubmitReview
}) => {
  const [userName, setUserName] = useState('');
  const [playerLevel, setPlayerLevel] = useState('متوسط (سطح ۳)');
  const [powerScore, setPowerScore] = useState(8.0);
  const [controlScore, setControlScore] = useState(8.5);
  const [comfortScore, setComfortScore] = useState(8.5);
  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // محاسبه اورال زنده نمره کاربر
  const calculatedUserOverall = Number(
    ((powerScore * 0.35) + (controlScore * 0.4) + (comfortScore * 0.25)).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !commentText.trim()) return;

    onSubmitReview({
      userName: userName.trim(),
      playerLevel,
      scores: {
        power: powerScore,
        control: controlScore,
        comfort: comfortScore
      },
      comment: commentText.trim(),
      rating: calculatedUserOverall
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setCommentText('');
    }, 1600);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 sm:p-5 bg-slate-900/95 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col gap-4 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#D7ED68]">
            ارزیابی شما از راکت (تنظیم ۳ اسلایدر کلیدی)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="text-[11px] text-slate-300">نمره نهایی شما:</span>
            <span className="font-mono font-black text-[#D7ED68] text-sm">{calculatedUserOverall}</span>
            <span className="text-[10px] text-slate-400">/ ۱۰</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ۳ اسلایدر تعاملی سرگرم‌کننده */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* قدرت */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-amber-400">قدرت ضربه (Power)</span>
            <span className="font-mono text-white">{powerScore}</span>
          </div>
          <input
            type="range"
            min="5"
            max="10"
            step="0.5"
            value={powerScore}
            onChange={e => setPowerScore(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* کنترل */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-sky-400">کنترل شات (Control)</span>
            <span className="font-mono text-white">{controlScore}</span>
          </div>
          <input
            type="range"
            min="5"
            max="10"
            step="0.5"
            value={controlScore}
            onChange={e => setControlScore(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* راحتی */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-emerald-400">راحتی مچ (Comfort)</span>
            <span className="font-mono text-white">{comfortScore}</span>
          </div>
          <input
            type="range"
            min="5"
            max="10"
            step="0.5"
            value={comfortScore}
            onChange={e => setComfortScore(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* نام و سطح بازیکن */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          placeholder="نام یا نام کاربری شما در رالی..."
          value={userName}
          onChange={e => setUserName(e.target.value)}
          className="bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7ED68]"
        />
        <select
          value={playerLevel}
          onChange={e => setPlayerLevel(e.target.value)}
          className="bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7ED68] cursor-pointer"
        >
          <option value="مبتدی (سطح ۱)">مبتدی (سطح ۱)</option>
          <option value="متوسط (سطح ۲ الی ۳)">متوسط (سطح ۲ الی ۳)</option>
          <option value="پیشرفته (سطح ۴ الی ۵)">پیشرفته (سطح ۴ الی ۵)</option>
          <option value="حرفه‌ای و مسابقاتی (PRO)">حرفه‌ای و مسابقاتی (PRO)</option>
        </select>
      </div>

      {/* متن نظر و تجربه بازی */}
      <textarea
        required
        rows={3}
        placeholder="تجربه بازی در زمین، حس ضربه، مقایسه با راکت‌های قبلی..."
        value={commentText}
        onChange={e => setCommentText(e.target.value)}
        className="bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7ED68] resize-none"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitted}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
            submitted
              ? 'bg-emerald-600 text-white'
              : 'bg-[#D7ED68] hover:bg-[#c7de54] text-slate-950'
          }`}
        >
          {submitted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>امتیاز شما با موفقیت ثبت شد!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>ثبت امتیاز و نظر در کارنامه راکت</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

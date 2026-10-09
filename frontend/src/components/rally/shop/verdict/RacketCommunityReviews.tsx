import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, CheckCircle, Send, Sparkles, UserCheck } from 'lucide-react';
import { CommunityReview } from '../../../../types/racketVerdict';
import { SAMPLE_COMMUNITY_REVIEWS } from '../../../../data/racketVerdictData';

interface RacketCommunityReviewsProps {
  productId: string;
  productName: string;
}

export const RacketCommunityReviews: React.FC<RacketCommunityReviewsProps> = React.memo(({
  productId,
  productName
}) => {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // فیلدهای فرم ثبت نظر و امتیازدهی تعاملی کاربر
  const [userName, setUserName] = useState('');
  const [playerLevel, setPlayerLevel] = useState('متوسط (سطح ۳)');
  const [powerScore, setPowerScore] = useState(8.0);
  const [controlScore, setControlScore] = useState(8.5);
  const [comfortScore, setComfortScore] = useState(8.5);
  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // محاسبه اورال زنده نمره کاربر
  const calculatedUserOverall = Number(((powerScore * 0.35) + (controlScore * 0.4) + (comfortScore * 0.25)).toFixed(1));

  // بارگذاری نظرات از حافظه کلاینت و داده‌های پیش‌فرض
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`rally_reviews_${productId}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        const initial = SAMPLE_COMMUNITY_REVIEWS[productId] || [
          {
            id: `rev-${productId}-default`,
            userName: 'سهراب مرادی',
            playerLevel: 'متوسط (باشگاه FGB انقلاب)',
            rating: 8.6,
            scores: { power: 7.5, control: 9.0, comfort: 9.2 },
            comment: `تجربه بازی فوق‌العاده‌ای با راکت ${productName} داشتم. انتقال نیرو بسیار یکنواخت است و در بازی‌های پر فشار خستگی دست حس نمی‌شود.`,
            date: '۵ روز پیش',
            likesCount: 11,
            isVerifiedPlayer: true
          }
        ];
        setReviews(initial);
      }
    } catch {
      // fallback
    }
  }, [productId, productName]);

  // ثبت نظر جدید
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !commentText.trim()) return;

    const newRev: CommunityReview = {
      id: `rev-${Date.now()}`,
      userName: userName.trim(),
      playerLevel,
      rating: calculatedUserOverall,
      scores: {
        power: powerScore,
        control: controlScore,
        comfort: comfortScore
      },
      comment: commentText.trim(),
      date: 'لحظاتی پیش',
      likesCount: 1,
      isVerifiedPlayer: true
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`rally_reviews_${productId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setCommentText('');
    }, 1800);
  };

  // افزایش لایک
  const handleLike = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, likesCount: r.likesCount + 1 } : r);
    setReviews(updated);
    try {
      localStorage.setItem(`rally_reviews_${productId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6 bg-slate-900/80 rounded-3xl border border-slate-800 text-white">
      
      {/* سربرگ نظرات جامعه بازیکنان */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>نظرات و امتیازدهی بازیکنان کورت (COMMUNITY VERDICT)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تجربه عملی پدل‌بازها با این راکت و ریتینگ جامعه رالی
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showForm ? 'بستن فرم امتیازدهی' : 'امتیاز و نظر شما به این راکت'}</span>
        </button>
      </div>

      {/* فرم ثبت امتیاز تعاملی و نظر */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 bg-slate-950/90 rounded-2xl border border-cyan-500/30 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black text-cyan-400">
              ارزیابی شما از راکت (اسلایدرها را تنظیم کنید)
            </span>
            <div className="flex items-center gap-1 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-500/40">
              <span className="text-[11px] text-slate-300">امتیاز نهایی شما:</span>
              <span className="font-mono font-black text-cyan-400 text-sm">{calculatedUserOverall}</span>
              <span className="text-[10px] text-slate-400">/ ۱۰</span>
            </div>
          </div>

          {/* ۳ اسلایدر تعاملی سرگرم‌کننده */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* قدرت */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
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
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-cyan-400">کنترل شات (Control)</span>
                <span className="font-mono text-white">{controlScore}</span>
              </div>
              <input
                type="range"
                min="5"
                max="10"
                step="0.5"
                value={controlScore}
                onChange={e => setControlScore(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* راحتی */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
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
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <select
              value={playerLevel}
              onChange={e => setPlayerLevel(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="مبتدی (سطح ۱)">مبتدی (سطح ۱)</option>
              <option value="متوسط (سطح ۲ الی ۳)">متوسط (سطح ۲ الی ۳)</option>
              <option value="پیشرفته (سطح ۴ الی ۵)">پیشرفته (سطح ۴ الی ۵)</option>
              <option value="حرفه‌ای و مسابقاتی (PRO)">حرفه‌ای و مسابقاتی (PRO)</option>
            </select>
          </div>

          {/* متن نظر و تجربه */}
          <textarea
            required
            rows={3}
            placeholder="تجربه بازی در زمین، حس ضربه، مقایسه با راکت‌های قبلی..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitted}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                submitted ? 'bg-emerald-600 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black'
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
      )}

      {/* لیست نظرات ثبت‌شده */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-bold">
                    {rev.userName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{rev.userName}</span>
                      {rev.isVerifiedPlayer && (
                        <span title="بازیکن تاییدشده رالی" className="flex items-center text-cyan-400">
                          <UserCheck className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{rev.playerLevel}</span>
                  </div>
                </div>

                {/* نمره کلی کاربر */}
                <div className="flex items-center gap-1 bg-cyan-950/90 border border-cyan-500/30 px-2 py-0.5 rounded-lg text-cyan-300 font-mono font-bold text-xs">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{rev.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {rev.comment}
              </p>
            </div>

            {/* نوار پایین نظر: ریزنمرات + تاریخ + لایک */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
              {rev.scores ? (
                <div className="flex items-center gap-2 font-mono">
                  <span>قدرت: <b className="text-amber-400">{rev.scores.power}</b></span>
                  <span>کنترل: <b className="text-cyan-400">{rev.scores.control}</b></span>
                  <span>راحتی: <b className="text-emerald-400">{rev.scores.comfort}</b></span>
                </div>
              ) : (
                <span>{rev.date}</span>
              )}

              <button
                onClick={() => handleLike(rev.id)}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer bg-slate-900 px-2 py-1 rounded-md"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{rev.likesCount}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
});

RacketCommunityReviews.displayName = 'RacketCommunityReviews';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Sparkles, UserCheck } from 'lucide-react';
import { CommunityReview } from '../../../../types/racketVerdict';
import { SAMPLE_COMMUNITY_REVIEWS } from '../../../../data/racketVerdictData';
import { RacketReviewForm } from './RacketReviewForm';

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

  // بارگذاری فقط نظرات واقعی از حافظه محلی
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`rally_reviews_${productId}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews([]);
      }
    } catch {
      setReviews([]);
    }
  }, [productId]);

  // ثبت نظر جدید
  const handleAddNewReview = (newReviewData: {
    userName: string;
    playerLevel: string;
    scores: { power: number; control: number; comfort: number };
    comment: string;
    rating: number;
  }) => {
    const newRev: CommunityReview = {
      id: `rev-${Date.now()}`,
      userName: newReviewData.userName,
      playerLevel: newReviewData.playerLevel,
      rating: newReviewData.rating,
      scores: newReviewData.scores,
      comment: newReviewData.comment,
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
    <div className="flex flex-col gap-5 p-5 sm:p-6 bg-[#0B2238] rounded-3xl border border-slate-700/80 text-white shadow-xl">
      
      {/* سربرگ نظرات جامعه بازیکنان */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#D7ED68]" />
            <span>نظرات و امتیازدهی بازیکنان کورت (COMMUNITY VERDICT)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تجربه عملی پدل‌بازها با این راکت و ریتینگ جامعه رالی
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-xs font-black bg-[#D7ED68] hover:bg-[#c7de54] text-slate-950 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showForm ? 'بستن فرم امتیازدهی' : 'امتیاز و نظر شما به این راکت'}</span>
        </button>
      </div>

      {/* فرم ثبت امتیاز تعاملی و نظر */}
      {showForm && (
        <RacketReviewForm
          onClose={() => setShowForm(false)}
          onSubmitReview={handleAddNewReview}
        />
      )}

      {/* لیست نظرات ثبت‌شده یا وضعیت آماده برای اولین نظر */}
      {reviews.length === 0 ? (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center gap-2">
          <MessageSquare className="w-8 h-8 text-slate-600 mb-1" />
          <p className="text-xs font-bold text-slate-300">
            هنوز نظری برای این راکت ثبت نشده است
          </p>
          <p className="text-[11px] text-slate-500 max-w-sm">
            اگر با این راکت در کورت بازی کرده‌اید، اولین بازیکنی باشید که عملکرد فنی و حس ضربه آن را ارزیابی می‌کند.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-black bg-[#D7ED68] hover:bg-[#c7de54] text-slate-950 transition-all cursor-pointer shadow-sm"
          >
            ثبت اولین نظر و امتیاز
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-[#D7ED68] flex items-center justify-center text-xs font-black">
                    {rev.userName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{rev.userName}</span>
                      {rev.isVerifiedPlayer && (
                        <span title="بازیکن تاییدشده رالی" className="flex items-center text-[#D7ED68]">
                          <UserCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{rev.playerLevel}</span>
                  </div>
                </div>

                {/* نمره کلی کاربر */}
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg text-[#D7ED68] font-mono font-bold text-xs border border-slate-800">
                  <Star className="w-3 h-3 text-[#D7ED68] fill-[#D7ED68]" />
                  <span>{rev.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {rev.comment}
              </p>
            </div>

            {/* نوار پایین نظر: ریزنمرات + تاریخ + لایک */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              {rev.scores ? (
                <div className="flex items-center gap-2 font-mono">
                  <span>قدرت: <b className="text-amber-400">{rev.scores.power}</b></span>
                  <span>کنترل: <b className="text-sky-400">{rev.scores.control}</b></span>
                  <span>راحتی: <b className="text-emerald-400">{rev.scores.comfort}</b></span>
                </div>
              ) : (
                <span>{rev.date}</span>
              )}

              <button
                onClick={() => handleLike(rev.id)}
                className="flex items-center gap-1 hover:text-[#D7ED68] transition-colors cursor-pointer bg-slate-950 px-2 py-1 rounded-md border border-slate-800/80"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{rev.likesCount}</span>
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

    </div>
  );
});

RacketCommunityReviews.displayName = 'RacketCommunityReviews';

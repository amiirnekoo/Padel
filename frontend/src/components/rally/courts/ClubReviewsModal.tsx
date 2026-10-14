import React, { useState } from 'react';
import { X, Star, ThumbsUp, CheckCircle2, MessageSquare, Send, Sparkles } from 'lucide-react';
import { CourtClub } from '../../../types/rally';

interface ClubReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: CourtClub;
}

interface ClubReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  turfScore: number;
  lightScore: number;
  amenitiesScore: number;
  comment: string;
  likesCount: number;
}

const INITIAL_REVIEWS: Record<string, ClubReview[]> = {
  default: [
    {
      id: 'cr-1',
      userName: 'کیانوش اسدی',
      rating: 5,
      date: '۳ روز پیش',
      turfScore: 5,
      lightScore: 5,
      amenitiesScore: 4,
      comment: 'چمن آبی فوق‌العاده تمیز و استاندارد WPT. شیشه‌ها کاملاً شفاف بود و هیچ خطای دیدی نداشت. پارکینگ هم راحت جا داشت.',
      likesCount: 14,
    },
    {
      id: 'cr-2',
      userName: 'مهسا تهرانی',
      rating: 4.8,
      date: 'هفته گذشته',
      turfScore: 5,
      lightScore: 4,
      amenitiesScore: 5,
      comment: 'لانژ کافه عالیه و برخورد پرسنل کلوپ بسیار حرفه‌ای بود. برای سانس‌های شب نور پروژکتور عالی تنظیم شده.',
      likesCount: 9,
    },
  ],
};

export const ClubReviewsModal: React.FC<ClubReviewsModalProps> = ({
  isOpen,
  onClose,
  club,
}) => {
  const [reviews, setReviews] = useState<ClubReview[]>(INITIAL_REVIEWS.default);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: ClubReview = {
      id: `rev-${Date.now()}`,
      userName: 'شما (بازیکن تاییدشده)',
      rating: newRating,
      date: 'هم‌اکنون',
      turfScore: newRating,
      lightScore: newRating,
      amenitiesScore: newRating,
      comment: newComment.trim(),
      likesCount: 1,
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70" dir="rtl">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[88vh] text-rally-charcoal">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">تجربیات و نظرات فنی بازیکنان</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D7ED68] text-slate-950">
                ⭐ {club.rating} ({reviews.length} نظر ثبت‌شده)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{club.name}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Technical Scorecard */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 block font-bold">کیفیت چمن و شیشه</span>
            <span className="font-black text-slate-900 text-sm mt-0.5 inline-block">۴.۹ از ۵</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 block font-bold">نور پروژکتور شب</span>
            <span className="font-black text-slate-900 text-sm mt-0.5 inline-block">۴.۸ از ۵</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 block font-bold">امکانات و رختکن</span>
            <span className="font-black text-slate-900 text-sm mt-0.5 inline-block">۴.۹ از ۵</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-[320px]">
          {reviews.map((r) => (
            <div key={r.id} className="p-3.5 rounded-2xl bg-white border border-gray-200 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-slate-900">{r.userName}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    بازیکن تاییدشده
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{r.rating}</span>
                  <span className="text-gray-400 text-[10px] mr-1">({r.date})</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">{r.comment}</p>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>تایید بازی در کورت سنترال</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <ThumbsUp className="w-3 h-3" /> {r.likesCount} نفر مفید دانستند
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleSubmitReview} className="p-4 bg-white border-t border-gray-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">ثبت تجربه شما از این کلوپ:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="نظرتان درباره کیفیت چمن، نور، رختکن و برخورد پرسنل..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-800 focus:border-rally-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 h-10 rounded-xl bg-rally-primary hover:bg-rally-primary-light disabled:opacity-40 text-white text-xs font-black flex items-center gap-1 cursor-pointer shrink-0 transition-all"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span>ثبت نظر</span>
            </button>
          </div>

          {isSubmitted && (
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              نظر شما با موفقیت ثبت شد و پس از بررسی منتشر می‌گردد.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

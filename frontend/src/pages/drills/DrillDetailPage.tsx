import React, { useState, useEffect } from 'react';
import { DrillDetail } from '../../types/drills';
import { drillsApi } from '../../services/drillsApi';
import { DrillVideoPlayer } from '../../components/drills/DrillVideoPlayer';
import { DrillStepsList } from '../../components/drills/DrillStepsList';
import { DrillActionsBar } from '../../components/drills/DrillActionsBar';
import {
  ArrowRight,
  Clock,
  Users,
  Target,
  Wrench,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface DrillDetailPageProps {
  slug: string;
  onBack: () => void;
  userToken?: string | null;
  onRequireAuth: () => void;
}

export const DrillDetailPage: React.FC<DrillDetailPageProps> = ({
  slug,
  onBack,
  userToken,
  onRequireAuth
}) => {
  const [drill, setDrill] = useState<DrillDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDrill = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await drillsApi.getDrillBySlug(slug);
      // Strictly guard against non-published drills in public route
      if (data.status !== 'published') {
        throw new Error('این تمرین در دسترس عمومی نیست.');
      }
      setDrill(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در دریافت اطلاعات تمرین');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrill();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6" dir="rtl">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div className="aspect-video w-full bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-40 w-full bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (errorMessage || !drill) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center" dir="rtl">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-2">تمرین یافت نشد</h2>
        <p className="text-xs text-slate-600 mb-6">{errorMessage}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={fetchDrill}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تلاش مجدد</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-rally-primary hover:bg-rally-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            بازگشت به فهرست
          </button>
        </div>
      </div>
    );
  }

  const sportFa = drill.sport === 'padel' ? 'پدل' : 'تنیس';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8" dir="rtl">
      {/* 1. Back Button & Header Specifications */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-4 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست تمرینات</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rally-primary/10 text-rally-primary border border-rally-primary/20">
            {sportFa}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {drill.category}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            سطح: {drill.level}
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
          {drill.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-rally-primary" />
            <span>مدت اجرای تمرین: {drill.duration_minutes} دقیقه</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>تعداد نفرات: {drill.min_players} تا {drill.max_players} نفر ({drill.participation_type})</span>
          </span>
        </div>
      </div>

      {/* 2. Drill Objective */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2.5">
          <Target className="w-5 h-5 text-rally-primary" />
          <h2 className="text-sm sm:text-base font-black text-slate-900">هدف این تمرین</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {drill.objective || drill.summary}
        </p>
      </section>

      {/* 3. Media Player (Video or image without Autoplay) */}
      <DrillVideoPlayer
        mediaItems={drill.media_items}
        coverUrl={drill.cover_url}
        title={drill.title}
      />

      {/* 4. Equipment and Court Setup */}
      {((drill.equipment_needed && drill.equipment_needed.length > 0) || drill.court_setup_notes) && (
        <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-700 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Wrench className="w-4 h-4 text-slate-600" />
            <span>تجهیزات و چیدمان کورت</span>
          </div>
          {drill.equipment_needed && drill.equipment_needed.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="font-semibold text-slate-600 ml-1">تجهیزات لازم:</span>
              {drill.equipment_needed.map((eq, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                  {eq}
                </span>
              ))}
            </div>
          )}
          {drill.court_setup_notes && (
            <p className="text-slate-600 leading-relaxed">
              <strong>نحوه چیدمان:</strong> {drill.court_setup_notes}
            </p>
          )}
        </section>
      )}

      {/* 5. Execution Steps, Common Mistakes, Producer/Reviewer */}
      <DrillStepsList
        steps={drill.steps}
        commonMistakes={drill.common_mistakes}
        safetyPrecautions={drill.safety_precautions}
        authorName={drill.author_name}
        reviewerName={drill.reviewer_name}
        originSource={drill.origin_source}
        rightsHolder={drill.rights_holder}
      />

      {/* 6. Bookmark and Log Completion Actions */}
      <DrillActionsBar
        drillId={drill.id}
        isBookmarked={drill.is_bookmarked}
        bookmarkCount={drill.bookmark_count}
        completionCount={drill.completion_count}
        userToken={userToken}
        onRequireAuth={onRequireAuth}
        onBookmarkChanged={(newStatus, newCount) => {
          setDrill((prev) => prev ? { ...prev, is_bookmarked: newStatus, bookmark_count: newCount } : prev);
        }}
        onCompletionLogged={(newCount) => {
          setDrill((prev) => prev ? { ...prev, completion_count: newCount, has_completed: true } : prev);
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { DrillMediaItem } from '../../types/drills';
import { Play, AlertTriangle, Clock, Film } from 'lucide-react';

interface DrillVideoPlayerProps {
  mediaItems: DrillMediaItem[];
  coverUrl?: string | null;
  title: string;
}

export const DrillVideoPlayer: React.FC<DrillVideoPlayerProps> = ({
  mediaItems,
  coverUrl,
  title
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  // Find primary video media
  const videoMedia = mediaItems.find((m) => m.media_type === 'video');
  const subtitleMedia = mediaItems.find((m) => m.media_type === 'subtitle');

  // Case 1: Purely text-based drill without video attachment
  if (!videoMedia) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 font-medium">
        این تمرین به صورت متن و دستورالعمل تصویری طراحی شده و فاقد ویدئو است.
      </div>
    );
  }

  // Case 2: Media in validation or processing pipeline
  if (videoMedia.media_status === 'validating' || videoMedia.media_status === 'received') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
        <Clock className="w-8 h-8 text-amber-600 mx-auto" />
        <h4 className="text-xs sm:text-sm font-bold text-amber-900">
          ویدئو در حال اعتبارسنجی و آماده‌سازی است
        </h4>
        <p className="text-[11px] text-amber-700 max-w-sm mx-auto">
          فایل ویدئویی ارسال شده و در صف بررسی فنی قرار دارد. پس از اعتبارسنجی پخش آن فعال خواهد شد.
        </p>
      </div>
    );
  }

  // Case 3: Rejected / invalid video file
  if (videoMedia.media_status === 'rejected' || hasPlaybackError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-2">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
        <h4 className="text-xs sm:text-sm font-bold text-rose-900">
          پخش ویدئو در حال حاضر ممکن نیست
        </h4>
        <p className="text-[11px] text-rose-700 max-w-sm mx-auto">
          فایل ویدئوی این تمرین با خطای فنی مواجه شده و قابل نمایش نیست. می‌توانید مراحل متنی زیر را دنبال کنید.
        </p>
      </div>
    );
  }

  const streamUrl = `/api/v1/drills/${videoMedia.drill_id}/media/${videoMedia.id}/stream`;

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-sm" dir="ltr">
      {!isPlaying ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <Film className="w-12 h-12 text-slate-700" />
            </div>
          )}

          {/* User-initiated play overlay (Zero Autoplay) */}
          <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center p-4">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 rounded-full bg-rally-primary hover:bg-rally-primary-hover text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
              aria-label="پخش ویدئوی آموزشی"
            >
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            </button>
            <span className="mt-3 text-xs font-bold text-white bg-slate-950/70 px-3 py-1 rounded-full">
              شروع پخش ویدئو (بدون دانلود خودکار)
            </span>
          </div>
        </div>
      ) : (
        <video
          controls
          playsInline
          autoPlay
          preload="metadata"
          onError={() => setHasPlaybackError(true)}
          className="w-full h-full object-contain bg-black"
        >
          <source src={streamUrl} type={videoMedia.mime_type || 'video/mp4'} />
          {subtitleMedia && subtitleMedia.media_status === 'valid' && (
            <track
              kind="subtitles"
              src={`/api/v1/drills/${subtitleMedia.drill_id}/media/${subtitleMedia.id}/stream`}
              srcLang="fa"
              label="فارسی"
              default
            />
          )}
          مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
        </video>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { DrillDetail, DrillMediaItem, DrillMediaKind } from '../../../../types/drills';
import { drillsApi } from '../../../../services/drillsApi';
import { X, Upload, Trash2, Check, AlertCircle, Play, Image as ImageIcon, Clock } from 'lucide-react';

interface AdminDrillMediaModalProps {
  drill: DrillDetail;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (drill: DrillDetail) => void;
  adminToken?: string;
}

export const AdminDrillMediaModal: React.FC<AdminDrillMediaModalProps> = ({
  drill,
  isOpen,
  onClose,
  onUpdated,
  adminToken
}) => {
  const [mediaType, setMediaType] = useState<DrillMediaKind>('video');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      await drillsApi.uploadMedia(drill.id, selectedFile, mediaType, adminToken);
      const refreshed = await drillsApi.getAdminDrill(drill.id, adminToken);
      onUpdated(refreshed);
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در آپلود رسانه');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetCover = async (mediaId: string) => {
    try {
      const refreshed = await drillsApi.setCover(drill.id, mediaId, adminToken);
      onUpdated(refreshed);
    } catch (err: any) {
      alert(err.message || 'خطا در تنظیم جلد');
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('آیا از حذف این رسانه مطمئن هستید؟')) return;
    try {
      await drillsApi.deleteMedia(drill.id, mediaId, adminToken);
      const refreshed = await drillsApi.getAdminDrill(drill.id, adminToken);
      onUpdated(refreshed);
    } catch (err: any) {
      alert(err.message || 'خطا در حذف رسانه');
    }
  };

  const handlePreviewPrivate = async (media: DrillMediaItem) => {
    setErrorMessage(null);
    try {
      // Fetch safe, short-lived signed ephemeral token without exposing user JWT
      const res = await drillsApi.getEphemeralPreviewToken(drill.id, media.id, adminToken);
      setPreviewUrl(res.preview_url);
      setPreviewTitle(media.original_filename);
    } catch (err: any) {
      alert(err.message || 'خطا در دریافت مجوز پیش‌نمایش خصوصی');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              مدیریت رسانه‌ها و ویدئو: {drill.title}
            </h3>
            <span className="text-[11px] text-slate-400">
              آپلود، اعتبارسنجی خودکار فرمت و کدک، تعیین جلد و پیش‌نمایش خصوصی امن
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Upload New Media Section */}
          <form onSubmit={handleUpload} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-rally-primary" />
              <span>آپلود فایل جدید</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">نوع رسانه</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as DrillMediaKind)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="video">ویدئوی تمرین (MP4 / WebM)</option>
                  <option value="cover_image">تصویر جلد (Cover Image)</option>
                  <option value="infographic">اینفوگرافیک چیدمان</option>
                  <option value="subtitle">زیرنویس (VTT)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1">انتخاب فایل</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 rounded-xl bg-rally-primary hover:bg-rally-primary-hover text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'در حال آپلود و پردازش...' : 'آپلود رسانه'}</span>
              </button>
            </div>
          </form>

          {/* Media Items List */}
          <div className="space-y-3">
            <h4 className="font-bold text-white">رسانه‌های متصل به این تمرین ({drill.media_items.length})</h4>

            {drill.media_items.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500">
                هنوز هیچ رسانه‌ای برای این تمرین بارگذاری نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {drill.media_items.map((m) => {
                  const isCover = m.is_cover || drill.cover_media_id === m.id;
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                          {m.media_type === 'video' ? (
                            <Play className="w-4 h-4 text-rally-primary" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{m.original_filename}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">
                              {m.media_type}
                            </span>
                            {isCover && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                تصویر جلد
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                            <span>{(m.file_size_bytes / (1024 * 1024)).toFixed(2)} مگابایت</span>
                            {m.duration_seconds && <span>مدت: {Math.round(m.duration_seconds)} ثانیه</span>}
                            {/* Validation Status */}
                            {m.media_status === 'valid' && (
                              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> معتبر
                              </span>
                            )}
                            {m.media_status === 'validating' && (
                              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> در حال اعتبارسنجی
                              </span>
                            )}
                            {m.media_status === 'rejected' && (
                              <span className="text-rose-400 font-bold flex items-center gap-0.5" title={m.validation_error || 'فایل نامعتبر'}>
                                <AlertCircle className="w-3 h-3" /> رد شده: {m.validation_error}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Safe Private Preview Button */}
                        <button
                          type="button"
                          onClick={() => handlePreviewPrivate(m)}
                          className="px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                          title="پیش‌نمایش امن با دسترسی موقت"
                        >
                          <Play className="w-3 h-3" />
                          <span>پیش‌نمایش</span>
                        </button>

                        {/* Set Cover Button */}
                        {(m.media_type === 'cover_image' || m.media_type === 'video') && !isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(m.id)}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 cursor-pointer"
                          >
                            تعیین به عنوان جلد
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(m.id)}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 cursor-pointer"
                          title="حذف رسانه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Secure Ephemeral Preview Player */}
          {previewUrl && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>پیش‌نمایش خصوصی: {previewTitle}</span>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  بستن پیش‌نمایش
                </button>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black" dir="ltr">
                <video controls playsInline className="w-full h-full object-contain">
                  <source src={previewUrl} />
                  امکان پخش در این مرورگر وجود ندارد.
                </video>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

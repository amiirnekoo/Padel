import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, Copy, Check, Filter, RefreshCw, Folder } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface MediaItem {
  id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  content_type: string;
  folder: string;
  alt_text?: string;
  created_at: string;
}

export const AdminMediaLibraryTab: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMedia = async (folder?: string) => {
    setIsLoading(true);
    try {
      const targetFolder = folder && folder !== 'ALL' ? folder : undefined;
      const res = await rallyApi.getAdminMedia(targetFolder);
      setMediaList(Array.isArray(res) ? res : []);
    } catch {
      setStatusMsg({ type: 'error', text: 'خطا در بارگذاری رسانه‌ها' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(selectedFolder);
  }, [selectedFolder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'تنها فرمت‌های تصویری مجاز می‌باشند.' });
      return;
    }

    setIsUploading(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Content = reader.result as string;
        const uploadFolder = selectedFolder === 'ALL' ? 'products' : selectedFolder;
        const res = await rallyApi.uploadAdminMedia({
          file_name: file.name,
          data_base64: base64Content,
          folder: uploadFolder,
          alt_text: file.name.split('.')[0]
        });

        if (res.success) {
          setStatusMsg({ type: 'success', text: `فایل ${file.name} با موفقیت بارگذاری شد.` });
          fetchMedia(selectedFolder);
        } else {
          setStatusMsg({ type: 'error', text: res.error || 'خطا در بارگذاری' });
        }
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: err?.message || 'خطا در ارسال فایل' });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!window.confirm(`آیا از حذف رسانه "${fileName}" اطمینان دارید؟`)) return;
    const res = await rallyApi.deleteAdminMedia(id);
    if (res.success) {
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      setStatusMsg({ type: 'success', text: 'فایل با موفقیت حذف گردید.' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'خطا در حذف' });
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const folders = [
    { id: 'ALL', label: 'همه فایل‌ها' },
    { id: 'products', label: 'محصولات' },
    { id: 'banners', label: 'بنرها' },
    { id: 'articles', label: 'مقالات' },
    { id: 'general', label: 'عمومی' }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-rally-primary" />
            <span>کتابخانه جامع چندرسانه‌ای رالی (Media Library)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            آپلود امن تصاویر محصولات، بنرها و مقالات بدون نیاز به باز کردن پروژه و با لینک پایدار CDN
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className={`px-4 py-2.5 rounded-xl bg-rally-primary hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'در حال آپلود...' : 'آپلود تصویر جدید'}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
          </label>

          <button
            onClick={() => fetchMedia(selectedFolder)}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="به‌روزرسانی"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rally-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Folder Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFolder(f.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              selectedFolder === f.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs">در حال بارگذاری فایل‌ها...</div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900/50 border border-slate-800 rounded-2xl text-xs">
          هیچ فایلی در این دسته‌بندی یافت نشد. می‌توانید با دکمه بالا تصویر جدید آپلود کنید.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col group hover:border-slate-700 transition-all shadow-sm">
              <div className="aspect-square bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <img
                  src={item.file_path}
                  alt={item.alt_text || item.file_name}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
                <span className="absolute top-2 right-2 text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800">
                  {item.folder}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between gap-2 border-t border-slate-800/80">
                <div className="truncate text-xs font-bold text-slate-200" title={item.file_name}>
                  {item.file_name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{(item.file_size_bytes / 1024).toFixed(1)} KB</span>
                  <span>{new Date(item.created_at).toLocaleDateString('fa-IR')}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/50">
                  <button
                    onClick={() => handleCopyUrl(item.file_path, item.id)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="کپی لینک تصویر"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>کپی لینک</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.file_name)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="حذف فایل"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

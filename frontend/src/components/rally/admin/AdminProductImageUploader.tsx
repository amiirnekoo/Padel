import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Star, Trash2, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

export interface ProcessedImageItem {
  id: string;
  name: string;
  primaryUrl: string;
  desktopUrl: string;
  tabletUrl: string;
  mobileUrl: string;
  thumbUrl: string;
  isPrimary: boolean;
  status: 'processing' | 'ready' | 'error';
  errorMsg?: string;
}

interface AdminProductImageUploaderProps {
  productSlug: string;
  images: ProcessedImageItem[];
  onChange: React.Dispatch<React.SetStateAction<ProcessedImageItem[]>>;
}

export const AdminProductImageUploader: React.FC<AdminProductImageUploaderProps> = ({
  productSlug,
  images,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, index: number) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('تنها فرمت‌های تصویری (PNG, JPG, WebP) پشتیبانی می‌شوند.');
      return;
    }

    const tempId = `img-${Date.now()}-${index}`;
    const newItem: ProcessedImageItem = {
      id: tempId,
      name: file.name,
      primaryUrl: URL.createObjectURL(file),
      desktopUrl: '',
      tabletUrl: '',
      mobileUrl: '',
      thumbUrl: '',
      isPrimary: images.length === 0 && index === 0,
      status: 'processing',
    };

    // ثبت موقت آیتم برای نمایش لودینگ
    onChange((prev) => [...prev, newItem]);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Content = reader.result as string;
        const res = await rallyApi.processProductImage({
          product_slug: productSlug || 'custom-product',
          image_name: `${Date.now()}_${index}`,
          content_base64: base64Content,
        });

        if (res.success && res.data) {
          onChange((prev) =>
            prev.map((item) =>
              item.id === tempId
                ? {
                    ...item,
                    primaryUrl: res.data!.primary_url,
                    desktopUrl: res.data!.desktop,
                    tabletUrl: res.data!.tablet,
                    mobileUrl: res.data!.mobile,
                    thumbUrl: res.data!.thumbnail,
                    status: 'ready',
                  }
                : item
            )
          );
        } else {
          onChange((prev) =>
            prev.map((item) =>
              item.id === tempId
                ? { ...item, status: 'error', errorMsg: res.error || 'خطا در بهینه‌سازی ابعاد' }
                : item
            )
          );
        }
      } catch (err: any) {
        onChange((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, status: 'error', errorMsg: err?.message || 'خطا در ارتباط' }
              : item
          )
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    Array.from(fileList).forEach((file, idx) => {
      processFile(file, idx);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const setAsPrimary = (id: string) => {
    onChange((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const removeImage = (id: string) => {
    onChange((prev) => {
      const remaining = prev.filter((img) => img.id !== id);
      if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-rally-primary" />
          <span>تصاویر محصول و پردازش رسپانسیو چندپلتفرمه</span>
        </label>
        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>تولید خودکار وب‌پلتفرم، تبلت و موبایل (WebP)</span>
        </span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-rally-primary bg-rally-primary/10 shadow-lg'
            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
            <UploadCloud className="w-5 h-5 text-rally-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">
              عکس‌ها را به اینجا بکشید یا برای انتخاب کلیک کنید
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              سیستم به صورت خودکار ابعاد موبایل (480px)، تبلت (800px) و دسکتاپ رتینا (1200px) را می‌سازد
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
          {uploadError}
        </div>
      )}

      {/* Uploaded Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {images.map((item, idx) => (
            <div
              key={item.id}
              className={`relative bg-slate-900 border rounded-xl overflow-hidden group transition-all ${
                item.isPrimary
                  ? 'border-rally-primary ring-1 ring-rally-primary/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="aspect-square bg-slate-950 relative flex items-center justify-center p-2">
                <img
                  src={item.thumbUrl || item.primaryUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />

                {item.status === 'processing' && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                    <Loader2 className="w-5 h-5 text-rally-primary animate-spin" />
                    <span className="text-[10px] text-slate-300 font-bold">بهینه‌سازی ابعاد...</span>
                  </div>
                )}

                {item.isPrimary && (
                  <div className="absolute top-1.5 right-1.5 bg-rally-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>کاور اصلی</span>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-2 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAsPrimary(item.id);
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    item.isPrimary
                      ? 'text-rally-primary font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="انتخاب به عنوان تصویر شاخص"
                >
                  {item.isPrimary ? 'شاخص' : 'انتخاب کاور'}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(item.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                  title="حذف این عکس"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

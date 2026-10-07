import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, X, ChevronRight, ChevronLeft, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  brand: string;
  isPadel?: boolean;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = React.memo(({
  images,
  productName,
  brand,
  isPadel = true
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  
  const thumbsContainerRef = useRef<HTMLDivElement>(null);

  const validImages = images && images.length > 0 ? images : ['/images/rally_logo_crisp.png?v=20261007_v2'];
  const currentImage = validImages[activeIdx] || validImages[0];

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  }, [validImages.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIdx((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  }, [validImages.length]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbsContainerRef.current) {
      const activeEl = thumbsContainerRef.current.children[activeIdx] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIdx]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') handlePrev();
      if (e.key === 'ArrowLeft') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  const accentRing = isPadel ? 'border-sky-500 ring-2 ring-sky-300' : 'border-emerald-500 ring-2 ring-emerald-300';

  return (
    <div className="flex flex-col gap-3.5 select-none">
      {/* Main Showcase Stage (High-Definition Studio View, Zero Blur) */}
      <div
        className="relative aspect-square w-full rounded-3xl bg-white border border-slate-200/90 overflow-hidden flex items-center justify-center cursor-pointer group shadow-sm"
        onClick={() => setIsLightboxOpen(true)}
      >
        {imgErrors[activeIdx] ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
            <span className="text-sm font-bold text-slate-700">{brand}</span>
            <span className="text-xs text-slate-400 mt-1 line-clamp-2 px-4">{productName}</span>
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md mt-2 font-medium">تصویر رسمی</span>
          </div>
        ) : (
          <img
            src={currentImage}
            alt={`${productName} - تصویر ${activeIdx + 1}`}
            onError={() => setImgErrors(prev => ({ ...prev, [activeIdx]: true }))}
            className="w-full h-full object-contain p-5 transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            style={{
              imageRendering: '-webkit-optimize-contrast',
            }}
          />
        )}

        {/* Counter Badge */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/85 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
          {activeIdx + 1} از {validImages.length}
        </div>

        {/* Lightbox Trigger Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/95 text-slate-700 hover:text-slate-950 hover:bg-white shadow-md flex items-center justify-center transition-all cursor-pointer"
          title="مشاهده بزرگنمایی و جزئیات باکیفیت"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Desktop Click for Fullscreen Hint */}
        <div className="hidden sm:flex absolute bottom-3 right-3 left-3 items-center justify-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-medium transition-opacity duration-200 pointer-events-none bg-slate-900/75 text-white/90 shadow-sm opacity-0 group-hover:opacity-100">
          <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
          <span>برای مشاهده کیفیت بالا و تمام‌صفحه کلیک کنید</span>
        </div>

        {/* Arrow Navigators on Main Stage */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
              title="تصویر قبلی"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
              title="تصویر بعدی"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Carousel Track */}
      {validImages.length > 1 && (
        <div className="relative">
          <div
            ref={thumbsContainerRef}
            className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth"
          >
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 border transition-all duration-200 cursor-pointer overflow-hidden ${
                  activeIdx === idx
                    ? `${accentRing} shadow-sm scale-102`
                    : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={img}
                  alt={`بندانگشتی ${idx + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Quick scroll controls for long list of images */}
          {validImages.length > 5 && (
            <div className="hidden sm:flex justify-between items-center mt-1 text-xs text-slate-400 px-1">
              <span>تعداد کل تصاویر: {validImages.length} عکس رسمی</span>
              <div className="flex gap-1">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer"
                  title="تصویر قبلی"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer"
                  title="تصویر بعدی"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col justify-between p-4 animate-in fade-in duration-150"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white max-w-6xl w-full mx-auto pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-sky-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                {brand}
              </span>
              <span className="text-sm font-bold text-slate-200 line-clamp-1">{productName}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">
                {activeIdx + 1} از {validImages.length}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Image Stage */}
          <div
            className="flex-1 relative max-w-5xl w-full mx-auto flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={productName}
              className="max-h-[75vh] max-w-full object-contain drop-shadow-2xl"
            />

            {/* Arrows */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails */}
          {validImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar max-w-4xl mx-auto w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {validImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border-2 transition-all cursor-pointer flex-shrink-0 p-1 ${
                    activeIdx === idx ? 'border-sky-400 scale-105' : 'border-slate-700 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`بندانگشتی ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ProductImageGallery.displayName = 'ProductImageGallery';

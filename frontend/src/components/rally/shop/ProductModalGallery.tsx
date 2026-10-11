import React, { useState } from 'react';
import { ShieldCheck, Truck, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';
import { getProPlayerForProduct } from '../../../data/proPlayersData';

interface ProductModalGalleryProps {
  product: ShopProduct;
}

export const ProductModalGallery: React.FC<ProductModalGalleryProps> = React.memo(({ product }) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const proPlayer = getProPlayerForProduct(product);
  const galleryImages = (product.images && product.images.length > 0) ? product.images : [product.image_url];

  const handleImgError = (idx: number) => setImgErrors(prev => ({ ...prev, [idx]: true }));

  return (
    <div className="md:col-span-5 flex flex-col gap-3">
      {/* Main Stage Image */}
      <div className="relative aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden border border-gray-200 flex items-center justify-center p-3">
        {imgErrors[selectedImgIdx] ? (
          <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
            <span className="text-xs font-bold text-slate-600 mb-1">{product.brand}</span>
            <span className="text-[11px] text-slate-400">{product.name_fa}</span>
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-2">تصویر شماره {selectedImgIdx + 1} آماده بارگذاری</span>
          </div>
        ) : (
          <img
            src={galleryImages[selectedImgIdx]}
            alt={`${product.name_fa} - تصویر ${selectedImgIdx + 1}`}
            onError={() => handleImgError(selectedImgIdx)}
            className="w-full h-full object-contain transition-all duration-200"
          />
        )}

        {/* Pro Player Minimalist Circular Headshot */}
        {proPlayer && (
          <div
            className="absolute top-2.5 left-2.5 z-20 w-11 h-11 rounded-full overflow-hidden border-2 border-slate-200/90 shadow-md bg-[#EEF0F2] flex-shrink-0"
            title={`راکت رسمی ${proPlayer.name_fa} (${proPlayer.name_en})`}
          >
            <img src={proPlayer.avatar_url} alt={proPlayer.name_fa} className="w-full h-full object-cover pointer-events-none" draggable={false} />
          </div>
        )}

        {/* Prev / Next buttons */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImgIdx((selectedImgIdx - 1 + galleryImages.length) % galleryImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow text-gray-700 flex items-center justify-center hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedImgIdx((selectedImgIdx + 1) % galleryImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow text-gray-700 flex items-center justify-center hover:bg-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {product.discount_percent > 0 && product.stock > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
            ٪{product.discount_percent} تخفیف
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          {galleryImages.map((img, i) => (
            <button
              key={img + i}
              type="button"
              draggable={false}
              onClick={() => setSelectedImgIdx(i)}
              className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-slate-50 transition-all cursor-pointer ${
                selectedImgIdx === i ? 'border-rally-primary ring-2 ring-rally-primary/20' : 'border-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              {imgErrors[i] ? (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-100">
                  عکس {i + 1}
                </div>
              ) : (
                <img
                  src={img}
                  alt={`نمای ${i + 1}`}
                  onError={() => handleImgError(i)}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="w-full h-full object-contain p-1 pointer-events-none"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Guarantees */}
      <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
        <span className="text-[11px] text-sky-900 font-medium">ضمانت اصالت ۱۰۰٪ اورجینال و سلامت فیزیکی</span>
      </div>
      <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2">
        <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span className="text-[11px] text-blue-800 font-medium">ارسال اکسپرس در تهران و سراسر کشور</span>
      </div>
    </div>
  );
});

ProductModalGallery.displayName = 'ProductModalGallery';

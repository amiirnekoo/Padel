import React, { useState } from 'react';
import { X, Star, ShieldCheck, Truck, ShoppingCart, Check, Award, Flame, ChevronRight, ChevronLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';
import { getRacketVerdict } from '../../../data/racketVerdictData';

interface ProductDetailsModalProps {
  product: ShopProduct | null;
  onClose: () => void;
  onAddToCart: (product: ShopProduct, quantity: number) => void;
  onOpenCart: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenCart
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const isRacket = product.category === 'PADEL_RACKET' || (product.sport === 'PADEL' && (product.shape || product.weight));
  const verdict = isRacket ? getRacketVerdict(product) : null;

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image_url];

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleImgError = (idx: number) => {
    setImgErrors(prev => ({ ...prev, [idx]: true }));
  };

  const SPECS = [
    { label: 'برند سازنده', value: product.brand },
    { label: 'سال عرضه', value: product.year ? `${product.year}` : '۲۰۲۶' },
    { label: 'سطح بازیکن', value: product.level === 'PRO' ? 'حرفه‌ای / قهرمانی' : product.level === 'ADVANCED' ? 'پیشرفته' : 'متوسط' },
    { label: 'وزن فیزیکی', value: product.weight },
    { label: 'نقطه تعادل (Balance)', value: product.balance },
    { label: 'شکل هندسی فریم', value: product.shape },
    { label: 'جنس سطح راکت', value: product.surface },
    { label: 'هسته فومی (Core)', value: product.core },
    ...(verdict ? [
      { label: 'پروفایل سبک بازی', value: verdict.playProfile_fa },
      { label: 'سفتی شاسی و فوم', value: verdict.stiffness.label_fa }
    ] : []),
    { label: 'گارانتی و پشتیبانی', value: product.warranty }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-200 my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="bg-rally-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {product.brand}
            </span>
            {product.year === 2027 ? (
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs border border-amber-300">
                <Sparkles className="w-3 h-3 text-slate-950" />
                NEW ۲۰۲۷
              </span>
            ) : product.year === 2026 ? (
              <span className="bg-amber-500/10 text-amber-700 border border-amber-300 text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                ۲۰۲۶
              </span>
            ) : null}
            {product.is_women && (
              <span className="bg-rose-50 text-rose-700 border border-rose-300 text-xs font-black px-2 py-0.5 rounded-lg">
                👩 ویژه بانوان
              </span>
            )}
            <span className="hidden sm:inline text-xs text-gray-400 font-mono">کد: {product.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Gallery Column */}
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

              {/* Prev / Next buttons */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImgIdx((selectedImgIdx - 1 + galleryImages.length) % galleryImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow text-gray-700 flex items-center justify-center hover:bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImgIdx((selectedImgIdx + 1) % galleryImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow text-gray-700 flex items-center justify-center hover:bg-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {product.discount_percent > 0 && (
                <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
                  ٪{product.discount_percent} تخفیف
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setSelectedImgIdx(i)}
                    className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-slate-50 transition-all ${
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
                        className="w-full h-full object-contain p-1"
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

          {/* Details Column */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-gray-400">({product.reviews_count} نظر کارشناسی)</span>
                {verdict && (
                  <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    <span>نمره ورردیکت: {verdict.overallScore.toFixed(1)}</span>
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                {product.name_fa}
              </h2>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5 mb-2.5">
                {product.name_en}
              </p>

              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3">
                {product.description}
              </p>

              {/* Bullet Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-[11px] font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rally-primary" />
                    <span>فناوری‌های انحصاری:</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-gray-600">
                    {product.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rally-primary flex-shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs Table */}
              <h4 className="text-[11px] font-bold text-gray-800 mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-rally-primary" />
                <span>شناسنامه فنی</span>
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                <table className="w-full text-[11px] text-right table-fixed">
                  <colgroup>
                    <col className="w-2/5" />
                    <col className="w-3/5" />
                  </colgroup>
                  <tbody>
                    {SPECS.map((spec, idx) => (
                      <tr key={spec.label} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-1 px-2.5 font-semibold text-gray-600 border-b border-gray-100">{spec.label}</td>
                        <td className="py-1 px-2.5 font-medium text-gray-900 border-b border-gray-100 truncate">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-gray-200 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  {product.discount_percent > 0 && (
                    <span className="text-[11px] text-gray-400 line-through block">
                      {product.original_price.toLocaleString('fa-IR')} تومان
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl font-black text-gray-900">
                      {product.price.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">تومان</span>
                  </div>
                </div>

                {/* Qty Selector */}
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold text-xs">-</button>
                  <span className="px-3 py-1 text-xs font-bold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-2.5 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold text-xs">+</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAdd}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isAdded ? 'bg-sky-600 text-white' : 'bg-rally-primary text-white hover:bg-rally-primary-dark'
                  }`}
                >
                  {isAdded ? <><Check className="w-4 h-4" /><span>به سبد اضافه شد</span></> : <><ShoppingCart className="w-4 h-4" /><span>افزودن به سبد خرید</span></>}
                </button>

                <button
                  onClick={() => { handleAdd(); onOpenCart(); }}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs bg-sky-600 text-white hover:bg-sky-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Flame className="w-4 h-4" />
                  <span>تکمیل و تسویه</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

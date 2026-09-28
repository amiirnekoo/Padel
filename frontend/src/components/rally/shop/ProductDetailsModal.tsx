import React, { useState } from 'react';
import { X, Star, ShieldCheck, Truck, ShoppingCart, Check, Award, Flame } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

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
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const SPECS = [
    { label: 'برند سازنده', value: product.brand },
    { label: 'رشته تخصصی', value: product.sport === 'PADEL' ? 'پدل (Padel)' : 'تنیس (Tennis)' },
    { label: 'سطح بازیکن', value: product.level === 'PRO' ? 'حرفه‌ای / قهرمانی' : product.level === 'ADVANCED' ? 'پیشرفته' : 'متوسط' },
    { label: 'وزن فیزیکی', value: product.weight },
    { label: 'نقطه تعادل (Balance)', value: product.balance },
    { label: 'شکل هندسی فریم', value: product.shape },
    { label: 'جنس سطح راکت', value: product.surface },
    { label: 'هسته فومی (Core)', value: product.core },
    { label: 'گارانتی و پشتیبانی', value: product.warranty }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="bg-rally-primary text-white text-xs font-bold px-2.5 py-1 rounded-md">
              {product.brand}
            </span>
            <span className="text-xs text-gray-500 font-mono">کد کالا: {product.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Image & Quick Highlight */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="relative aspect-square w-full rounded-2xl bg-slate-900 overflow-hidden border border-gray-200">
              <img
                src={product.image_url}
                alt={product.name_fa}
                className="w-full h-full object-cover object-center"
              />
              {product.discount_percent > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                  ٪{product.discount_percent} تخفیف ویژه
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs text-emerald-800">
                <span className="font-bold">تضمین ۱۰۰٪ اصالت کالا:</span> امکان مرجوعی تا ۷ روز در صورت عدم تأیید اصالت توسط مربیان.
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <span className="font-bold">ارسال اکسپرس:</span> تحویل ۲ ساعته در تهران و ۲۴ ساعته در سراسر کشور با بیمه مرسوله.
              </div>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-gray-400">({product.reviews_count} نظر ثبت‌شده)</span>
              </div>

              <h2 className="text-lg font-black text-gray-900 leading-tight">
                {product.name_fa}
              </h2>
              <p className="text-xs text-gray-500 font-mono mt-1 mb-3">
                {product.name_en}
              </p>

              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                {product.description}
              </p>

              {/* Technical Specifications Table */}
              <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-rally-primary" />
                <span>مشخصات فنی و فیزیکی</span>
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <table className="w-full text-xs text-right table-fixed">
                  <colgroup>
                    <col className="w-2/5" />
                    <col className="w-3/5" />
                  </colgroup>
                  <tbody>
                    {SPECS.map((spec, idx) => (
                      <tr
                        key={spec.label}
                        className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        <td className="py-1.5 px-3 font-semibold text-gray-600 border-b border-gray-100">
                          {spec.label}
                        </td>
                        <td className="py-1.5 px-3 font-medium text-gray-900 border-b border-gray-100 truncate">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-gray-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  {product.discount_percent > 0 && (
                    <span className="text-xs text-gray-400 line-through block">
                      {product.original_price.toLocaleString('fa-IR')} تومان
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-gray-900">
                      {product.price.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">تومان</span>
                  </div>
                </div>

                {/* Qty Selector */}
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAdd}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rally-primary text-white hover:bg-slate-800'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>به سبد اضافه شد</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>افزودن به سبد خرید</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleAdd();
                    onOpenCart();
                  }}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Flame className="w-4 h-4" />
                  <span>تکمیل سفارش و تسویه</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

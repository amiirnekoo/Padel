import React, { useState } from 'react';
import { X, Plus, PackagePlus, Check } from 'lucide-react';
import { ShopProduct, ProductCategory, SportType } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';

interface AdminNewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: ShopProduct) => void;
}

export const AdminNewProductModal: React.FC<AdminNewProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct
}) => {
  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [brand, setBrand] = useState('Nox');
  const [category, setCategory] = useState<ProductCategory>('PADEL_RACKET');
  const [sport, setSport] = useState<SportType>('PADEL');
  const [level, setLevel] = useState<'PRO' | 'ADVANCED' | 'INTERMEDIATE'>('PRO');
  const [price, setPrice] = useState<number>(21000000);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [weight, setWeight] = useState('۳۶۵ گرم');
  const [balance, setBalance] = useState('متعادل (Even)');
  const [shape, setShape] = useState('اشکی (Teardrop)');
  const [surface, setSurface] = useState('کربن ۱۲K بافت‌دار');
  const [core, setCore] = useState('فوم چندلایه Black EVA');
  const [description, setDescription] = useState('');
  const [imageFolderSlug, setImageFolderSlug] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) return;

    const slug = imageFolderSlug.trim() || `${brand.toLowerCase()}-${Date.now()}`;
    const brandFolder = brand.toLowerCase();
    const primaryImg = `/images/products/${brandFolder}/${slug}/1.jpg`;

    const newProd: ShopProduct = {
      id: `prod-admin-${Date.now()}`,
      name_fa: nameFa,
      name_en: nameEn || nameFa,
      brand,
      category,
      sport,
      level,
      year: 2026,
      original_price: discountPercent > 0 ? Math.round(price / (1 - discountPercent / 100)) : price,
      discount_percent: discountPercent,
      price,
      stock,
      weight,
      balance,
      shape,
      surface,
      core,
      warranty: 'ضمانت اصالت و سلامت فیزیکی رالی',
      image_url: primaryImg,
      images: [
        `/images/products/${brandFolder}/${slug}/1.jpg`,
        `/images/products/${brandFolder}/${slug}/2.jpg`,
        `/images/products/${brandFolder}/${slug}/3.jpg`,
        `/images/products/${brandFolder}/${slug}/4.jpg`
      ],
      rating: 5.0,
      reviews_count: 1,
      description: description || `محصول جدید کلکسیون سال ۲۰۲۶ برند معتبر ${brand} با بالاترین کیفیت متریال و استاندارد مسابقاتی.`
    };

    try {
      await rallyApi.createAdminProduct({
        title_fa: newProd.name_fa,
        title_en: newProd.name_en,
        category_id: category === 'PADEL_RACKET' ? 'padel-rackets' : 'balls',
        brand: newProd.brand,
        model_year: 2026,
        sport: newProd.sport,
        level: newProd.level,
        original_price: newProd.original_price,
        discount_percent: newProd.discount_percent,
        price: newProd.price,
        stock: newProd.stock,
        is_in_stock: newProd.stock > 0,
        primary_image: newProd.image_url,
        description_fa: newProd.description,
        gallery_images: newProd.images
      });
    } catch {}

    onAddProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-white shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rally-primary/20 text-rally-primary border border-rally-primary/30">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">افزودن محصول جدید به فروشگاه</h3>
              <p className="text-[11px] text-slate-400">ثبت کالای جدید با مشخصات فنی و گالری چندعکسی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">نام فارسی محصول *</label>
              <input
                type="text"
                required
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder="مثلاً راکت پدل نوکس مدل جدید ۲۰۲۶"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rally-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">نام انگلیسی / لاتین</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. NOX AT10 Genius 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rally-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">برند</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Nox">NOX (نوکس)</option>
                <option value="Bullpadel">Bullpadel (بول‌پدل)</option>
                <option value="Head">HEAD (هد)</option>
                <option value="Babolat">Babolat (بابولات)</option>
                <option value="Wilson">Wilson (ویلسون)</option>
                <option value="Asics">Asics (اسیکس)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">دسته‌بندی</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="PADEL_RACKET">راکت پدل</option>
                <option value="TENNIS_RACKET">راکت تنیس</option>
                <option value="BAGS">کیف و پلبگ</option>
                <option value="ACCESSORIES">اکسسوری و گریپ</option>
                <option value="BALLS">توپ مسابقاتی</option>
                <option value="SHOES">کفش تخصصی</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">قیمت نهایی (تومان) *</label>
              <input
                type="number"
                required
                step={100000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">موجودی انبار</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">وزن</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">شکل هندسی</label>
              <input
                type="text"
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">جنس سطح</label>
              <input
                type="text"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">نام پوشه عکس (Slug)</label>
              <input
                type="text"
                value={imageFolderSlug}
                onChange={(e) => setImageFolderSlug(e.target.value)}
                placeholder="مثلاً nox-at10-custom"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">توضیحات تخصصی و ویژگی‌ها</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیح کوتاه در مورد راکت و بازیکنان مشهوری که از آن استفاده می‌کنند..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rally-primary hover:bg-rally-primary-dark flex items-center gap-1.5 shadow-lg shadow-rally-primary/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن و انتشار در فروشگاه</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

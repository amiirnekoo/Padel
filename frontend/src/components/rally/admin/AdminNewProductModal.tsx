import React, { useState } from 'react';
import { X, Plus, PackagePlus } from 'lucide-react';
import { ShopProduct, ProductCategory, SportType } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';
import { AdminProductImageUploader, ProcessedImageItem } from './AdminProductImageUploader';
import { AdminProductSpecsForm } from './AdminProductSpecsForm';

interface AdminNewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: ShopProduct) => void;
}

export const AdminNewProductModal: React.FC<AdminNewProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
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
  const [uploadedImages, setUploadedImages] = useState<ProcessedImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const productSlug = nameEn
    ? nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : `${brand.toLowerCase()}-${Date.now()}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) return;

    setIsSubmitting(true);

    const primaryItem = uploadedImages.find((img) => img.isPrimary) || uploadedImages[0];
    const primaryImgUrl = primaryItem ? primaryItem.primaryUrl : '/images/rally_shop_banner.jpg';
    
    const allGalleryUrls = uploadedImages.length > 0
      ? [primaryImgUrl, ...uploadedImages.filter((img) => img !== primaryItem).map((img) => img.primaryUrl)]
      : [primaryImgUrl];

    const originalPrice = discountPercent > 0 ? Math.round(price / (1 - discountPercent / 100)) : price;

    const newProd: ShopProduct = {
      id: `prod-admin-${Date.now()}`,
      name_fa: nameFa,
      name_en: nameEn || nameFa,
      brand,
      category,
      sport,
      level,
      year: 2026,
      original_price: originalPrice,
      discount_percent: discountPercent,
      price,
      stock,
      weight,
      balance,
      shape,
      surface,
      core,
      warranty: 'ضمانت ۶ ماهه اصالت و سلامت فیزیکی رالی',
      image_url: primaryImgUrl,
      images: allGalleryUrls,
      rating: 5.0,
      reviews_count: 1,
      power_index: 9.2,
      control_index: 9.5,
      tags: ['مدل ۲۰۲۶', brand, sport === 'PADEL' ? 'پدل حرفه‌ای' : 'تنیس'],
      features: [
        `رویه باکیفیت ${surface}`,
        `فوم هسته ${core} با پاسخدهی بهینه`,
        'سیستم انحصاری جذب لرزش ضربه',
        'گارانتی رسمی اصالت و تضمین سلامت کالا',
      ],
      description:
        description ||
        `محصول جدید و اورجینال سال ۲۰۲۶ برند ${brand} با متریال مسابقاتی و بالاترین استاندارد عملکردی.`,
    };

    try {
      await rallyApi.createAdminProduct({
        id: newProd.id,
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
        gallery_images: newProd.images,
        specs: {
          weight: newProd.weight,
          balance: newProd.balance,
          shape: newProd.shape,
          surface: newProd.surface,
          core: newProd.core,
        },
      });
    } catch {}

    onAddProduct(newProd);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-white shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rally-primary/20 text-rally-primary border border-rally-primary/30">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">افزودن محصول جدید به فروشگاه</h3>
              <p className="text-[11px] text-slate-400">ثبت کالای جدید طبق قالب استاندارد همراه با دراپ و بهینه‌سازی رسپانسیو عکس</p>
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
          <AdminProductImageUploader
            productSlug={productSlug}
            images={uploadedImages}
            onChange={setUploadedImages}
          />

          <AdminProductSpecsForm
            nameFa={nameFa}
            setNameFa={setNameFa}
            nameEn={nameEn}
            setNameEn={setNameEn}
            brand={brand}
            setBrand={setBrand}
            category={category}
            setCategory={setCategory}
            price={price}
            setPrice={setPrice}
            stock={stock}
            setStock={setStock}
            weight={weight}
            setWeight={setWeight}
            balance={balance}
            setBalance={setBalance}
            shape={shape}
            setShape={setShape}
            surface={surface}
            setSurface={setSurface}
            description={description}
            setDescription={setDescription}
          />

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rally-primary hover:bg-rally-primary-dark flex items-center gap-1.5 shadow-lg shadow-rally-primary/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'در حال ثبت و پردازش...' : 'افزودن و انتشار در فروشگاه'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

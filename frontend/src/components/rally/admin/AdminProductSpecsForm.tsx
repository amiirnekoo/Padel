import React from 'react';
import { ProductCategory } from '../../../types/rally';

interface AdminProductSpecsFormProps {
  nameFa: string;
  setNameFa: (v: string) => void;
  nameEn: string;
  setNameEn: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  category: ProductCategory;
  setCategory: (v: ProductCategory) => void;
  price: number;
  setPrice: (v: number) => void;
  stock: number;
  setStock: (v: number) => void;
  weight: string;
  setWeight: (v: string) => void;
  balance: string;
  setBalance: (v: string) => void;
  shape: string;
  setShape: (v: string) => void;
  surface: string;
  setSurface: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}

export const AdminProductSpecsForm: React.FC<AdminProductSpecsFormProps> = ({
  nameFa,
  setNameFa,
  nameEn,
  setNameEn,
  brand,
  setBrand,
  category,
  setCategory,
  price,
  setPrice,
  stock,
  setStock,
  weight,
  setWeight,
  balance,
  setBalance,
  shape,
  setShape,
  surface,
  setSurface,
  description,
  setDescription,
}) => {
  return (
    <div className="space-y-3.5">
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
            <option value="Siux">Siux (سیوکس)</option>
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
          <label className="block text-xs font-medium text-slate-300 mb-1">تعادل</label>
          <input
            type="text"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
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
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">توضیحات تخصصی و ویژگی‌ها</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیح کامل در مورد راکت، سبک بازی، بالانس و بازیکنان مشهوری که از آن استفاده می‌کنند..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};

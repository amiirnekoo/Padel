import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface SupplySourceAddFormProps {
  defaultMode: 'INSTANT' | 'EUROPE';
  onAdd: (newSource: {
    source_name: string;
    base_url: string;
    brand: string;
    markup_percent: number;
    currency: string;
    delivery_time: string;
    supply_mode: 'INSTANT' | 'EUROPE';
  }) => Promise<void>;
  onCancel: () => void;
}

export const SupplySourceAddForm: React.FC<SupplySourceAddFormProps> = ({
  defaultMode,
  onAdd,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    source_name: '',
    base_url: '',
    brand: 'Nox',
    markup_percent: defaultMode === 'INSTANT' ? 4.0 : 25.0,
    currency: defaultMode === 'INSTANT' ? 'TOMAN' : 'EUR',
    delivery_time: defaultMode === 'INSTANT' ? 'تحویل فوری ۲۴ ساعته' : '۴ الی ۶ هفته',
    supply_mode: defaultMode,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.source_name || !formData.base_url) return;
    setSubmitting(true);
    await onAdd(formData);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-sky-400" />
          <span>افزودن سورس رفرنس جدید ({formData.supply_mode === 'INSTANT' ? 'تامین داخلی' : 'سفارش اروپا'})</span>
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="نام سایت رفرنس (مثلا: سان اسپرت یا FunPadel)"
          value={formData.source_name}
          onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          required
        />
        <input
          type="url"
          placeholder="آدرس اینترنتی صفحه رفرنس (URL)"
          value={formData.base_url}
          onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          required
        />
        <div className="flex gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 w-1/2">
            <input
              type="number"
              step="0.5"
              placeholder="درصد سود"
              value={formData.markup_percent}
              onChange={(e) => setFormData({ ...formData, markup_percent: parseFloat(e.target.value) || 0 })}
              className="w-full bg-transparent text-xs text-white text-center font-bold focus:outline-none"
              required
            />
            <span className="text-slate-400 text-xs mr-1">٪</span>
          </div>

          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="TOMAN">تومان (TOMAN)</option>
            <option value="EUR">یورو (EUR)</option>
            <option value="AED">درهم (AED)</option>
            <option value="USD">دلار (USD)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="زمان تحویل (مثلا: تحویل فوری ۲۴ ساعته یا ۴ الی ۶ هفته)"
          value={formData.delivery_time}
          onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        <select
          value={formData.supply_mode}
          onChange={(e) => setFormData({
            ...formData,
            supply_mode: e.target.value as 'INSTANT' | 'EUROPE',
            currency: e.target.value === 'INSTANT' ? 'TOMAN' : 'EUR',
            markup_percent: e.target.value === 'INSTANT' ? 4.0 : 25.0
          })}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          <option value="INSTANT">🇮🇷 تامین داخلی (انبار مرکزی تهران)</option>
          <option value="EUROPE">🇪🇺 سفارش اختصاصی از اروپا</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'در حال ثبت...' : 'ذخیره منبع رفرنس'}
        </button>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import { X, Building2, Plus, Sparkles, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

export interface NewCourtPayload {
  name: string;
  isIndoor: boolean;
  glassType: string;
  turfColor: string;
  defaultPrice: number;
  openTime: string;
  closeTime: string;
}

interface NewCourtModalProps {
  isOpen: boolean;
  clubName: string;
  onClose: () => void;
  onAddCourt: (court: NewCourtPayload) => void;
}

export const NewCourtModal: React.FC<NewCourtModalProps> = ({
  isOpen,
  clubName,
  onClose,
  onAddCourt,
}) => {
  const [name, setName] = useState('');
  const [isIndoor, setIsIndoor] = useState(true);
  const [glassType, setGlassType] = useState('سوپر پانورامیک بدون ستون (Super Panoramic)');
  const [turfColor, setTurfColor] = useState('چمن آبی موندو استاندارد رسمی WPT');
  const [defaultPrice, setDefaultPrice] = useState(2400000);
  const [openTime, setOpenTime] = useState('۰۸:۰۰');
  const [closeTime, setCloseTime] = useState('۲۳:۳۰');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCourt({
      name: name.trim(),
      isIndoor,
      glassType,
      turfColor,
      defaultPrice,
      openTime,
      closeTime,
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
          <Building2 className="w-6 h-6 text-rally-primary" />
          <div>
            <h3 className="font-bold text-white text-base">ثبت و افزودن کورت جدید</h3>
            <p className="text-xs text-slate-400">افزودن زمین بازی به پلتفرم رالی برای {clubName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">نام و عنوان کورت:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: کورت ۱ سنترال یا کورت VIP پانوراما"
              className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">نوع سازه:</label>
              <select
                value={isIndoor ? 'INDOOR' : 'OUTDOOR'}
                onChange={(e) => setIsIndoor(e.target.value === 'INDOOR')}
                className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary"
              >
                <option value="INDOOR">مسقف (Indoor)</option>
                <option value="OUTDOOR">روباز (Outdoor)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">نرخ هر سانس ۹۰ دقیقه:</label>
              <input
                type="number"
                required
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(Number(e.target.value))}
                className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary font-bold text-[#D7ED68]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">مشخصات شیشه و دیواره:</label>
            <select
              value={glassType}
              onChange={(e) => setGlassType(e.target.value)}
              className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary font-bold"
            >
              <option value="سوپر پانورامیک بدون ستون (Super Panoramic)">سوپر پانورامیک ۱۲ میل بدون ستون (دید ۳۶۰ درجه)</option>
              <option value="پانوراما با پایه‌های گوشه‌ای">پانوراما با پایه‌های گوشه‌ای استاندارد</option>
              <option value="شیشه سکوریت ۱۰ میل ستون‌دار">شیشه سکوریت ۱۰ میل ستون‌دار کلاسیک</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">نوع و رنگ چمن مصنوعی:</label>
            <select
              value={turfColor}
              onChange={(e) => setTurfColor(e.target.value)}
              className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rally-primary font-bold"
            >
              <option value="چمن آبی موندو استاندارد رسمی WPT">چمن موندو آبی رسمی WPT (تکسچرد)</option>
              <option value="چمن مشکی موندو پرمیوم">چمن مشکی موندو پرمیوم</option>
              <option value="چمن سبز کلاسیک مسابقاتی">چمن سبز کلاسیک مسابقاتی</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">ساعت اولین سانس:</label>
              <input
                type="text"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">ساعت آخرین سانس:</label>
              <input
                type="text"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full bg-[#0B1724] border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rally-primary hover:bg-rally-primary/80 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#D7ED68]" />
              <span>ثبت کورت و تولید خودکار سانس‌ها</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs cursor-pointer"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

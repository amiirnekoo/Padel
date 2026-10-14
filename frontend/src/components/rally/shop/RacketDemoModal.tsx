import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

interface RacketDemoModalProps {
  product: ShopProduct;
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_CLUBS = [
  { id: 'viva', name: 'باشگاه پدل ویوا (نیاوران تهران)', address: 'نیاوران، خ عمار' },
  { id: 'enghelab', name: 'مجموعه پدل انقلاب تهران', address: 'خ ولیعصر، اتوبان نیایش' },
  { id: 'lefour', name: 'پدل کلوپ لفور (شهرک غرب)', address: 'شهرک غرب، بلوار فرحزادی' },
  { id: 'namakabrood', name: 'کلوپ پدل نمک‌آبرود', address: 'چالوس، شهرک نمک‌آبرود' },
];

export const RacketDemoModal: React.FC<RacketDemoModalProps> = ({ product, isOpen, onClose }) => {
  const [selectedClub, setSelectedClub] = useState(DEMO_CLUBS[0].id);
  const [demoDate, setDemoDate] = useState('امروز / فردا');
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerLevel, setPlayerLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !playerPhone.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">برنامه تست دمو راکت در کورت</h3>
              <p className="text-xs text-sky-200">پیش از خرید، راکت را در بازی واقعی امتحان کنید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-sm">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-slate-900">درخواست تست دمو با موفقیت ثبت شد</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                راکت تستی <strong className="text-slate-900">{product.name_fa}</strong> با هماهنگی به کلوپ انتخابی شما ارسال می‌شود. کارشناس تست رالی ظرف ۲ ساعت آینده جهت هماهنگی سانس با شما تماس می‌گیرد.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-700 font-bold">
                کد پیگیری دمو: <span className="font-mono text-sky-600">DEMO-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-4 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                بستن و بازگشت به فروشگاه
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Card summary */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={product.image_url}
                  alt={product.name_fa}
                  className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                    {product.brand}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">{product.name_fa}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">مشخصات وزن: {product.weight || 'استاندارد مسابقه‌ای (۳۶۵ گرم)'}</p>
                </div>
              </div>

              {/* Policy Note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  هزینه دمو (۲۰۰,۰۰۰ ت) پس از بازی در صورت خرید قطعی راکت به عنوان <strong>تخفیف ۱۰۰٪</strong> از فاکتور شما کسر خواهد شد.
                </span>
              </div>

              {/* Club selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  کلوپ همکار رالی برای تحویل راکت دمو:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_CLUBS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClub(c.id)}
                      className={`p-2.5 rounded-xl text-right border text-xs transition-all flex items-center justify-between ${
                        selectedClub === c.id
                          ? 'border-sky-600 bg-sky-50 font-bold text-sky-950 ring-2 ring-sky-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{c.address}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="مثال: امیر رضایی"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">شماره تماس همراه:</label>
                  <input
                    type="tel"
                    required
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    placeholder="۰۹۱۲..."
                    dir="ltr"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-right"
                  />
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">سطح بازی شما:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BEGINNER', label: 'مبتدی (۱-۲)' },
                    { id: 'INTERMEDIATE', label: 'متوسط (۳-۴)' },
                    { id: 'ADVANCED', label: 'پیشرفته (۵+)' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setPlayerLevel(lvl.id as any)}
                      className={`p-2 rounded-xl text-center text-xs font-bold border transition-all ${
                        playerLevel === lvl.id
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#0B4278] hover:bg-[#0C4F8D] text-white font-bold text-xs shadow-md transition-all active:scale-98"
              >
                ثبت رزرو تست دمو در کورت
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

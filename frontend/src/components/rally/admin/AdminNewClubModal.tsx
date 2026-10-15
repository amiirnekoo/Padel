import React, { useState } from 'react';
import { X, Building2, MapPin, Phone, Layers, DollarSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';
import { CourtClub } from '../../../types/rally';

interface AdminNewClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClubAdded: (newClub: CourtClub) => void;
}

export const AdminNewClubModal: React.FC<AdminNewClubModalProps> = ({
  isOpen,
  onClose,
  onClubAdded,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('تهران');
  const [area, setArea] = useState('نیاوران');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('02122334455');
  const [courtsCount, setCourtsCount] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(2800000);
  const [amenities, setAmenities] = useState('پارکینگ اختصاصی، کافه تریا، رختکن و دوش آبگرم، پرو شاپ');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await rallyApi.createVenue({
        name: name.trim(),
        city,
        province: city === 'تهران' ? 'تهران' : city,
        address: address.trim() || `خیابان اصلی، منطقه ${area}`,
        phone: phone.trim(),
        courts_count: courtsCount,
        default_hourly_rate: hourlyRate,
        amenities,
      });

      const newClubId = res?.club_id || `club-${Date.now()}`;
      const newClubObject: CourtClub = {
        id: newClubId,
        name: name.trim(),
        sport: 'PADEL',
        city,
        area,
        address: address.trim() || `خیابان اصلی، منطقه ${area}`,
        courtType: 'OUTDOOR',
        surface: 'چمن مصنوعی آبی موندو WPT',
        startingPrice: Math.floor(hourlyRate / 10),
        images: ['/images/courts/club_enghelab_central.jpg'],
        rating: 5.0,
        amenities: amenities.split('،').map((s, idx) => ({ id: `am-${idx}`, label: s.trim(), iconName: 'Check' })),
        rules: ['کفش مناسب الزامی است', 'حضور ۱۵ دقیقه پیش از سانس'],
        cancellationPolicy: 'استرداد ۱۰۰٪ تا ۲۴ ساعت قبل از سانس',
        slots: [],
        latitude: 35.7984,
        longitude: 51.4123,
      };

      onClubAdded(newClubObject);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در ثبت اطلاعات مجموعه ورزشی.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto flex flex-col text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rally-primary/20 text-rally-primary flex items-center justify-center border border-rally-primary/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">ثبت مجموعه و باشگاه جدید در رالی</h3>
              <p className="text-[11px] text-slate-400">اتصال به موتور رزرواسیون و نقشه کشوری</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh]">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">نام رسمی مجموعه ورزشی:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: کلوپ پدل زعفرانیه VIP"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-rally-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">شهر:</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-rally-primary focus:outline-none"
                  >
                    <option value="تهران">تهران</option>
                    <option value="مازندران">مازندران</option>
                    <option value="مشهد">مشهد</option>
                    <option value="اصفهان">اصفهان</option>
                    <option value="شیراز">شیراز</option>
                    <option value="تبریز">تبریز</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">منطقه / محله:</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="مثال: نیاوران، ولنجک..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-rally-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">آدرس دقیق کلوپ:</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس دقیق و ورودی مجموعه..."
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-rally-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">شماره تماس گیشه:</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-left focus:border-rally-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">تعداد کورت‌ها:</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={courtsCount}
                    onChange={(e) => setCourtsCount(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-rally-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">نرخ پایه هر ساعت (ریال):</label>
                <input
                  type="number"
                  step="100000"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-rally-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">امکانات رفاهی مجموعه:</label>
                <input
                  type="text"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="با کامای فارسی جدا کنید"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-rally-primary focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-rally-primary hover:bg-rally-primary-hover disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all min-h-[40px]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Building2 className="w-4 h-4" />}
                  <span>{isLoading ? 'در حال ثبت مجموعه...' : 'تایید و افزودن به رالی'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-base font-black text-white">مجموعه ورزشی با موفقیت در سیستم ثبت گردید!</h4>
              <p className="text-xs text-slate-400">کلوپ جدید به فهرست باشگاه‌ها و نقشه رالی اضافه شد.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

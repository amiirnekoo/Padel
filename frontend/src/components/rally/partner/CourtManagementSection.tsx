import React, { useState, useEffect } from 'react';
import { Plus, Building2, CheckCircle2, AlertCircle, Image as ImageIcon, Zap, Sun, Moon } from 'lucide-react';
import { OwnerCourtItem, SportType } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';

interface CourtManagementSectionProps {
  clubId?: string;
  onOpenMatchmakingModal?: (court: OwnerCourtItem) => void;
}

const PRESET_COURT_IMAGES = [
  { id: 'padel_panoramic', url: '/images/courts/padel_panoramic.jpg', label: 'پدل پانورامیک چمن آبی' },
  { id: 'padel_indoor', url: '/images/courts/padel_indoor.jpg', label: 'پدل سالن سرپوشیده لوکس' },
  { id: 'tennis_clay', url: '/images/courts/tennis_clay.jpg', label: 'تنیس خاک رس استاندارد' },
];

export const CourtManagementSection: React.FC<CourtManagementSectionProps> = ({
  clubId = 'club-1',
  onOpenMatchmakingModal,
}) => {
  const [courts, setCourts] = useState<OwnerCourtItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState('کورت ۱ پانورامیک');
  const [sportType, setSportType] = useState<SportType>('PADEL');
  const [surfaceType, setSurfaceType] = useState('چمن مصنوعی آبی موندو');
  const [isIndoor, setIsIndoor] = useState(false);
  const [hasLighting, setHasLighting] = useState(true);
  const [hourlyRateToman, setHourlyRateToman] = useState(280000);
  const [selectedImageUrl, setSelectedImageUrl] = useState('/images/courts/padel_panoramic.jpg');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCourts = async () => {
    setLoading(true);
    const data = await rallyApi.getClubCourts(clubId);
    if (data && data.length > 0) {
      setCourts(data);
    } else {
      // Fallback initial sample courts
      setCourts([
        {
          id: 'court-1',
          club_id: clubId,
          name: 'کورت ۱ پانورامیک شیشه‌ای',
          sport_type: 'PADEL',
          surface_type: 'چمن مصنوعی آبی موندو WPT',
          is_indoor: false,
          has_lighting: true,
          hourly_rate: 2800000,
          image_url: '/images/courts/padel_panoramic.jpg',
          is_active: true,
        },
        {
          id: 'court-2',
          club_id: clubId,
          name: 'کورت ۲ VIP سرپوشیده',
          sport_type: 'PADEL',
          surface_type: 'چمن مصنوعی آبی با نور متمرکز',
          is_indoor: true,
          has_lighting: true,
          hourly_rate: 3200000,
          image_url: '/images/courts/padel_indoor.jpg',
          is_active: true,
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCourts();
  }, [clubId]);

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload = {
      name,
      sport_type: sportType,
      surface_type: surfaceType,
      is_indoor: isIndoor,
      has_lighting: hasLighting,
      hourly_rate: hourlyRateToman * 10, // Tomans to Rials
      image_url: selectedImageUrl,
    };

    const res = await rallyApi.addCourt(clubId, payload);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`کورت «${name}» با موفقیت ثبت و آماده اجاره و مچ‌میکینگ شد.`);
      setIsAdding(false);
      loadCourts();
    } else {
      setErrorMsg(res.error || 'خطا در ثبت کورت');
    }
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 text-white" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="text-rally-accent" size={24} />
            مدیریت کورت‌ها، تصاویر و قیمت‌گذاری سانس‌ها
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            کورت‌های پدل و تنیس خود را همراه با تصویر، مشخصات فنی و نرخ اجاره اختصاصی ثبت و فعال کنید.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-rally-accent hover:bg-rally-accent-hover text-slate-950 transition flex items-center gap-1.5 shadow-md"
        >
          <Plus size={15} />
          {isAdding ? 'بستن فرم' : 'افزودن کورت جدید'}
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs mb-4">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Court Form */}
      {isAdding && (
        <form onSubmit={handleAddCourt} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl mb-6 space-y-4">
          <h3 className="text-sm font-bold text-rally-accent mb-2">مشخصات کورت جدید:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">نام کورت:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً کورت ۱ پانورامیک شیشه‌ای"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رشته ورزشی:</label>
              <select
                value={sportType}
                onChange={(e) => setSportType(e.target.value as SportType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="PADEL">پدل (Padel)</option>
                <option value="TENNIS">تنیس (Tennis)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">نوع کفپوش:</label>
              <input
                type="text"
                value={surfaceType}
                onChange={(e) => setSurfaceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">نرخ هر ساعت اجاره (تومان):</label>
              <input
                type="number"
                value={hourlyRateToman}
                onChange={(e) => setHourlyRateToman(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          {/* Quick Select Court Image */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-blue-400" />
              <span>انتخاب عکس واقعی کورت:</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_COURT_IMAGES.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImageUrl(img.url)}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 transition relative ${
                    selectedImageUrl === img.url ? 'border-rally-accent ring-2 ring-rally-accent/40' : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-20 object-cover" />
                  <div className="p-1.5 text-[10px] text-center bg-slate-950/90 truncate">{img.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={isIndoor}
                onChange={(e) => setIsIndoor(e.target.checked)}
                className="rounded border-slate-700"
              />
              <span>سالن سرپوشیده (Indoor)</span>
            </label>

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={hasLighting}
                onChange={(e) => setHasLighting(e.target.checked)}
                className="rounded border-slate-700"
              />
              <span>دارای پروژکتور و روشنایی شب</span>
            </label>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-xs font-bold rounded-xl bg-rally-accent text-slate-950 shadow-md"
            >
              {loading ? 'در حال ثبت...' : 'ذخیره کورت'}
            </button>
          </div>
        </form>
      )}

      {/* Courts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courts.map((court) => (
          <div key={court.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
            {court.image_url && (
              <div className="w-full h-36 relative overflow-hidden">
                <img src={court.image_url} alt={court.name} className="w-full h-full object-cover" />
                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-white border border-slate-700">
                  {court.sport_type === 'PADEL' ? 'پدل' : 'تنیس'}
                </div>
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white mb-1">{court.name}</h4>
                <div className="text-[11px] text-slate-400 mb-3">{court.surface_type} • {court.is_indoor ? 'سرپوشیده' : 'روباز'}</div>
                <div className="text-xs text-slate-300 font-mono font-bold mb-3">
                  نرخ اجاره: {(court.hourly_rate / 10).toLocaleString('fa-IR')} تومان / ساعت
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> فعال برای اجاره
                </span>
                <button
                  type="button"
                  onClick={() => onOpenMatchmakingModal && onOpenMatchmakingModal(court)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-900/60 hover:bg-blue-800 text-blue-300 border border-blue-700/60 flex items-center gap-1 transition"
                >
                  <Zap size={12} />
                  برگزاری مچ‌میکینگ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

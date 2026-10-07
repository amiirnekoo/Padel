import React, { useState } from 'react';
import { UserCheck, Calendar, Check, X, Clock, Award, Star, Phone, Package, Plus, DollarSign, Save } from 'lucide-react';

interface StudentRequest {
  id: string;
  studentName: string;
  studentPhone: string;
  requestedDate: string;
  level: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

interface CoachPackage {
  id: string;
  title: string;
  sessionsCount: number;
  price: number;
  discountPercent?: number;
}

const INITIAL_REQUESTS: StudentRequest[] = [
  {
    id: 'REQ-1',
    studentName: 'محمدرضا صادقی',
    studentPhone: '۰۹۱۲۵۵۵۶۶۷۷',
    requestedDate: 'پنجشنبه ۱۸:۰۰ تا ۱۹:۳۰',
    level: 'مبتدی (اولین جلسه)',
    status: 'PENDING',
  },
  {
    id: 'REQ-2',
    studentName: 'نگین مرادی',
    studentPhone: '۰۹۱۲۴۴۴۳۳۲۲',
    requestedDate: 'جمعه ۱۰:۰۰ تا ۱۱:۳۰',
    level: 'متوسط (اصلاح بکهند و باندخا)',
    status: 'ACCEPTED',
  },
  {
    id: 'REQ-3',
    studentName: 'کیان افشار',
    studentPhone: '۰۹۳۰۹۹۹۸۸۷۷',
    requestedDate: 'شنبه ۱۹:۳۰ تا ۲۱:۰۰',
    level: 'پیشرفته (تاکتیک مسابقه)',
    status: 'PENDING',
  },
];

const INITIAL_PACKAGES: CoachPackage[] = [
  { id: 'pkg-1', title: 'پکیج خصوصی مقدماتی (۵ جلسه)', sessionsCount: 5, price: 7000000, discountPercent: 7 },
  { id: 'pkg-2', title: 'دوره جامع مسترکلاس (۱۰ جلسه)', sessionsCount: 10, price: 13500000, discountPercent: 10 },
  { id: 'pkg-3', title: 'پکیج تاکتیکی دونفره (۴ جلسه)', sessionsCount: 4, price: 9000000, discountPercent: 5 },
];

export const PortalCoachTab: React.FC = () => {
  const [requests, setRequests] = useState<StudentRequest[]>(INITIAL_REQUESTS);
  const [packages, setPackages] = useState<CoachPackage[]>(INITIAL_PACKAGES);
  const [hourlyRate, setHourlyRate] = useState(1500000);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(1500000);
  const [rateSavedNotice, setRateSavedNotice] = useState(false);

  const handleAction = (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleSaveRate = () => {
    setHourlyRate(tempRate);
    setIsEditingRate(false);
    setRateSavedNotice(true);
    setTimeout(() => setRateSavedNotice(false), 2500);
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Coach KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">جلسات قطعی این هفته</span>
          <p className="text-xl font-black text-white mt-1">۸ جلسه تایید شده</p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">انقلاب، نیاوران و ویوا</span>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">نرخ پایه هر جلسه ۹۰ دقیقه</span>
            <button
              onClick={() => {
                if (isEditingRate) handleSaveRate();
                else setIsEditingRate(true);
              }}
              className="text-[10px] font-bold text-rally-primary hover:underline cursor-pointer"
            >
              {isEditingRate ? 'ذخیره' : 'تغییر نرخ'}
            </button>
          </div>
          {isEditingRate ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={tempRate}
                onChange={(e) => setTempRate(Number(e.target.value))}
                className="w-full bg-[#0B1724] border border-white/20 rounded-lg px-2 py-1 text-sm text-white font-mono"
              />
              <button onClick={handleSaveRate} className="p-1 bg-rally-primary rounded text-white">
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-xl font-black text-[#D7ED68] mt-1">{hourlyRate.toLocaleString('fa-IR')} تومان</p>
          )}
          {rateSavedNotice ? (
            <span className="text-[10px] text-emerald-400 mt-0.5 block">نرخ جدید با موفقیت ذخیره شد</span>
          ) : (
            <span className="text-[10px] text-slate-400 mt-0.5 block">نمایش زنده در پروفایل عمومی</span>
          )}
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">درخواست‌های در انتظار</span>
          <p className="text-xl font-black text-amber-400 mt-1">{pendingRequestsCount} شاگرد</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">نیازمند بررسی و تایید ساعت</span>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">رضایت و امتیاز شاگردان</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xl font-black text-amber-400">۴.۹</span>
            <span className="text-xs text-slate-400 font-mono">(۲۸ نظر)</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">مربی رسمی تایید شده فدراسیون</span>
        </div>
      </div>

      {/* Student Requests Section */}
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-xs">درخواست‌های آموزش خصوصی شاگردان</h4>
            <p className="text-[11px] text-slate-400">با تایید شما، پیامک لینک رزرو کورت و پیش‌پرداخت برای شاگرد ارسال می‌شود</p>
          </div>
        </div>

        <div className="divide-y divide-white/5 p-4 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{r.studentName}</span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {r.studentPhone}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D7ED68]" />
                    {r.requestedDate}
                  </span>
                  <span className="text-slate-400">سطح مهارت: {r.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {r.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleAction(r.id, 'ACCEPTED')}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تایید و ارسال لینک</span>
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'DECLINED')}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/20 transition-colors cursor-pointer"
                    >
                      رد
                    </button>
                  </>
                ) : r.status === 'ACCEPTED' ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-xl">
                    تایید شده
                  </span>
                ) : (
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-1 rounded-xl">
                    رد شده
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Packages Management Section */}
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-xs">پکیج‌ها و دوره‌های چندجلسه‌ای شما</h4>
            <p className="text-[11px] text-slate-400">بسته‌های پیشنهادی با تخفیف برای ثبت‌نام سریع‌تر بازیکنان</p>
          </div>
          <button
            onClick={() => {
              const title = prompt('عنوان پکیج آموزشی جدید را وارد کنید:');
              if (!title) return;
              const count = Number(prompt('تعداد جلسات پکیج:', '5')) || 5;
              const price = Number(prompt('قیمت کل پکیج (تومان):', '7000000')) || 7000000;
              setPackages((prev) => [
                ...prev,
                { id: `pkg-${Date.now()}`, title, sessionsCount: count, price, discountPercent: 5 },
              ]);
            }}
            className="px-3 py-1.5 bg-rally-primary/20 hover:bg-rally-primary/30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rally-primary/40 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#D7ED68]" />
            <span>تعریف پکیج جدید</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-[#0B1724] border border-white/5 rounded-xl p-3.5 space-y-2">
              <div className="flex items-start justify-between">
                <span className="font-bold text-white text-xs">{pkg.title}</span>
                {pkg.discountPercent && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {pkg.discountPercent}٪ تخفیف
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                <span>تعداد جلسات: </span>
                <strong className="text-white">{pkg.sessionsCount} جلسه</strong>
              </div>
              <div className="text-sm font-bold text-[#D7ED68] font-mono">
                {pkg.price.toLocaleString('fa-IR')} تومان
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

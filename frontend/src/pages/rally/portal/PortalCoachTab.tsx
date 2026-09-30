import React, { useState } from 'react';
import { UserCheck, Calendar, Check, X, Clock, Award, Star, Phone } from 'lucide-react';

interface StudentRequest {
  id: string;
  studentName: string;
  studentPhone: string;
  requestedDate: string;
  level: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

const INITIAL_REQUESTS: StudentRequest[] = [
  {
    id: 'REQ-1',
    studentName: 'محمدرضا صادقی',
    studentPhone: '۰۹۱۲۵۵۵۶۶۷۷',
    requestedDate: 'پنجشنبه ۱۸:۰۰ تا ۱۹:۳۰',
    level: 'مبتدی (اولین جلسه)',
    status: 'PENDING'
  },
  {
    id: 'REQ-2',
    studentName: 'نگین مرادی',
    studentPhone: '۰۹۱۲۴۴۴۳۳۲۲',
    requestedDate: 'جمعه ۱۰:۰۰ تا ۱۱:۳۰',
    level: 'متوسط (اصلاح بکهند و باندخا)',
    status: 'ACCEPTED'
  }
];

export const PortalCoachTab: React.FC = () => {
  const [requests, setRequests] = useState<StudentRequest[]>(INITIAL_REQUESTS);
  const [hourlyRate, setHourlyRate] = useState(1500000);

  const handleAction = (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Coach Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">جلسات آموزشی این هفته</span>
          <p className="text-xl font-black text-white mt-1">۵ جلسه تایید شده</p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">باشگاه انقلاب و ولنجک</span>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">نرخ پایه هر جلسه ۹۰ دقیقه‌ای</span>
          <p className="text-xl font-black text-[#D7ED68] mt-1">{hourlyRate.toLocaleString('fa-IR')} تومان</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">قابل تغییر در پروفایل مربی</span>
        </div>

        <div className="bg-[#0F1E2E] border border-white/10 p-4 rounded-2xl">
          <span className="text-xs text-slate-400">امتیاز شاگردان</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xl font-black text-amber-400">۴.۹</span>
            <span className="text-xs text-slate-400">(از ۲۸ نظر ثبت‌شده)</span>
          </div>
        </div>
      </div>

      {/* Student Requests List */}
      <div className="bg-[#0F1E2E] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-xs">درخواست‌های ثبت‌نام جلسات خصوصی</h4>
            <p className="text-[11px] text-slate-400">شاگردان پس از تایید شما، هزینه را واریز و کورت رزرو می‌شود</p>
          </div>
        </div>

        <div className="divide-y divide-white/5 p-4 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{r.studentName}</span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {r.studentPhone}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D7ED68]" />
                    {r.requestedDate}
                  </span>
                  <span className="text-slate-400">هدف: {r.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {r.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleAction(r.id, 'ACCEPTED')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تایید و ارسال لینک پرداخت</span>
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'DECLINED')}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/20 cursor-pointer transition-colors"
                    >
                      رد درخواست
                    </button>
                  </>
                ) : r.status === 'ACCEPTED' ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-xl">
                    تایید شده
                  </span>
                ) : (
                  <span className="bg-rose-500/10 text-rose-400 text-xs font-bold px-3 py-1 rounded-xl">
                    رد شده
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

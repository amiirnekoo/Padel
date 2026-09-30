import React, { useState } from 'react';
import { UserCheck, Search, Award, Check, X, ShieldAlert, Star } from 'lucide-react';
import { MOCK_COACHES } from '../../../data/mockRallyData';
import { Coach } from '../../../types/rally';

export const AdminCoachesTab: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>(MOCK_COACHES);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvals, setApprovals] = useState<Record<string, 'APPROVED' | 'PENDING' | 'REJECTED'>>({
    'c-1': 'APPROVED',
    'c-2': 'APPROVED',
    'c-3': 'PENDING'
  });

  const handleSetApproval = (coachId: string, status: 'APPROVED' | 'REJECTED') => {
    setApprovals((prev) => ({ ...prev, [coachId]: status }));
  };

  const filtered = coaches.filter((c) => c.name.includes(searchTerm) || c.title.includes(searchTerm));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search & Stats Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در بین مربیان تایید شده یا در انتظار..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rally-primary"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <span>تعداد کل مربیان: </span>
            <strong className="text-white font-mono">{coaches.length}</strong>
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold">
            فعال و آماده رزرو: ۲
          </div>
        </div>
      </div>

      {/* Coaches Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((coach) => {
          const status = approvals[coach.id] || 'APPROVED';
          return (
            <div key={coach.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={coach.avatarUrl} alt={coach.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{coach.name}</h4>
                      <p className="text-[11px] text-slate-400">{coach.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{coach.rating}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">سطح مربیگری:</span>
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-rally-primary" />
                      {coach.levels.join('، ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">نرخ هر جلسه خصوصی:</span>
                    <span className="font-bold text-[#D7ED68]">{coach.hourlyRate.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">باشگاه‌های تحت پوشش:</span>
                    <span className="font-medium text-slate-300 truncate max-w-[140px]">{coach.clubs.join('، ')}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  {status === 'APPROVED' && (
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      مدارک تایید شده
                    </span>
                  )}
                  {status === 'PENDING' && (
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      در انتظار بررسی مدارک
                    </span>
                  )}
                  {status === 'REJECTED' && (
                    <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      رد صلاحیت شده
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {status !== 'APPROVED' && (
                    <button
                      onClick={() => handleSetApproval(coach.id, 'APPROVED')}
                      className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                      title="تایید صلاحیت مربی"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {status !== 'REJECTED' && (
                    <button
                      onClick={() => handleSetApproval(coach.id, 'REJECTED')}
                      className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg text-xs font-bold border border-rose-500/30 transition-colors cursor-pointer"
                      title="رد یا تعلیق مربی"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

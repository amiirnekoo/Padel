import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Building2, CheckCircle2, XCircle, Clock, Search, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface RoleUpgradeItem {
  tracking_id: string;
  phone_number: string;
  full_name: string;
  target_role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  details?: Record<string, any>;
  admin_notes?: string;
  reviewed_at?: string;
}

export const AdminRoleRequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<RoleUpgradeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await rallyApi.getAdminRoleUpgradeRequests();
      if (Array.isArray(res)) {
        setRequests(res);
      }
    } catch {
      // در صورت بروز خطای موقت، لیست خالی حفظ می‌شود
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (trackingId: string) => {
    setActionLoading(trackingId);
    try {
      const res = await rallyApi.approveAdminRoleUpgradeRequest(trackingId);
      if (res && res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.tracking_id === trackingId ? { ...r, status: 'APPROVED' } : r))
        );
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'خطا در تایید درخواست');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (trackingId: string) => {
    const notes = rejectNotes[trackingId] || 'عدم تطابق مدارک یا اطلاعات ارسالی';
    setActionLoading(trackingId);
    try {
      const res = await rallyApi.rejectAdminRoleUpgradeRequest(trackingId, notes);
      if (res && res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.tracking_id === trackingId ? { ...r, status: 'REJECTED', admin_notes: notes } : r))
        );
        setActiveRejectId(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'خطا در رد درخواست');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone_number?.includes(searchQuery) ||
      r.tracking_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header & Stats */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rally-primary" />
            <h3 className="font-bold text-white text-base">درخواست‌های ارتقای نقش (مربیان و باشگاه‌داران)</h3>
            {pendingCount > 0 && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {pendingCount} نیازمند بررسی
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            بررسی احراز صلاحیت، مدارک پیوست و تایید آنی تغییر سطح دسترسی کاربران به پنل مربی یا مدیریت باشگاه
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRequests}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rally-primary' : ''}`} />
            <span>به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'همه درخواست‌ها' },
            { id: 'PENDING', label: `در انتظار بررسی (${pendingCount})` },
            { id: 'APPROVED', label: 'تایید شده' },
            { id: 'REJECTED', label: 'رد شده' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-rally-primary text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو با نام، شماره یا کد رهگیری..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rally-primary"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
            {isLoading ? 'در حال بارگذاری درخواست‌ها...' : 'هیچ درخواستی با این مشخصات یافت نشد.'}
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isCoach = req.target_role === 'COACH';
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.tracking_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{req.full_name || 'کاربر بدون نام'}</span>
                    <span className="text-slate-400 text-xs font-mono">{req.phone_number}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                        isCoach
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {isCoach ? <UserCheck className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      ارتقا به {isCoach ? 'مربی رسمی' : 'مدیر باشگاه'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      کد پیگیری: {req.tracking_id}
                    </span>
                  </div>

                  {req.details && Object.keys(req.details).length > 0 && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex flex-wrap gap-4">
                      {req.details.bio && (
                        <div>
                          <span className="text-slate-500">رزومه: </span>
                          <span>{req.details.bio}</span>
                        </div>
                      )}
                      {req.details.license_no && (
                        <div>
                          <span className="text-slate-500">شماره مربیگری: </span>
                          <span className="font-mono text-amber-400">{req.details.license_no}</span>
                        </div>
                      )}
                      {req.details.club_name && (
                        <div>
                          <span className="text-slate-500">نام مجموعه: </span>
                          <span className="text-emerald-400">{req.details.club_name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {req.admin_notes && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>یادداشت ادمین: {req.admin_notes}</span>
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  {isPending ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleApprove(req.tracking_id)}
                        disabled={actionLoading === req.tracking_id}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تایید و ارتقای نقش</span>
                      </button>
                      <button
                        onClick={() => setActiveRejectId(activeRejectId === req.tracking_id ? null : req.tracking_id)}
                        disabled={actionLoading === req.tracking_id}
                        className="flex-1 sm:flex-none px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رد درخواست</span>
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {isApproved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {isApproved ? 'تایید و اعمال شده' : 'رد صلاحیت شده'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

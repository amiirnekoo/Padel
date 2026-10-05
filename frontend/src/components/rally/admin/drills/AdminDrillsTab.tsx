import React, { useState, useEffect } from 'react';
import { DrillDetail, DrillListItem } from '../../../../types/drills';
import { drillsApi } from '../../../../services/drillsApi';
import { AdminDrillEditModal } from './AdminDrillEditModal';
import { AdminDrillMediaModal } from './AdminDrillMediaModal';
import { AdminDrillReviewModal } from './AdminDrillReviewModal';
import { AdminDrillTableRow } from './AdminDrillTableRow';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

export const AdminDrillsTab: React.FC = () => {
  const [drills, setDrills] = useState<DrillListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedDrillDetail, setSelectedDrillDetail] = useState<DrillDetail | null>(null);
  const [reviewTargetDrill, setReviewTargetDrill] = useState<DrillDetail | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const adminToken = sessionStorage.getItem('rally_admin_token') || undefined;

  const fetchDrills = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await drillsApi.getAdminDrills(
        statusFilter ? { status: statusFilter } : {},
        adminToken
      );
      const list = res.drills || [];
      setDrills(list);
      const params = new URLSearchParams(window.location.search);
      if (params.get('open_review') === '1' && list.length > 0) {
        const pending = list.find((d: any) => d.status === 'pending_review');
        if (pending) setReviewTargetDrill(pending as any);
      }
    } catch (err: any) {
      setActionError(err.message || 'خطا در دریافت تمرینات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrills();
  }, [statusFilter]);

  const handleOpenEdit = async (drillItem?: DrillListItem) => {
    setActionError(null);
    if (!drillItem) {
      setSelectedDrillDetail(null);
      setIsEditModalOpen(true);
      return;
    }
    try {
      const full = await drillsApi.getAdminDrill(drillItem.id, adminToken);
      setSelectedDrillDetail(full);
      setIsEditModalOpen(true);
    } catch (err: any) {
      setActionError(err.message || 'خطا در بارگذاری جزئیات تمرین');
    }
  };

  const handleOpenMedia = async (drillItem: DrillListItem) => {
    setActionError(null);
    try {
      const full = await drillsApi.getAdminDrill(drillItem.id, adminToken);
      setSelectedDrillDetail(full);
      setIsMediaModalOpen(true);
    } catch (err: any) {
      setActionError(err.message || 'خطا در بارگذاری رسانه‌ها');
    }
  };

  const handleSubmitReview = async (drillId: string) => {
    try {
      await drillsApi.submitForReview(drillId, adminToken);
      fetchDrills();
    } catch (err: any) {
      alert(err.message || 'خطا در ارسال برای بازبینی');
    }
  };

  const handleReviewDecision = async (drillId: string, _decision: 'approved' | 'rejected') => {
    try {
      const full = await drillsApi.getAdminDrill(drillId, adminToken);
      setReviewTargetDrill(full);
    } catch (err: any) {
      alert(err.message || 'خطا در بارگذاری اطلاعات برای بازبینی تخصصی');
    }
  };

  const handlePublish = async (drillId: string) => {
    try {
      await drillsApi.publishDrill(drillId, adminToken);
      fetchDrills();
    } catch (err: any) {
      alert(err.message || 'خطا در انتشار تمرین');
    }
  };

  const handleArchive = async (drillId: string) => {
    if (!confirm('آیا از بایگانی این تمرین مطمئن هستید؟')) return;
    try {
      await drillsApi.archiveDrill(drillId, adminToken);
      fetchDrills();
    } catch (err: any) {
      alert(err.message || 'خطا در بایگانی تمرین');
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>مدیریت تمرینات تخصصی (Drills CMS)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rally-primary/20 text-rally-primary">
              نسخه‌بندی دقیق و RBAC
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ایجاد پیش‌نویس، بررسی حقوق نشر، مدیریت رسانه‌ها و انتشار کنترل‌شده
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDrills}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
            title="به‌روزرسانی"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEdit()}
            className="px-4 py-2 bg-rally-primary hover:bg-rally-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تمرین جدید</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold ml-1">وضعیت:</span>
        {[
          { id: '', label: 'همه' },
          { id: 'draft', label: 'پیش‌نویس' },
          { id: 'in_review', label: 'در انتظار بازبینی' },
          { id: 'approved', label: 'تأییدشده' },
          { id: 'published', label: 'منتشرشده' },
          { id: 'archived', label: 'بایگانی' }
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStatusFilter(s.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer border ${
              statusFilter === s.id
                ? 'bg-rally-primary text-white border-rally-primary'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Drills Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs table-fixed">
            <colgroup>
              <col className="w-44" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-48" />
            </colgroup>
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3">عنوان تمرین</th>
                <th className="p-3">ورزش / دسته</th>
                <th className="p-3">سطح / مدت</th>
                <th className="p-3">وضعیت چرخه</th>
                <th className="p-3">آمار</th>
                <th className="p-3">اقدامات مدیریتی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {drills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    {isLoading ? 'در حال دریافت اطلاعات...' : 'هیچ تمرینی با این وضعیت یافت نشد.'}
                  </td>
                </tr>
              ) : (
                drills.map((d) => (
                  <AdminDrillTableRow
                    key={d.id}
                    drill={d}
                    onEdit={handleOpenEdit}
                    onMedia={handleOpenMedia}
                    onSubmitReview={handleSubmitReview}
                    onReviewDecision={handleReviewDecision}
                    onPublish={handlePublish}
                    onArchive={handleArchive}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      <AdminDrillEditModal
        drill={selectedDrillDetail}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDrillDetail(null);
        }}
        onSaved={fetchDrills}
        adminToken={adminToken}
      />

      {/* Media Management Modal */}
      {selectedDrillDetail && (
        <AdminDrillMediaModal
          drill={selectedDrillDetail}
          isOpen={isMediaModalOpen}
          onClose={() => {
            setIsMediaModalOpen(false);
            setSelectedDrillDetail(null);
          }}
          onUpdated={(updated) => {
            setSelectedDrillDetail(updated);
            fetchDrills();
          }}
          adminToken={adminToken}
        />
      )}

      {/* Expert Review Modal */}
      {reviewTargetDrill && (
        <AdminDrillReviewModal
          drill={reviewTargetDrill}
          onClose={() => setReviewTargetDrill(null)}
          onSuccess={() => {
            setReviewTargetDrill(null);
            fetchDrills();
          }}
          adminToken={adminToken}
        />
      )}
    </div>
  );
};

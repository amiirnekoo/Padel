import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Lock, Mail, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface AdminUserItem {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  role: string;
  is_active: boolean;
  club_id?: string;
  created_at: string;
}

export const AdminTeamTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'OPERATIONS_ADMIN',
    club_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await rallyApi.getAdminUsers();
      setUsers(Array.isArray(res) ? res : []);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await rallyApi.createAdminUser({
        username: form.username.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        email: form.email.trim() || undefined,
        role: form.role,
        club_id: form.club_id.trim() || undefined
      });
      if (res.success) {
        setStatusMsg({ type: 'success', text: `حساب کاربری ${form.username} با موفقیت ایجاد شد.` });
        setIsModalOpen(false);
        setForm({ username: '', password: '', full_name: '', email: '', role: 'OPERATIONS_ADMIN', club_id: '' });
        fetchUsers();
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'خطا در ثبت کاربر' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleBadges: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: 'مدیر ارشد (SuperAdmin)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    OPERATIONS_ADMIN: { label: 'ادمین عملیاتی', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    SHOP_ADMIN: { label: 'مدیر فروشگاه و انبار', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    CONTENT_EDITOR: { label: 'دبیر تحریریه و محتوا', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    VENUE_MANAGER: { label: 'مدیر باشگاه همکار', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-rally-primary" />
            <span>مدیریت تیم و دسترسی‌های ادمین (Admin RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تعریف حساب‌های کاربری، تعیین نقش‌های دسترسی و نظارت بر امنیت مدیران پلتفرم
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-rally-primary hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>تعریف ادمین جدید</span>
          </button>
          <button onClick={fetchUsers} className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rally-primary' : ''}`} />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full table-fixed text-right">
          <colgroup>
            <col className="w-36" />
            <col className="w-32" />
            <col className="w-48" />
            <col className="w-44" />
            <col className="w-24" />
            <col className="w-28" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400">
              <th className="p-3.5">نام و نام خانوادگی</th>
              <th className="p-3.5">نام کاربری</th>
              <th className="p-3.5">سطح دسترسی (Role)</th>
              <th className="p-3.5">ایمیل سازمانی</th>
              <th className="p-3.5">وضعیت</th>
              <th className="p-3.5">تاریخ ثبت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {users.map((u) => {
              const rBadge = roleBadges[u.role] || { label: u.role, color: 'bg-slate-800 text-slate-300' };
              return (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-white truncate">{u.full_name}</td>
                  <td className="p-3.5 font-mono text-slate-300 font-bold">{u.username}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${rBadge.color}`}>
                      {rBadge.label}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px] truncate">{u.email || '—'}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${u.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {u.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 text-[11px] font-mono">
                    {new Date(u.created_at).toLocaleDateString('fa-IR')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-rally-primary" />
              <span>ایجاد حساب ادمین جدید</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">نام کامل</label>
                <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">نام کاربری</label>
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">رمز عبور امن</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">ایمیل</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">نقش دسترسی</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                  <option value="OPERATIONS_ADMIN">ادمین عملیاتی پلتفرم</option>
                  <option value="SHOP_ADMIN">مدیر فروشگاه و سفارشات</option>
                  <option value="CONTENT_EDITOR">دبیر محتوا و مقالات</option>
                  <option value="VENUE_MANAGER">مدیر کورت‌ها و سانس‌ها</option>
                  <option value="SUPER_ADMIN">مدیر ارشد (Super Admin)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-bold">انصراف</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-rally-primary text-white rounded-xl font-bold disabled:opacity-50">
                  {isSubmitting ? 'در حال ثبت...' : 'ایجاد حساب ادمین'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Ban, CheckCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface CourtItem {
  id: string;
  name: string;
  club_id: string;
}

interface SlotItem {
  id: string;
  start_time: string;
  end_time: string;
  price: number;
  status: 'AVAILABLE' | 'BLOCKED' | 'BOOKED' | 'TOURNAMENT_HOLD';
  court_id: string;
}

export const AdminSchedulerTab: React.FC = () => {
  const [courts, setCourts] = useState<CourtItem[]>([
    { id: 'court-viva-1', name: 'کورت ۱ پانورامیک (ویوا مینی‌سیتی)', club_id: 'club-viva' },
    { id: 'court-rev-1', name: 'کورت ۱ پانورامیک (انقلاب)', club_id: 'club-enghelab' },
    { id: 'court-rev-2', name: 'کورت ۲ سنترال (انقلاب)', club_id: 'club-enghelab' },
    { id: 'court-laf-1', name: 'کورت روباز ۱ (لفور آجودانیه)', club_id: 'club-lafour' },
    { id: 'court-vel-1', name: 'کورت ۱ روباز (بام ولنجک)', club_id: 'club-velenjak' }
  ]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('court-rev-1');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    start_hour: 8,
    end_hour: 24,
    slot_duration_minutes: 90,
    hourly_rate: 2500000
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const club = courts.find((c) => c.id === selectedCourtId);
      if (club) {
        const cal = await rallyApi.getClubCalendar(club.club_id, selectedDate);
        if (cal && cal.slots) {
          const courtSlots = cal.slots.filter((s: any) => s.court_id === selectedCourtId);
          setSlots(courtSlots);
        } else {
          setSlots([]);
        }
      }
    } catch {
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedCourtId, selectedDate]);

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setStatusMsg(null);
    try {
      const res = await rallyApi.generateAdminCourtSlots(selectedCourtId, batchForm);
      if (res.success) {
        setStatusMsg({ type: 'success', text: `تعداد ${res.data?.slots_created || 0} سانس با موفقیت تولید شد.` });
        setIsBatchModalOpen(false);
        fetchSlots();
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'خطا در تولید سانس‌ها' });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSlotStatus = async (slotId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
    const res = await rallyApi.updateAdminSlot(slotId, { status: nextStatus });
    if (res.success) {
      setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: nextStatus as any } : s)));
    } else {
      alert(res.error || 'خطا در تغییر وضعیت سانس');
    }
  };

  const statusColor: Record<string, string> = {
    AVAILABLE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    BLOCKED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    BOOKED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    TOURNAMENT_HOLD: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rally-primary" />
            <span>زمان‌بندی و تولید هوشمند سانس‌های کورت (Court Scheduler)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تولید تقویم سانس‌ها به صورت دسته‌ای، کنترل اشغال کورت‌ها و مسدودسازی آنی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-4 py-2 bg-rally-primary hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تولید دسته‌ای سانس‌ها</span>
          </button>
          <button onClick={fetchSlots} className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rally-primary' : ''}`} />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Selectors Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">انتخاب کورت</label>
          <select
            value={selectedCourtId}
            onChange={(e) => setSelectedCourtId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            {courts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">تاریخ مشاهده</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
          />
        </div>
      </div>

      {/* Slots Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center justify-between">
          <span>سانس‌های تعریف شده برای تاریخ {selectedDate}</span>
          <span className="text-xs text-slate-400 font-normal">{slots.length} سانس موجود</span>
        </h3>

        {slots.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
            برای این تاریخ و کورت هنوز سانسی تولید نشده است. با دکمه بالا «تولید دسته‌ای سانس‌ها» را بزنید.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((s) => (
              <div key={s.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {s.start_time?.slice(0, 5)} تا {s.end_time?.slice(0, 5)}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor[s.status] || 'text-slate-400'}`}>
                    {s.status === 'AVAILABLE' ? 'آزاد' : s.status === 'BOOKED' ? 'رزرو شده' : s.status === 'BLOCKED' ? 'مسدود' : 'تورنمنت'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-xs font-bold text-rally-primary">{s.price?.toLocaleString('fa-IR')} تومان</span>
                  {s.status !== 'BOOKED' && (
                    <button
                      onClick={() => handleToggleSlotStatus(s.id, s.status)}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        s.status === 'AVAILABLE'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {s.status === 'AVAILABLE' ? 'مسدودسازی' : 'بازگشایی'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Generation Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setIsBatchModalOpen(false)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rally-primary" />
              <span>تولید زمان‌بندی دوره‌ای سانس‌ها</span>
            </h3>

            <form onSubmit={handleGenerateSlots} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">از تاریخ</label>
                  <input type="date" value={batchForm.start_date} onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">تا تاریخ</label>
                  <input type="date" value={batchForm.end_date} onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ساعت شروع روزانه</label>
                  <input type="number" min="0" max="23" value={batchForm.start_hour} onChange={(e) => setBatchForm({ ...batchForm, start_hour: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ساعت پایان روزانه</label>
                  <input type="number" min="1" max="24" value={batchForm.end_hour} onChange={(e) => setBatchForm({ ...batchForm, end_hour: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">مدت هر سانس (دقیقه)</label>
                  <select value={batchForm.slot_duration_minutes} onChange={(e) => setBatchForm({ ...batchForm, slot_duration_minutes: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                    <option value="60">۶۰ دقیقه (۱ ساعت)</option>
                    <option value="90">۹۰ دقیقه (۱.۵ ساعت استاندارد)</option>
                    <option value="120">۱۲۰ دقیقه (۲ ساعت مسابقه)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">تعرفه هر سانس (تومان)</label>
                  <input type="number" step="50000" value={batchForm.hourly_rate} onChange={(e) => setBatchForm({ ...batchForm, hourly_rate: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsBatchModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-bold">انصراف</button>
                <button type="submit" disabled={isGenerating} className="px-5 py-2 bg-rally-primary text-white rounded-xl font-bold disabled:opacity-50">
                  {isGenerating ? 'در حال ایجاد...' : 'تولید سانس‌ها'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

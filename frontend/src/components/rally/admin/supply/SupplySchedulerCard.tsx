import React, { useState, useEffect } from 'react';
import { Clock, Play, Power, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { rallyApi } from '../../../../services/rallyApi';

interface SupplySchedulerCardProps {
  onRefreshRules?: () => void;
  showToast: (msg: string) => void;
}

export const SupplySchedulerCard: React.FC<SupplySchedulerCardProps> = ({
  onRefreshRules,
  showToast,
}) => {
  const [enabled, setEnabled] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [nextRunAt, setNextRunAt] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [isToggling, setIsToggling] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const fetchStatus = async () => {
    const res = await rallyApi.getSupplySchedulerStatus();
    if (res) {
      setEnabled(res.enabled ?? true);
      setIsRunning(res.is_running ?? false);
      setLastRunAt(res.last_run_at ?? null);
      setNextRunAt(res.next_run_at ?? null);
      setLastStatus(res.last_status ?? null);
      setSyncedCount(res.synced_rules_count ?? 0);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setIsToggling(true);
    const newStatus = !enabled;
    const res = await rallyApi.toggleSupplyScheduler(newStatus);
    setIsToggling(false);
    if (res?.success) {
      setEnabled(newStatus);
      showToast(newStatus ? '✅ پایش خودکار روزانه فعال شد.' : '⏸️ پایش خودکار روزانه غیرفعال شد.');
      fetchStatus();
    } else {
      showToast(`⚠️ ${res?.error || 'خطا در تغییر وضعیت زمان‌بند'}`);
    }
  };

  const handleRunNow = async () => {
    setIsTriggering(true);
    const res = await rallyApi.runSupplySchedulerNow();
    setIsTriggering(false);
    if (res?.success) {
      showToast(`✅ پایش روزانه سایت‌های رفرنس انجام شد (${res.data?.synced_rules_count || 0} سورس آپدیت شدند).`);
      fetchStatus();
      if (onRefreshRules) onRefreshRules();
    } else {
      showToast(`⚠️ ${res?.error || 'خطا در اجرای پایش روزانه'}`);
    }
  };

  const formatPersianDate = (isoString?: string | null) => {
    if (!isoString) return 'هنوز انجام نشده';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('fa-IR');
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${enabled ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
          <Clock className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">پایش خودکار و روزانه سایت‌های رفرنس (Daily Zero-Token Crawler)</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {enabled ? 'فعال (هر ۲۴ ساعت)' : 'غیرفعال'}
            </span>
            {lastStatus === 'SUCCESS' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <CheckCircle className="w-3 h-3" /> موفق
              </span>
            )}
            {lastStatus === 'ERROR' && (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                <AlertTriangle className="w-3 h-3" /> دارای خطا
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
            <span>آخرین پایش: <strong className="text-slate-200">{formatPersianDate(lastRunAt)}</strong> ({syncedCount} سورس)</span>
            <span>پایش بعدی: <strong className="text-slate-200">{formatPersianDate(nextRunAt)}</strong></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center">
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            enabled
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{enabled ? 'غیرفعال‌سازی' : 'فعال‌سازی'}</span>
        </button>

        <button
          onClick={handleRunNow}
          disabled={isTriggering || isRunning}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-sky-950"
        >
          {isTriggering || isRunning ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>پایش روزانه فوری</span>
        </button>
      </div>
    </div>
  );
};

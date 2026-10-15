import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, AlertOctagon, Check, Trash2, RefreshCw } from 'lucide-react';
import { rallyApi } from '../../../../services/rallyApi';

export interface SupplyAlert {
  id: string;
  rule_id: string;
  source_name: string;
  product_id: string;
  alert_type: 'PRICE_SURGE' | 'STOCK_OUT';
  old_price?: number;
  new_price?: number;
  percent_change?: number;
  created_at: string;
  is_acknowledged: boolean;
  message: string;
}

interface SupplyAlertsViewProps {
  showToast: (msg: string) => void;
  onAlertCountChange?: (count: number) => void;
}

export const SupplyAlertsView: React.FC<SupplyAlertsViewProps> = ({ showToast, onAlertCountChange }) => {
  const [alerts, setAlerts] = useState<SupplyAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [unackOnly, setUnackOnly] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    const res = await rallyApi.getSupplyPriceAlerts(unackOnly);
    if (res?.success) {
      setAlerts(res.alerts || []);
      if (onAlertCountChange) onAlertCountChange(res.unacknowledged_count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, [unackOnly]);

  const handleAcknowledge = async (id: string) => {
    const res = await rallyApi.acknowledgeSupplyPriceAlert(id);
    if (res?.success) {
      showToast('✅ هشدار تایید و خوانده شد.');
      loadAlerts();
    } else {
      showToast('⚠️ خطا در تایید هشدار');
    }
  };

  const handleClearAcknowledged = async () => {
    const res = await rallyApi.clearAcknowledgedSupplyAlerts();
    if (res?.success) {
      showToast(`✅ ${res.cleared_count || 0} هشدار تاییدشده پاکسازی شدند.`);
      loadAlerts();
    }
  };

  const formatPersianDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('fa-IR');
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnackOnly(true)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              unackOnly ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            نیازمند بررسی
          </button>
          <button
            onClick={() => setUnackOnly(false)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              !unackOnly ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            همه هشدارها ({alerts.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAlerts}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="به‌روزرسانی"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClearAcknowledged}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 font-bold transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>پاکسازی خوانده‌شده‌ها</span>
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <p className="font-bold text-white text-sm">هیچ هشداری وجود ندارد</p>
          <p className="text-slate-400 text-xs">قیمت‌های تمام سایت‌های رفرنس پایدار بوده و هیچ جهش نامتعارف یا ناموجودی گزارش نشده است.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const isSurge = alert.alert_type === 'PRICE_SURGE';
            const isIncrease = (alert.percent_change || 0) > 0;

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  alert.is_acknowledged
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : isSurge
                    ? 'bg-amber-950/20 border-amber-800/60 shadow-lg shadow-amber-950/20'
                    : 'bg-rose-950/20 border-rose-800/60 shadow-lg shadow-rose-950/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    isSurge
                      ? isIncrease ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {isSurge ? (
                      isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
                    ) : (
                      <AlertOctagon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{alert.source_name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-sky-300">
                        {alert.product_id}
                      </span>
                      {isSurge && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isIncrease ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {isIncrease ? 'جهش +' : 'کاهش -'}{Math.abs(alert.percent_change || 0)}%
                        </span>
                      )}
                      {!isSurge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          ناموجود در منبع
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{alert.message}</p>
                    <p className="text-slate-500 text-[10px]">{formatPersianDate(alert.created_at)}</p>
                  </div>
                </div>

                {!alert.is_acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition-all cursor-pointer self-end sm:self-center flex-shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>بررسی شد</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

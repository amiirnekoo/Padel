import React from 'react';
import { ExternalLink, RefreshCw, Trash2, Power } from 'lucide-react';
import { SupplyRuleItem } from './SupplyRulesModal';

interface SupplySourceListProps {
  rules: SupplyRuleItem[];
  syncingId: string | null;
  onSync: (ruleId: string) => void;
  onUpdateMarkup: (ruleId: string, markup: number) => void;
  onUpdateDelivery: (ruleId: string, deliveryTime: string) => void;
  onToggleActive: (ruleId: string, isActive: boolean) => void;
  onDelete: (ruleId: string) => void;
}

export const SupplySourceList: React.FC<SupplySourceListProps> = ({
  rules,
  syncingId,
  onSync,
  onUpdateMarkup,
  onUpdateDelivery,
  onToggleActive,
  onDelete,
}) => {
  if (rules.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
        هیچ سایت رفرنسی در این بخش ثبت نشده است. از دکمه «افزودن منبع رفرنس جدید» استفاده کنید.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
      <table className="w-full text-right text-xs table-fixed">
        <colgroup>
          <col className="w-36" />
          <col className="w-56" />
          <col className="w-24" />
          <col className="w-36" />
          <col className="w-28" />
          <col className="w-28" />
        </colgroup>
        <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800">
          <tr>
            <th className="p-3">نام تامین‌کننده</th>
            <th className="p-3">آدرس سایت رفرنس</th>
            <th className="p-3 text-center">سود مصوب</th>
            <th className="p-3">زمان تحویل</th>
            <th className="p-3 text-center">وضعیت</th>
            <th className="p-3 text-center">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {rules.map((rule) => {
            const isSyncing = syncingId === rule.id;
            return (
              <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-white flex items-center gap-1.5 truncate">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        rule.is_active ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    />
                    <span className="truncate">{rule.source_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    ارز: {rule.currency} | برند: {rule.brand}
                  </span>
                </td>

                <td className="p-3 truncate">
                  <a
                    href={rule.base_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1 text-[11px] truncate"
                    title={rule.base_url}
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{rule.base_url}</span>
                  </a>
                  {rule.last_sync_at && (
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      آخرین پایش: {rule.last_sync_at}
                    </span>
                  )}
                </td>

                <td className="p-3 text-center">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      defaultValue={rule.markup_percent}
                      onBlur={(e) => onUpdateMarkup(rule.id, parseFloat(e.target.value) || 0)}
                      className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                    />
                    <span className="text-slate-400 text-xs">٪</span>
                  </div>
                </td>

                <td className="p-3">
                  <input
                    type="text"
                    defaultValue={rule.delivery_time}
                    onBlur={(e) => onUpdateDelivery(rule.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  />
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => onToggleActive(rule.id, !rule.is_active)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      rule.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{rule.is_active ? 'فعال در رفرنس' : 'غیرفعال'}</span>
                  </button>
                </td>

                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onSync(rule.id)}
                      disabled={isSyncing}
                      title="استعلام بلادرنگ این سورس"
                      className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => onDelete(rule.id)}
                      title="حذف سورس رفرنس"
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

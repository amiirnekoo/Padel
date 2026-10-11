import React, { useState, useEffect } from 'react';
import { X, Globe, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Sliders } from 'lucide-react';
import { rallyApi } from '../../../../services/rallyApi';

export interface SupplyRuleItem {
  id: string;
  source_name: string;
  base_url: string;
  brand: string;
  markup_percent: number;
  currency: string;
  delivery_time: string;
  supply_mode: 'INSTANT' | 'EUROPE';
  is_active: boolean;
  last_sync_at?: string;
  last_sync_status?: string;
  synced_products_count?: number;
}

interface SupplyRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRulesUpdated?: () => void;
}

export const SupplyRulesModal: React.FC<SupplyRulesModalProps> = ({
  isOpen,
  onClose,
  onRulesUpdated
}) => {
  const [rules, setRules] = useState<SupplyRuleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // New rule state
  const [newSource, setNewSource] = useState({
    source_name: '',
    base_url: '',
    brand: 'Nox',
    markup_percent: 4.0,
    currency: 'TOMAN',
    delivery_time: 'تحویل فوری ۲۴ ساعته',
    supply_mode: 'INSTANT' as 'INSTANT' | 'EUROPE'
  });

  const loadRules = async () => {
    setLoading(true);
    const res = await rallyApi.getSupplyRules();
    if (res?.rules) {
      setRules(res.rules);
    } else {
      // Fallback local defaults
      setRules([
        {
          id: 'rule-sunsport-nox',
          source_name: 'سان اسپرت ایران (موجودی تهران)',
          base_url: 'https://sunsportiran.com/category/sports-equipment/racket-padel/',
          brand: 'Nox',
          markup_percent: 4.0,
          currency: 'TOMAN',
          delivery_time: 'تحویل فوری ۲۴ ساعته',
          supply_mode: 'INSTANT',
          is_active: true
        },
        {
          id: 'rule-funpadel-europe',
          source_name: 'فان‌پدل پرتغال (سفارش اروپا)',
          base_url: 'https://funpadel.pt/pt/padel-raquetes/nox',
          brand: 'Nox',
          markup_percent: 40.0,
          currency: 'EUR',
          delivery_time: '۴ الی ۶ هفته',
          supply_mode: 'EUROPE',
          is_active: true
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadRules();
    }
  }, [isOpen]);

  const handleSyncNow = async (ruleId: string) => {
    setSyncingId(ruleId);
    const res = await rallyApi.syncSupplyRule(ruleId);
    setSyncingId(null);
    if (res?.success) {
      setNotification(`✅ همگام‌سازی موفق: ${res.data?.synced_count || 0} کالا با سود تعیین‌شده به‌روز شدند.`);
      loadRules();
      if (onRulesUpdated) onRulesUpdated();
    } else {
      setNotification(`⚠️ ${res?.error || 'خطا در ارتباط با سایت تامین‌کننده'}`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateMarkup = async (ruleId: string, markup_percent: number) => {
    await rallyApi.updateSupplyRule(ruleId, { markup_percent });
    setRules((prev) => prev.map((r) => r.id === ruleId ? { ...r, markup_percent } : r));
    setNotification('✅ درصد سود تامین‌کننده ذخیره شد.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateDelivery = async (ruleId: string, delivery_time: string) => {
    await rallyApi.updateSupplyRule(ruleId, { delivery_time });
    setRules((prev) => prev.map((r) => r.id === ruleId ? { ...r, delivery_time } : r));
  };

  const handleToggleActive = async (ruleId: string, is_active: boolean) => {
    await rallyApi.updateSupplyRule(ruleId, { is_active });
    setRules((prev) => prev.map((r) => r.id === ruleId ? { ...r, is_active } : r));
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('آیا از حذف این منبع تامین اطمینان دارید؟')) return;
    await rallyApi.deleteSupplyRule(ruleId);
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.source_name || !newSource.base_url) return;
    const res = await rallyApi.createSupplyRule(newSource);
    if (res?.success) {
      setIsAdding(false);
      setNewSource({
        source_name: '',
        base_url: '',
        brand: 'Nox',
        markup_percent: 4.0,
        currency: 'TOMAN',
        delivery_time: 'تحویل فوری ۲۴ ساعته',
        supply_mode: 'INSTANT'
      });
      loadRules();
      setNotification('✅ سورس تامین جدید با موفقیت اضافه شد.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">موتور تامین هوشمند و قیمت‌گذاری خودکار</h2>
              <p className="text-xs text-slate-400">مدیریت سایت‌های رفرنس، درصد سود و زمان تحویل بدون مصرف توکن</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {notification && (
            <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/80 text-sky-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>{notification}</span>
            </div>
          )}

          {/* Rules Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-right text-xs table-fixed">
              <colgroup>
                <col className="w-40" />
                <col className="w-56" />
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-36" />
                <col className="w-32" />
              </colgroup>
              <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">نام تامین‌کننده</th>
                  <th className="p-3">آدرس سایت رفرنس</th>
                  <th className="p-3">درصد سود</th>
                  <th className="p-3">نوع تامین</th>
                  <th className="p-3">زمان تحویل</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        <span>{rule.source_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">برند: {rule.brand} ({rule.currency})</span>
                    </td>
                    <td className="p-3 truncate">
                      <a href={rule.base_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1 text-[11px] truncate">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{rule.base_url}</span>
                      </a>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          defaultValue={rule.markup_percent}
                          onBlur={(e) => handleUpdateMarkup(rule.id, parseFloat(e.target.value) || 0)}
                          className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-white text-xs"
                        />
                        <span className="text-slate-400 text-xs">٪</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        rule.supply_mode === 'INSTANT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {rule.supply_mode === 'INSTANT' ? 'انبار داخلی' : 'اروپا 🇪🇺'}
                      </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        defaultValue={rule.delivery_time}
                        onBlur={(e) => handleUpdateDelivery(rule.id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSyncNow(rule.id)}
                          disabled={syncingId === rule.id}
                          title="همگام‌سازی بلادرنگ اکنون"
                          className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === rule.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          title="حذف قانون"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Rule Section */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-800/60 px-4 py-2.5 rounded-xl cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن منبع تامین رفرنس جدید</span>
            </button>
          ) : (
            <form onSubmit={handleAddSubmit} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-400" />
                <span>تعریف سورس تامین جدید</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="نام تامین‌کننده (مثلا: سان اسپرت)"
                  value={newSource.source_name}
                  onChange={(e) => setNewSource({ ...newSource, source_name: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <input
                  type="url"
                  placeholder="آدرس سایت رفرنس (URL)"
                  value={newSource.base_url}
                  onChange={(e) => setNewSource({ ...newSource, base_url: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="درصد سود (مثلا: 4)"
                    value={newSource.markup_percent}
                    onChange={(e) => setNewSource({ ...newSource, markup_percent: parseFloat(e.target.value) || 0 })}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                  <select
                    value={newSource.supply_mode}
                    onChange={(e) => setNewSource({ ...newSource, supply_mode: e.target.value as any })}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
                  >
                    <option value="INSTANT">انبار داخلی</option>
                    <option value="EUROPE">سفارش اروپا</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer">انصراف</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer">ذخیره قانون</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

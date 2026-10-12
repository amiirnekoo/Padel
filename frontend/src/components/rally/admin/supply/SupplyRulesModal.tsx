import React, { useState, useEffect } from 'react';
import { X, Sliders, RefreshCw, Plus, CheckCircle2, Award } from 'lucide-react';
import { rallyApi } from '../../../../services/rallyApi';
import { SupplySourceList } from './SupplySourceList';
import { SupplySourceAddForm } from './SupplySourceAddForm';
import { SupplyBestPriceReport } from './SupplyBestPriceReport';

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
  latest_prices?: Record<string, number>;
}

interface SupplyRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRulesUpdated?: () => void;
}

export const SupplyRulesModal: React.FC<SupplyRulesModalProps> = ({
  isOpen,
  onClose,
  onRulesUpdated,
}) => {
  const [rules, setRules] = useState<SupplyRuleItem[]>([]);
  const [activeTab, setActiveTab] = useState<'INSTANT' | 'EUROPE' | 'BEST_PRICE'>('INSTANT');
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const loadRules = async () => {
    setLoading(true);
    const res = await rallyApi.getSupplyRules();
    if (res?.rules && res.rules.length > 0) {
      setRules(res.rules);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadRules();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSyncSingle = async (ruleId: string) => {
    setSyncingId(ruleId);
    const res = await rallyApi.syncSupplyRule(ruleId);
    setSyncingId(null);
    if (res?.success) {
      showToast(`✅ همگام‌سازی موفق: ${res.data?.synced_count || 0} کالا پایش شدند.`);
      loadRules();
      if (onRulesUpdated) onRulesUpdated();
    } else {
      showToast(`⚠️ ${res?.error || 'خطا در ارتباط با سایت تامین‌کننده'}`);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    const targetMode = activeTab === 'BEST_PRICE' ? undefined : activeTab;
    const res = await rallyApi.syncAllSupplyRules(targetMode);
    setSyncingAll(false);
    if (res?.success) {
      showToast('✅ پایش جامع و استخراج ارزان‌ترین قیمت‌ها از تمام سایت‌های رفرنس انجام شد.');
      loadRules();
      if (onRulesUpdated) onRulesUpdated();
    } else {
      showToast('⚠️ خطا در همگام‌سازی دسته‌ای سورس‌ها');
    }
  };

  const handleUpdateMarkup = async (ruleId: string, markup_percent: number) => {
    await rallyApi.updateSupplyRule(ruleId, { markup_percent });
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, markup_percent } : r)));
    showToast('✅ درصد سود ذخیره شد.');
  };

  const handleUpdateDelivery = async (ruleId: string, delivery_time: string) => {
    await rallyApi.updateSupplyRule(ruleId, { delivery_time });
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, delivery_time } : r)));
  };

  const handleToggleActive = async (ruleId: string, is_active: boolean) => {
    await rallyApi.updateSupplyRule(ruleId, { is_active });
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, is_active } : r)));
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('آیا از حذف این منبع رفرنس اطمینان دارید؟')) return;
    await rallyApi.deleteSupplyRule(ruleId);
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    showToast('منبع رفرنس حذف شد.');
  };

  const handleAddSubmit = async (newSource: any) => {
    const res = await rallyApi.createSupplyRule(newSource);
    if (res?.success) {
      setIsAdding(false);
      loadRules();
      showToast('✅ سورس رفرنس جدید با موفقیت اضافه شد.');
    } else {
      showToast(`⚠️ ${res?.error || 'خطا در ثبت سورس'}`);
    }
  };

  if (!isOpen) return null;

  const domesticRules = rules.filter((r) => r.supply_mode === 'INSTANT');
  const europeRules = rules.filter((r) => r.supply_mode === 'EUROPE');
  const displayedRules = activeTab === 'INSTANT' ? domesticRules : europeRules;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                موتور تامین چندمنبعی و انتخاب ارزان‌ترین قیمت (Best Price)
              </h2>
              <p className="text-xs text-slate-400">
                مدیریت ۵ سایت رفرنس تامین داخلی و ۵ سایت رفرنس اروپا با استعلام خودکار و انتخاب کمترین قیمت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar & Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('INSTANT'); setIsAdding(false); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'INSTANT'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🇮🇷 ۵ سورس انبار داخلی</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/25 text-[10px]">{domesticRules.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('EUROPE'); setIsAdding(false); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'EUROPE'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🇪🇺 ۵ سورس سفارش اروپا</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/25 text-[10px]">{europeRules.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('BEST_PRICE'); setIsAdding(false); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'BEST_PRICE'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>نتایج ارزان‌ترین قیمت‌ها</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
              <span>پایش و کشف ارزان‌ترین‌ها</span>
            </button>

            {activeTab !== 'BEST_PRICE' && !isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>سورس جدید</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Active Rounding Policy Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="font-bold text-white">قانون مصوب رندسازی قیمت‌ها:</span>
              <span className="text-slate-400">قیمت راکت‌ها بدون خرده در پله‌های ۵۰۰,۰۰۰ تومانی به بالا (Ceil) رند می‌شوند.</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
              گام ۵۰۰,۰۰۰ تومان (Ceil)
            </span>
          </div>

          {notification && (
            <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/80 text-sky-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {isAdding && (
            <SupplySourceAddForm
              defaultMode={activeTab === 'EUROPE' ? 'EUROPE' : 'INSTANT'}
              onAdd={handleAddSubmit}
              onCancel={() => setIsAdding(false)}
            />
          )}

          {activeTab === 'BEST_PRICE' ? (
            <SupplyBestPriceReport mode="INSTANT" />
          ) : (
            <SupplySourceList
              rules={displayedRules}
              syncingId={syncingId}
              onSync={handleSyncSingle}
              onUpdateMarkup={handleUpdateMarkup}
              onUpdateDelivery={handleUpdateDelivery}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteRule}
            />
          )}
        </div>
      </div>
    </div>
  );
};

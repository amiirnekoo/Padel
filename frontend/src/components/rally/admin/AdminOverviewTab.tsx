import React from 'react';
import { Activity, ShieldAlert, ShoppingBag, Zap, Building2, AlertTriangle, CheckCircle2, ArrowUpRight, Plus } from 'lucide-react';
import { ShopProduct, MatchmakingGameItem } from '../../../types/rally';

interface AdminOverviewTabProps {
  productsCount: number;
  matchesCount: number;
  openIncidentsCount: number;
  systemStats: any;
  onOpenSOSModal: () => void;
  onNavigateToTab: (tab: 'inventory' | 'matches' | 'incidents') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  productsCount,
  matchesCount,
  openIncidentsCount,
  systemStats,
  onOpenSOSModal,
  onNavigateToTab
}) => {
  const KPIS = [
    {
      title: 'تعداد محصولات فعال انبار',
      value: productsCount.toLocaleString('fa-IR'),
      sub: 'کلکسیون‌های ۲۰۲۶ و پایه',
      icon: ShoppingBag,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      action: () => onNavigateToTab('inventory')
    },
    {
      title: 'مسابقات مچ‌میکینگ در جریان',
      value: matchesCount.toLocaleString('fa-IR'),
      sub: 'کورت‌های فعال دابلز ۴ نفره',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      action: () => onNavigateToTab('matches')
    },
    {
      title: 'گزارش‌های اضطراری باز (SOS)',
      value: openIncidentsCount.toLocaleString('fa-IR'),
      sub: openIncidentsCount === 0 ? 'وضعیت عادی و پایدار' : 'نیازمند بررسی مالک',
      icon: ShieldAlert,
      color: openIncidentsCount === 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20',
      action: () => onNavigateToTab('incidents')
    },
    {
      title: 'کورت‌های عملیاتی پدل و تنیس',
      value: (systemStats?.total_courts || 14).toLocaleString('fa-IR'),
      sub: 'باشگاه‌های همکار تهران',
      icon: Building2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      action: () => onNavigateToTab('matches')
    }
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner with SOS Alert Button */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white">مرکز فرماندهی عملیات پلتفرم پدل (رالی)</h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                سیستم آنلاین
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">مدیریت روان انبار، سفارشات و نظارت بدون ریسک تخریب ساختار سیستم</p>
          </div>
        </div>

        <button
          onClick={onOpenSOSModal}
          className="px-4 py-2.5 rounded-2xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 border border-red-500 transition-all cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>ارسال گزارش اضطراری (SOS به مالک)</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              onClick={kpi.action}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>

              <div className="mt-4">
                <div className="text-2xl font-black font-mono text-white">{kpi.value}</div>
                <div className="text-xs font-bold text-slate-300 mt-1">{kpi.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Instructions for Operations Admin */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-xs space-y-2.5 text-slate-300">
        <h4 className="font-bold text-white flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>دستورالعمل‌های ایمنی پنل ادمین عملیاتی</span>
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
          <li className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rally-primary" />
            <span>تغییرات موجودی انبار به صورت آنی در فروشگاه اعمال می‌شود.</span>
          </li>
          <li className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rally-primary" />
            <span>لغو اضطراری مچ‌میکینگ بلافاصله وجه را به کیف پول بازیکنان برمی‌گرداند.</span>
          </li>
          <li className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rally-primary" />
            <span>پایگاه داده اصلی و کدهای پروژه در برابر خطای انسانی ۱۰۰٪ ایزوله هستند.</span>
          </li>
          <li className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rally-primary" />
            <span>در صورت بروز هرگونه اختلال یا مغایرت از دکمه SOS گزارش ارسال کنید.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

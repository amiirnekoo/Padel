import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Zap, ShieldAlert, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react';
import { ShopProduct, MatchmakingGameItem } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';
import { AdminOverviewTab } from '../../../components/rally/admin/AdminOverviewTab';
import { AdminInventoryTab } from '../../../components/rally/admin/AdminInventoryTab';
import { AdminMatchesMonitorTab } from '../../../components/rally/admin/AdminMatchesMonitorTab';
import { AdminIncidentModal } from '../../../components/rally/admin/AdminIncidentModal';
import { AdminNewProductModal } from '../../../components/rally/admin/AdminNewProductModal';

interface AdminPortalPageProps {
  products: ShopProduct[];
  onUpdateProduct: (productId: string, updates: Partial<ShopProduct>) => void;
  onAddProduct: (product: ShopProduct) => void;
  onExitAdmin: () => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  products,
  onUpdateProduct,
  onAddProduct,
  onExitAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'matches' | 'incidents'>('overview');
  const [matches, setMatches] = useState<MatchmakingGameItem[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [matchesRes, incs, stats] = await Promise.all([
        rallyApi.getMatchmakingGames(),
        rallyApi.getAdminIncidents(),
        rallyApi.getAdminStats()
      ]);

      if (matchesRes && matchesRes.games) {
        setMatches(matchesRes.games);
      }
      setIncidents(incs || []);
      setSystemStats(stats || null);
    } catch {
      // offline/fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const openIncidentsCount = incidents.filter((i) => !i.is_resolved).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rally-primary text-white flex items-center justify-center font-black text-sm">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">پنل مدیریت اختصاصی رالی</span>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                ادمین عملیاتی
              </span>
            </div>
            <span className="text-[10px] text-slate-400">دسترسی امن به انبار، مسابقات و سفارش‌ها</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="به‌روزرسانی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rally-primary' : ''}`} />
          </button>

          <button
            onClick={onExitAdmin}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>بازگشت به سایت</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-l border-slate-800 p-3 sm:p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-rally-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>داشبورد و آمار کلان</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-rally-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>مدیریت انبار و کالاها</span>
            </div>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full font-mono font-bold text-slate-300">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-rally-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>مانیتورینگ مچ‌میکینگ</span>
            </div>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full font-mono font-bold text-slate-300">
              {matches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'incidents'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>گزارش‌های SOS و حوادث</span>
            </div>
            {openIncidentsCount > 0 && (
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                {openIncidentsCount} باز
              </span>
            )}
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              productsCount={products.length}
              matchesCount={matches.length}
              openIncidentsCount={openIncidentsCount}
              systemStats={systemStats}
              onOpenSOSModal={() => setIsSOSOpen(true)}
              onNavigateToTab={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === 'inventory' && (
            <AdminInventoryTab
              products={products}
              onUpdateProduct={onUpdateProduct}
              onOpenNewProductModal={() => setIsNewProductOpen(true)}
            />
          )}

          {activeTab === 'matches' && (
            <AdminMatchesMonitorTab
              matches={matches}
              onRefresh={fetchAdminData}
            />
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h3 className="font-bold text-white text-sm">سوابق گزارش‌های اضطراری ارسالی به مالک</h3>
                  <p className="text-[11px] text-slate-400">ثبت وقایع مهم، قطعی‌ها یا نیازهای پشتیبانی جهت تصمیم‌گیری مدیریت</p>
                </div>
                <button
                  onClick={() => setIsSOSOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>ثبت گزارش اضطراری جدید</span>
                </button>
              </div>

              <div className="space-y-3">
                {incidents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
                    هیچ گزارش حاد یا اخطاری ثبت نشده است. سیستم در شرایط پایدار قرار دارد.
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div key={inc.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs sm:text-sm">{inc.title}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{inc.description}</p>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                        <span>ثبت شده توسط: {inc.reporter_name}</span>
                        <span>وضعیت: {inc.is_resolved ? 'حل شده' : 'در دست بررسی مالک'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AdminIncidentModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        onSuccess={fetchAdminData}
      />

      <AdminNewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onAddProduct={onAddProduct}
      />
    </div>
  );
};

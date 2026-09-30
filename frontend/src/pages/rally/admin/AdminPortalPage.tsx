import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Building2, UserCheck, DollarSign, Package, Zap, ShieldAlert, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { ShopProduct, MatchmakingGameItem } from '../../../types/rally';
import { rallyApi } from '../../../services/rallyApi';
import { AdminOverviewTab } from '../../../components/rally/admin/AdminOverviewTab';
import { AdminInventoryTab } from '../../../components/rally/admin/AdminInventoryTab';
import { AdminMatchesMonitorTab } from '../../../components/rally/admin/AdminMatchesMonitorTab';
import { AdminBookingsTab } from '../../../components/rally/admin/AdminBookingsTab';
import { AdminClubsTab } from '../../../components/rally/admin/AdminClubsTab';
import { AdminCoachesTab } from '../../../components/rally/admin/AdminCoachesTab';
import { AdminFinancesTab } from '../../../components/rally/admin/AdminFinancesTab';
import { AdminIncidentModal } from '../../../components/rally/admin/AdminIncidentModal';
import { AdminNewProductModal } from '../../../components/rally/admin/AdminNewProductModal';
import { AdminLoginModal } from '../../../components/rally/admin/AdminLoginModal';

export type AdminTab = 'overview' | 'bookings' | 'clubs' | 'coaches' | 'finances' | 'inventory' | 'matches' | 'incidents';

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
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('rally_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
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
      if (matchesRes && matchesRes.games) setMatches(matchesRes.games);
      setIncidents(incs || []);
      setSystemStats(stats || null);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) fetchAdminData();
  }, [adminUser]);

  const handleLogout = () => {
    sessionStorage.removeItem('rally_admin_token');
    sessionStorage.removeItem('rally_admin_user');
    setAdminUser(null);
    onExitAdmin();
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <AdminLoginModal isOpen={true} onClose={onExitAdmin} onLoginSuccess={(u) => setAdminUser(u)} />
      </div>
    );
  }

  const openIncidentsCount = incidents.filter((i) => !i.is_resolved).length;

  const sidebarItems: { id: AdminTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'داشبورد کلان', icon: LayoutDashboard },
    { id: 'bookings', label: 'رزروها و سانس‌ها', icon: Calendar },
    { id: 'clubs', label: 'باشگاه‌ها و کورت‌ها', icon: Building2 },
    { id: 'coaches', label: 'مربیان و تاییدیه‌ها', icon: UserCheck },
    { id: 'finances', label: 'تراکنش‌ها و تسویه', icon: DollarSign },
    { id: 'inventory', label: 'انبار و کالاها', icon: Package, count: products.length },
    { id: 'matches', label: 'مانیتورینگ بازی‌ها', icon: Zap, count: matches.length },
    { id: 'incidents', label: 'گزارش‌های SOS', icon: ShieldAlert, count: openIncidentsCount, badgeColor: 'bg-red-500/20 text-red-300' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rally-primary text-white flex items-center justify-center font-black text-sm">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">سامانه جامع مدیریت پلتفرم رالی (Admin Portal)</span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {adminUser?.full_name || 'ادمین ارشد'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">کنترل رزروها، باشگاه‌ها، مربیان، انبار و امور مالی</span>
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
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
          <button
            onClick={onExitAdmin}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>مشاهده وب‌سایت</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-l border-slate-800 p-3 sm:p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible flex-shrink-0">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? item.id === 'incidents' ? 'bg-red-600 text-white shadow-md' : 'bg-rally-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${item.badgeColor || 'bg-slate-950 text-slate-300'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Tabs */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              productsCount={products.length}
              matchesCount={matches.length}
              openIncidentsCount={openIncidentsCount}
              systemStats={systemStats}
              onOpenSOSModal={() => setIsSOSOpen(true)}
              onNavigateToTab={(t) => setActiveTab(t as AdminTab)}
            />
          )}
          {activeTab === 'bookings' && <AdminBookingsTab />}
          {activeTab === 'clubs' && <AdminClubsTab />}
          {activeTab === 'coaches' && <AdminCoachesTab />}
          {activeTab === 'finances' && <AdminFinancesTab />}
          {activeTab === 'inventory' && (
            <AdminInventoryTab products={products} onUpdateProduct={onUpdateProduct} onOpenNewProductModal={() => setIsNewProductOpen(true)} />
          )}
          {activeTab === 'matches' && <AdminMatchesMonitorTab matches={matches} onRefresh={fetchAdminData} />}
          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h3 className="font-bold text-white text-sm">سوابق گزارش‌های اضطراری SOS ارسالی به مالک</h3>
                  <p className="text-[11px] text-slate-400">ثبت وقایع مهم، قطعی‌ها یا نیازهای پشتیبانی فوری</p>
                </div>
                <button
                  onClick={() => setIsSOSOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>ثبت گزارش جدید</span>
                </button>
              </div>

              <div className="space-y-3">
                {incidents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
                    هیچ گزارش حادی ثبت نشده است. سیستم کاملاً پایدار است.
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div key={inc.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{inc.title}</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{inc.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <AdminIncidentModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} onSuccess={fetchAdminData} />
      <AdminNewProductModal isOpen={isNewProductOpen} onClose={() => setIsNewProductOpen(false)} onAddProduct={onAddProduct} />
    </div>
  );
};

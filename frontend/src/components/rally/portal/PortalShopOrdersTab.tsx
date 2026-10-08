import React, { useState, useEffect } from 'react';
import { ShoppingBag, PackageCheck, Truck, Clock, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface ShopOrder {
  order_id: string;
  created_at: string;
  total_amount: number;
  status: string;
  tracking_code?: string;
  items_summary?: string;
}

interface PortalShopOrdersTabProps {
  onNavigateToShop: () => void;
}

export const PortalShopOrdersTab: React.FC<PortalShopOrdersTabProps> = ({ onNavigateToShop }) => {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await rallyApi.getMyShopOrders();
      if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch {
      // در صورت خطا لیست خالی حفظ می‌شود
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header Bar */}
      <div className="bg-[#0B1E30] border border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rally-primary" />
            <h3 className="font-bold text-white text-base">سفارشات تجهیزات ورزشی شما</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            پیگیری وضعیت بسته‌بندی، ارسال و کد رهگیری پستی مرسولات خریداری شده از رالی استور
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
            title="به‌روزرسانی"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rally-primary' : ''}`} />
          </button>
          <button
            onClick={onNavigateToShop}
            className="px-3.5 py-2 bg-rally-primary hover:bg-rally-primary/80 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>مشاهده فروشگاه</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="bg-[#0B1E30] border border-white/10 rounded-2xl p-8 text-center text-slate-400 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs">تاکنون سفارشی از فروشگاه ثبت نکرده‌اید.</p>
            <button
              onClick={onNavigateToShop}
              className="px-4 py-2 bg-rally-primary text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-rally-primary/80"
            >
              خرید راکت و تجهیزات پدل
            </button>
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o.order_id}
              className="bg-[#0B1E30] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">سفارش #{o.order_id}</span>
                  <span className="text-xs text-slate-400">{o.created_at}</span>
                </div>
                <div className="text-xs text-slate-300">
                  <span>مبلغ کل: </span>
                  <strong className="text-[#D7ED68] font-extrabold">{o.total_amount?.toLocaleString('fa-IR')} تومان</strong>
                </div>
                {o.tracking_code && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-sky-400" />
                    <span>کد رهگیری پست پیشتاز: <strong className="text-slate-200 font-bold" dir="ltr">{o.tracking_code}</strong></span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {o.status || 'در حال آماده‌سازی'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

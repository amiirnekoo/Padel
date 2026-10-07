import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Truck, CheckCircle2, Clock, MapPin, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface PortalShopOrdersTabProps {
  onNavigateToShop?: () => void;
}

export const PortalShopOrdersTab: React.FC<PortalShopOrdersTabProps> = ({ onNavigateToShop }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rallyApi.getMyShopOrders();
      setOrders(data || []);
    } catch {
      setError('خطا در دریافت لیست سفارشات فروشگاه');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string, orderStatus?: string) => {
    if (orderStatus === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تحویل داده شده</span>
        </span>
      );
    }
    if (orderStatus === 'SHIPPED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
          <Truck className="w-3.5 h-3.5" />
          <span>ارسال با پست پیشتاز</span>
        </span>
      );
    }
    if (status === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
          <Package className="w-3.5 h-3.5" />
          <span>درحال آماده‌سازی و بسته‌بندی</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
        <Clock className="w-3.5 h-3.5" />
        <span>در انتظار پرداخت</span>
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0B1E30] border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">سفارشات فروشگاه تجهیزات رالی</h3>
            <p className="text-xs text-slate-300">سوابق خرید راکت، توپ، اکسسوری و پیگیری مرسولات پستی</p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D7ED68]' : ''}`} />
          <span>به‌روزرسانی وضعیت</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {isLoading && orders.length === 0 ? (
        <div className="p-12 text-center text-slate-300 bg-[#0B1E30] border border-white/10 rounded-3xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D7ED68] mb-2" />
          <p className="text-xs">در حال بارگذاری سوابق سفارشات...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#0B1E30] border border-white/10 rounded-3xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-white">هنوز سفارشی از فروشگاه ثبت نکرده‌اید</h4>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            انواع راکت‌های اورجینال پدل و تنیس، گریپ، کیف و توپ با ضمانت اصالت فیزیکی رالی آماده ارسال هستند.
          </p>
          {onNavigateToShop && (
            <button
              onClick={onNavigateToShop}
              className="mt-3 px-4 py-2.5 rounded-xl bg-[#D7ED68] text-[#07131F] font-black text-xs hover:brightness-110 cursor-pointer"
            >
              مشاهده محصولات فروشگاه
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord, idx) => (
            <div
              key={ord.order_id || idx}
              className="bg-[#0B1E30] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4"
            >
              {/* Order Card Top Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-black text-[#D7ED68] bg-[#D7ED68]/10 px-3 py-1 rounded-xl border border-[#D7ED68]/20">
                    {ord.tracking_code}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {ord.created_at?.split('T')[0] || ord.created_at}
                  </span>
                </div>
                {getStatusBadge(ord.status, ord.order_status)}
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {(ord.items || []).map((item: any, iIdx: number) => (
                  <div
                    key={iIdx}
                    className="p-3 bg-[#07131F] border border-white/5 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <Package className="w-5 h-5 text-[#D7ED68]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">{item.name_fa || item.title || 'محصول رالی'}</h5>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          تعداد: <span className="font-mono font-bold text-white">{item.quantity}</span> عدد
                        </div>
                      </div>
                    </div>
                    <div className="text-left font-mono text-xs font-bold text-slate-200">
                      {((item.total_price || item.unit_price * item.quantity) || 0).toLocaleString('fa-IR')}{' '}
                      <span className="text-[10px] text-slate-400 font-sans">تومان</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details & Summary Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-md">
                    آدرس: {ord.delivery_address || 'تهران'}
                  </span>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  {ord.shipping_tracking_code && (
                    <span className="text-[11px] text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      رهگیری پست: {ord.shipping_tracking_code}
                    </span>
                  )}
                  <div className="text-xs font-bold text-white">
                    مبلغ کل:{' '}
                    <span className="text-sm font-black text-[#D7ED68] font-mono">
                      {(ord.total_amount || 0).toLocaleString('fa-IR')}
                    </span>{' '}
                    تومان
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

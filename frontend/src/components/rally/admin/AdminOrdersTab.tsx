import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Truck, CheckCircle2, Clock, XCircle, Search, ExternalLink, RefreshCw, X } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface OrderItem {
  id: string;
  product_id: string;
  title_fa: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface OrderRecord {
  id: string;
  order_number: string;
  user_id: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  shipping_tracking_code?: string;
  admin_notes?: string;
  created_at: string;
  items?: OrderItem[];
}

export const AdminOrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async (status?: string) => {
    setIsLoading(true);
    try {
      const q = status && status !== 'ALL' ? status : undefined;
      const res = await rallyApi.getAdminOrders(q);
      setOrders(Array.isArray(res) ? res : []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(selectedStatus);
  }, [selectedStatus]);

  const handleOpenDetail = (order: OrderRecord) => {
    setActiveOrder(order);
    setNewStatus(order.order_status);
    setTrackingCode(order.shipping_tracking_code || '');
    setNotes(order.admin_notes || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      const res = await rallyApi.updateAdminOrderStatus(activeOrder.id, {
        order_status: newStatus,
        shipping_tracking_code: trackingCode.trim() || undefined,
        admin_notes: notes.trim() || undefined
      });
      if (res.success) {
        setActiveOrder(null);
        fetchOrders(selectedStatus);
      } else {
        alert(res.error || 'خطا در ثبت وضعیت');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    NEW: { label: 'جدید', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
    PROCESSING: { label: 'در حال بسته‌بندی', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Package },
    SHIPPED: { label: 'تحویل پست/تیپاکس', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Truck },
    DELIVERED: { label: 'تحویل شد', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    CANCELLED: { label: 'لغو شده', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: XCircle }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.receiver_name?.toLowerCase().includes(q) ||
      o.receiver_phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-rally-primary" />
            <span>مدیریت و ارسال سفارشات فروشگاه (Fulfillment)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            مشاهده خریدهای کاربران، تغییر وضعیت بسته‌بندی و درج کد رهگیری پستی
          </p>
        </div>
        <button
          onClick={() => fetchOrders(selectedStatus)}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="به‌روزرسانی"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rally-primary' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'NEW', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-rally-primary text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'همه سفارشات' : statusMap[st]?.label || st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو با شماره سفارش یا نام مشتری..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rally-primary pl-8"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-right">
            <colgroup>
              <col className="w-36" />
              <col className="w-36" />
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400">
                <th className="p-3.5">شماره سفارش</th>
                <th className="p-3.5">مشتری</th>
                <th className="p-3.5">مبلغ کل</th>
                <th className="p-3.5">روش پرداخت</th>
                <th className="p-3.5">وضعیت ارسال</th>
                <th className="p-3.5">تاریخ ثبت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {isLoading ? 'در حال بارگذاری...' : 'هیچ سفارشی یافت نشد.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const St = statusMap[ord.order_status] || statusMap.NEW;
                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-300 font-bold truncate">
                        {ord.order_number}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white truncate">{ord.receiver_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{ord.receiver_phone}</div>
                      </td>
                      <td className="p-3.5 font-bold text-rally-primary">
                        {ord.total_amount?.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-slate-400">تومان</span>
                      </td>
                      <td className="p-3.5 text-slate-300 text-[11px]">
                        {ord.payment_method === 'WALLET' ? 'کیف پول رالی' : 'درگاه شاپرک'}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${St.color}`}>
                          {St.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        {new Date(ord.created_at).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenDetail(ord)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-rally-primary hover:text-white text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          مدیریت
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setActiveOrder(null)}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-rally-primary" />
              <span>جزییات سفارش {activeOrder.order_number}</span>
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl space-y-2 text-xs border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>گیرنده:</span>
                <span className="text-white font-bold">{activeOrder.receiver_name} ({activeOrder.receiver_phone})</span>
              </div>
              <div className="text-slate-400">
                <span>آدرس ارسال: </span>
                <span className="text-slate-200">{activeOrder.delivery_address}</span>
              </div>
            </div>

            {/* Items */}
            {activeOrder.items && activeOrder.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">اقلام سفارش:</h4>
                <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs">
                  {activeOrder.items.map((it) => (
                    <div key={it.id} className="py-2 flex items-center justify-between">
                      <span className="text-white">{it.title_fa} × {it.quantity}</span>
                      <span className="text-rally-primary font-bold">{it.total_price?.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Update Status Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">وضعیت سفارش</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="NEW">جدید (ثبت شده)</option>
                  <option value="PROCESSING">در حال پردازش و انبارداری</option>
                  <option value="SHIPPED">تحویل شده به ناوگان پست / تیپاکس</option>
                  <option value="DELIVERED">تحویل نهایی به خریدار</option>
                  <option value="CANCELLED">لغو شده و استرداد وجه</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">کد رهگیری پستی / بارنامه</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="مثال: 94827011928492019"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">یادداشت داخلی ادمین</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="توضیحات بسته بندی، هماهنگی یا انبار..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-rally-primary text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isUpdating ? 'در حال ثبت...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

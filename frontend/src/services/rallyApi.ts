import { ShopProduct, CartItem, ShopOrderReceipt } from '../types/rally';

const API_BASE = '/api/v1';

export interface CheckoutPayload {
  user_id: string;
  items: { product_id: string; quantity: number }[];
  delivery_address: string;
  receiver_name: string;
  receiver_phone: string;
  payment_method: 'WALLET' | 'SHAPARAK';
  coupon_code?: string;
}

export const rallyApi = {
  /**
   * استعلام مانده زنده کیف پول کاربر از بک‌اند
   */
  async getWalletBalance(userId: string): Promise<number | null> {
    try {
      const res = await fetch(`${API_BASE}/wallet/balance?user_id=${userId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.balance_tomans || Math.floor(data.balance_rials / 10);
    } catch {
      return null;
    }
  },

  /**
   * محاسبه بلادرنگ سبد خرید و اعمال تخفیف از بک‌اند
   */
  async calculateCart(items: { product_id: string; quantity: number }[], couponCode?: string) {
    try {
      const res = await fetch(`${API_BASE}/shop/cart/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, coupon_code: couponCode || null }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * ثبت قطعی سفارش کالا در بک‌اند و کسر از کیف پول یا درگاه بانکی
   */
  async checkoutShopOrder(payload: CheckoutPayload): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/shop/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'خطا در ثبت سفارش فروشگاه' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'عدم برقراری ارتباط با سرور' };
    }
  },

  /**
   * قفل اتمیک ۱۰ دقیقه‌ای سانس در بک‌اند جهت جلوگیری از همروندی
   */
  async holdSlot(slotId: string, userId: string) {
    try {
      const res = await fetch(`${API_BASE}/slots/${slotId}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'امکان رزرو این سانس وجود ندارد' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در اتصال به موتور رزرو' };
    }
  },

  /**
   * پرداخت سانس رزرو شده از طریق موجودی کیف پول
   */
  async payBookingWithWallet(bookingId: string, userId: string) {
    try {
      const res = await fetch(`${API_BASE}/wallet/pay-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'خطا در تسویه با کیف پول' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور مالی' };
    }
  },
  /**
   * دریافت لیست عمومی باشگاه‌های تایید شده سراسر ایران
   */
  async getPublicVenues(city?: string, sport?: string) {
    try {
      const params = new URLSearchParams();
      if (city && city !== 'ALL' && city !== 'همه شهرها') params.append('city', city);
      if (sport && sport !== 'ALL') params.append('sport', sport);
      const url = `${API_BASE}/venues/public${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * دریافت تقویم زنده سانس‌های کورت‌های یک باشگاه برای تاریخ مشخص
   */
  async getClubCalendar(clubId: string, dateStr?: string) {
    try {
      const url = `${API_BASE}/clubs/${clubId}/calendar${dateStr ? `?date=${dateStr}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};

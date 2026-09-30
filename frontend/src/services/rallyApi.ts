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

  /**
   * دریافت کورت‌های متعلق به باشگاه
   */
  async getClubCourts(clubId: string) {
    try {
      const res = await fetch(`${API_BASE}/venues/${clubId}/courts`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * ثبت کورت جدید توسط باشگاه‌دار
   */
  async addCourt(clubId: string, courtData: any) {
    try {
      const res = await fetch(`${API_BASE}/venues/${clubId}/courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courtData),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت کورت' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در برقراری ارتباط' };
    }
  },

  /**
   * دریافت لیست بازی‌های مچ‌میکینگ آزاد
   */
  async getMatchmakingGames(skillLevel?: string, status: string = 'OPEN') {
    try {
      const params = new URLSearchParams();
      if (skillLevel && skillLevel !== 'ALL') params.append('skill_level', skillLevel);
      if (status) params.append('status', status);
      const res = await fetch(`${API_BASE}/matchmaking${params.toString() ? `?${params.toString()}` : ''}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * دریافت جزییات یک بازی مچ‌میکینگ
   */
  async getMatchmakingDetails(gameId: string) {
    try {
      const res = await fetch(`${API_BASE}/matchmaking/${gameId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * ایجاد بازی جدید مچ‌میکینگ ۴ نفره
   */
  async createMatchmakingGame(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/matchmaking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ایجاد مچ‌میکینگ' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  /**
   * پیوستن به پوزیشن خالی در مچ‌میکینگ ۴ نفره
   */
  async joinMatchmakingGame(gameId: string, userId: string, position: string) {
    try {
      const res = await fetch(`${API_BASE}/matchmaking/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, position }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در پیوستن به بازی' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  /**
   * دریافت آمار کلان داشبورد ادمین
   */
  async getAdminStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * دریافت لیست گزارش‌های اضطراری SOS
   */
  async getAdminIncidents(resolved?: boolean) {
    try {
      const url = resolved !== undefined ? `${API_BASE}/admin/incidents?resolved=${resolved}` : `${API_BASE}/admin/incidents`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * ثبت گزارش اضطراری جدید توسط ادمین به مالک پلتفرم
   */
  async reportAdminIncident(payload: { title: string; severity: string; category: string; description: string; reporter_name?: string }) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت گزارش' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  /**
   * لغو اضطراری بازی مچ‌میکینگ توسط ادمین با استرداد ۱۰۰٪ به بازیکنان
   */
  async emergencyCancelMatch(gameId: string, reason: string, adminName: string = 'ادمین عملیاتی') {
    try {
      const res = await fetch(`${API_BASE}/admin/matches/${gameId}/emergency-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, admin_name: adminName }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در لغو بازی' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  /**
   * احراز هویت و ورود ادمین عملیاتی
   */
  async adminLogin(username: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'نام کاربری یا رمز عبور اشتباه است.' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },
};



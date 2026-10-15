import { ShopProduct, CartItem, ShopOrderReceipt, PlayerProfileData } from '../types/rally';
import { AmericanoTournamentState } from '../types/americano';

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
   * تولید هدرهای احراز هویت کاربر احراز هویت شده بر اساس توکن ذخیره‌شده
   */
  getUserAuthHeaders(): Record<string, string> {
    const sessionStr = localStorage.getItem('padel_auth');
    let token = '';
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        token = session.token || '';
      } catch {
        token = '';
      }
    }
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  /**
   * استعلام مانده زنده کیف پول کاربر از بک‌اند با استفاده از توکن امن JWT
   */
  async getWalletBalance(userId?: string): Promise<number | null> {
    try {
      const headers = this.getUserAuthHeaders();
      const queryParam = userId ? `?user_id=${userId}` : '';
      const res = await fetch(`${API_BASE}/wallet/balance${queryParam}`, {
        headers,
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.balance_toman ?? Math.floor(data.balance / 10);
    } catch {
      return null;
    }
  },

  /**
   * دریافت کلیه رزروهای ثبت‌شده و قطعی کاربر از سرور
   */
  async getMyBookings(): Promise<any[]> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/bookings/my`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * درخواست لغو رزرو و استرداد وجه به کیف پول بر اساس قوانین کنسلی
   */
  async cancelBooking(bookingId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در لغو رزرو' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در برقراری ارتباط با سرور' };
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
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/shop/checkout`, {
        method: 'POST',
        headers,
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
   * دریافت سفارشات ثبت‌شده کاربر از فروشگاه
   */
  async getMyShopOrders(): Promise<any[]> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/shop/orders/my-orders`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.orders || [];
    } catch {
      return [];
    }
  },

  /**
   * دریافت تمرینات و دریل‌های نشان‌شده کاربر
   */
  async getMySavedDrills(): Promise<any[]> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/drills/my/activities?type=bookmarks`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    } catch {
      return [];
    }
  },

  /**
   * ثبت رسمی درخواست ارتقای نقش مربی یا باشگاه‌دار
   */
  async requestRoleUpgrade(payload: {
    requested_role: 'COACH' | 'CLUB_OPERATOR' | 'CLUB_MANAGER';
    full_name: string;
    phone_number: string;
    national_code?: string;
    organization_name?: string;
    experience_years?: number;
    license_number?: string;
    description?: string;
  }): Promise<{ success: boolean; tracking_id?: string; message?: string; error?: string }> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/auth/role-upgrade-request`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'خطا در ثبت درخواست ارتقای نقش' };
      }
      return { success: true, tracking_id: data.tracking_id, message: data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در برقراری ارتباط با سرور' };
    }
  },

  /**
   * واکشی شناسنامه ورزشی و مشخصات کاربر
   */
  async getUserProfile(): Promise<any | null> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/auth/me`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * به‌روزرسانی شناسنامه ورزشی و مشخصات کاربر
   */
  async updateUserProfile(payload: {
    full_name?: string;
    preferred_sport?: string;
    dominant_hand?: string;
    skill_level?: string;
    city?: string;
    emergency_phone?: string;
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در به‌روزرسانی مشخصات' };
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در اتصال به سرور' };
    }
  },


  /**
   * قفل اتمیک ۱۰ دقیقه‌ای سانس در بک‌اند جهت جلوگیری از همروندی
   */
  async holdSlot(slotId: string, userId?: string) {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/slots/${slotId}/hold`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userId ? { user_id: userId } : {}),
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
   * پرداخت سانس رزرو شده از طریق موجودی کیف پول کاربر احراز هویت شده
   */
  async payBookingWithWallet(slotId: string, bookingId?: string) {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/wallet/pay-booking`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ slot_id: slotId, booking_id: bookingId || null }),
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
   * ثبت رسمی نتیجه مسابقه و محاسبه زنده ریتینگ Elo
   */
  async submitMatchResult(gameId: string, setScores: number[][]) {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/matchmaking/${gameId}/result`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ set_scores: setScores }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت نتیجه مسابقه' };
      return { success: true, data: data.data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  /**
   * دریافت جدول رده‌بندی ریتینگ زنده مسابقات پدل رالی (Elo Leaderboard)
   */
  async getEloLeaderboard(limit: number = 50): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/matchmaking/elo-leaderboard?limit=${limit}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
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
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        return { success: false, error: 'خطای سرور در پردازش احراز هویت. لطفاً لحظاتی بعد مجدداً تلاش کنید.' };
      }
      if (!res.ok) {
        return { success: false, error: data.detail || 'نام کاربری یا رمز عبور اشتباه است.' };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  // ==================== ADMIN API CALLS ====================
  getAdminAuthHeaders() {
    const token = sessionStorage.getItem('rally_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async getAdminProducts(params?: { category_id?: string; brand?: string; search?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.category_id) q.append('category_id', params.category_id);
      if (params?.brand) q.append('brand', params.brand);
      if (params?.search) q.append('search', params.search);
      const res = await fetch(`${API_BASE}/admin/products?${q.toString()}`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createAdminProduct(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت کالا' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async updateAdminProduct(productId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ویرایش کالا' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async deleteAdminProduct(productId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در حذف کالا' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async updateAdminProductStock(productId: string, stock: number) {
    try {
      const res = await fetch(`${API_BASE}/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify({ stock }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در به‌روزرسانی موجودی' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  // Dynamic Supply Rules & Auto-Pricing
  async getSupplyRules() {
    try {
      const res = await fetch(`${API_BASE}/admin/supply-rules`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return { success: false, rules: [] };
      return await res.json();
    } catch {
      return { success: false, rules: [] };
    }
  },

  async createSupplyRule(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/supply-rules`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت قانون تامین' };
      return { success: true, rule: data.rule };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async updateSupplyRule(ruleId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/supply-rules/${ruleId}`, {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ویرایش قانون تامین' };
      return { success: true, rule: data.rule };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async deleteSupplyRule(ruleId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/supply-rules/${ruleId}`, {
        method: 'DELETE',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در حذف قانون تامین' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async syncSupplyRule(ruleId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/supply-rules/${ruleId}/sync`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در همگام‌سازی منبع' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async syncAllSupplyRules(supplyMode?: 'INSTANT' | 'EUROPE') {
    try {
      const url = supplyMode 
        ? `${API_BASE}/admin/supply-rules/sync-all?supply_mode=${supplyMode}` 
        : `${API_BASE}/admin/supply-rules/sync-all`;
      const res = await fetch(url, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در همگام‌سازی چندمنبعی' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async getBestPrices(productId?: string, supplyMode?: 'INSTANT' | 'EUROPE') {
    try {
      const params = new URLSearchParams();
      if (productId) params.append('product_id', productId);
      if (supplyMode) params.append('supply_mode', supplyMode);
      const res = await fetch(`${API_BASE}/admin/supply-rules/best-prices?${params.toString()}`, {
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در دریافت بهترین قیمت‌ها' };
      return { success: true, ...data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },


  async getAdminCategories() {
    try {
      const res = await fetch(`${API_BASE}/admin/categories`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getAdminOrders(status?: string) {
    try {
      const q = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/admin/orders${q}`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async updateAdminOrderStatus(orderId: string, payload: { order_status: string; shipping_tracking_code?: string; admin_notes?: string }) {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در تغییر وضعیت سفارش' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async getAdminArticles(categoryId?: string) {
    try {
      const q = categoryId ? `?category_id=${categoryId}` : '';
      const res = await fetch(`${API_BASE}/admin/articles${q}`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createAdminArticle(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/articles`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت مقاله' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async updateAdminArticle(articleId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ویرایش مقاله' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async deleteAdminArticle(articleId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/articles/${articleId}`, {
        method: 'DELETE',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در حذف مقاله' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async getAdminBanners(bannerType?: string) {
    try {
      const q = bannerType ? `?banner_type=${bannerType}` : '';
      const res = await fetch(`${API_BASE}/admin/banners${q}`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createAdminBanner(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/banners`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت بنر' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async updateAdminBanner(bannerId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/banners/${bannerId}`, {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ویرایش بنر' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async deleteAdminBanner(bannerId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/banners/${bannerId}`, {
        method: 'DELETE',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در حذف بنر' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async getAdminTournaments() {
    try {
      const res = await fetch(`${API_BASE}/admin/tournaments`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createAdminTournament(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/tournaments`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت تورنمنت' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async updateAdminTournament(tournamentId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/tournaments/${tournamentId}`, {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ویرایش تورنمنت' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async deleteAdminTournament(tournamentId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/tournaments/${tournamentId}`, {
        method: 'DELETE',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در حذف تورنمنت' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async getAdminRankings(category?: string) {
    try {
      const q = category ? `?category=${category}` : '';
      const res = await fetch(`${API_BASE}/admin/rankings${q}`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createAdminRanking(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/rankings`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت رنکینگ' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async updateAdminRanking(rankingId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/rankings/${rankingId}`, {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ویرایش رنکینگ' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async deleteAdminRanking(rankingId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/rankings/${rankingId}`, {
        method: 'DELETE',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در حذف رنکینگ' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async generateAdminCourtSlots(courtId: string, payload: {
    start_date: string;
    end_date: string;
    start_hour?: number;
    end_hour?: number;
    slot_duration_minutes?: number;
    hourly_rate?: number;
  }) {
    try {
      const res = await fetch(`${API_BASE}/admin/courts/${courtId}/generate-slots`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در تولید دسته‌ای سانس‌ها' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async updateAdminSlot(slotId: string, payload: { status: string; price?: number }) {
    try {
      const res = await fetch(`${API_BASE}/admin/slots/${slotId}`, {
        method: 'PATCH',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در به‌روزرسانی سانس' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async getAdminMedia(folder?: string) {
    try {
      const q = folder ? `?folder=${folder}` : '';
      const res = await fetch(`${API_BASE}/admin/media${q}`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async processProductImage(payload: { product_slug: string; image_name?: string; content_base64: string }) {
    try {
      const res = await fetch(`${API_BASE}/admin/media/process-product-image`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در پردازش تصویر رسپانسیو' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در برقراری ارتباط با موتور پردازش تصویر' };
    }
  },

  async uploadAdminMedia(payload: { file_name: string; data_base64: string; folder?: string; alt_text?: string }) {
    try {
      const res = await fetch(`${API_BASE}/admin/media/upload`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در بارگذاری مدیا' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async deleteAdminMedia(mediaId: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/media/${mediaId}`, {
        method: 'DELETE',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در حذف مدیا' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  async getAdminUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createAdminUser(payload: { username: string; password: string; full_name: string; email?: string; role?: string; club_id?: string }) {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ایجاد ادمین' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  // ==================== PUBLIC CONTENT READS ====================
  async getPublicArticles(categoryId?: string) {
    try {
      const q = categoryId ? `?category_id=${categoryId}` : '';
      const res = await fetch(`${API_BASE}/content/articles${q}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getPublicArticleBySlug(slug: string) {
    try {
      const res = await fetch(`${API_BASE}/content/articles/${slug}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPublicBanners(bannerType?: string) {
    try {
      const q = bannerType ? `?banner_type=${bannerType}` : '';
      const res = await fetch(`${API_BASE}/content/banners${q}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getPublicTournaments(status?: string) {
    try {
      const q = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/content/tournaments${q}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getPublicRankings(category?: string) {
    try {
      const q = category ? `?category=${category}` : '';
      const res = await fetch(`${API_BASE}/content/rankings${q}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * دریافت اعلان‌های پایدار درون‌پرتال کاربر از دیتابیس (بدون نیاز به پیامک)
   */
  async getMyInAppNotifications(): Promise<any[]> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/notifications/in-app/my`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.notifications || [];
    } catch {
      return [];
    }
  },

  /**
   * علامت‌گذاری اعلان درون‌پرتال به عنوان خوانده‌شده
   */
  async markInAppNotificationRead(notificationId: string): Promise<boolean> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/notifications/in-app/${notificationId}/read`, {
        method: 'POST',
        headers
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * بررسی مجدد و زنده موجودی سانس در زمان کلیک روی اعلان لیست انتظار
   */
  async checkSlotAvailability(slotId: string): Promise<{ exists: boolean; is_available: boolean; status?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/notifications/waitlist/check-slot/${slotId}`);
      if (!res.ok) return { exists: false, is_available: false };
      return await res.json();
    } catch {
      return { exists: false, is_available: false };
    }
  },

  /**
   * دریافت لیست درخواست‌های ارتقای نقش کاربران (پنل ادمین)
   */
  async getAdminRoleUpgradeRequests(statusFilter?: string): Promise<any[]> {
    try {
      const q = statusFilter ? `?status_filter=${statusFilter}` : '';
      const res = await fetch(`${API_BASE}/admin/role-upgrade-requests${q}`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.requests || [];
    } catch {
      return [];
    }
  },

  /**
   * تایید رسمی ارتقای نقش کاربر به مربی یا باشگاه‌دار (پنل ادمین)
   */
  async approveAdminRoleUpgradeRequest(trackingId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/role-upgrade-requests/${trackingId}/approve`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در تایید درخواست' };
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  /**
   * رد درخواست ارتقای نقش (پنل ادمین)
   */
  async rejectAdminRoleUpgradeRequest(trackingId: string, reason?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/role-upgrade-requests/${trackingId}/reject`, {
        method: 'POST',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify({ reason: reason || 'عدم احراز شرایط لازم' }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در رد درخواست' };
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  /**
   * دریافت تراز و خلاصه سود و زیان مالی باشگاه
   */
  async getClubAccountingSummary(clubId: string, startDate?: string, endDate?: string): Promise<any | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/accounting/club/${clubId}/summary${query}`, {
        headers: this.getUserAuthHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * دریافت لیست تراکنش‌های دفتر کل باشگاه
   */
  async getClubTransactions(clubId: string, paramsObj?: { type?: string; category?: string }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (paramsObj?.type) params.append('transaction_type', paramsObj.type);
      if (paramsObj?.category) params.append('category', paramsObj.category);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/accounting/club/${clubId}/transactions${query}`, {
        headers: this.getUserAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * ثبت تراکنش مالی دستی برای باشگاه
   */
  async createClubTransaction(clubId: string, payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/accounting/club/${clubId}/transactions`, {
        method: 'POST',
        headers: this.getUserAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت تراکنش' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در اتصال به سرور' };
    }
  },

  /**
   * حذف یک سند از دفتر کل باشگاه
   */
  async deleteClubTransaction(clubId: string, txId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/accounting/club/${clubId}/transactions/${txId}`, {
        method: 'DELETE',
        headers: this.getUserAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.detail || 'خطا در حذف سند' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  /**
   * دریافت تراز و خلاصه مالی مربی
   */
  async getCoachAccountingSummary(coachId: string, startDate?: string, endDate?: string): Promise<any | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/accounting/coach/${coachId}/summary${query}`, {
        headers: this.getUserAuthHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * دریافت لیست تراکنش‌های مالی مربی
   */
  async getCoachTransactions(coachId: string, paramsObj?: { type?: string; category?: string }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (paramsObj?.type) params.append('transaction_type', paramsObj.type);
      if (paramsObj?.category) params.append('category', paramsObj.category);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/accounting/coach/${coachId}/transactions${query}`, {
        headers: this.getUserAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * ثبت تراکنش مالی جدید برای مربی
   */
  async createCoachTransaction(coachId: string, payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/accounting/coach/${coachId}/transactions`, {
        method: 'POST',
        headers: this.getUserAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت تراکنش' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  /**
   * حذف سند مالی مربی
   */
  async deleteCoachTransaction(coachId: string, txId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/accounting/coach/${coachId}/transactions/${txId}`, {
        method: 'DELETE',
        headers: this.getUserAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.detail || 'خطا در حذف سند' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در ارتباط با سرور' };
    }
  },

  /**
   * دریافت پروفایل کاربر جاری و تطبیق نقش
   */
  async getMe(): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.getUserAuthHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * ثبت رزرو باجه / تلفنی حضوری با کارمزد صفر درصد و پیامک کاوه‌نگار
   */
  async createDeskBooking(payload: {
    court_id?: string;
    slot_id?: string;
    customer_name: string;
    customer_phone?: string;
    payment_method?: string;
    slot_time: string;
    slot_date?: string;
    club_name?: string;
    court_name?: string;
    send_sms?: boolean;
    is_recurring_vip?: boolean;
  }): Promise<{ success: boolean; tracking_code?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/bookings/desk-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getUserAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت رزرو باجه' };
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در برقراری ارتباط' };
    }
  },

  async getAdminClubs() {
    try {
      const res = await fetch(`${API_BASE}/admin/clubs`, {
        headers: this.getAdminAuthHeaders(),
      });
      if (!res.ok) return { success: false, clubs: [] };
      const clubs = await res.json();
      return { success: true, clubs };
    } catch (err: any) {
      return { success: false, clubs: [], error: err?.message };
    }
  },

  async updateClubLocation(clubId: string, payload: { latitude: number; longitude: number; address?: string }) {
    try {
      const res = await fetch(`${API_BASE}/admin/clubs/${clubId}/location`, {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت موقعیت' };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در برقراری ارتباط' };
    }
  },

  /**
   * پیشنهاد هوشمند راکت‌های پدل بر اساس بیومکانیک و سبک بازی
   */
  async recommendRackets(payload: {
    player_level: string;
    playstyle: string;
    physical_priority?: string;
    budget_tier?: string;
    supply_preference?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/shop/racket-finder/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.detail || 'خطا در محاسبه تطابق راکت' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در برقراری ارتباط با سرور' };
    }
  },

  /**
   * دریافت شناسنامه ورزشی و مشخصات کامل بازیکن
   */
  async getPlayerProfile(userId: string): Promise<PlayerProfileData | null> {
    try {
      const res = await fetch(`${API_BASE}/players/${userId}/profile`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // Fallback in demo or network down
    }

    // بازگشت پروفایل پیش‌فرض و غنی بر اساس شناسه کاربر در حالت دمو یا آفلاین
    return {
      id: userId,
      full_name: userId === 'u-3' ? 'امیرحسین نکوزاده' : userId === 'u-1' ? 'آرتین قهرمان' : userId === 'u-2' ? 'سهراب محمدی' : 'ورزشکار رسمی رالی',
      city: 'تهران',
      province: 'تهران',
      preferred_sport: 'PADEL',
      dominant_hand: 'RIGHT',
      preferred_side: 'RIGHT',
      racket_name: 'NOX AT10 Genius 18K 2026',
      elo_rating: userId === 'u-1' ? 1680 : userId === 'u-2' ? 1540 : userId === 'u-3' ? 1460 : 1350,
      skill_tier: userId === 'u-1' ? 'B' : userId === 'u-2' ? 'C+' : userId === 'u-3' ? 'C+' : 'C',
      rank: userId === 'u-1' ? 1 : userId === 'u-2' ? 2 : userId === 'u-3' ? 3 : 14,
      matches_played: 24,
      matches_won: 18,
      matches_lost: 6,
      win_rate: 75.0,
      kyc_status: 'VERIFIED',
      badges: [
        { id: 'club_1000', title: 'باشگاه ۴ رقمی‌ها', desc: 'عبور از مرز ریتینگ ۱۰۰۰ Elo پدل', icon: 'Zap' },
        { id: 'veteran', title: 'وفادار به کورت', desc: 'حضور در بیش از ۱۰ مسابقه رسمی', icon: 'Shield' },
        { id: 'high_win_rate', title: 'ماشین پیروزی', desc: 'نرخ برد درخشان بالای ۷۰ درصد', icon: 'Trophy' },
        { id: 'master_tier', title: 'کلاس مسترز', desc: 'رسیدن به سطح پیشرفته پدل', icon: 'Star' }
      ],
      recent_matches: [
        {
          game_id: 'm-1',
          title: 'بازی دابلز جام آدینه',
          club_name: 'باشگاه پدل FGB انقلاب',
          court_name: 'کورت سنترال ۱',
          date: '۱۴۰۵/۰۷/۲۱',
          won: true,
          rating_change: 18,
          partner_name: 'سهراب محمدی',
          opponents: ['کیان رضایی', 'بردیا تهرانی'],
          score_summary: '6-4, 6-3',
          skill_level: 'B-'
        },
        {
          game_id: 'm-2',
          title: 'چلنج مچ عصرگاهی',
          club_name: 'باشگاه پدل لافور',
          court_name: 'کورت مونت‌کارلو',
          date: '۱۴۰۵/۰۷/۱۸',
          won: true,
          rating_change: 14,
          partner_name: 'آرتین قهرمان',
          opponents: ['امید مرادی', 'نوید کاظمی'],
          score_summary: '7-6, 4-6, 6-2',
          skill_level: 'C+'
        },
        {
          game_id: 'm-3',
          title: 'رقابت ۴ نفره آزاد',
          club_name: 'باشگاه پدل ویوا',
          court_name: 'کورت WPT مشکی',
          date: '۱۴۰۵/۰۷/۱۴',
          won: false,
          rating_change: -12,
          partner_name: 'کیان رضایی',
          opponents: ['سهراب محمدی', 'آرتین قهرمان'],
          score_summary: '3-6, 4-6',
          skill_level: 'B'
        }
      ]
    };
  },

  /**
   * به‌روزرسانی مشخصات ورزشی و فنی بازیکن
   */
  async updateSportsProfile(payload: {
    dominant_hand?: 'RIGHT' | 'LEFT';
    preferred_side?: 'RIGHT' | 'LEFT' | 'BOTH';
    racket_name?: string;
    city?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/players/me/sports-profile`, {
        method: 'PUT',
        headers: this.getUserAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در به‌روزرسانی مشخصات' };
      return { success: true, data: data.data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در شبکه' };
    }
  },

  /**
   * ایجاد و قرعه‌کشی خودکار تورنمنت آمریکانو
   */
  async generateAmericanoTournament(payload: {
    title: string;
    players: string[];
    points_per_match?: number;
    club_name?: string;
  }): Promise<AmericanoTournamentState | null> {
    try {
      const res = await fetch(`${API_BASE}/americano/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * دریافت وضعیت زنده تورنمنت آمریکانو و لیدربورد
   */
  async getAmericanoTournament(tournamentId: string): Promise<AmericanoTournamentState | null> {
    try {
      const res = await fetch(`${API_BASE}/americano/${tournamentId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * ثبت امتیازات راند و به‌روزرسانی لیدربورد آمریکانو
   */
  async recordAmericanoRoundScore(
    tournamentId: string,
    roundIndex: number,
    scores: Array<{ court_number: number; score_a: number; score_b: number }>
  ): Promise<AmericanoTournamentState | null> {
    try {
      const res = await fetch(`${API_BASE}/americano/${tournamentId}/round-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round_index: roundIndex,
          scores,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * ثبت رسمی درخواست هماهنگی جلسه با مربی در بک‌اند
   */
  async createCoachRequest(coachId: string, payload: {
    student_name: string;
    student_phone: string;
    requested_date: string;
    skill_level?: string;
    training_goal?: string;
    club_name?: string;
    user_id?: string;
  }): Promise<{ success: boolean; request?: any; error?: string }> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/coaches/${coachId}/requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت درخواست مربی' };
      return { success: true, request: data.request };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در اتصال به سرور مربیان' };
    }
  },

  /**
   * دریافت درخواست‌های جلسه برای یک مربی
   */
  async getCoachRequests(coachId: string, status?: string): Promise<any[]> {
    try {
      const q = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/coaches/${coachId}/requests${q}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * تغییر وضعیت درخواست جلسه توسط مربی (پذیرش / رد)
   */
  async updateCoachRequestStatus(requestId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/coaches/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در بروزرسانی وضعیت' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در اتصال به سرور' };
    }
  },

  /**
   * ثبت‌نام رسمی تیم دونفره در تورنمنت
   */
  async registerTournament(tournamentId: string, payload: {
    team_name: string;
    partner_name: string;
    partner_phone?: string;
    contact_phone?: string;
    user_id?: string;
  }): Promise<{ success: boolean; registration?: any; registered_teams_count?: number; error?: string }> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت‌نام تورنمنت' };
      return { success: true, registration: data.registration, registered_teams_count: data.registered_teams_count };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در اتصال به سرور تورنمنت' };
    }
  },

  /**
   * دریافت لیست دیدگاه‌ها و امتیازات فنی ثبت‌شده برای یک کلوپ
   */
  async getClubReviews(clubId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/venues/${clubId}/reviews`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * ثبت دیدگاه و امتیاز جدید برای باشگاه در بک‌اند
   */
  async submitClubReview(clubId: string, payload: {
    user_name: string;
    rating: number;
    turf_score?: number;
    light_score?: number;
    amenities_score?: number;
    comment: string;
    user_id?: string;
  }): Promise<{ success: boolean; review?: any; error?: string }> {
    try {
      const headers = this.getUserAuthHeaders();
      const res = await fetch(`${API_BASE}/venues/${clubId}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت نظر' };
      return { success: true, review: data.review };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در اتصال به سرور' };
    }
  },

  /**
   * لایک کردن دیدگاه
   */
  async likeClubReview(reviewId: string): Promise<number | null> {
    try {
      const res = await fetch(`${API_BASE}/venues/reviews/${reviewId}/like`, { method: 'POST' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.likes_count ?? null;
    } catch {
      return null;
    }
  },

  /**
   * دریافت لیست محصولات آنلاین فروشگاه از بک‌اند
   */
  async getProducts(params?: { category?: string; sport?: string; brand?: string; search?: string }): Promise<any[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'ALL') query.append('category', params.category);
      if (params?.sport && params.sport !== 'ALL') query.append('sport', params.sport);
      if (params?.brand && params.brand !== 'ALL') query.append('brand', params.brand);
      if (params?.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/shop/products${qs}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },


  /**
   * ثبت و آنبوردینگ مجموعه یا کورت جدید در بک‌اند
   */
  async createVenue(payload: {
    owner_id?: string;
    name: string;
    province?: string;
    city?: string;
    address: string;
    phone: string;
    sports_supported?: string;
    amenities?: string;
    courts_count?: number;
    default_hourly_rate?: number;
    iban?: string;
  }): Promise<{ success: boolean; club_id?: string; error?: string }> {
    try {
      const headers = this.getUserAuthHeaders();
      const body = {
        owner_id: payload.owner_id || 'admin-root',
        name: payload.name,
        province: payload.province || 'تهران',
        city: payload.city || 'تهران',
        address: payload.address,
        phone: payload.phone,
        sports_supported: payload.sports_supported || 'PADEL',
        amenities: payload.amenities || 'پارکینگ، کافه، رختکن',
        courts_count: payload.courts_count || 2,
        default_hourly_rate: payload.default_hourly_rate || 3000000,
        iban: payload.iban || 'IR000000000000000000000000',
      };
      const res = await fetch(`${API_BASE}/venues/onboard`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'خطا در ثبت مجموعه' };
      return { success: true, club_id: data.club_id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطا در برقراری ارتباط با سرور' };
    }
  }
};





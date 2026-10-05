/**
 * سرویس ارتباط با API ماژول تمرینات تخصصی رالی
 */
import {
  DrillListResponse,
  DrillDetail,
  DrillFilters,
  DrillBookmarkResponse,
  DrillCompletionResponse,
  DrillEphemeralTokenResponse,
  DrillStepItem
} from '../types/drills';

const API_BASE = '/api/v1';

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const effectiveToken = token || sessionStorage.getItem('rally_admin_token') || localStorage.getItem('rally_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }
  return headers;
}

export const drillsApi = {
  /**
   * دریافت فهرست تمرینات منتشرشده با فیلترها و صفحه‌بندی
   */
  async getPublishedDrills(filters: DrillFilters = {}, signal?: AbortSignal): Promise<DrillListResponse> {
    const params = new URLSearchParams();
    if (filters.sport) params.set('sport', filters.sport);
    if (filters.category) params.set('category', filters.category);
    if (filters.level) params.set('level', filters.level);
    if (filters.participation) params.set('participation', filters.participation);
    if (filters.query?.trim()) params.set('query', filters.query.trim());
    if (filters.min_duration) params.set('min_duration', String(filters.min_duration));
    if (filters.max_duration) params.set('max_duration', String(filters.max_duration));
    params.set('page', String(filters.page || 1));
    params.set('page_size', String(filters.page_size || 12));

    const res = await fetch(`${API_BASE}/drills?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal
    });

    if (!res.ok) {
      throw new Error(`خطا در دریافت تمرینات (${res.status})`);
    }
    const raw = await res.json();
    const rawList = raw.drills || raw.items || [];
    const normalized = rawList.map((d: any) => ({
      ...d,
      sport: (d.sport || 'padel').toLowerCase(),
      category: (d.category || 'technique').toLowerCase(),
      level: (d.level || 'beginner').toLowerCase(),
      participation_type: (d.participant_type || d.participation_type || 'solo').toLowerCase(),
      cover_url: d.cover_image_url || d.cover_url || null,
      completion_count: d.completion_count ?? 0,
      bookmark_count: d.bookmark_count ?? 0,
      view_count: d.view_count ?? 0,
      status: (d.status || 'published').toLowerCase()
    }));
    return {
      total: raw.total ?? normalized.length,
      page: raw.page ?? 1,
      page_size: raw.page_size ?? 12,
      total_pages: raw.total_pages ?? 1,
      drills: normalized
    };
  },

  /**
   * دریافت جزئیات یک تمرین بر اساس اسلاگ
   */
  async getDrillBySlug(slug: string, signal?: AbortSignal): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/drills/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal
    });

    if (res.status === 404) {
      throw new Error('تمرین مورد نظر یافت نشد یا هنوز منتشر نشده است.');
    }
    if (!res.ok) {
      throw new Error(`خطا در دریافت اطلاعات تمرین (${res.status})`);
    }
    const raw = await res.json();
    return {
      ...raw,
      sport: (raw.sport || 'padel').toLowerCase(),
      category: (raw.category || 'technique').toLowerCase(),
      level: (raw.level || 'beginner').toLowerCase(),
      participation_type: (raw.participant_type || raw.participation_type || 'solo').toLowerCase(),
      cover_url: raw.cover_image_url || raw.cover_url || null,
      steps: raw.steps || [],
      media_items: raw.media_items || [],
      status: (raw.status || 'published').toLowerCase(),
      completion_count: raw.completion_count ?? 0,
      bookmark_count: raw.bookmark_count ?? 0,
      view_count: raw.view_count ?? 0,
      content_version: raw.content_version ?? 1,
      origin_source: raw.origin_source || 'original',
      usage_rights_confirmed: raw.usage_rights_confirmed ?? true,
      author_name: raw.author_name || 'تیم فنی رالی',
      reviewer_name: raw.reviewer_name || null
    };
  },

  /**
   * تغییر وضعیت نشان‌کردن (Bookmark) توسط کاربر احرازشده
   */
  async toggleBookmark(drillId: string, token: string): Promise<DrillBookmarkResponse> {
    const res = await fetch(`${API_BASE}/drills/${drillId}/bookmark`, {
      method: 'POST',
      headers: getAuthHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ثبت نشان');
    }
    return res.json();
  },

  /**
   * ثبت گزارش انجام تمرین توسط کاربر با Idempotency Key
   */
  async logCompletion(
    drillId: string,
    idempotencyKey: string,
    data: { notes?: string; user_difficulty_rating?: number },
    token: string
  ): Promise<DrillCompletionResponse> {
    const headers = getAuthHeaders(token) as Record<string, string>;
    headers['X-Idempotency-Key'] = idempotencyKey;

    const res = await fetch(`${API_BASE}/drills/${drillId}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ثبت انجام تمرین');
    }
    return res.json();
  },

  // --------------------------------------------------------------------------
  // متدهای اختصاصی پنل مدیریت (Admin)
  // --------------------------------------------------------------------------

  async getAdminDrills(params: Record<string, any> = {}, token?: string): Promise<DrillListResponse> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });

    const res = await fetch(`${API_BASE}/admin/drills?${q.toString()}`, {
      headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error(`خطا در دریافت لیست تمرینات مدیریت (${res.status})`);
    const raw = await res.json();
    const rawList = raw.drills || raw.items || [];
    const normalized = rawList.map((d: any) => ({
      ...d,
      sport: (d.sport || 'padel').toLowerCase(),
      category: (d.category || 'technique').toLowerCase(),
      level: (d.level || 'beginner').toLowerCase(),
      participation_type: (d.participant_type || d.participation_type || 'solo').toLowerCase(),
      status: (d.status || 'draft').toLowerCase(),
      completion_count: d.completion_count ?? 0,
      bookmark_count: d.bookmark_count ?? 0
    }));
    return {
      total: raw.total ?? normalized.length,
      page: raw.page ?? 1,
      page_size: raw.page_size ?? 12,
      total_pages: raw.total_pages ?? 1,
      drills: normalized
    };
  },

  async getAdminDrill(drillId: string, token?: string): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}`, {
      headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error(`خطا در دریافت جزئیات مدیریت تمرین (${res.status})`);
    const raw = await res.json();
    return {
      ...raw,
      sport: (raw.sport || 'padel').toLowerCase(),
      category: (raw.category || 'technique').toLowerCase(),
      level: (raw.level || 'beginner').toLowerCase(),
      participation_type: (raw.participant_type || raw.participation_type || 'solo').toLowerCase(),
      status: (raw.status || 'draft').toLowerCase(),
      steps: raw.steps || [],
      media_items: (raw.media_items || []).map((m: any) => ({
        ...m,
        media_type: (m.media_type || 'video').toLowerCase(),
        media_status: (m.validation_status || m.media_status || 'valid').toLowerCase()
      }))
    };
  },

  async createDraft(payload: any, token?: string): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/admin/drills`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ایجاد پیش‌نویس');
    }
    return res.json();
  },

  async updateDrill(drillId: string, payload: any, expectedVersion: number, token?: string): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}?expected_version=${expectedVersion}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload)
    });
    if (res.status === 409) {
      throw new Error('CONFLICT: نسخه تمرین تغییر کرده است. لطفاً فرم را مجدداً بارگذاری کنید تا تغییرات دیگران بازنویسی نشود.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ذخیره تمرین');
    }
    return res.json();
  },

  async uploadMedia(drillId: string, file: File, mediaType: string, token?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('media_type', mediaType);

    const headers: HeadersInit = {};
    const effectiveToken = token || sessionStorage.getItem('rally_admin_token');
    if (effectiveToken) headers['Authorization'] = `Bearer ${effectiveToken}`;

    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/media`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در آپلود رسانه');
    }
    return res.json();
  },

  async deleteMedia(drillId: string, mediaId: string, token?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/media/${mediaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در حذف رسانه');
    }
  },

  async setCover(drillId: string, mediaId: string, token?: string): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/cover`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ cover_media_id: mediaId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در تنظیم جلد');
    }
    return res.json();
  },

  async saveSteps(drillId: string, steps: DrillStepItem[], token?: string): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/steps`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ steps })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ثبت مراحل');
    }
    return res.json();
  },

  async submitForReview(drillId: string, token?: string): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/submit-for-review`, {
      method: 'POST',
      headers: getAuthHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ارسال برای بازبینی');
    }
    return res.json();
  },

  async reviewDrill(
    drillId: string,
    action: 'APPROVE' | 'REJECT' | 'approved' | 'rejected',
    notes?: string,
    checklist?: {
      suitability_approved: boolean;
      movement_clarity_approved: boolean;
      media_sync_approved: boolean;
      pedagogical_notes?: string;
      safety_notes?: string;
      verified_media_ids?: string[];
    },
    token?: string
  ): Promise<DrillDetail> {
    const normAction = action.toUpperCase() === 'APPROVED' ? 'APPROVE' : action.toUpperCase() === 'REJECTED' ? 'REJECT' : action.toUpperCase();
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ action: normAction, review_notes: notes, checklist })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ثبت بازبینی');
    }
    return res.json();
  },

  async publishDrill(drillId: string, token?: string): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در انتشار تمرین');
    }
    return res.json();
  },

  async archiveDrill(drillId: string, token?: string): Promise<DrillDetail> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/archive`, {
      method: 'POST',
      headers: getAuthHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در بایگانی تمرین');
    }
    return res.json();
  },

  /**
   * دریافت توکن موقت پیش‌نمایش رسانه خصوصی برای ادمین
   */
  async getEphemeralPreviewToken(drillId: string, mediaId: string, token?: string): Promise<DrillEphemeralTokenResponse> {
    const res = await fetch(`${API_BASE}/admin/drills/${drillId}/media/${mediaId}/preview-token`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در دریافت توکن پیش‌نمایش');
    }
    return res.json();
  }
};

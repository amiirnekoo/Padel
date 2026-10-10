import { useState, useEffect } from 'react';

export interface ProductRatingSummary {
  averageRating: number | null;
  reviewsCount: number;
}

const REVIEW_EVENT = 'rally_product_review_updated';

/**
 * دریافت خلاصه امتیازات واقعی و نظرات ثبت‌شده کاربران برای یک محصول
 */
export function getProductRatingSummary(productId: string): ProductRatingSummary {
  try {
    const raw = localStorage.getItem(`rally_reviews_${productId}`);
    if (!raw) {
      return { averageRating: null, reviewsCount: 0 };
    }
    const reviews = JSON.parse(raw);
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return { averageRating: null, reviewsCount: 0 };
    }
    const sum = reviews.reduce((acc: number, r: { rating?: number }) => {
      const val = typeof r.rating === 'number' && !isNaN(r.rating) ? r.rating : 0;
      return acc + val;
    }, 0);
    const avg = Number((sum / reviews.length).toFixed(1));
    return {
      averageRating: avg,
      reviewsCount: reviews.length
    };
  } catch {
    return { averageRating: null, reviewsCount: 0 };
  }
}

/**
 * اطلاع‌رسانی به تمامی کامپوننت‌های برنامه هنگام ثبت، ویرایش یا حذف نظر
 */
export function notifyReviewUpdated(productId: string): void {
  try {
    window.dispatchEvent(new CustomEvent(REVIEW_EVENT, { detail: { productId } }));
  } catch {
    // ignore
  }
}

/**
 * هوک واکنش‌گرا برای رصد زنده امتیاز و نظرات واقعی محصول
 */
export function useProductRating(productId: string): ProductRatingSummary {
  const [summary, setSummary] = useState<ProductRatingSummary>(() => getProductRatingSummary(productId));

  useEffect(() => {
    setSummary(getProductRatingSummary(productId));

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ productId?: string }>;
      if (!custom.detail || custom.detail.productId === productId || !custom.detail.productId) {
        setSummary(getProductRatingSummary(productId));
      }
    };

    window.addEventListener(REVIEW_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(REVIEW_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [productId]);

  return summary;
}

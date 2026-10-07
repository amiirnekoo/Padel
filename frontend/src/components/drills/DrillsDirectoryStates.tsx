import React from 'react';
import { AlertCircle, RefreshCw, Dumbbell, ChevronRight, ChevronLeft } from 'lucide-react';

export const DrillsLoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" dir="rtl">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div key={idx} className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden shadow-2xs animate-pulse">
          <div className="aspect-video w-full bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-2/3 bg-slate-100 rounded" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface DrillsEmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export const DrillsEmptyState: React.FC<DrillsEmptyStateProps> = ({ hasFilters, onResetFilters }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs" dir="rtl">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
        <Dumbbell className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
        {hasFilters ? 'تمرینی با فیلترهای انتخابی پیدا نشد' : 'در حال حاضر تمرین منتشرشده‌ای موجود نیست'}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
        {hasFilters
          ? 'می‌توانید فیلترهای سطح، ورزش یا مدت را تغییر دهید یا واژه جستجوی دیگری را امتحان کنید.'
          : 'محتوای آموزشی تأییدشده و استانداردهای تمرین پس از بازبینی و انتشار توسط کارشناسان در این بخش در دسترس قرار خواهد گرفت.'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="px-5 py-2.5 rounded-xl bg-rally-primary text-white text-xs font-bold hover:bg-rally-primary-hover transition-colors cursor-pointer"
        >
          پاکسازی فیلترها و مشاهده همه تمرینات
        </button>
      )}
    </div>
  );
};

interface DrillsErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const DrillsErrorState: React.FC<DrillsErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-rose-50/80 border border-rose-200 rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto" dir="rtl">
      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-rose-900 mb-1">
        خطا در برقراری ارتباط با سامانه تمرینات
      </h3>
      <p className="text-xs text-rose-700 leading-relaxed mb-5">
        {message || 'امکان دریافت تمرینات در این لحظه وجود ندارد. لطفاً اتصال اینترنت خود را بررسی و دوباره تلاش کنید.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>تلاش دوباره</span>
      </button>
    </div>
  );
};

interface DrillsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DrillsPagination: React.FC<DrillsPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-6" dir="rtl">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        aria-label="صفحه قبل"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <span className="text-xs font-bold text-slate-600 px-3">
        صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        aria-label="صفحه بعد"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
};

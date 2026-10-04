import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface CourtsEmptyStateProps {
  onResetFilters: () => void;
}

export const CourtsEmptyState: React.FC<CourtsEmptyStateProps> = ({ onResetFilters }) => {
  return (
    <div className="bg-white rounded-3xl p-10 border border-black/[0.05] text-center space-y-3 max-w-md mx-auto shadow-xs">
      <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
      <h3 className="text-base font-black text-rally-charcoal">
        کورت یا سانسی با این مشخصات یافت نشد
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">
        لطفاً عبارت جستجو را تغییر دهید یا فیلترهای زمانی و نوع سالن را بازنشانی کنید.
      </p>
      <button
        onClick={onResetFilters}
        className="px-5 py-2 rounded-full bg-rally-primary text-white text-xs font-bold shadow-xs hover:bg-rally-primary-light transition-all cursor-pointer inline-flex items-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>پاک کردن فیلترها و مشاهده همه</span>
      </button>
    </div>
  );
};

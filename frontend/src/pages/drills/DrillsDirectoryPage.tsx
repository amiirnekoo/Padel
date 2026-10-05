import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DrillListItem, DrillFilters, DrillListResponse } from '../../types/drills';
import { drillsApi } from '../../services/drillsApi';
import { DrillCard } from '../../components/drills/DrillCard';
import { DrillFilterBar } from '../../components/drills/DrillFilterBar';
import {
  DrillsLoadingSkeleton,
  DrillsEmptyState,
  DrillsErrorState,
  DrillsPagination
} from '../../components/drills/DrillsDirectoryStates';
import { Dumbbell } from 'lucide-react';

interface DrillsDirectoryPageProps {
  initialFilters?: DrillFilters;
  onSelectDrill: (slug: string) => void;
  userToken?: string | null;
  onRequireAuth?: () => void;
}

export const DrillsDirectoryPage: React.FC<DrillsDirectoryPageProps> = ({
  initialFilters = {},
  onSelectDrill,
  userToken,
  onRequireAuth
}) => {
  const [filters, setFilters] = useState<DrillFilters>(() => ({
    page: 1,
    page_size: 12,
    ...initialFilters
  }));

  const [data, setData] = useState<DrillListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AbortController ref to prevent stale network requests from overriding newer filters
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDrills = useCallback(async (currentFilters: DrillFilters) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await drillsApi.getPublishedDrills(currentFilters, controller.signal);
      setData(response);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setErrorMessage(err.message || 'خطا در بارگذاری فهرست تمرینات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrills(filters);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters, fetchDrills]);

  const handleFilterChange = (updates: Partial<DrillFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, page_size: 12 });
  };

  const handleToggleBookmark = async (drillId: string) => {
    if (!userToken) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      const res = await drillsApi.toggleBookmark(drillId, userToken);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          drills: prev.drills.map((d) =>
            d.id === drillId
              ? { ...d, is_bookmarked: res.is_bookmarked, bookmark_count: res.bookmark_count }
              : d
          )
        };
      });
    } catch (e: any) {
      alert(e.message || 'خطا در نشان کردن تمرین');
    }
  };

  const hasActiveFilters = Boolean(
    filters.sport ||
    filters.category ||
    filters.level ||
    filters.participation ||
    filters.query ||
    filters.min_duration ||
    filters.max_duration
  );

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* Page Header: Title and Exact Approved Tagline */}
      <section className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden border border-slate-800">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-3 border border-white/15">
            <Dumbbell className="w-3.5 h-3.5 text-rally-accent" />
            <span>پلتفرم تمرینی رالی</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2.5">
            تمرینات تخصصی
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            تمرین مناسب سطح خودت را پیدا کن و در جلسه بعد اجرا کن.
          </p>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-rally-primary/20 rounded-full pointer-events-none" />
      </section>

      {/* Filter and Search Bar */}
      <DrillFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalCount={data?.total}
      />

      {/* Main Drills Directory Area */}
      <section aria-label="فهرست تمرینات تخصصی">
        {isLoading ? (
          <DrillsLoadingSkeleton />
        ) : errorMessage ? (
          <DrillsErrorState
            message={errorMessage}
            onRetry={() => fetchDrills(filters)}
          />
        ) : !data || data.drills.length === 0 ? (
          <DrillsEmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.drills.map((drill) => (
                <DrillCard
                  key={drill.id}
                  drill={drill}
                  onSelect={onSelectDrill}
                  onToggleBookmark={handleToggleBookmark}
                  isBookmarked={drill.is_bookmarked}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <DrillsPagination
              currentPage={data.page}
              totalPages={data.total_pages}
              onPageChange={(page) => handleFilterChange({ page })}
            />
          </>
        )}
      </section>
    </div>
  );
};

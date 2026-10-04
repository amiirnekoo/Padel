import { useState, useCallback } from 'react';
import { CourtClub } from '../types/rally';
import { calculateDirectDistanceKm } from '../utils/persianUtils';

export function useCourtsDistance() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDistanceSorted, setIsDistanceSorted] = useState<boolean>(false);

  /**
   * درخواست موقعیت مکانی فقط پس از کلیک صریح کاربر (User Action)
   * در صورت رد شدن مجوز، فیلترهای دیگر و لیست بدون تغییر باقی می‌مانند
   */
  const requestLocationAndSort = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('مرورگر شما از دریافت موقعیت مکانی پشتیبانی نمی‌کند.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserCoords(coords);
        setIsDistanceSorted(true);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setIsDistanceSorted(false);
        if (err.code === 1) {
          setLocationError('مجوز موقعیت مکانی صادر نشد. فیلتر دستی در دسترس است.');
        } else {
          setLocationError('دریافت موقعیت مکانی ناموفق بود.');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);

  const clearDistanceSort = useCallback(() => {
    setIsDistanceSorted(false);
    setLocationError(null);
  }, []);

  /**
   * تزریق فاصله مستقیم و مرتب‌سازی در صورت در دسترس بودن موقعیت کاربر
   */
  const applyDistanceToClubs = useCallback((clubs: CourtClub[]): CourtClub[] => {
    if (!userCoords || !isDistanceSorted) {
      return clubs;
    }

    const clubsWithDistance = clubs.map((club) => {
      if (club.latitude && club.longitude) {
        const dist = calculateDirectDistanceKm(
          userCoords.lat,
          userCoords.lng,
          club.latitude,
          club.longitude
        );
        return { ...club, directDistanceKm: dist };
      }
      return club;
    });

    return [...clubsWithDistance].sort((a, b) => {
      const distA = a.directDistanceKm ?? 999999;
      const distB = b.directDistanceKm ?? 999999;
      return distA - distB;
    });
  }, [userCoords, isDistanceSorted]);

  return {
    userCoords,
    isLocating,
    locationError,
    isDistanceSorted,
    requestLocationAndSort,
    clearDistanceSort,
    applyDistanceToClubs
  };
}

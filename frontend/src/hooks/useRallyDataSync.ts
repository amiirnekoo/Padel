import { useEffect } from 'react';
import { rallyApi } from '../services/rallyApi';
import { CourtClub, ShopProduct } from '../types/rally';

export const useRallyDataSync = (
  setProductsList: React.Dispatch<React.SetStateAction<ShopProduct[]>>,
  setClubsList: React.Dispatch<React.SetStateAction<CourtClub[]>>
) => {
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch public venues from backend database
    rallyApi
      .getPublicVenues()
      .then((venues) => {
        if (isMounted && Array.isArray(venues) && venues.length > 0) {
          setClubsList((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newClubs: CourtClub[] = venues
              .filter((v: any) => !existingIds.has(v.id))
              .map((v: any) => ({
                id: v.id,
                name: v.name,
                sport: 'PADEL',
                city: v.city || 'تهران',
                area: v.address?.split('،')[0] || 'مرکزی',
                address: v.address,
                courtType: 'OUTDOOR',
                surface: 'چمن مصنوعی آبی موندو',
                startingPrice: Math.floor(Number(v.default_hourly_rate || 3000000) / 10),
                images: ['/images/courts/club_enghelab_central.jpg'],
                rating: 4.9,
                amenities: v.amenities
                  ? v.amenities.split('،').map((s: string, idx: number) => ({ id: `am-${idx}`, label: s.trim(), iconName: 'Check' }))
                  : [{ id: 'am-1', label: 'پارکینگ', iconName: 'Check' }, { id: 'am-2', label: 'کافه', iconName: 'Check' }],
                rules: ['کفش ورزشی مناسب الزامی است'],
                cancellationPolicy: 'استرداد ۱۰۰٪ تا ۲۴ ساعت پیش از سانس',
                slots: [],
                latitude: 35.7984,
                longitude: 51.4123,
              }));
            return newClubs.length > 0 ? [...newClubs, ...prev] : prev;
          });
        }
      })
      .catch(() => {});

    // 2. Fetch products and sync latest prices/stock from backend
    rallyApi
      .getProducts()
      .then((prods) => {
        if (isMounted && Array.isArray(prods) && prods.length > 0) {
          setProductsList((prev) => {
            const prodMap = new Map(prods.map((p: any) => [p.id, p]));
            return prev.map((p) => {
              const remote = prodMap.get(p.id);
              if (remote) {
                return {
                  ...p,
                  price: remote.price_toman ? remote.price_toman * 10 : (remote.price || p.price),
                  stock: remote.stock ?? p.stock,
                };
              }
              return p;
            });
          });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [setProductsList, setClubsList]);
};

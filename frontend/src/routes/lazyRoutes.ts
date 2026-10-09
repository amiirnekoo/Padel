import { lazy } from 'react';
import { UserSession } from '../components/AuthModal';
import { ShopProduct } from '../types/rally';
import { MOCK_SHOP_PRODUCTS } from '../data/mockRallyShopData';

// Dynamic lazy imports for heavy subpages and portals
export const RallyCourtsPage = lazy(() => import('../pages/rally/RallyCourtsPage').then(m => ({ default: m.RallyCourtsPage })));
export const RallyMatchmakingPage = lazy(() => import('../pages/rally/RallyMatchmakingPage').then(m => ({ default: m.RallyMatchmakingPage })));
export const RallyCoachesPage = lazy(() => import('../pages/rally/RallyCoachesPage').then(m => ({ default: m.RallyCoachesPage })));
export const RallyTournamentsPage = lazy(() => import('../pages/rally/RallyTournamentsPage').then(m => ({ default: m.RallyTournamentsPage })));
export const RallyRankingsPage = lazy(() => import('../pages/rally/RallyRankingsPage').then(m => ({ default: m.RallyRankingsPage })));
export const RallyMagazinePage = lazy(() => import('../pages/rally/RallyMagazinePage').then(m => ({ default: m.RallyMagazinePage })));
export const RallyShopPage = lazy(() => import('../pages/rally/RallyShopPage').then(m => ({ default: m.RallyShopPage })));
export const RallyProductDetailPage = lazy(() => import('../pages/rally/shop/RallyProductDetailPage').then(m => ({ default: m.RallyProductDetailPage })));
export const DrillsDirectoryPage = lazy(() => import('../pages/drills/DrillsDirectoryPage').then(m => ({ default: m.DrillsDirectoryPage })));
export const DrillDetailPage = lazy(() => import('../pages/drills/DrillDetailPage').then(m => ({ default: m.DrillDetailPage })));
export const AdminPortalPage = lazy(() => import('../pages/rally/admin/AdminPortalPage').then(m => ({ default: m.AdminPortalPage })));
export const UnifiedPortalPage = lazy(() => import('../pages/rally/portal/UnifiedPortalPage').then(m => ({ default: m.UnifiedPortalPage })));
export const RallyTermsPage = lazy(() => import('../pages/rally/info').then(m => ({ default: m.RallyTermsPage })));
export const RallyAboutPage = lazy(() => import('../pages/rally/info').then(m => ({ default: m.RallyAboutPage })));
export const RallyContactPage = lazy(() => import('../pages/rally/info').then(m => ({ default: m.RallyContactPage })));

export function getInitialUserSession(): UserSession | null {
  try {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (searchParams?.get('demo') === 'club' || searchParams?.get('portal') === 'club') {
      const demoClub: UserSession = {
        userId: 'usr-lafour-manager',
        phoneNumber: '09121112233',
        role: 'CLUB_MANAGER',
        fullName: 'مدیریت پدل کلاب نیاوران (لفور)',
        token: 'demo_token_lafour'
      };
      localStorage.setItem('padel_auth', JSON.stringify(demoClub));
      return demoClub;
    }
    const saved = localStorage.getItem('padel_auth');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

export function getInitialShopProducts(): ShopProduct[] {
  try {
    // Purge legacy shop product caches to guarantee always-fresh catalog
    localStorage.removeItem('rally_shop_products');
    localStorage.removeItem('rally_shop_cache_ver');
    return MOCK_SHOP_PRODUCTS;
  } catch {
    return MOCK_SHOP_PRODUCTS;
  }
}

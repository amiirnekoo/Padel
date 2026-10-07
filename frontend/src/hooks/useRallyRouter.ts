import { useState, useEffect, useCallback } from 'react';
import { RallyPageTab } from '../components/rally/RallyHeader';
import { ShopProduct } from '../types/rally';

export interface RouteState {
  tab: RallyPageTab;
  productId: string | null;
  drillSlug: string | null;
  isAdmin: boolean;
  isPortal: boolean;
}

const TAB_TITLES: Record<RallyPageTab, string> = {
  home: 'رالی پدل | تقویم زنده، رزرو زمین و فروشگاه تخصصی',
  drills: 'تمرینات تخصصی پدل و تنیس | رالی',
  courts: 'رزرو آنلاین زمین‌ها و کورت‌های پدل و تنیس | رالی',
  matchmaking: 'حریف‌یابی و مسابقات دوستانه پدل | رالی',
  coaches: 'رزرو مربیان رسمی و بین‌المللی پدل | رالی',
  tournaments: 'مسابقات و تورنمنت‌های کشوری پدل | رالی',
  rankings: 'رنکینگ رسمی بازیکنان پدل ایران و جهان | رالی',
  magazine: 'مجله، اخبار، رویدادها و آموزش‌های تخصصی پدل | رالی',
  shop: 'فروشگاه تخصصی راکت و تجهیزات اورجینال پدل | رالی',
  partners: 'همکاری تجاری و باشگاه‌ها | رالی',
  sponsors: 'اسپانسرها و حامیان رالی',
  terms: 'قوانین، مقررات و رویه استرداد وجه | رالی',
  about: 'درباره ما | پلتفرم ورزشی رالی',
  contact: 'تماس با ما و ثبت شکایات | رالی'
};

export function parsePath(pathname: string): RouteState {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPortalQuery = searchParams?.get('portal') === 'club' || searchParams?.get('demo') === 'club';

  if (cleanPath.startsWith('/admin')) {
    return { tab: 'home', productId: null, drillSlug: null, isAdmin: true, isPortal: false };
  }
  if (cleanPath.startsWith('/portal') || isPortalQuery) {
    return { tab: 'home', productId: null, drillSlug: null, isAdmin: false, isPortal: true };
  }

  // Check drill detail page: /drills/:slug
  const drillMatch = cleanPath.match(/^\/drills\/(.+)$/);
  if (drillMatch) {
    const rawSlug = decodeURIComponent(drillMatch[1]);
    return { tab: 'drills', productId: null, drillSlug: rawSlug, isAdmin: false, isPortal: false };
  }

  // Check product page: /shop/:id or /product/:id
  const shopMatch = cleanPath.match(/^\/shop\/(.+)$/);
  if (shopMatch) {
    const rawId = decodeURIComponent(shopMatch[1]);
    return { tab: 'shop', productId: rawId, drillSlug: null, isAdmin: false, isPortal: false };
  }
  const prodMatch = cleanPath.match(/^\/product\/(.+)$/);
  if (prodMatch) {
    const rawId = decodeURIComponent(prodMatch[1]);
    return { tab: 'shop', productId: rawId, drillSlug: null, isAdmin: false, isPortal: false };
  }

  switch (cleanPath) {
    case '/drills':
      return { tab: 'drills', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/courts':
      return { tab: 'courts', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/coaches':
      return { tab: 'coaches', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/matchmaking':
      return { tab: 'matchmaking', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/tournaments':
      return { tab: 'tournaments', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/rankings':
      return { tab: 'rankings', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/magazine':
      return { tab: 'magazine', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/shop':
      return { tab: 'shop', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/terms':
    case '/rules':
    case '/privacy':
      return { tab: 'terms', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/about':
      return { tab: 'about', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    case '/contact':
      return { tab: 'contact', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
    default:
      return { tab: 'home', productId: null, drillSlug: null, isAdmin: false, isPortal: false };
  }
}

export function useRallyRouter(allProducts: ShopProduct[]) {
  const [route, setRoute] = useState<RouteState>(() => parsePath(window.location.pathname));

  // Sync state on browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update document title dynamically based on active route
  useEffect(() => {
    if (route.isAdmin) {
      document.title = 'پنل مدیریت یکپارچه پلتفرم رالی';
      return;
    }
    if (route.isPortal) {
      document.title = 'پرتال اختصاصی ورزشکاران و همکاران | رالی';
      return;
    }
    if (route.productId) {
      const prod = allProducts.find((p) => p.id === route.productId);
      if (prod) {
        document.title = `${prod.name_fa} | فروشگاه رالی`;
        return;
      }
    }
    if (route.drillSlug) {
      document.title = 'جزئیات تمرین تخصصی | رالی';
      return;
    }
    document.title = TAB_TITLES[route.tab] || 'رالی پدل | مرجع ورزش‌های راکتی ایران';
  }, [route, allProducts]);

  const navigateToTab = useCallback((tab: RallyPageTab) => {
    const targetUrl = tab === 'home' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ tab, productId: null, drillSlug: null, isAdmin: false, isPortal: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToDrill = useCallback((drillSlug: string) => {
    const targetUrl = `/drills/${encodeURIComponent(drillSlug)}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ tab: 'drills', productId: null, drillSlug, isAdmin: false, isPortal: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const backToDrills = useCallback(() => {
    if (window.location.pathname !== '/drills') {
      window.history.pushState({}, '', '/drills');
    }
    setRoute({ tab: 'drills', productId: null, drillSlug: null, isAdmin: false, isPortal: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToProduct = useCallback((productId: string) => {
    const targetUrl = `/shop/${encodeURIComponent(productId)}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ tab: 'shop', productId, drillSlug: null, isAdmin: false, isPortal: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const backToShop = useCallback(() => {
    if (window.location.pathname !== '/shop') {
      window.history.pushState({}, '', '/shop');
    }
    setRoute({ tab: 'shop', productId: null, drillSlug: null, isAdmin: false, isPortal: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToPortal = useCallback(() => {
    if (window.location.pathname !== '/portal') {
      window.history.pushState({}, '', '/portal');
    }
    setRoute({ tab: 'home', productId: null, drillSlug: null, isAdmin: false, isPortal: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToAdmin = useCallback(() => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setRoute({ tab: 'home', productId: null, drillSlug: null, isAdmin: true, isPortal: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const exitSpecialPage = useCallback(() => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setRoute({ tab: 'home', productId: null, drillSlug: null, isAdmin: false, isPortal: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    route,
    navigateToTab,
    navigateToDrill,
    backToDrills,
    navigateToProduct,
    backToShop,
    navigateToPortal,
    navigateToAdmin,
    exitSpecialPage,
  };
}

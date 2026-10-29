import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './motion';
export const PAGES = ['leeral', 'sunuchat', 'saaytu', 'waluma', 'contact'];


function parseLocation() {
  const legacy = (window.location.hash || '').match(/^#\/([a-z]+)$/);

  if (legacy && PAGES.includes(legacy[1])) {
    const prefix = window.location.pathname.startsWith('/en') ? '/en' : '';
    window.history.replaceState(
      {},
      '',
      `${prefix}/${legacy[1]}`
    );
    return { page: legacy[1], anchor: null };
  }

 
  const rawPathname =
    window.location.pathname.replace(/\/+$/, '') || '/';

  const pathname =
    rawPathname.replace(/^\/en(?=\/|$)/, '') || '/';

  const segment = pathname === '/' ? '' : pathname.slice(1);

  if (PAGES.includes(segment)) {
    return { page: segment, anchor: null };
  }

  const hash = window.location.hash || '';
  const anchor =
    hash.length > 1 && !hash.startsWith('#/')
      ? hash.slice(1)
      : null;

  return { page: 'home', anchor };
}


export function navigate(path, options = {}) {
  const target = path.startsWith('#/') ? path.slice(1) : path;
  if (target.startsWith('#')) {
    window.location.hash = target;
    return;
  }
  if (options.replace) window.history.replaceState({}, '', target);
  else window.history.pushState({}, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function useHashRoute() {
  const [route, setRoute] = useState(parseLocation);
  const current = useRef(route.page);

  const scrollToAnchor = useCallback((anchor, delay = 0) => {
    if (!anchor) return;
    window.setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView();
    }, delay);
  }, []);

  useEffect(() => {
    if (route.page === 'home' && route.anchor) scrollToAnchor(route.anchor, 60);
    const onNavigate = () => {
      const next = parseLocation();
      const swap = () => {
        flushSync(() => setRoute(next));
        current.current = next.page;
        if (next.page !== 'home') window.scrollTo(0, 0);
      };
      if (next.page !== current.current && document.startViewTransition && !prefersReducedMotion()) {
        document.startViewTransition(swap);
      } else {
        swap();
      }
      if (next.page === 'home') scrollToAnchor(next.anchor, 80);
    };
    window.addEventListener('popstate', onNavigate);
    window.addEventListener('hashchange', onNavigate);
    return () => {
      window.removeEventListener('popstate', onNavigate);
      window.removeEventListener('hashchange', onNavigate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return route;
}

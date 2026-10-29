import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './motion';

// Routage par URL propre : /, /leeral, /sunuchat, /saaytu, /waluma et /contact.
// Les anciennes URL #/page restent prises en charge et sont converties en chemins propres.
export const PAGES = ['leeral', 'sunuchat', 'saaytu', 'waluma', 'contact'];

function parseLocation() {
  const legacy = (window.location.hash || '').match(/^#\/([a-z]+)$/);
  if (legacy && PAGES.includes(legacy[1])) {
    window.history.replaceState({}, '', `/${legacy[1]}`);
    return { page: legacy[1], anchor: null };
  }
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const segment = pathname === '/' ? '' : pathname.slice(1);
  if (PAGES.includes(segment)) return { page: segment, anchor: null };
  const hash = window.location.hash || '';
  const anchor = hash.length > 1 && !hash.startsWith('#/') ? hash.slice(1) : null;
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

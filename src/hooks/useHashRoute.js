import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './motion';
import { PAGE_IDS, resolvePath, langFromPath, pathFor } from '../routes';

export const PAGES = PAGE_IDS.filter((id) => id !== 'home');


function parseLocation() {
  const legacy = (window.location.hash || '').match(/^#\/([a-z]+)$/);

  if (legacy && PAGES.includes(legacy[1])) {
    window.history.replaceState({}, '', pathFor(legacy[1], langFromPath()));
    return { page: legacy[1], anchor: null };
  }

  const hit = resolvePath(window.location.pathname);
  if (hit && hit.page !== 'home') {
    return { page: hit.page, anchor: null };
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

  // Défile jusqu'à l'ancre (#travaux…) : on attend que la section existe,
  // car en venant d'une autre page l'accueil est encore en train de s'afficher.
  const scrollToAnchor = useCallback((anchor, delay = 0) => {
    if (!anchor) return;
    let tries = 0;
    const attempt = () => {
      const el = document.getElementById(anchor);
      if (el) { el.scrollIntoView(); return; }
      if (tries++ < 30) window.setTimeout(attempt, 50);
    };
    window.setTimeout(attempt, delay);
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

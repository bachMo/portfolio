import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './motion';

// Routage par hash : #/contact, #/sunuchat, #/saaytu, #/waluma — et ancres (#travaux…) sur l'accueil.
// Fonctionne sur n'importe quel hébergement statique, sans configuration de réécriture.
export const PAGES = ['sunuchat', 'saaytu', 'waluma', 'contact'];

function parse(hash) {
  const m = (hash || '').match(/^#\/([a-z]+)$/);
  if (m && PAGES.includes(m[1])) return { page: m[1], anchor: null };
  const anchor = hash && hash.length > 1 && !hash.startsWith('#/') ? hash.slice(1) : null;
  return { page: 'home', anchor };
}

export default function useHashRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  const current = useRef(route.page);

  const scrollToAnchor = useCallback((anchor, delay) => {
    if (!anchor) return;
    setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView();
    }, delay);
  }, []);

  useEffect(() => {
    // premier chargement avec une ancre
    if (route.page === 'home' && route.anchor) scrollToAnchor(route.anchor, 60);
    const onHash = () => {
      const next = parse(window.location.hash);
      if (next.page !== current.current) {
        current.current = next.page;
        const swap = () => {
          flushSync(() => setRoute(next));
          if (next.page !== 'home') window.scrollTo(0, 0);
        };
        if (document.startViewTransition && !prefersReducedMotion()) document.startViewTransition(swap);
        else swap();
        if (next.page === 'home') scrollToAnchor(next.anchor, 80);
      } else {
        setRoute(next);
        if (next.page === 'home') scrollToAnchor(next.anchor, 0);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return route;
}

import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { usePrefs } from '../i18n/PrefsContext';
import { prefersReducedMotion } from '../hooks/motion';

/** Bascule clair/sombre avec une révélation circulaire qui part du bouton. */
export default function ThemeToggle() {
  const { theme, applyTheme, t } = usePrefs();
  const ref = useRef(null);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    if (!document.startViewTransition || prefersReducedMotion()) {
      applyTheme(next);
      return;
    }
    const r = ref.current.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.classList.add('theme-vt');
    const vt = document.startViewTransition(() => flushSync(() => applyTheme(next)));
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
    vt.finished.finally(() => root.classList.remove('theme-vt'));
  };

  return (
    <button ref={ref} className="iconbtn theme-btn" type="button" aria-label={t('aria.theme')} aria-pressed={theme === 'dark'} onClick={toggle}>
      <svg className="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
      </svg>
    </button>
  );
}

import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import { CONFIG } from '../config';
import LangSwitch from './LangSwitch';
import useLink from '../hooks/useLink';
import ThemeToggle from './ThemeToggle';

const SECTIONS = ['services', 'travaux', 'expertise', 'parcours'];

/** En-tête collant + barre de progression + menu mobile plein écran + scrollspy. */
export default function Nav({ page }) {
  const { t } = usePrefs();
  const L = useLink();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const progRef = useRef(null);
  const burgerRef = useRef(null);

  // progression de lecture
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progRef.current) progRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [page]);

  // section active (accueil uniquement)
  useEffect(() => {
    setActive(null);
    if (page !== 'home') return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [page]);

  // menu mobile
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    const onKey = (e) => { if (e.key === 'Escape' && open) { setOpen(false); burgerRef.current && burgerRef.current.focus(); } };
    const onResize = () => { if (window.innerWidth > 760) setOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);

  const link = (id, key) => (
  <a
    href={page === 'home' ? `#${id}` : L('home', id)}
    aria-current={active === id ? 'true' : undefined}
    dangerouslySetInnerHTML={{ __html: t(key) }}
  />
);
  const dlink = (href, key, n) => (
    <a href={href} onClick={() => setOpen(false)}>
      <b style={{ fontWeight: 400 }} dangerouslySetInnerHTML={{ __html: t(key) }} />
      <span>{n}</span>
    </a>
  );

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <a
            className="brand"
            href={page === 'home' ? '#top' : L('home')}
            aria-label={t('aria.home')}
          >
            <b>Bachir Sy</b>
            <span>/ DKR</span>
          </a>
          <nav className="links" aria-label={t('aria.mainnav')}>
            {link('services', 'nav.services')}
            {link('travaux', 'nav.work')}
            {link('expertise', 'nav.expertise')}
            {link('parcours', 'nav.path')}
          </nav>
          <div className="nav-right">
            <LangSwitch />
            <ThemeToggle />
            <a className="pill dark magnetic" href={L('contact')} dangerouslySetInnerHTML={{ __html: t('nav.cta') }} />
            <button ref={burgerRef} className="burger" type="button" aria-expanded={open} aria-controls="drawer"
                    aria-label={open ? t('aria.close') : t('aria.menu')} onClick={() => setOpen(!open)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path className="l1" d="M4 8h16" />
                <path className="l2" d="M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="progress" aria-hidden="true"><i ref={progRef} /></div>
      </header>
      <nav className="drawer" id="drawer" hidden={!open} aria-label={t('aria.mobilenav')}>
        <div className="dlinks">
          {dlink(page === 'home' ? '#services' : L('home', 'services'), 'nav.services', '01')}
          {dlink(page === 'home' ? '#travaux' : L('home', 'travaux'), 'nav.work', '02')} 
{dlink(page === 'home' ? '#expertise' : L('home', 'expertise'), 'nav.expertise', '03')}
{dlink(page === 'home' ? '#parcours' : L('home', 'parcours'), 'nav.path', '04')}
          {dlink(L('contact'), 'nav.contact', '05')}
        </div>
        <div className="dfoot">
          <LangSwitch />
          <a className="mono muted" href={'mailto:' + CONFIG.contactEmail}>{CONFIG.contactEmail}</a>
        </div>
      </nav>
    </>
  );
}

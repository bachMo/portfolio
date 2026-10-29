import { useEffect } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Interactions from './components/Interactions';
import Creative from './components/Creative';
import CommandPalette from './components/CommandPalette';
import ChapterRail from './components/ChapterRail';
import EasterEgg from './components/EasterEgg';
import useHashRoute from './hooks/useHashRoute';
import { usePrefs } from './i18n/PrefsContext';
import Home from './pages/Home';
import CaseLeeral from './pages/CaseLeeral';
import CaseSunuChat from './pages/CaseSunuChat';
import CaseSaaytu from './pages/CaseSaaytu';
import CaseWaluma from './pages/CaseWaluma';
import Contact from './pages/Contact';
import ServicePage from './pages/ServicePage';
import { Analytics } from '@vercel/analytics/react';
import { SITE_URL, ROUTES, resolvePath, langFromPath } from './routes';

const PAGES = {
  home: Home,
  leeral: CaseLeeral,
  sunuchat: CaseSunuChat,
  saaytu: CaseSaaytu,
  waluma: CaseWaluma,
  contact: Contact,
  'svc-site': ServicePage,
  'svc-platform': ServicePage,
  'svc-ai': ServicePage,
};


function setMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const match = selector.match(/(name|property)="([^"]+)"/);
    if (match) element.setAttribute(match[1], match[2]);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

export default function App() {
  const { t, lang } = usePrefs();
  const { page } = useHashRoute();
  const Page = PAGES[page] || Home;

  useEffect(() => {
    // La langue suit l'URL (/en/...) pour que le titre et l'URL canonique
    // restent ceux de la page affichée, comme dans le HTML généré au build.
    const isEn = langFromPath() === 'en';
    const metadata = (ROUTES[page] || ROUTES.home)[isEn ? 'en' : 'fr'];
    const canonical = `${SITE_URL}${metadata.path}`;
    document.title = metadata.title;
    setMeta('meta[name="description"]', 'content', metadata.description);
    setMeta('meta[property="og:title"]', 'content', metadata.title);
    setMeta('meta[property="og:description"]', 'content', metadata.description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:locale"]', 'content', isEn ? 'en_US' : 'fr_FR');
    setMeta('meta[name="twitter:title"]', 'content', metadata.title);
    setMeta('meta[name="twitter:description"]', 'content', metadata.description);
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
  }, [page, lang]);

  // Navigation interne sans rechargement : tous les liens « /… » (et « /…#ancre »)
  // passent par l'historique du navigateur. Le rideau animé (Creative) passe en premier.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href^="/"]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!resolvePath(href.split('#')[0])) return;
      e.preventDefault();
      if (href !== window.location.pathname + window.location.hash) window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <Nav page={page} />
      <div id="main">
        <Page key={page} page={page} />
      </div>
      <Footer />
      <Interactions />
      <Creative page={page} />
      <ChapterRail page={page} />
      <CommandPalette />
      <EasterEgg />
      <div className="grain" aria-hidden="true" />
      <Analytics />
    </>
  );
}

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
import { Analytics } from '@vercel/analytics/react';
import SEO_DATA from './seo/pages.json';

const PAGES = {
  home: Home,
  leeral: CaseLeeral,
  sunuchat: CaseSunuChat,
  saaytu: CaseSaaytu,
  waluma: CaseWaluma,
  contact: Contact,
};

// Titres et descriptions partagés avec le script de génération (scripts/generate-seo-pages.js)
const SITE_URL = SEO_DATA.site;
const SEO_PAGES = SEO_DATA.pages;

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
    const isEn = /^\/en(\/|$)/.test(window.location.pathname);
    const base = page === 'home' ? '/' : `/${page}`;
    const route = isEn ? (base === '/' ? '/en/' : `/en${base}`) : base;
    const metadata = SEO_PAGES[route] || SEO_PAGES[isEn ? '/en/' : '/'];
    const canonical = `${SITE_URL}${route}`;
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

  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <Nav page={page} />
      <div id="main">
        <Page key={page} />
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

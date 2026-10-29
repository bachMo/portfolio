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

const PAGES = {
  home: Home,
  leeral: CaseLeeral,
  sunuchat: CaseSunuChat,
  saaytu: CaseSaaytu,
  waluma: CaseWaluma,
  contact: Contact,
};

const SEO = {
  home: {
    title: 'Bachir Sy | Développeur freelance Full-Stack & IA à Dakar',
    description: 'Mamadou Bachir Sy, développeur freelance Full-Stack et IA à Dakar, Sénégal. Applications web et mobiles, chatbots IA, assistants multilingues et automatisation.'
  },
  leeral: {
    title: 'Leeral | Assistant IA multilingue en français, wolof et pulaar — Bachir Sy',
    description: 'Découvrez Leeral, un assistant intelligent qui aide à comprendre les documents du quotidien grâce à l’IA, au texte et à la voix, en français, wolof et pulaar.'
  },
  sunuchat: {
    title: 'SunuChat | Assistant conversationnel de santé par IA — Bachir Sy',
    description: 'Étude de cas SunuChat : assistant conversationnel de santé combinant IA générative, recherche documentaire et expérience multilingue texte et voix.'
  },
  saaytu: {
    title: 'Saaytu Mbay | Assistant IA pour l’agriculture — Bachir Sy',
    description: 'Découvrez Saaytu Mbay, un assistant numérique agricole qui aide les producteurs à accéder à des informations pratiques grâce à l’intelligence artificielle.'
  },
  waluma: {
    title: 'Waluma | Plateforme numérique de mise en relation santé — Bachir Sy',
    description: 'Étude de cas Waluma : plateforme web et mobile pour faciliter la gestion des praticiens, des missions et des services de santé.'
  },
  contact: {
    title: 'Contacter Bachir Sy | Développeur freelance Full-Stack & IA à Dakar',
    description: 'Vous avez un projet web, mobile ou IA ? Contactez Bachir Sy, développeur freelance Full-Stack et IA basé à Dakar, Sénégal.'
  }
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
  const { t } = usePrefs();
  const { page } = useHashRoute();
  const Page = PAGES[page] || Home;

  useEffect(() => {
    const metadata = SEO[page] || SEO.home;
    const path = page === 'home' ? '/' : `/${page}`;
    const canonical = `https://www.bachirsy.com${path}`;
    document.title = metadata.title;
    setMeta('meta[name="description"]', 'content', metadata.description);
    setMeta('meta[property="og:title"]', 'content', metadata.title);
    setMeta('meta[property="og:description"]', 'content', metadata.description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
  }, [page]);

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

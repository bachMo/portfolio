import Nav from './components/Nav';
import Footer from './components/Footer';
import Interactions from './components/Interactions';
import Creative from './components/Creative';
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

export default function App() {
  const { t } = usePrefs();
  const { page } = useHashRoute();
  const Page = PAGES[page] || Home;

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
      <div className="grain" aria-hidden="true" />
      <Analytics />
    </>
  );
}

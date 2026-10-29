
import { usePrefs } from '../i18n/PrefsContext';
import { useCallback } from 'react';

export default function LangSwitch() {
  const { lang, setLang, t } = usePrefs();

  const changeLanguage = useCallback((nextLang) => {
    if (lang === nextLang) return;

    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const isEnglish = pathname === '/en' || pathname.startsWith('/en/');
    const currentPath = isEnglish
      ? pathname.replace(/^\/en(?=\/|$)/, '') || '/'
      : pathname;

    const nextPath = nextLang === 'en'
      ? (currentPath === '/' ? '/en/' : `/en${currentPath}`)
      : currentPath;

    setLang(nextLang);
    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [lang, setLang]);

  return (
    <div className="lang" data-lang={lang} role="group" aria-label={t('aria.lang')}>
      <span className="knob" aria-hidden="true" />
      {['fr', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => changeLanguage(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

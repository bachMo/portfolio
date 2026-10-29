
import { usePrefs } from '../i18n/PrefsContext';
import { useCallback } from 'react';
import { resolvePath, pathFor } from '../routes';

export default function LangSwitch() {
  const { lang, setLang, t } = usePrefs();

  const changeLanguage = useCallback((nextLang) => {
    if (lang === nextLang) return;

    // Même page, dans l'autre langue (les slugs peuvent différer : /services/creation-site-web ⇄ /en/services/website-development).
    const hit = resolvePath(window.location.pathname);
    const nextPath = pathFor(hit ? hit.page : 'home', nextLang);

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

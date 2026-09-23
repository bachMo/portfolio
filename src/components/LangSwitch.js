import { usePrefs } from '../i18n/PrefsContext';

export default function LangSwitch() {
  const { lang, setLang, t } = usePrefs();
  return (
    <div className="lang" data-lang={lang} role="group" aria-label={t('aria.lang')}>
      <span className="knob" aria-hidden="true" />
      {['fr', 'en'].map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => lang !== l && setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

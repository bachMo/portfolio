import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import fr from './fr';
import en from './en';
import { langFromPath } from '../routes';

const DICTS = { fr, en };


export function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch (e) {
    /* stockage indisponible : on ignore */
  }
  return null;
}

function initialLang() {
  return langFromPath();
}

const mq = () => window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return mq().matches ? 'dark' : 'light';
}

const PrefsContext = createContext(null);

export function PrefsProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const [theme, setThemeState] = useState(currentTheme);

  const t = useCallback((key) => {
    const v = DICTS[lang][key];
    return v !== undefined ? v : fr[key] !== undefined ? fr[key] : key;
  }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
    store('bs-lang', l);
  }, []);

  // Applique le thème sur <html> (appelé de façon synchrone pendant la transition).
  const applyTheme = useCallback((next) => {
    document.documentElement.setAttribute('data-theme', next);
    store('bs-theme', next);
    setThemeState(next);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // Boutons Précédent / Suivant du navigateur : la langue suit l'URL.
  useEffect(() => {
    const onPop = () => setLangState(langFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#15120F' : '#F7F0E5');
  }, [theme]);

  // Suit le thème système tant que l'utilisateur n'a rien choisi.
  useEffect(() => {
    const m = mq();
    const onChange = () => {
      if (!document.documentElement.getAttribute('data-theme')) setThemeState(m.matches ? 'dark' : 'light');
    };
    m.addEventListener ? m.addEventListener('change', onChange) : m.addListener(onChange);
    return () => (m.removeEventListener ? m.removeEventListener('change', onChange) : m.removeListener(onChange));
  }, []);

  const value = useMemo(() => ({ lang, setLang, t, theme, applyTheme }), [lang, setLang, t, theme, applyTheme]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  return useContext(PrefsContext);
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import { CONFIG } from '../config';
import { CV } from '../data/cv';

const TXT = {
  fr: {
    ph: 'Où voulez-vous aller ?', go: 'Aller', act: 'Actions', cases: 'Études de cas', none: 'Aucun résultat',
    home: 'Accueil', svc: 'Services', work: 'Travaux', exp: 'Expertise', path: 'Parcours', contact: 'Écrire un message',
    mail: 'Copier mon adresse e-mail', copied: 'Adresse copiée !', cv: 'Télécharger mon CV', theme: 'Changer de thème',
    lang: 'Switch to English', li: 'Mon LinkedIn', hint: 'naviguer', enter: 'ouvrir', esc: 'fermer',
  },
  en: {
    ph: 'Where do you want to go?', go: 'Go to', act: 'Actions', cases: 'Case studies', none: 'No results',
    home: 'Home', svc: 'Services', work: 'Work', exp: 'Expertise', path: 'Background', contact: 'Write me a message',
    mail: 'Copy my email address', copied: 'Address copied!', cv: 'Download my résumé', theme: 'Toggle theme',
    lang: 'Passer en français', li: 'My LinkedIn', hint: 'navigate', enter: 'open', esc: 'close',
  },
};

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Palette de commandes : Ctrl/⌘ + K (ou « / ») pour tout atteindre au clavier. */
export default function CommandPalette() {
  const { lang, setLang, theme, applyTheme } = usePrefs();
  const tx = TXT[lang] || TXT.fr;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [toast, setToast] = useState('');
  const input = useRef(null);
  const last = useRef(null);

  const go = (path) => () => {
    if (path.startsWith('#/')) path = path.slice(1);
    if (path.startsWith('#')) { window.location.hash = path; return; }
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const items = useMemo(() => [
    { g: tx.go, label: tx.home, k: '↖', run: () => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { g: tx.go, label: tx.svc, k: '01', run: go('#services') },
    { g: tx.go, label: tx.work, k: '02', run: go('#travaux') },
    { g: tx.go, label: tx.exp, k: '03', run: go('#expertise') },
    { g: tx.go, label: tx.path, k: '04', run: go('#parcours') },
    { g: tx.cases, label: 'Leeral', k: 'IA', run: go('/leeral') },
    { g: tx.cases, label: 'SunuChat', k: 'IA', run: go('/sunuchat') },
    { g: tx.cases, label: 'Saaytu Mbay', k: 'IA', run: go('/saaytu') },
    { g: tx.cases, label: 'Waluma', k: 'Web', run: go('/waluma') },
    { g: tx.act, label: tx.contact, k: '✉', run: go('/contact') },
    { g: tx.act, label: tx.mail, k: '⧉', run: () => {
      const done = () => { setToast(tx.copied); setTimeout(() => setToast(''), 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(CONFIG.contactEmail).then(done, done); else done();
    } },
    { g: tx.act, label: tx.cv, k: 'PDF', run: () => {
      const cv = (CV[lang] || CV.fr)[theme === 'dark' ? 'dark' : 'light'];
      const a = document.createElement('a'); a.href = cv.href; a.download = cv.file; document.body.appendChild(a); a.click(); a.remove();
    } },
    { g: tx.act, label: tx.theme, k: theme === 'dark' ? '☀' : '☾', run: () => applyTheme(theme === 'dark' ? 'light' : 'dark') },
    { g: tx.act, label: tx.lang, k: lang === 'fr' ? 'EN' : 'FR', run: () => setLang(lang === 'fr' ? 'en' : 'fr') },
    { g: tx.act, label: tx.li, k: '↗', run: () => window.open(CONFIG.links.linkedin, '_blank', 'noopener') },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [lang, theme]);

  const list = useMemo(() => {
    const n = norm(q.trim());
    return n ? items.filter((it) => norm(it.label + ' ' + it.g).includes(n)) : items;
  }, [q, items]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === '/' && !typing && !open) { e.preventDefault(); setOpen(true); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-palette', onOpen);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-palette', onOpen); };
  }, [open]);

  useEffect(() => {
    if (open) {
      last.current = document.activeElement;
      setQ(''); setSel(0);
      setTimeout(() => input.current && input.current.focus(), 30);
    } else if (last.current && last.current.focus) {
      last.current.focus();
    }
    document.documentElement.classList.toggle('palette-open', open);
  }, [open]);

  useEffect(() => { setSel(0); }, [q]);

  const run = (it) => { setOpen(false); setTimeout(it.run, 60); };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(list.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === 'Enter' && list[sel]) { e.preventDefault(); run(list[sel]); }
  };

  let lastGroup = null;
  return (
    <>
      {open && (
        <div className="cmdk" role="dialog" aria-modal="true" aria-label="Menu" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="cmdk-box" onKeyDown={onKeyDown}>
            <div className="cmdk-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx.ph} aria-label={tx.ph} />
              <kbd>Esc</kbd>
            </div>
            <ul className="cmdk-list" role="listbox">
              {list.length === 0 && <li className="cmdk-none">{tx.none}</li>}
              {list.map((it, i) => {
                const head = it.g !== lastGroup ? (lastGroup = it.g) : null;
                return (
                  <li key={it.label} role="presentation">
                    {head && <span className="cmdk-g mono">{head}</span>}
                    <button type="button" role="option" aria-selected={i === sel} className={i === sel ? 'on' : ''}
                      onMouseEnter={() => setSel(i)} onClick={() => run(it)}>
                      <span>{it.label}</span><b className="mono">{it.k}</b>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="cmdk-foot mono"><span>↑↓ {tx.hint}</span><span>↵ {tx.enter}</span><span>esc {tx.esc}</span></div>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}

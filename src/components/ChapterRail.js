import { useEffect, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';

const CH = {
  fr: ['Goorgoorlu', 'Signature', 'Travaux', 'Équipes', 'Expertise', 'Parcours', 'Contact'],
  en: ['Goorgoorlu', 'Signature', 'Work', 'Teams', 'Expertise', 'Background', 'Contact'],
};
const SEL = ['#goorgoorlu', '[aria-labelledby="sig-title"]', '#travaux', '[aria-labelledby="team-title"]', '#expertise', '#parcours', '#contact'];

/** Sommaire vertical sur le côté (grands écrans, page d'accueil) : chapitre en cours + accès direct. */
export default function ChapterRail({ page }) {
  const { lang } = usePrefs();
  const [cur, setCur] = useState(-1);
  const names = CH[lang] || CH.fr;

  useEffect(() => {
    if (page !== 'home') return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.45;
      let idx = -1;
      SEL.forEach((s, i) => {
        const el = document.querySelector(s);
        if (el && el.getBoundingClientRect().top < mid) idx = i;
      });
      setCur(idx);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [page]);

  if (page !== 'home') return null;
  const goto = (i) => {
    const el = document.querySelector(SEL[i]);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={'chapters' + (cur >= 0 ? ' show' : '')} aria-label={lang === 'en' ? 'Chapters' : 'Chapitres'}>
      {names.map((n, i) => (
        <button key={n} type="button" className={i === cur ? 'on' : i < cur ? 'past' : ''} onClick={() => goto(i)} aria-current={i === cur ? 'true' : undefined}>
          <span className="mono">{String(i + 1).padStart(2, '0')}</span>
          <em>{n}</em>
        </button>
      ))}
    </nav>
  );
}

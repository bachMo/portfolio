import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import useLink from '../hooks/useLink';
import { prefersReducedMotion } from '../hooks/motion';
import Reel from './Reel';

/*
 * Showreel 3D de l'accueil : les quatre études de cas en vidéo, disposées
 * en arc dans l'espace. Sur grand écran, la section reste fixée et le
 * défilement fait tourner l'arc ; la carte au premier plan joue sa vidéo.
 * Sur mobile (ou animations réduites) : une rangée qui se fait glisser.
 */
const ITEMS = [
  { id: 'leeral', name: 'Lee<em>ral</em>', k: { fr: 'Assistant IA · documents', en: 'AI assistant · documents' } },
  { id: 'sunuchat', name: 'Sunu<em>Chat</em>', k: { fr: 'Chatbot IA · santé publique', en: 'AI chatbot · public health' } },
  { id: 'saaytu', name: 'Saaytu <em>Mbay</em>', k: { fr: 'Chatbot IA · agriculture', en: 'AI chatbot · farming' } },
  { id: 'waluma', name: 'Walu<em>ma</em>', k: { fr: 'Santé · web + mobile', en: 'Health · web + mobile' } },
];
const TXT = {
  fr: { kicker: 'SHOWREEL — QUATRE PRODUITS EN MOUVEMENT', title: 'Voir le travail <em>bouger.</em>', sub: 'Quatre études de cas, chacune résumée en huit secondes : le problème, le produit, ce qu’il change.', open: 'Ouvrir l’étude de cas', hint: 'Faites défiler', swipe: 'Glissez' },
  en: { kicker: 'SHOWREEL — FOUR PRODUCTS IN MOTION', title: 'See the work <em>move.</em>', sub: 'Four case studies, each summed up in eight seconds: the problem, the product, what it changes.', open: 'Open the case study', hint: 'Keep scrolling', swipe: 'Swipe' },
};
const h = (s) => ({ __html: s });

export default function Showreel() {
  const { lang } = usePrefs();
  const L = useLink();
  const tx = TXT[lang] || TXT.fr;
  const sec = useRef(null);
  const cards = useRef([]);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Arc 3D piloté par le défilement (grand écran, animations autorisées).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1001px)');
    const decide = () => setPinned(mq.matches && !prefersReducedMotion());
    decide();
    if (mq.addEventListener) mq.addEventListener('change', decide);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', decide); };
  }, []);

  useEffect(() => {
    const el = sec.current;
    if (!el) return undefined;
    if (!pinned) { cards.current.forEach((c) => { if (c) c.style.transform = ''; }); return undefined; }
    let raf = 0;
    const n = ITEMS.length;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? Math.max(0, Math.min(1, -r.top / run)) : 0;
      const a = p * (n - 1);
      el.style.setProperty('--sr', p.toFixed(4));
      cards.current.forEach((c, i) => {
        if (!c) return;
        const d = i - a;
        const ad = Math.abs(d);
        c.style.transform = `translate3d(${d * 58}%, 0, ${-ad * 340}px) rotateY(${-d * 34}deg) scale(${1 - Math.min(ad, 2) * 0.04})`;
        c.style.opacity = String(Math.max(0, 1 - Math.max(0, ad - 1.2) * 1.2));
        c.style.zIndex = String(100 - Math.round(ad * 10));
        c.style.setProperty('--dim', Math.min(1, ad).toFixed(3));
      });
      const next = Math.round(a);
      setActive((cur) => (cur === next ? cur : next));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    tick();
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, [pinned]);

  // Mobile : la carte la plus visible dans la rangée devient la carte active.
  useEffect(() => {
    if (pinned || !('IntersectionObserver' in window)) return undefined;
    const root = sec.current && sec.current.querySelector('.sr-stage');
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActive(cards.current.indexOf(e.target)); });
    }, { root, threshold: 0.6 });
    cards.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, [pinned]);

  // Clic sur une carte de côté : on fait défiler jusqu'à elle.
  const goTo = (i, e) => {
    if (!pinned || i === active) return;
    e.preventDefault();
    const el = sec.current;
    const run = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (run * i) / (ITEMS.length - 1) + 2, behavior: 'smooth' });
  };

  const cur = ITEMS[active];

  return (
    <section ref={sec} className={'sr' + (pinned ? ' is-pinned' : '')} id="showreel" aria-labelledby="sr-title">
      <div className="sr-sticky">
        <div className="wrap sr-head">
          <div>
            <span className="mono kicker">{tx.kicker}</span>
            <h2 className="h2" id="sr-title" dangerouslySetInnerHTML={h(tx.title)} />
          </div>
          <p>{tx.sub}</p>
        </div>
        <div className="sr-stage">
          {ITEMS.map((it, i) => (
            <a
              key={it.id}
              ref={(n) => { cards.current[i] = n; }}
              className={'sr-card' + (i === active ? ' is-active' : '')}
              href={L(it.id)}
              onClick={(e) => goTo(i, e)}
              aria-label={`${it.name.replace(/<[^>]+>/g, '')} — ${tx.open}`}
            >
              <Reel id={it.id} label={it.name.replace(/<[^>]+>/g, '')} active={!pinned || i === active} />
              <span className="sr-shade" aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="wrap sr-foot" aria-live="polite">
          <span className="mono sr-count">{String(active + 1).padStart(2, '0')} / {String(ITEMS.length).padStart(2, '0')}</span>
          <div className="sr-name" key={cur.id}>
            <b className="serif" dangerouslySetInnerHTML={h(cur.name)} />
            <span className="mono">{cur.k[lang] || cur.k.fr}</span>
          </div>
          <a className="pill sr-open" href={L(cur.id)}>
            <span>{tx.open}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <div className="sr-meter" aria-hidden="true">
            <span className="mono muted">{pinned ? tx.hint : tx.swipe}</span>
            <b><i /></b>
          </div>
        </div>
      </div>
    </section>
  );
}

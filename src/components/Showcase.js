import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, hasFinePointer } from '../hooks/motion';

/*
 * Briques visuelles partagées par les pages services et les études de cas :
 * - ScrollFX     : barre de progression + variables de défilement (--p, --pin, --tx)
 * - Band         : bandeaux de mots-clés qui défilent (deux bandes croisées)
 * - CursorPreview: aperçu d'image qui suit la souris au survol d'une liste
 * - NextCase     : grand lien « projet suivant » avec nom qui défile et aperçu
 * - RoundBadge   : pastille au texte circulaire qui tourne
 * Tout reste lisible et statique si l'utilisateur réduit les animations.
 */

const ARROW = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

/**
 * Barre de progression de lecture + effets liés au défilement :
 * [data-scrub] reçoit --p (0 → 1 quand l'élément arrive au centre de l'écran),
 * [data-pin] reçoit --pin (progression dans une section « épinglée ») et --tx
 * (décalage horizontal de sa piste .pin-track).
 */
export function ScrollFX({ page }) {
  const bar = useRef(null);
  useEffect(() => {
    const still = prefersReducedMotion();
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      if (still) return;
      document.querySelectorAll('[data-scrub]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.75)));
        el.style.setProperty('--p', p.toFixed(3));
      });
      document.querySelectorAll('[data-pin]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const run = r.height - vh;
        const p = run > 0 ? Math.max(0, Math.min(1, -r.top / run)) : 0;
        el.style.setProperty('--pin', p.toFixed(4));
        const track = el.querySelector('.pin-track');
        if (track) {
          // fin de piste : la dernière carte s'aligne sur la marge droite
          const vp = track.parentElement;
          const last = track.lastElementChild;
          const pad = parseFloat(getComputedStyle(vp).paddingRight) || 0;
          const prev = parseFloat(el.dataset.tx) || 0;
          const end = last ? last.getBoundingClientRect().right - prev : 0;
          const over = Math.max(0, end - (vp.getBoundingClientRect().right - pad));
          const tx = -over * p;
          el.dataset.tx = tx;
          el.style.setProperty('--tx', tx.toFixed(1) + 'px');
        }
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    tick();
    const t = setTimeout(tick, 400);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [page]);
  return <div className="sx-progress" aria-hidden="true"><i ref={bar} /></div>;
}

/** Deux bandes de mots-clés croisées qui défilent en sens inverse. */
export function Band({ items, alt, caps }) {
  const row = (list, k) => (
    <div className={'sx-band-row ' + k}>
      <div className="sx-band-track">
        {[0, 1].map((copy) => (
          <span key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
            {list.map((w, i) => (
              <span key={i} className="sx-band-item">{w}<i>✦</i></span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <div className={'sx-band' + (caps ? ' caps' : '')}>
      {row(items, 'a')}
      {row(alt || [...items].reverse(), 'b')}
    </div>
  );
}

/**
 * Aperçu flottant qui suit la souris au-dessus d'une liste de liens.
 * Chaque ligne porte data-preview (index dans `previews`).
 */
export function useCursorPreview() {
  const box = useRef(null);
  const [cur, setCur] = useState(-1);
  const fine = useRef(false);
  useEffect(() => { fine.current = hasFinePointer() && !prefersReducedMotion(); }, []);
  const handlers = (i) => ({
    onMouseEnter: () => { if (fine.current) setCur(i); },
    onMouseLeave: () => setCur(-1),
    onMouseMove: (e) => {
      if (!fine.current || !box.current) return;
      box.current.style.setProperty('--mx', e.clientX + 'px');
      box.current.style.setProperty('--my', e.clientY + 'px');
    },
  });
  return { box, cur, handlers };
}

export function CursorPreview({ box, cur, previews }) {
  return (
    <div className={'sx-preview' + (cur >= 0 ? ' on' : '')} ref={box} aria-hidden="true">
      {previews.map((p, i) => (
        <div key={i} className={'sx-preview-card' + (i === cur ? ' cur' : '')}>
          {p.img ? <img src={p.img} alt="" loading="lazy" /> : <span className="serif">{p.name}</span>}
        </div>
      ))}
    </div>
  );
}

/** Grand lien vers le projet suivant : nom géant qui défile + aperçu au survol. */
export function NextCase({ href, name, label, kicker, img }) {
  const { box, cur, handlers } = useCursorPreview();
  const words = Array.from({ length: 4 }, (_, i) => (
    <span key={i} className={i % 2 ? 'o' : ''}>{name}<i>→</i></span>
  ));
  return (
    <div className="next sx-next">
      <div className="sx-next-top">
        <span className="mono muted" dangerouslySetInnerHTML={{ __html: label }} />
        {kicker && <span className="mono acc">{kicker}</span>}
      </div>
      <a href={href} className="sx-next-link" aria-label={name} {...handlers(0)}>
        <span className="sx-next-track" aria-hidden="true">
          <span>{words}</span>
          <span>{words}</span>
        </span>
        <span className="sx-next-go" aria-hidden="true">{ARROW}</span>
      </a>
      <CursorPreview box={box} cur={cur} previews={[{ img, name }]} />
    </div>
  );
}

/** Pastille ronde au texte circulaire (lien). */
export function RoundBadge({ href, text, onClick, id = 'sxBadge' }) {
  return (
    <a className="sx-badge" href={href} onClick={onClick} aria-hidden="true" tabIndex="-1">
      <svg viewBox="0 0 200 200">
        <defs>
          <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href={'#' + id} textLength="486" lengthAdjust="spacing">{text}</textPath>
        </text>
      </svg>
      <span className="sx-badge-core">{ARROW}</span>
    </a>
  );
}

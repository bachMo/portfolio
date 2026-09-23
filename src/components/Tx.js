import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '../hooks/motion';

// Transforme "texte <em>italique</em>" en jetons, en conservant les <em> (classe/style simples).
function parse(html) {
  const tokens = [];
  const re = /<em([^>]*)>(.*?)<\/em>/g;
  let last = 0;
  let m;
  const decode = (s) => {
    const el = document.createElement('textarea');
    el.innerHTML = s;
    return el.value;
  };
  while ((m = re.exec(html))) {
    if (m.index > last) tokens.push({ text: decode(html.slice(last, m.index)), em: null });
    const attrs = m[1] || '';
    const cls = (attrs.match(/class="([^"]*)"/) || [])[1];
    const sty = (attrs.match(/style="([^"]*)"/) || [])[1];
    const style = sty
      ? Object.fromEntries(
          sty.split(';').filter(Boolean).map((d) => {
            const [k, ...v] = d.split(':');
            return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.join(':').trim()];
          })
        )
      : undefined;
    tokens.push({ text: decode(m[2]), em: { className: cls, style } });
    last = re.lastIndex;
  }
  if (last < html.length) tokens.push({ text: decode(html.slice(last)), em: null });
  return tokens;
}

function words(text, counter) {
  return text.split(/(\s+)/).filter(Boolean).map((part, i) =>
    /^\s+$/.test(part) ? part : (
      <span key={i} className="w" style={{ '--i': counter.n++ }}>{part}</span>
    )
  );
}

/**
 * Titre « transcrit » : les mots apparaissent un à un (flou → net) avec un curseur.
 * mode="mount"  → joue à l'apparition du composant (après `delay` ms)
 * mode="inview" → joue quand le titre entre dans l'écran
 * Rejoue automatiquement au changement de langue si le titre est visible.
 */
export default function Tx({ as = 'h2', html, mode = 'mount', delay = 0, onStart, className, ...rest }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const timers = useRef([]);
  const first = useRef(true);

  const { nodes, count } = useMemo(() => {
    const counter = { n: 0 };
    const out = parse(html).map((tok, i) =>
      tok.em ? <em key={i} className={tok.em.className} style={tok.em.style}>{words(tok.text, counter)}</em>
             : <span key={i} style={{ display: 'contents' }}>{words(tok.text, counter)}</span>
    );
    return { nodes: out, count: counter.n };
  }, [html]);

  const play = (d) => {
    timers.current.forEach(clearTimeout);
    setOn(false);
    const wait = prefersReducedMotion() ? 0 : d;
    timers.current = [setTimeout(() => {
      setOn(true);
      if (onStart) onStart(count);
    }, Math.max(wait, 30))];
  };

  useEffect(() => {
    if (mode === 'inview' && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { play(0); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(ref.current);
      return () => { io.disconnect(); timers.current.forEach(clearTimeout); };
    }
    play(delay);
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // changement de langue : rejoue si visible, sinon affiche directement
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const r = ref.current.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) play(0);
    else setOn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  return createElement(
    as,
    {
      ref,
      'data-tx': '',
      className: ['tx-ready', on ? 'on' : '', className || ''].filter(Boolean).join(' '),
      style: { '--n': count },
      ...rest,
    },
    nodes,
    <span className="caret" aria-hidden="true" />
  );
}

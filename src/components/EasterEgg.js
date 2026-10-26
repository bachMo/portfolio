import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import { prefersReducedMotion } from '../hooks/motion';
import img from '../assets';

const SECRET = 'goorgoorlu';
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const COLORS = ['#C4552B', '#E9A54B', '#2A1B12', '#FBF1E4', '#B27613'];

/** Surprise : tapez « goorgoorlu » (ou le code Konami) n'importe où sur le site. */
export default function EasterEgg() {
  const { lang } = usePrefs();
  const [show, setShow] = useState(false);
  const canvas = useRef(null);
  const buf = useRef('');
  const keys = useRef([]);

  useEffect(() => {
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      keys.current = [...keys.current, e.key].slice(-KONAMI.length);
      if (e.key.length === 1) buf.current = (buf.current + e.key.toLowerCase()).slice(-SECRET.length);
      if (buf.current === SECRET || keys.current.join() === KONAMI.join()) {
        buf.current = ''; keys.current = [];
        setShow(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!show) return undefined;
    const hide = setTimeout(() => setShow(false), 5200);
    if (prefersReducedMotion() || !canvas.current) return () => clearTimeout(hide);
    const c = canvas.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = window.innerWidth * dpr; c.height = window.innerHeight * dpr;
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    const W = window.innerWidth, H = window.innerHeight;
    const parts = Array.from({ length: 160 }, () => ({
      x: W * (0.5 + (Math.random() - 0.5) * 0.3), y: H + 20,
      vx: (Math.random() - 0.5) * 14, vy: -(Math.random() * 16 + 12),
      r: Math.random() * 6 + 4, a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.3,
      c: COLORS[(Math.random() * COLORS.length) | 0], s: Math.random() < 0.5,
    }));
    let raf = 0;
    const tick = () => {
      g.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.42; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c;
        if (p.s) g.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { g.beginPath(); g.arc(0, 0, p.r / 1.6, 0, Math.PI * 2); g.fill(); }
        g.restore();
      });
      if (parts.some((p) => p.y < H + 40)) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(hide); cancelAnimationFrame(raf); };
  }, [show]);

  if (!show) return null;
  return (
    <div className="egg" aria-live="polite">
      <canvas ref={canvas} className="egg-confetti" aria-hidden="true" />
      <div className="egg-peek">
        <div className="egg-bubble">
          <b>Jërëjëf !</b>
          <span>{lang === 'en' ? 'You found the goorgoorlu. Curious people make great clients.' : 'Vous avez trouvé le goorgoorlu. Les curieux font les meilleurs clients.'}</span>
        </div>
        <img src={img.mascotte} alt="" />
      </div>
    </div>
  );
}

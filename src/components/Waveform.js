import { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../hooks/motion';

/** Onde du hero : se lève au chargement, respire, et réagit au curseur. */
export default function Waveform() {
  const barsRef = useRef(null);

  useEffect(() => {
    const el = barsRef.current;
    const wave = el.parentNode;
    const reduce = prefersReducedMotion();
    const N = window.innerWidth < 760 ? 56 : 120;
    const bars = [];
    const base = [];
    el.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const env = Math.sin((i / (N - 1)) * Math.PI);
      const h = Math.max(0.04, env * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43))));
      const b = document.createElement('i');
      b.style.height = '100%';
      const r = i / (N - 1);
      if (r >= 0.52 && r <= 0.69) b.className = 'hot';
      el.appendChild(b);
      bars.push(b);
      base.push(h);
    }
    if (reduce) {
      bars.forEach((b, i) => { b.style.transform = `scaleY(${base[i]})`; });
      return undefined;
    }

    const cur = base.map(() => 0.02);
    let pointerX = null;
    let visible = true;
    let looping = false;
    let raf = 0;
    const t0 = performance.now();

    const frame = (now) => {
      const t = (now - t0) / 1000;
      for (let i = 0; i < N; i++) {
        let rise = Math.min(1, Math.max(0, (t * 1000 - i * 7) / 900));
        rise = 1 - Math.pow(1 - rise, 3);
        const breathe = 0.88 + 0.12 * Math.sin(t * 2.2 + i * 0.33) * Math.sin(t * 0.7 + i * 0.11);
        let target = base[i] * breathe * rise;
        if (pointerX !== null) {
          const d = i / (N - 1) - pointerX;
          target += Math.exp(-(d * d) / (2 * 0.035 * 0.035)) * 0.55 * rise;
        }
        target = Math.min(1, Math.max(0.02, target));
        cur[i] += (target - cur[i]) * 0.18;
        bars[i].style.transform = `scaleY(${cur[i].toFixed(3)})`;
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
      else looping = false;
    };
    const loop = () => {
      if (looping) return;
      looping = true;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      pointerX = (e.clientX - r.left) / r.width;
    };
    const onLeave = () => { pointerX = null; };
    if (hasFinePointer()) {
      wave.addEventListener('pointermove', onMove);
      wave.addEventListener('pointerleave', onLeave);
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); });
    io.observe(el);
    const onVis = () => { if (!document.hidden) loop(); };
    document.addEventListener('visibilitychange', onVis);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      wave.removeEventListener('pointermove', onMove);
      wave.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div className="bars" ref={barsRef} />;
}

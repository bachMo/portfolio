import { useEffect, useRef, useState } from 'react';
import { voice } from '../hooks/voice';

/*
 * Vagues vocales : six vagues superposées, une par bande de fréquences.
 * - l'intensité de la voix soulève les vagues et les élargit ;
 * - la gravité (hauteur de la voix) fait glisser les couleurs : une voix grave
 *   colore l'onde en brun et terracotta, une voix aiguë en ocre et or ;
 * - les attaques fortes projettent des embruns.
 */

const RAMP = ['#3B1408', '#6E2410', '#A63E1C', '#C4552B', '#E0703F', '#E9A54B', '#F3C778', '#FBE3B0'];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const RGB = RAMP.map(hex);
function ramp(t) {
  const x = Math.min(0.999, Math.max(0, t)) * (RGB.length - 1);
  const i = Math.floor(x), f = x - i;
  return RGB[i].map((c, k) => Math.round(c + (RGB[i + 1][k] - c) * f));
}
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const toHex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');

const LAYERS = [
  // fréquence spatiale, vitesse, décalage de couleur, lobes
  { f: 1.6, s: 0.55, dc: -0.16, lobes: 2 },
  { f: 2.3, s: -0.7, dc: -0.08, lobes: 2 },
  { f: 3.1, s: 0.9, dc: 0.0, lobes: 3 },
  { f: 4.2, s: -1.1, dc: 0.08, lobes: 3 },
  { f: 5.6, s: 1.35, dc: 0.16, lobes: 3 },
  { f: 7.4, s: -1.6, dc: 0.24, lobes: 4 },
];

function isDark() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if (!bg.startsWith('#')) return false;
  const [r, g, b] = hex(bg.length === 4 ? '#' + [...bg.slice(1)].map((c) => c + c).join('') : bg);
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}

export default function VoiceWaves() {
  const canvas = useRef(null);
  const [on, setOn] = useState(voice.active);

  useEffect(() => voice.subscribe(setOn), []);

  useEffect(() => {
    if (!on || !canvas.current) return undefined;
    const cv = canvas.current;
    const g = cv.getContext('2d');
    const root = document.documentElement;
    let W = 0, H = 0, dpr = 1, dark = isDark();
    const resize = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      dark = isDark();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const sm = { bands: LAYERS.map(() => 0), intensity: 0, slow: 0, reg: 0.5, pitch: 0, form: 0, voicedAt: -1e9 };
    const seeds = LAYERS.map((_, k) => Array.from({ length: 4 }, (__, j) => ({ p: k * 1.7 + j * 2.3, w: 0.6 + ((k * 7 + j * 3) % 5) * 0.12 })));
    const foam = [];
    const hist = [];
    const t0 = performance.now();
    let last = t0, raf = 0;

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = (now - t0) / 1000;
      const a = voice.analyse();
      if (!a) return;

      // lissage : attaque rapide, retombée douce
      const ease = (cur, target, up, down) => cur + (target - cur) * (target > cur ? up : down);
      sm.intensity = ease(sm.intensity, a.intensity, 0.35, 0.06);
      sm.slow += (a.intensity - sm.slow) * 0.02;
      a.bands.forEach((b, k) => { sm.bands[k] = ease(sm.bands[k], b, 0.4, 0.07); });
      if (a.pitch) {
        sm.voicedAt = now;
        // correction d'octave puis médiane glissante : une lecture stable, sans sauts
        let p = a.pitch;
        if (sm.pitch) {
          if (Math.abs(p * 2 - sm.pitch) < sm.pitch * 0.14) p *= 2;
        }
        hist.push(p); if (hist.length > 9) hist.shift();
        const med = [...hist].sort((x, y) => x - y)[hist.length >> 1];
        sm.pitch = sm.pitch ? sm.pitch * 0.8 + med * 0.2 : med;
        const reg = (Math.log2(sm.pitch) - Math.log2(80)) / (Math.log2(300) - Math.log2(80));
        sm.reg += (Math.min(1, Math.max(0, reg)) - sm.reg) * 0.12;
      }
      sm.form = Math.min(1, sm.form + dt / 1.4);
      const form = 1 - Math.pow(1 - sm.form, 3);

      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const mid = H / 2;
      const maxA = H * 0.44;

      // ligne d'horizon
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = rgba(ramp(sm.reg * 0.7 + 0.15), dark ? 0.35 : 0.28);
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, mid); g.lineTo(W, mid); g.stroke();

      g.globalCompositeOperation = dark ? 'screen' : 'source-over';
      const base = dark ? 0.12 : 0.22;
      const STEP = Math.max(3, W / 260);
      let crestX = W / 2, crestY = mid, crestH = 0;

      LAYERS.forEach((L, k) => {
        const energy = sm.bands[k] * (0.55 + 0.45 * sm.intensity);
        const idle = 0.035 + 0.02 * Math.sin(t * 0.9 + k);
        const amp = maxA * form * Math.max(idle, energy) * (1 - k * 0.07);
        const col = ramp(sm.reg * 0.68 + base + L.dc);
        const hi = ramp(sm.reg * 0.68 + base + 0.2 + L.dc);
        const width = 0.1 + 0.16 * energy + 0.05 * sm.intensity;
        const lobes = seeds[k].slice(0, L.lobes).map((s, j) => ({
          c: 0.5 + 0.34 * Math.sin(t * 0.21 * s.w + s.p) * (0.6 + 0.4 * Math.cos(t * 0.13 + j)),
          w: width * s.w,
          h: 0.65 + 0.35 * Math.sin(t * 0.8 * s.w + s.p * 1.3),
        }));
        const h = (x) => {
          const u = x / W;
          let e = 0;
          for (const lb of lobes) { const d = (u - lb.c) / lb.w; e += lb.h * Math.exp(-d * d); }
          const edge = Math.sin(Math.PI * u);
          const ripple = 0.7 + 0.3 * Math.sin(u * L.f * Math.PI * 2 + t * L.s * 2.2 + k);
          return amp * Math.min(1.25, e) * edge * ripple;
        };
        const tops = [], bots = [];
        for (let x = 0; x <= W + STEP; x += STEP) {
          const xx = Math.min(W, x);
          const v = h(xx);
          const skew = 0.78 + 0.22 * Math.sin(xx / W * 5 + t * 0.7 + k * 2);
          tops.push([xx, mid - v]);
          bots.push([xx, mid + v * skew]);
          if (v > crestH) { crestH = v; crestX = xx; crestY = mid - v; }
        }
        const grad = g.createLinearGradient(0, mid - amp, 0, mid + amp);
        const alpha = dark ? 0.5 : 0.2;
        grad.addColorStop(0, rgba(hi, alpha));
        grad.addColorStop(0.5, rgba(col, alpha + (dark ? 0.12 : 0.08)));
        grad.addColorStop(1, rgba(col, alpha * 0.6));
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(tops[0][0], tops[0][1]);
        for (let i = 1; i < tops.length; i++) g.lineTo(tops[i][0], tops[i][1]);
        for (let i = bots.length - 1; i >= 0; i--) g.lineTo(bots[i][0], bots[i][1]);
        g.closePath();
        g.fill();
        // liseré lumineux sur la crête
        g.strokeStyle = rgba(dark ? hi : col, dark ? 0.75 : 0.6);
        g.lineWidth = 1 + energy * 1.2;
        g.beginPath();
        g.moveTo(tops[0][0], tops[0][1]);
        for (let i = 1; i < tops.length; i++) g.lineTo(tops[i][0], tops[i][1]);
        g.stroke();
      });

      // embruns sur les attaques fortes
      if (a.intensity > 0.45 && a.intensity > sm.slow * 1.35 && foam.length < 160) {
        const n = Math.round(6 + 14 * a.intensity);
        for (let i = 0; i < n; i++) {
          foam.push({ x: crestX + (Math.random() - 0.5) * 120, y: crestY + Math.random() * 10,
            vx: (Math.random() - 0.5) * 60, vy: -(40 + Math.random() * 120 * a.intensity),
            r: 0.8 + Math.random() * 2.2, life: 1, c: ramp(sm.reg * 0.7 + 0.35 + Math.random() * 0.15) });
        }
      }
      g.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      for (let i = foam.length - 1; i >= 0; i--) {
        const p = foam[i];
        p.life -= dt * 0.9; p.vy += 140 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life <= 0) { foam.splice(i, 1); continue; }
        g.fillStyle = rgba(p.c, p.life * 0.9);
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
      }

      const color = toHex(ramp(sm.reg * 0.72 + 0.3));
      voice.state = { intensity: sm.intensity, pitch: sm.pitch, register: sm.reg, color, voiced: now - sm.voicedAt < 900 };
      root.style.setProperty('--amp', (sm.intensity * 0.35).toFixed(3));
      root.style.setProperty('--vcol', color);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cv.width, cv.height);
      root.style.removeProperty('--amp');
      root.style.removeProperty('--vcol');
    };
  }, [on]);

  return <canvas ref={canvas} className={'voice-waves' + (on ? ' on' : '')} aria-hidden="true" />;
}

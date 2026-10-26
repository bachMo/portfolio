import { useEffect } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../hooks/motion';

/**
 * Couche « créative » (v5) — tout est ici, pour pouvoir l'activer ou la retirer d'un coup.
 * - curseur personnalisé avec étiquette « Voir » sur les projets (souris uniquement)
 * - apparition des blocs au défilement, titres qui montent depuis un masque
 * - petits titres en monospace qui se « décodent » (clin d'œil à la transcription vocale)
 * - chiffres clés qui défilent jusqu'à leur valeur
 * - cartes en 3D légère qui suivent la souris
 * - bandeau défilant qui accélère avec le scroll
 * - halo du hero qui suit la souris, parallaxe ([data-par])
 * - signature du pied de page dont les lettres réagissent au curseur
 * Tout est désactivé si l'utilisateur a demandé de réduire les animations.
 */

const REVEAL = [
  '.intro > p', '.h2', '.card', '.tcard', '.lab > *', '.lab-head', '.cols > div', '.steps4 > div',
  '.process > h2', '.path .row', '.metrics > div', '.goor-art', '.goor-text > p', '.goor-cv',
  '.sig-head', '.pipe .step', '.facts > *', '.contact-band', '.item', '.panel', '.browser',
  '.phone-stage', '.next', '.two > *', '.facts4 > div', '.app-shots figure', '.cp-form-wrap',
].join(',');
const SCRAMBLE = '.kicker, .band-k, .sig-top > .mono, .marquee-label, .facts4 small, .lab-head .muted, .path h3';
const TILT = '.card, a.tcard, .lab-own';
const LABELLED = '.shot, .lab-own, a.tcard, .next a, .case-link';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_·';

const label = () => (document.documentElement.lang === 'en' ? 'View' : 'Voir');

export default function Creative({ page }) {
  // Révélations, décodage, compteurs, parallaxe : rescannés à chaque changement de page.
  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return undefined;
    const root = document.getElementById('main');
    const footer = document.querySelector('.bigfoot');
    if (!root) return undefined;
    const timers = [];

    // Un élément masqué par clip-path n'est pas « vu » par l'observateur : pour les titres
    // masqués, on observe leur parent et on déclenche le titre.
    const proxies = new Map();
    const play = (el) => {
      el.classList.add('in');
      // une fois l'entrée jouée, on rend la main aux styles d'origine (survol, etc.)
      timers.push(setTimeout(() => el.classList.remove('rv', 'in', 'rv-mask'), 1600));
    };
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        reveal.unobserve(e.target);
        const targets = proxies.get(e.target);
        if (targets) { targets.forEach(play); proxies.delete(e.target); }
        else play(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    const scramble = (el) => {
      if (el.children.length) return;
      const final = el.textContent;
      if (!final.trim()) return;
      const start = performance.now();
      const dur = 650 + final.length * 12;
      let written = final;
      const tick = (now) => {
        if (el.textContent !== written) return; // le texte a changé (langue) : on s'arrête
        const p = Math.min(1, (now - start) / dur);
        const fixed = Math.floor(final.length * p);
        written = final.split('').map((c, i) => (i < fixed || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
        if (p >= 1) written = final;
        el.textContent = written;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const countUp = (strong) => {
      const node = strong.firstChild;
      if (!node || node.nodeType !== 3) return;
      const m = node.nodeValue.trim().match(/^(\d+)(\+?)$/);
      if (!m) return;
      const target = +m[1];
      const suffix = m[2];
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        node.nodeValue = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      node.nodeValue = '0' + suffix;
      requestAnimationFrame(tick);
    };

    const once = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        once.unobserve(e.target);
        if (e.target.matches('.metrics strong')) countUp(e.target);
        else if (e.target.matches('.wordmark')) e.target.classList.add('in');
        else scramble(e.target);
      });
    }, { threshold: 0.6 });

    const scan = (scope) => {
      scope.querySelectorAll(REVEAL).forEach((el, i) => {
        if (el.dataset.rvDone || el.closest('.hero') || el.closest('.drawer')) return;
        el.dataset.rvDone = '1';
        const sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : i;
        el.style.setProperty('--rv-d', Math.min(sib, 6) * 80 + 'ms');
        el.classList.add('rv');
        if (el.matches('.h2, .process > h2') && el.parentElement) {
          el.classList.add('rv-mask');
          const p = el.parentElement;
          if (!proxies.has(p)) { proxies.set(p, []); reveal.observe(p); }
          proxies.get(p).push(el);
        } else {
          reveal.observe(el);
        }
      });
      scope.querySelectorAll(SCRAMBLE).forEach((el) => {
        if (el.dataset.scDone) return;
        el.dataset.scDone = '1';
        once.observe(el);
      });
      scope.querySelectorAll('.metrics strong:not(.metric-word)').forEach((el) => {
        if (el.dataset.cuDone) return;
        el.dataset.cuDone = '1';
        once.observe(el);
      });
    };

    scan(root);
    if (footer) {
      const wm = footer.querySelector('.wordmark');
      if (wm && !wm.dataset.wmDone) { wm.dataset.wmDone = '1'; wm.classList.add('wm-ready'); once.observe(wm); }
    }
    const mo = new MutationObserver(() => scan(root));
    mo.observe(root, { childList: true, subtree: true });

    // parallaxe douce
    let raf = 0;
    const par = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll('[data-par]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const k = parseFloat(el.dataset.par) || 0.1;
        const off = (r.top + r.height / 2 - vh / 2) * k;
        el.style.setProperty('--py', off.toFixed(1) + 'px');
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(par); };
    window.addEventListener('scroll', onScroll, { passive: true });
    par();

    return () => {
      reveal.disconnect(); once.disconnect(); mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [page]);

  // Bandeau qui accélère avec la vitesse de défilement.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let last = window.scrollY;
    let v = 0;
    let raf = 0;
    const loop = () => {
      const y = window.scrollY;
      v = v * 0.9 + (y - last) * 0.1;
      last = y;
      const track = document.querySelector('.marquee .track');
      if (track && track.getAnimations) {
        const a = track.getAnimations()[0];
        if (a) a.playbackRate = 1 + Math.min(Math.abs(v) / 6, 5);
        track.style.setProperty('--sk', Math.max(-8, Math.min(8, -v * 0.35)).toFixed(2) + 'deg');
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Curseur, cartes 3D, halo du hero, signature réactive : souris uniquement.
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return undefined;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    const txt = document.createElement('span');
    dot.className = 'cur-dot';
    ring.className = 'cur-ring';
    ring.appendChild(txt);
    document.body.append(dot, ring);
    document.documentElement.classList.add('has-cursor');

    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
    let tilted = null;
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const untilt = () => {
      if (!tilted) return;
      tilted.classList.remove('tilting');
      tilted.style.transform = '';
      const img = tilted.querySelector('.shot img');
      if (img) img.style.transform = '';
      tilted = null;
    };

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
      document.documentElement.classList.remove('cur-out');
      const t = e.target;
      if (!t.closest) return;
      const lab = t.closest(LABELLED);
      const hot = t.closest('a, button, [role="tab"], label, summary');
      const field = t.closest('input, textarea, select');
      ring.classList.toggle('is-label', !!lab);
      ring.classList.toggle('is-hot', !!hot && !lab);
      ring.classList.toggle('is-field', !!field);
      dot.classList.toggle('is-field', !!field);
      if (lab) txt.textContent = label();

      // cartes 3D
      const card = t.closest(TILT);
      if (card !== tilted) untilt();
      if (card) {
        tilted = card;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('tilting');
        card.style.transform = `perspective(1000px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-6px)`;
        const img = card.querySelector('.shot img');
        if (img) img.style.transform = `scale(1.08) translate(${(-px * 10).toFixed(1)}px,${(-py * 10).toFixed(1)}px)`;
      }

      // halo du hero
      const hero = t.closest('.hero');
      if (hero) {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--gx', e.clientX - r.left + 'px');
        hero.style.setProperty('--gy', e.clientY - r.top + 'px');
        hero.classList.add('glow-on');
      }

      // signature du pied de page
      const wm = t.closest('.wordmark');
      document.querySelectorAll('.wordmark .wl').forEach((l) => {
        if (!wm) { l.style.removeProperty('--lift'); return; }
        const r = l.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        const lift = Math.max(0, 1 - d / 260);
        l.style.setProperty('--lift', (lift * lift * -0.14).toFixed(3) + 'em');
      });
    };
    const onOut = (e) => {
      if (!e.relatedTarget) { document.documentElement.classList.add('cur-out'); untilt(); }
    };
    const onDown = () => ring.classList.add('is-down');
    const onUp = () => ring.classList.remove('is-down');
    const onLeaveHero = (e) => {
      const hero = document.querySelector('.hero');
      if (hero && e.target === hero) hero.classList.remove('glow-on');
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onOut);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeaveHero, true);
    return () => {
      cancelAnimationFrame(raf);
      untilt();
      dot.remove(); ring.remove();
      document.documentElement.classList.remove('has-cursor', 'cur-out');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeaveHero, true);
    };
  }, []);

  // Le titre du hero devient « jouable » une fois sa transcription terminée.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const t = setTimeout(() => {
      const h = document.getElementById('heroTitle');
      if (h) h.classList.add('settled');
    }, 3200);
    return () => clearTimeout(t);
  }, [page]);

  return null;
}

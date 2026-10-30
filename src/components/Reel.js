import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import { prefersReducedMotion } from '../hooks/motion';

/*
 * Vidéo courte (boucle de 8 s, sans son) chargée seulement à l'approche :
 * - se lance quand elle est visible, se met en pause sinon
 * - bouton lecture / pause toujours disponible (accessibilité)
 * - rien ne démarre seul si l'utilisateur réduit les animations
 * `active` (facultatif) permet au parent de décider qui joue (carrousel 3D).
 */
export const REELS = ['leeral', 'sunuchat', 'saaytu', 'waluma'];
const src = (id, ext) => `/reels/${id}.${ext}`;

export default function Reel({ id, label, active = true, className = '' }) {
  const { lang } = usePrefs();
  const box = useRef(null);
  const vid = useRef(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(null); // choix explicite : 'play' | 'pause'
  const [playing, setPlaying] = useState(false);
  const still = useRef(false);

  useEffect(() => { still.current = prefersReducedMotion(); }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || !('IntersectionObserver' in window)) { setInView(true); setLoaded(true); return undefined; }
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setLoaded(true); near.disconnect(); } }, { rootMargin: '600px 0px' });
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting && e.intersectionRatio >= 0.35), { threshold: [0, 0.35, 0.6] });
    near.observe(el); io.observe(el);
    return () => { near.disconnect(); io.disconnect(); };
  }, []);

  // les sources sont ajoutées à l'approche : on recharge la vidéo à ce moment-là
  useEffect(() => { if (loaded && vid.current) vid.current.load(); }, [loaded]);

  useEffect(() => {
    const v = vid.current;
    if (!v || !loaded) return;
    const want = user === 'play' || (user === null && !still.current && inView && active);
    if (want && user !== 'pause') {
      const p = v.play();
      if (p && p.catch) p.catch(() => setPlaying(false));
    } else v.pause();
  }, [inView, active, loaded, user]);

  const toggle = (e) => {
    e.preventDefault(); e.stopPropagation();
    setLoaded(true);
    setUser(playing ? 'pause' : 'play');
  };

  const t = lang === 'en'
    ? { play: 'Play the animation', pause: 'Pause the animation' }
    : { play: 'Lire l’animation', pause: 'Mettre l’animation en pause' };

  return (
    <div ref={box} className={'reel ' + className + (playing ? ' is-playing' : '')}>
      <video
        ref={vid}
        muted
        loop
        playsInline
        preload="none"
        poster={src(id, 'jpg')}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {loaded && <source src={src(id, 'webm')} type="video/webm" />}
        {loaded && <source src={src(id, 'mp4')} type="video/mp4" />}
      </video>
      <button type="button" className="reel-btn" onClick={toggle} aria-label={playing ? t.pause : t.play} aria-pressed={playing}>
        {playing
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>}
      </button>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import { voice } from '../hooks/voice';

const TXT = {
  fr: {
    try: 'Parlez, l’onde vous écoute', stop: 'Arrêter le micro', note: 'Rien n’est enregistré : tout reste dans votre navigateur.',
    no: 'Micro indisponible ou refusé.', low: 'Grave', high: 'Aiguë', int: 'Intensité', reg: ['Voix grave', 'Voix médium', 'Voix aiguë'], wait: 'Parlez, chantez, sifflez…',
  },
  en: {
    try: 'Speak, the wave is listening', stop: 'Stop the mic', note: 'Nothing is recorded: it all stays in your browser.',
    no: 'Microphone unavailable or blocked.', low: 'Low', high: 'High', int: 'Intensity', reg: ['Low voice', 'Mid voice', 'High voice'], wait: 'Speak, sing, whistle…',
  },
};
const SEGS = 18;

/** Bouton « mode voix » sous l'onde du hero, avec la lecture en direct de la voix. */
export default function VoiceToggle() {
  const { lang } = usePrefs();
  const tx = TXT[lang] || TXT.fr;
  const [on, setOn] = useState(voice.active);
  const [err, setErr] = useState(false);
  const hud = useRef(null);
  const supported = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  useEffect(() => voice.subscribe(setOn), []);
  useEffect(() => () => voice.stop(), []);
  useEffect(() => {
    document.documentElement.classList.toggle('voice-on', on);
  }, [on]);

  // Lecture en direct (hauteur, registre, intensité) sans re-rendu React.
  useEffect(() => {
    if (!on || !hud.current) return undefined;
    const el = hud.current;
    const dot = el.querySelector('.vh-dot');
    const hz = el.querySelector('.vh-hz');
    const reg = el.querySelector('.vh-reg-name');
    const segs = el.querySelectorAll('.vh-int i');
    let raf = 0, shown = '';
    const tick = () => {
      const s = voice.state;
      el.style.setProperty('--vcol-hud', s.color);
      dot.style.left = (s.register * 100).toFixed(1) + '%';
      const label = s.voiced && s.pitch ? Math.round(s.pitch) + ' Hz' : '— Hz';
      if (label !== shown) { hz.textContent = label; shown = label; }
      reg.textContent = s.voiced ? tx.reg[s.register < 0.36 ? 0 : s.register < 0.66 ? 1 : 2] : tx.wait;
      const lit = Math.round(s.intensity * SEGS);
      segs.forEach((g, i) => g.classList.toggle('lit', i < lit));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, tx]);

  if (!supported) return null;

  const toggle = async () => {
    setErr(false);
    if (voice.active) { voice.stop(); return; }
    try { await voice.start(); } catch (e) { setErr(true); }
  };

  return (
    <div className={'voice-try' + (on ? ' on' : '')}>
      <button type="button" className="voice-btn" onClick={toggle} aria-pressed={on}>
        <span className="voice-ic" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </span>
        <span>{on ? tx.stop : tx.try}</span>
      </button>
      {on ? (
        <div className="voice-hud" ref={hud} aria-hidden="true">
          <div className="vh-reg">
            <span className="mono">{tx.low}</span>
            <span className="vh-track"><i className="vh-dot" /></span>
            <span className="mono">{tx.high}</span>
          </div>
          <div className="vh-read"><b className="vh-hz mono">— Hz</b><span className="vh-reg-name">{tx.wait}</span></div>
          <div className="vh-int"><span className="mono">{tx.int}</span><span className="vh-segs">{Array.from({ length: SEGS }, (_, i) => <i key={i} />)}</span></div>
        </div>
      ) : (
        <span className="voice-note mono" aria-live="polite">{err ? tx.no : tx.note}</span>
      )}
      {on && <span className="voice-note mono voice-note-on">{tx.note}</span>}
    </div>
  );
}

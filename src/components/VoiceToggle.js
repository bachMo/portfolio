import { useEffect, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import { voice } from '../hooks/voice';

const TXT = {
  fr: { try: 'Parlez, l’onde vous écoute', stop: 'Arrêter le micro', live: 'À l’écoute…', note: 'Rien n’est enregistré : tout reste dans votre navigateur.', no: 'Micro indisponible ou refusé.' },
  en: { try: 'Speak, the wave is listening', stop: 'Stop the mic', live: 'Listening…', note: 'Nothing is recorded: it all stays in your browser.', no: 'Microphone unavailable or blocked.' },
};

/** Bouton « mode voix » sous l'onde du hero. */
export default function VoiceToggle() {
  const { lang } = usePrefs();
  const tx = TXT[lang] || TXT.fr;
  const [on, setOn] = useState(voice.active);
  const [err, setErr] = useState(false);
  const supported = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  useEffect(() => voice.subscribe(setOn), []);
  useEffect(() => () => voice.stop(), []);
  useEffect(() => {
    document.documentElement.classList.toggle('voice-on', on);
  }, [on]);

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
      <span className="voice-note mono" aria-live="polite">{err ? tx.no : on ? tx.live + ' ' + tx.note : tx.note}</span>
    </div>
  );
}

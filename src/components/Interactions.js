import { useEffect } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../hooks/motion';

const SPOT = '.card,.tcard,.lab article,.panel,.cp-form-wrap,.step';

/**
 * Effets globaux au curseur (souris uniquement, désactivés si « réduire les animations ») :
 * - halo qui suit le curseur sur les cartes
 * - boutons « aimantés » (.magnetic)
 */
export default function Interactions() {
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return undefined;
    let magnet = null;
    const release = () => {
      if (magnet) { magnet.classList.remove('pull'); magnet.style.transform = ''; magnet = null; }
    };
    const onMove = (e) => {
      const card = e.target.closest && e.target.closest(SPOT);
      if (card) {
        card.classList.add('spot');
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      }
      const m = e.target.closest && e.target.closest('.magnetic');
      if (m !== magnet) release();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        m.classList.add('pull');
        m.style.transform = `translate(${(dx * 0.22).toFixed(1)}px,${(dy * 0.32).toFixed(1)}px)`;
      }
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', release);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', release);
    };
  }, []);
  return null;
}

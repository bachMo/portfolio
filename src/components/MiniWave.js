import { useMemo } from 'react';

/** Petite onde d'une bulle vocale (étude de cas Saaytu Mbay). */
export default function MiniWave({ seed, playing }) {
  const bars = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      h: 4 + Math.round(18 * Math.abs(Math.sin(i * seed) * Math.cos(i * 0.7))),
      delay: (i * 37) % 400,
    })),
    [seed]
  );
  return (
    <div className={'mini' + (playing ? ' play' : '')}>
      {bars.map((b, i) => (
        <i key={i} style={{ height: b.h + 'px', animationDelay: b.delay + 'ms' }} />
      ))}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import { prefersReducedMotion } from '../hooks/motion';
import signature from '../data/signature';

const TABS = [['sante', 'sig.tab1'], ['agri', 'sig.tab2']];

/** Projets signature : onglets + pipeline où un signal traverse les 6 étapes. */
export default function Signature() {
  const { lang, t } = usePrefs();
  const [sig, setSig] = useState('sante');
  const [fading, setFading] = useState(false);
  const [lit, setLit] = useState(() => new Set());
  const pipeRef = useRef(null);
  const timers = useRef([]);
  const s = signature[lang][sig];

  const flow = () => {
    if (prefersReducedMotion()) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    for (let i = 0; i < 6; i++) {
      timers.current.push(setTimeout(() => setLit((p) => new Set(p).add(i)), i * 170));
      timers.current.push(setTimeout(() => setLit((p) => { const n = new Set(p); n.delete(i); return n; }), i * 170 + 520));
    }
  };

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { flow(); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(pipeRef.current);
    const tm = timers.current;
    return () => { io.disconnect(); tm.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (key) => {
    if (key === sig) return;
    const delay = prefersReducedMotion() ? 0 : 220;
    setFading(true);
    setTimeout(() => {
      setSig(key);
      setFading(false);
      setTimeout(flow, 150);
    }, delay);
  };

  return (
    <section className="block wrap" aria-labelledby="sig-title">
      <div className="sig-top">
        <span className="mono acc" dangerouslySetInnerHTML={{ __html: t('sig.kicker') }} />
        <div className="tabs" role="tablist" aria-label={t('aria.pick')}>
          {TABS.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={sig === key} onClick={() => pick(key)}
                    dangerouslySetInnerHTML={{ __html: t(label) }} />
          ))}
        </div>
      </div>
      <div className={'sig-body' + (fading ? ' fade' : '')}>
        <div className="sig-head">
          <div>
            <span className="name">{s.name}</span>
            <h2 id="sig-title">{s.h1} <em>{s.h2}</em></h2>
          </div>
          <a className="pill dark" href={s.href} style={{ height: '56px', padding: '0 28px', fontSize: '16px', flexShrink: 0 }}>
            <span dangerouslySetInnerHTML={{ __html: t('case.read') }} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
        </div>
        <div className="pipe" ref={pipeRef}>
          {s.steps.map((p, i) => (
            <div key={sig + i} className={'step' + (p.hot ? ' hot' : '') + (lit.has(i) ? ' lit' : '')}>
              <span className="n">0{i + 1}</span>
              <h3 style={{ overflowWrap: 'break-word' }}>{p.title}</h3>
              <p>{p.desc}</p>
              <code>{p.tech}</code>
            </div>
          ))}
        </div>
        <span className="mono rail-hint" aria-hidden="true">
          <span dangerouslySetInnerHTML={{ __html: t('rail.hint') }} />{' '}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </span>
        <div className="facts" style={{ marginTop: '40px' }}>
          <p><strong dangerouslySetInnerHTML={{ __html: t('sig.role') }} /><span>{s.role}</span></p>
          <p><strong dangerouslySetInnerHTML={{ __html: t('sig.ctx') }} /><span>{s.ctx}</span></p>
          <p><strong dangerouslySetInnerHTML={{ __html: t('sig.done') }} /><span>{s.done}</span></p>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import useLink from '../hooks/useLink';
import { MOCKS } from '../components/Services';
import SERVICES_DATA from '../data/services';
import DATA from '../data/servicePages.json';
import { ROUTES, SITE_URL } from '../routes';
import Tx from '../components/Tx';
import img from '../assets';
import { prefersReducedMotion } from '../hooks/motion';
import { ScrollFX, Band, RoundBadge, useCursorPreview, CursorPreview } from '../components/Showcase';

const h = (s) => ({ __html: s });
const ARROW = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const BACK = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
);
const ORDER = ['svc-site', 'svc-platform', 'svc-ai'];
const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
// Aperçus affichés au survol de la liste « Déjà réalisé »
const PREVIEW = { '/waluma': img.waluma, '/sunuchat': img.sunuchat, '/leeral': img.leeralExplication, 'https://spot-sc46.vercel.app/': img.spot, 'https://melimicro.com': img.melimicro };
// Petits pictos des étapes de travail
const STEP_ICONS = [
  <path key="0" d="M4 6h16v10H8l-4 4z" />,
  <><rect key="a" x="3" y="4" width="18" height="16" rx="2" /><path key="b" d="M3 9h18M8 9v11" /></>,
  <path key="0" d="M8 8l-5 4 5 4M16 8l5 4-5 4M13.5 5l-3 14" />,
  <path key="0" d="M12 3c3 2 5 5 5 9l-2 3H9l-2-3c0-4 2-7 5-9zM9 15l-2 5 3-2M15 15l2 5-3-2M12 9v2" />,
];

/** Avant / Après : bascule automatiquement une fois à l'écran, puis au clic. */
function useBeforeAfter(page) {
  const [after, setAfter] = useState(false);
  const ref = useRef(null);
  const touched = useRef(false);
  useEffect(() => {
    setAfter(false);
    touched.current = false;
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return undefined;
    let t = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      t = setTimeout(() => { if (!touched.current) setAfter(true); }, 2200);
    }, { threshold: 0.45 });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [page]);
  const set = (v) => { touched.current = true; setAfter(v); };
  return { ref, after, set };
}


// Prépare le formulaire de contact avec le bon type de projet
const preselect = (id) => { try { sessionStorage.setItem('svc-type', id); } catch (e) { /* stockage indisponible */ } };

/** Données structurées (Service + FAQ) pour Google, mises à jour à chaque page. */
function useStructuredData(page, lang, svc) {
  useEffect(() => {
    const meta = ROUTES[page][lang];
    const json = [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: meta.title.split(' | ')[0].split(' — ')[0],
        description: meta.description,
        url: `${SITE_URL}${meta.path}`,
        areaServed: [{ '@type': 'Country', name: 'Senegal' }, { '@type': 'Place', name: 'West Africa' }],
        provider: { '@id': `${SITE_URL}/#person` },
        inLanguage: lang,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: svc.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ];
    let el = document.getElementById('ld-service');
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'ld-service';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(json);
    return () => { const s = document.getElementById('ld-service'); if (s) s.remove(); };
  }, [page, lang, svc]);
}

export default function ServicePage({ page }) {
  const { lang } = usePrefs();
  const L = useLink();
  const entry = DATA.services[page] || DATA.services['svc-site'];
  const svc = entry[lang] || entry.fr;
  const ui = DATA.ui[lang] || DATA.ui.fr;
  const steps = DATA.process[lang] || DATA.process.fr;
  const Mock = MOCKS[entry.mock];
  const sd = SERVICES_DATA[lang] || SERVICES_DATA.fr;
  const mockText = sd.mock;
  const others = ORDER.filter((id) => id !== page);
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  const chips = svc.facts[1].split(/,\s*/).map(cap);
  const ba = useBeforeAfter(page);
  const { box, cur, handlers } = useCursorPreview();

  useStructuredData(page, lang, svc);

  // La maquette s'anime quand elle entre à l'écran (même logique que la section Services de l'accueil).
  const visual = useRef(null);
  useEffect(() => {
    const el = visual.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { el.classList.add('is-on'); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-on'); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [page]);

  const toWork = (e) => { e.preventDefault(); const el = document.getElementById('realisations'); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  const band = [...chips, ...sd.items[Math.max(0, ORDER.indexOf(page))].who, ...svc.uses.map((u) => u.t)];

  return (
    <main id="svc-page" className={'svcp sx svcp-' + entry.mock}>
      <ScrollFX page={page} />
      <div className="wrap">
        <div className="case-nav">
          <a className="pill" href={L('home', 'services')}>
            {BACK}
            <span>{ui.back}</span>
          </a>
          <nav className="sx-tabs" aria-label={ui.label}>
            {ORDER.map((id, i) => (
              <a key={id} href={L(id)} aria-current={id === page ? 'page' : undefined}>
                <span className="mono">{DATA.services[id].n}</span>
                <b>{sd.items[i].short}</b>
              </a>
            ))}
          </nav>
        </div>

        <section className="svcp-hero sx-hero">
          <span className="sx-bignum" data-par="0.14" aria-hidden="true">{entry.n}</span>
          <span className="mono acc sx-kicker"><i className="dot" />{svc.kicker}</span>
          <Tx key={page} as="h1" className="serif" html={svc.h1} delay={200} />
          <div className="sx-hero-row">
            <p className="lede">{svc.lede}</p>
            <div className="sx-hero-act">
              <div className="svcp-ctas">
                <a className="pill solid magnetic" href={L('contact')} onClick={() => preselect(entry.mock)}>
                  <span>{ui.start}</span>{ARROW}
                </a>
                <a className="pill" href="#realisations" onClick={toWork}><span>{ui.talk}</span></a>
              </div>
            </div>
          </div>
          <div className="sx-tickets">
            {svc.facts.map((f, i) => (
              <div key={ui.facts[i]} className="sx-ticket">
                <small className="mono">{String(i + 1).padStart(2, '0')} · {ui.facts[i]}</small>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="svcp-visual sx-stage" ref={visual} data-scrub="">
          <div className="sx-stage-glow" aria-hidden="true" />
          <div className="sx-stage-mock"><Mock m={mockText} /></div>
          {chips.slice(0, 3).map((c, i) => (
            <span key={c} className={'sx-chip c' + i} aria-hidden="true"><i>{CHECK}</i>{c}</span>
          ))}
        </div>
      </div>

      <Band items={band} />

      <div className="wrap">
        <section className={'sx-ba' + (ba.after ? ' is-after' : '')} ref={ba.ref}>
          <div className="sx-ba-head">
            <h2 className="svcp-h2">{ba.after ? ui.get : ui.problems}</h2>
            <div className="sx-switch" role="group" aria-label={ui.before + ' / ' + ui.after}>
              <button type="button" aria-pressed={!ba.after} onClick={() => ba.set(false)}>{ui.before}</button>
              <button type="button" aria-pressed={ba.after} onClick={() => ba.set(true)}>{ui.after}</button>
              <i aria-hidden="true" />
            </div>
          </div>
          <div className="sx-ba-stage">
            <div className="sx-ba-panel before" aria-hidden={ba.after}>
              {svc.problems.map((p, i) => (
                <div className="sx-ba-row" key={p.t} style={{ '--i': i }}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <div><b>{p.t}</b><p>{p.d}</p></div>
                </div>
              ))}
            </div>
            <ul className="sx-ba-panel after" aria-hidden={!ba.after}>
              {svc.get.map((g, i) => (
                <li key={g} style={{ '--i': i }}><i>{CHECK}</i><span>{g}</span></li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="sx-proc" data-pin="">
        <div className="sx-proc-sticky">
          <div className="wrap sx-proc-head">
            <h2 className="svcp-h2">{ui.process}</h2>
            <div className="sx-proc-meter" aria-hidden="true">
              <span className="mono muted">{ui.scroll}</span>
              <b><i /></b>
            </div>
          </div>
          <div className="sx-proc-viewport">
            <ol className="pin-track sx-proc-track">
              {steps.map((s, i) => (
                <li key={s.t} style={{ '--i': i }}>
                  <span className="sx-proc-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <svg className="sx-proc-ic" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{STEP_ICONS[i % STEP_ICONS.length]}</svg>
                  <small className="mono">{ui.step} {i + 1}/{steps.length}</small>
                  <b className="serif">{s.t}</b>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="svcp-block">
          <h2 className="svcp-h2">{ui.uses}</h2>
          <div className="sx-bento">
            {svc.uses.map((u, i) => (
              <article key={u.t} className={'b' + i}>
                <span className="mono">{ui.case} {String(i + 1).padStart(2, '0')}</span>
                <h3 className="serif">{u.t}</h3>
                <p>{u.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="svcp-block" id="realisations">
          <h2 className="svcp-h2">{ui.work}</h2>
          <div className="sx-work">
            {svc.work.map((w, i) => {
              const inner = (
                <>
                  <span className="mono sx-work-i">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="serif">{w.name}</h3>
                  <p>{w.desc}</p>
                  {w.href && <span className="mono sx-work-go">{w.href.startsWith('http') ? ui.visit : ui.read} ↗</span>}
                </>
              );
              if (!w.href) return <article key={w.name} className="sx-work-row" {...handlers(i)}>{inner}</article>;
              const external = w.href.startsWith('http');
              return (
                <a key={w.name} className="sx-work-row" href={external ? w.href : L.loc(w.href)} {...handlers(i)} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {inner}
                </a>
              );
            })}
          </div>
          <CursorPreview box={box} cur={cur} previews={svc.work.map((w) => ({ img: PREVIEW[w.href], name: w.name }))} />
        </section>

        <section className="svcp-block sx-faq">
          <div className="sx-faq-side">
            <h2 className="svcp-h2">{ui.faq}</h2>
            <p className="muted">{ui.askd}</p>
            <a className="pill" href={L('contact')} onClick={() => preselect(entry.mock)}><span>{ui.askcta}</span>{ARROW}</a>
          </div>
          <div className="svcp-faq">
            {svc.faq.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary><span className="mono acc">{String(i + 1).padStart(2, '0')}</span>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="svcp-final sx-final">
          <span className="sx-final-n" aria-hidden="true">{entry.n}</span>
          <h2 className="serif" dangerouslySetInnerHTML={h(svc.final)} />
          <div className="sx-final-act">
            <a className="pill magnetic" href={L('contact')} onClick={() => preselect(entry.mock)}>
              <span>{ui.start}</span>{ARROW}
            </a>
            <RoundBadge href={L('contact')} text={ui.badge} onClick={() => preselect(entry.mock)} />
          </div>
        </section>

        <div className="svcp-others">
          <span className="mono muted">{ui.others}</span>
          <div>
            {others.map((id) => {
              const o = DATA.services[id];
              return (
                <a key={id} href={L(id)}>
                  <span className="mono acc">{o.n}</span>
                  <b className="serif" dangerouslySetInnerHTML={h(o[lang].h1)} />
                  {ARROW}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

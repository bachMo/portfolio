import { useEffect, useRef } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import useLink from '../hooks/useLink';
import { MOCKS } from '../components/Services';
import SERVICES_DATA from '../data/services';
import DATA from '../data/servicePages.json';
import { ROUTES, SITE_URL } from '../routes';

const h = (s) => ({ __html: s });
const ARROW = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const BACK = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
);
const ORDER = ['svc-site', 'svc-platform', 'svc-ai'];

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
  const mockText = (SERVICES_DATA[lang] || SERVICES_DATA.fr).mock;
  const others = ORDER.filter((id) => id !== page);

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

  return (
    <main id="svc-page" className={'svcp svcp-' + entry.mock}>
      <div className="wrap">
        <div className="case-nav">
          <a className="pill" href={L('home', 'services')}>
            {BACK}
            <span>{ui.back}</span>
          </a>
          <span className="mono muted">{ui.label} {entry.n} / 03</span>
        </div>

        <section className="svcp-hero">
          <span className="mono acc">{svc.kicker}</span>
          <h1 className="serif" dangerouslySetInnerHTML={h(svc.h1)} />
          <p className="lede">{svc.lede}</p>
          <div className="svcp-ctas">
            <a className="pill solid magnetic" href={L('contact')} onClick={() => preselect(entry.mock)}>
              <span>{ui.start}</span>{ARROW}
            </a>
            <a className="pill" href="#realisations" onClick={(e) => { e.preventDefault(); const el = document.getElementById('realisations'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}><span>{ui.talk}</span></a>
          </div>
          <div className="facts4">
            {svc.facts.map((f, i) => (
              <div key={ui.facts[i]}>
                <small>{ui.facts[i]}</small>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="svcp-visual" ref={visual}><Mock m={mockText} /></div>

        <section className="block two svcp-block">
          <h2>{ui.problems}</h2>
          <div>
            {svc.problems.map((p, i) => (
              <div className="item" key={p.t}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <div><b>{p.t}</b><span>{p.d}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="svcp-block">
          <h2 className="svcp-h2">{ui.get}</h2>
          <ul className="svcp-get">
            {svc.get.map((g) => <li key={g}>{g}</li>)}
          </ul>
        </section>

        <section className="svcp-block">
          <h2 className="svcp-h2">{ui.process}</h2>
          <ol className="svcp-steps">
            {steps.map((s, i) => (
              <li key={s.t}>
                <span className="mono acc">{String(i + 1).padStart(2, '0')}</span>
                <b>{s.t}</b>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="svcp-block">
          <h2 className="svcp-h2">{ui.uses}</h2>
          <div className="svcp-uses">
            {svc.uses.map((u) => (
              <article key={u.t}>
                <h3 className="serif">{u.t}</h3>
                <p>{u.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="svcp-block" id="realisations">
          <h2 className="svcp-h2">{ui.work}</h2>
          <div className="svcp-work">
            {svc.work.map((w) => {
              const inner = (
                <>
                  <h3 className="serif">{w.name}</h3>
                  <p>{w.desc}</p>
                  {w.href && <span className="mono acc">{w.href.startsWith('http') ? ui.visit : ui.read} ↗</span>}
                </>
              );
              if (!w.href) return <article key={w.name}>{inner}</article>;
              const external = w.href.startsWith('http');
              return (
                <a key={w.name} href={external ? w.href : L.loc(w.href)} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {inner}
                </a>
              );
            })}
          </div>
        </section>

        <section className="svcp-block">
          <h2 className="svcp-h2">{ui.faq}</h2>
          <div className="svcp-faq">
            {svc.faq.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="svcp-final">
          <h2 className="serif" dangerouslySetInnerHTML={h(svc.final)} />
          <a className="pill solid magnetic" href={L('contact')} onClick={() => preselect(entry.mock)}>
            <span>{ui.start}</span>{ARROW}
          </a>
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

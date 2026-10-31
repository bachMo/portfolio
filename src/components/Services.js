import { useEffect, useRef } from 'react';
import { usePrefs } from '../i18n/PrefsContext';
import DATA from '../data/services';
import useLink from '../hooks/useLink';

const h = (s) => ({ __html: s });
const ARROW = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

// Prépare le formulaire de contact avec le bon type de projet
const preselect = (id) => { try { sessionStorage.setItem('svc-type', id); } catch (e) { /* stockage indisponible */ } };

export function MockSite({ m }) {
  return (
    <div className="svm svm-site" aria-hidden="true">
      <div className="svm-bar"><i /><i /><i /><span>{m.url}</span></div>
      <div className="svm-body">
        <div className="svs-nav"><b className="svs-logo" /><span /><span /><span /><em className="svs-btn-s" /></div>
        <div className="svs-hero">
          <div className="svs-copy">
            <div className="svs-h"><span>{m.heroA}</span><span className="acc">{m.heroB}</span></div>
            <div className="svs-lines"><i /><i /></div>
            <div className="svs-cta">{m.btn}</div>
          </div>
          <div className="svs-img"><div className="svs-sun" /><div className="svs-hill" /></div>
        </div>
        <div className="svs-cards"><i /><i /><i /></div>
      </div>
      <div className="svs-toast"><b>●</b><div><strong>{m.toast}</strong><small>{m.toastSub}</small></div></div>
      <div className="svs-cursor" />
    </div>
  );
}

export function MockDash({ m }) {
  const bars = [38, 52, 44, 70, 62, 88];
  return (
    <div className="svm svm-dash" aria-hidden="true">
      <div className="svd-side"><b /><i className="on" /><i /><i /><i /></div>
      <div className="svd-main">
        <div className="svd-top">{m.dash}<span>●</span></div>
        <div className="svd-kpis">
          <div><small>{m.k1}</small><strong data-to="248">248</strong></div>
          <div><small>{m.k2}</small><strong>1,8 M</strong></div>
          <div><small>{m.k3}</small><strong data-to="96">96</strong></div>
        </div>
        <div className="svd-row">
          <div className="svd-chart">
            {bars.map((v, i) => <div key={i} className="svd-bar" style={{ '--h': v + '%', '--d': i * 90 + 'ms' }}><i /><span>{m.week[i]}</span></div>)}
          </div>
          <div className="svd-kanban">
            <div><small>{m.todo}</small><i /><i /></div>
            <div><small>{m.doing}</small><i /></div>
            <div><small>{m.done}</small><i /><i /></div>
            <div className="svd-task">{m.task}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockAI({ m }) {
  return (
    <div className="svm svm-ai" aria-hidden="true">
      <div className="sva-head"><b>✦</b><div><strong>{m.chatName}</strong><small>● {m.online} · {m.night}</small></div></div>
      <div className="sva-thread">
        <div className="sva-msg in">{m.q}</div>
        <div className="sva-typing"><i /><i /><i /></div>
        <div className="sva-msg out">{m.a}</div>
      </div>
      <div className="sva-flow">
        <span>✓ {m.auto1}</span><span>✓ {m.auto2}</span><span>✓ {m.auto3}</span>
      </div>
      <svg className="sva-spark" viewBox="0 0 300 70" preserveAspectRatio="none"><path d="M0 60 C 40 55, 60 40, 95 44 S 150 20, 185 26 S 250 8, 300 6" /></svg>
    </div>
  );
}

export const MOCKS = { site: MockSite, platform: MockDash, ai: MockAI };

export default function Services() {
  const { lang } = usePrefs();
  const d = DATA[lang] || DATA.fr;
  const L = useLink();
  const root = useRef(null);

  useEffect(() => {
    const cards = root.current ? root.current.querySelectorAll('.svc-card') : [];
    if (!('IntersectionObserver' in window)) { cards.forEach((c) => c.classList.add('is-on')); return undefined; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-on'); }), { threshold: 0.35 });
    cards.forEach((c) => io.observe(c));
    // Empilement : chaque carte se fige seulement quand elle est entièrement visible.
    // Si elle est plus haute que l'écran, elle défile d'abord jusqu'à montrer son bas, puis se fige.
    const fit = () => {
      const sec = root.current; if (!sec) return;
      sec.classList.add('is-sticky');
      const nav = window.innerWidth > 960 ? 92 : 80;
      Array.from(cards).forEach((c, i) => {
        const pref = nav + i * 18;
        c.style.top = Math.min(pref, window.innerHeight - c.offsetHeight - 16) + 'px';
      });
    };
    fit();
    window.addEventListener('resize', fit);
    const ro = 'ResizeObserver' in window ? new ResizeObserver(fit) : null;
    if (ro) cards.forEach((c) => ro.observe(c));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    return () => { io.disconnect(); window.removeEventListener('resize', fit); if (ro) ro.disconnect(); };
  }, []);

  return (
    <section className="svc wrap" id="services" aria-labelledby="svc-title" ref={root}>
      <div className="svc-head">
        <span className="mono kicker acc" dangerouslySetInnerHTML={h(d.kicker)} />
        <h2 className="svc-title serif" id="svc-title" dangerouslySetInnerHTML={h(d.title)} />
        <div className="svc-head-row">
          <p dangerouslySetInnerHTML={h(d.sub)} />
          <nav className="svc-index" aria-label={d.kicker}>
            {d.items.map((it) => (
              <a key={it.id} href={L('svc-' + it.id)}><span className="mono">{it.n}</span>{it.short}</a>
            ))}
          </nav>
        </div>
      </div>

      <div className="svc-stack">
        {d.items.map((it, i) => {
          const Mock = MOCKS[it.id];
          return (
            <article key={it.id} className={'svc-card svc-' + it.id} id={'svc-' + it.id} style={{ '--i': i }}>
              <div className="svc-text">
                <div className="svc-num serif" aria-hidden="true">{it.n}</div>
                <h3 className="serif"><a href={L('svc-' + it.id)} dangerouslySetInnerHTML={h(it.title)} /></h3>
                <p className="svc-lede" dangerouslySetInnerHTML={h(it.lede)} />
                <div className="svc-meta">
                  <div>
                    <span className="mono muted">{d.get}</span>
                    <ul>{it.get.map((g) => <li key={g} dangerouslySetInnerHTML={h(g)} />)}</ul>
                  </div>
                  <div>
                    <span className="mono muted">{d.for}</span>
                    <div className="svc-chips">{it.who.map((w) => <span key={w}>{w}</span>)}</div>
                    <span className="mono muted svc-seen-k">{d.seen}</span>
                    <div className="svc-seen">
                      {it.seen.map(([name, href]) => (href
                        ? <a key={name} href={L.loc(href)} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{name}<span aria-hidden="true">↗</span></a>
                        : <span key={name}>{name}</span>))}
                    </div>
                  </div>
                </div>
                {it.price && (
                  <p className="svc-from">
                    <small className="mono">{d.from}</small>
                    <b className="serif">{it.price}</b>
                    <a href={L('svc-' + it.id, 'tarifs')}>{d.rates}</a>
                  </p>
                )}
                <div className="svc-ctas">
                  <a className="pill solid magnetic svc-cta" href={L('contact')} onClick={() => preselect(it.id)}>
                    <span>{d.cta}</span>{ARROW}
                  </a>
                  <a className="pill svc-more" href={L('svc-' + it.id)}>
                    <span>{d.more}</span>{ARROW}
                  </a>
                </div>
              </div>
              <div className="svc-visual"><Mock m={d.mock} /></div>
            </article>
          );
        })}
      </div>

      <div className="svc-outro">
        <p className="serif" dangerouslySetInnerHTML={h(d.outro)} />
        <a className="pill dark magnetic" href={L('contact')}><span>{d.outroCta}</span>{ARROW}</a>
      </div>
    </section>
  );
}

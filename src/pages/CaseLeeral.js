import { usePrefs } from '../i18n/PrefsContext';
import useLink from '../hooks/useLink';
import Tx from '../components/Tx';
import img from '../assets';
import { ScrollFX, Band, NextCase } from '../components/Showcase';
import Reel from '../components/Reel';

const html = (s) => ({ __html: s });
const ITEMS = ['01', '02', '03', '04'];
const NUMS = [
  ['12 → 2', 'le.n1'],
  ['25 444', 'le.n2'],
  ['0', 'le.n3'],
  ['20', 'le.n4'],
];

export default function CaseLeeral() {
  const { t } = usePrefs();
  const L = useLink();
  return (
    <main id="case-leeral" className="sx-case">
      <ScrollFX page="leeral" />
      <div className="wrap">
        <div className="case-nav">
          <a className="pill" href={L('home', 'travaux')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span dangerouslySetInnerHTML={html(t('case.back'))} />
          </a>
          <span className="mono muted">
            <span dangerouslySetInnerHTML={html(t('case.label'))} />
            {' 01 / 04'}
          </span>
        </div>

        <section className="case-hero">
          <span className="sx-casenum" data-par="0.12" aria-hidden="true">01</span>
          <span className="mono acc" dangerouslySetInnerHTML={html(t('le.k'))} />
          <Tx as="h1" html={'Lee<em>ral</em>'} delay={250} />
          <p className="lede" dangerouslySetInnerHTML={html(t('le.lede'))} />
          <div className="facts4">
            <div>
              <small dangerouslySetInnerHTML={html(t('f.role'))} />
              <span dangerouslySetInnerHTML={html(t('le.role'))} />
            </div>
            <div>
              <small dangerouslySetInnerHTML={html(t('f.channels'))} />
              <span dangerouslySetInnerHTML={html(t('le.channels'))} />
            </div>
            <div>
              <small dangerouslySetInnerHTML={html(t('f.langs'))} />
              <span dangerouslySetInnerHTML={html(t('le.langs'))} />
            </div>
            <div>
              <small dangerouslySetInnerHTML={html(t('f.team'))} />
              <span dangerouslySetInnerHTML={html(t('le.team'))} />
            </div>
          </div>
        </section>
        <Band items={[...t('le.k').split('·'), 'WhatsApp Cloud API', 'FastAPI', 'PostgreSQL', 'Redis', 'Expo'].map((w) => w.trim())} caps />
        <div className="case-reel" data-scrub=""><Reel id="leeral" label="Leeral" /></div>

        <div className="phone-stage" data-scrub="">
          <div className="app-shots">
            <figure>
              <img src={img.leeralExplication} alt={t('le.cap1')} loading="lazy" />
              <figcaption dangerouslySetInnerHTML={html(t('le.cap1'))} />
            </figure>
            <figure>
              <img src={img.leeralApprendre} alt={t('le.cap2')} loading="lazy" />
              <figcaption dangerouslySetInnerHTML={html(t('le.cap2'))} />
            </figure>
          </div>
          <div className="app-bet">
            <span className="mono muted" dangerouslySetInnerHTML={html(t('le.bet'))} />
            <p className="serif big-bet" dangerouslySetInnerHTML={html(t('le.bet.t'))} />
            <p className="muted" dangerouslySetInnerHTML={html(t('le.bet.d'))} />
            <div className="app-links">
              <a className="pill solid magnetic" href="https://wa.me/221766111021?text=Salam" target="_blank" rel="noopener noreferrer">
                <span dangerouslySetInnerHTML={html(t('le.try'))} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
              </a>
              <a className="pill" href="https://leeral.expo.app" target="_blank" rel="noopener noreferrer">
                <span dangerouslySetInnerHTML={html(t('le.web'))} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
              </a>
            </div>
          </div>
        </div>

        <section className="block two">
          <h2 dangerouslySetInnerHTML={html(t('le.h'))} />
          <div>
            {ITEMS.map((n, i) => (
              <div className="item" key={n}>
                <span className="n">{n}</span>
                <div>
                  <b dangerouslySetInnerHTML={html(t(`le.${i + 1}.t`))} />
                  <span dangerouslySetInnerHTML={html(t(`le.${i + 1}.d`))} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="block panels">
          <div className="panel">
            <span className="mono muted" dangerouslySetInnerHTML={html(t('le.res'))} />
            <div className="nums">
              {NUMS.map(([n, k]) => (
                <div key={k}>
                  <strong>{n}</strong>
                  <span dangerouslySetInnerHTML={html(t(k))} />
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <span className="mono muted" dangerouslySetInnerHTML={html(t('le.safe'))} />
            <p className="big" dangerouslySetInnerHTML={html(t('le.safe.t'))} />
            <p className="muted" dangerouslySetInnerHTML={html(t('le.safe.d'))} />
          </div>
        </section>

        <NextCase href={L('sunuchat')} name="SunuChat" label={t('case.next')} kicker={t('sc.k')} img={img.sunuchat} />
      </div>
    </main>
  );
}

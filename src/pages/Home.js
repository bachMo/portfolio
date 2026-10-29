import { usePrefs } from '../i18n/PrefsContext';
import { CONFIG } from '../config';
import Tx from '../components/Tx';
import { useEffect, useRef, useState } from 'react';
import Clock from '../components/Clock';
import Waveform from '../components/Waveform';
import Signature from '../components/Signature';
import TeamRail from '../components/TeamRail';
import OptionalLink from '../components/OptionalLink';
import Goorgoorlu from '../components/Goorgoorlu';
import CvLink from '../components/CvLink';
import VoiceToggle from '../components/VoiceToggle';
import Services from '../components/Services';
import { prefersReducedMotion } from '../hooks/motion';
import img from '../assets';


export default function Home() {
  const { t } = usePrefs();
  // Le reste du hero apparaît une fois le titre « transcrit » (uniquement au premier affichage).
  const [heroReady, setHeroReady] = useState(false);
  const heroTimer = useRef(null);
  const onHeroStart = (words) => {
    if (heroReady) return;
    heroTimer.current = setTimeout(() => setHeroReady(true), prefersReducedMotion() ? 0 : words * 75 + 250);
  };
  useEffect(() => () => clearTimeout(heroTimer.current), []);

  return (
    <main id="home">
      <section className="hero wrap" id="top">
        <div className="glow" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="meta mono">
          <span>
            <span dangerouslySetInnerHTML={{__html:t('hero.loc')}} />
            {" · 14.69°N 17.44°W"}
          </span>
          <span className="live">
            <span className="dot" />
            <span dangerouslySetInnerHTML={{__html:t('hero.open')}} />
            {" · "}
            <Clock />
            {" GMT"}
          </span>
        </div>
        <Tx as="h1" html={t('hero.title')} id="heroTitle" delay={450} onStart={onHeroStart} />
        <div className={'hero-row hero-after' + (heroReady ? ' on' : '')}>
          <p dangerouslySetInnerHTML={{__html:t('hero.sub')}} />
          <div className="ctas">
            <a className="pill solid magnetic" href="#services">
              <span dangerouslySetInnerHTML={{__html:t('hero.cta1')}} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <a className="pill magnetic" href="/contact" dangerouslySetInnerHTML={{__html:t('hero.cta2')}} />
          </div>
        </div>
        <div className="wave" aria-hidden="true">
          <Waveform />
          <div className="wave-legend mono">
            <span dangerouslySetInnerHTML={{__html:t('wave.voice')}} />
            <span dangerouslySetInnerHTML={{__html:t('wave.a')}} />
            <span dangerouslySetInnerHTML={{__html:t('wave.tr')}} />
            <span className="acc" dangerouslySetInnerHTML={{__html:t('wave.b')}} />
            <span dangerouslySetInnerHTML={{__html:t('wave.c')}} />
            <span dangerouslySetInnerHTML={{__html:t('wave.reply')}} />
          </div>
        </div>
        <VoiceToggle />
      </section>
      <div className="wrap">
        <div className="metrics">
          <div>
            <strong>
              4
              <small dangerouslySetInnerHTML={{__html:t('m.years')}} />
            </strong>
            <span dangerouslySetInnerHTML={{__html:t('m.1')}} />
          </div>
          <div>
            <strong>
              10+
            </strong>
            <span dangerouslySetInnerHTML={{__html:t('m.2')}} />
          </div>
          <div>
            <strong>
              3
            </strong>
            <span dangerouslySetInnerHTML={{__html:t('m.3')}} />
          </div>
          <div>
            <strong>
              464
              <small>
                {" h"}
              </small>
            </strong>
            <span dangerouslySetInnerHTML={{__html:t('m.4')}} />
          </div>
          <div>
            <strong className="metric-word" dangerouslySetInnerHTML={{__html:t('m.5.big')}} />
            <span dangerouslySetInnerHTML={{__html:t('m.5')}} />
          </div>
        </div>
      </div>
      <div className="marquee" aria-labelledby="marqLabel">
        <span className="mono marquee-label" id="marqLabel" dangerouslySetInnerHTML={{__html:t('marq.label')}} />
        <div className="track">
          <span>
            Jokalante
          </span>
          <span>
            École Polytechnique de Thiès
          </span>
          <span>
            Grand Challenges Canada
          </span>
          <span>
            CNCR
          </span>
          <span>
            ASPRODEB
          </span>
          <span>
            MyAgro
          </span>
          <span>
            Solsen
          </span>
          <span>
            AI Hub Sénégal
          </span>
          <span>
            Pulse Digital
          </span>
          <span>
            Linepharma
          </span>
          <span>
            Migros
          </span>
          <span aria-hidden="true">
            Jokalante
          </span>
          <span aria-hidden="true">
            École Polytechnique de Thiès
          </span>
          <span aria-hidden="true">
            Grand Challenges Canada
          </span>
          <span aria-hidden="true">
            CNCR
          </span>
          <span aria-hidden="true">
            ASPRODEB
          </span>
          <span aria-hidden="true">
            MyAgro
          </span>
          <span aria-hidden="true">
            Solsen
          </span>
          <span aria-hidden="true">
            AI Hub Sénégal
          </span>
          <span aria-hidden="true">
            Pulse Digital
          </span>
          <span aria-hidden="true">
            Linepharma
          </span>
          <span aria-hidden="true">
            Migros
          </span>
        </div>
      </div>
      <Services />
      <Goorgoorlu />
      <Signature />
      <section className="block wrap" id="travaux">
        <div className="intro">
          <div>
            <span className="mono kicker" dangerouslySetInnerHTML={{__html:t('solo.kicker')}} />
            <h2 className="h2" dangerouslySetInnerHTML={{__html:t('solo.title')}} />
          </div>
          <p dangerouslySetInnerHTML={{__html:t('solo.sub')}} />
        </div>
        <div className="solo">
          <article className="card">
            <a className="shot" href="/waluma" tabIndex="-1" aria-hidden="true">
              <img src={img.waluma} alt="" loading="lazy" />
            </a>
            <div className="card-body">
              <div className="card-top mono">
                <span className="acc" dangerouslySetInnerHTML={{__html:t('solo.1.tag')}} />
                <span className="muted">
                  S1
                </span>
              </div>
              <h3>
                Waluma
              </h3>
              <p dangerouslySetInnerHTML={{__html:t('solo.1.desc')}} />
              <div className="chips">
                <span>
                  Expo
                </span>
                <span>
                  Next.js
                </span>
                <span>
                  Express
                </span>
                <span>
                  Prisma · PostgreSQL
                </span>
              </div>
              <div className="links-row">
                <a className="case-link" href="/waluma">
                  <span dangerouslySetInnerHTML={{__html:t('case.read')}} />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a href="https://waluma-api-d3hq.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <span dangerouslySetInnerHTML={{__html:t('solo.site')}} />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </a>
              </div>
            </div>
          </article>
          <article className="card">
            <a className="shot" href="https://melimicro.com" target="_blank" rel="noopener noreferrer" tabIndex="-1" aria-hidden="true">
              <img src={img.melimicro} alt="" loading="lazy" />
            </a>
            <div className="card-body">
              <div className="card-top mono">
                <span className="acc" dangerouslySetInnerHTML={{__html:t('solo.2.tag')}} />
                <span className="muted">
                  S2
                </span>
              </div>
              <h3>
                Meli Micro
              </h3>
              <p dangerouslySetInnerHTML={{__html:t('solo.2.desc')}} />
              <a className="visit" href="https://melimicro.com" target="_blank" rel="noopener noreferrer">
                {"melimicro.com "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </a>
            </div>
          </article>
          <article className="card">
            <a className="shot" href="https://spot-sc46.vercel.app" target="_blank" rel="noopener noreferrer" tabIndex="-1" aria-hidden="true">
              <img src={img.spot} alt="" loading="lazy" />
            </a>
            <div className="card-body">
              <div className="card-top mono">
                <span className="acc" dangerouslySetInnerHTML={{__html:t('solo.3.tag')}} />
                <span className="muted">
                  S3
                </span>
              </div>
              <h3>
                SPOT Énergie
              </h3>
              <p dangerouslySetInnerHTML={{__html:t('solo.3.desc')}} />
              <a className="visit" href="https://spot-sc46.vercel.app" target="_blank" rel="noopener noreferrer">
                {"spot-sc46.vercel.app "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </a>
            </div>
          </article>
        </div>
      </section>
      <section className="block wrap" aria-labelledby="team-title">
        <div className="intro">
          <div>
            <span className="mono kicker" dangerouslySetInnerHTML={{__html:t('team.kicker')}} />
            <h2 className="h2" id="team-title" dangerouslySetInnerHTML={{__html:t('team.title')}} />
          </div>
          <p dangerouslySetInnerHTML={{__html:t('team.sub')}} />
        </div>
        <TeamRail />
        <span className="mono rail-hint" aria-hidden="true">
          <span dangerouslySetInnerHTML={{__html:t('rail.team')}} />
          {" "}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
        <div className="block" style={{paddingTop:"120px"}}>
          <div className="lab-head">
            <h2 className="serif" style={{fontSize:"56px",lineHeight:"1"}} dangerouslySetInnerHTML={{__html:t('lab.title')}} />
            <span className="muted" dangerouslySetInnerHTML={{__html:t('lab.sub')}} />
          </div>
          <div className="lab">
            <a className="lab-own" href="/leeral">
              <span className="mono acc" dangerouslySetInnerHTML={{__html:t('lab.0.tag')}} />
              <h3>
                Leeral
              </h3>
              <p dangerouslySetInnerHTML={{__html:t('lab.0.desc')}} />
              <span className="lab-go" dangerouslySetInnerHTML={{__html:t('case.read') + ' →'}} />
            </a>
            <article>
              <span className="mono acc" dangerouslySetInnerHTML={{__html:t('lab.1.tag')}} />
              <h3>
                Walabot
              </h3>
              <p dangerouslySetInnerHTML={{__html:t('lab.1.desc')}} />
            </article>
            <article>
              <span className="mono acc" dangerouslySetInnerHTML={{__html:t('lab.2.tag')}} />
              <h3>
                VERIFA
              </h3>
              <p dangerouslySetInnerHTML={{__html:t('lab.2.desc')}} />
            </article>
            <article>
              <span className="mono acc" dangerouslySetInnerHTML={{__html:t('lab.3.tag')}} />
              <h3>
                Kaddu
              </h3>
              <p dangerouslySetInnerHTML={{__html:t('lab.3.desc')}} />
            </article>
          </div>
        </div>
      </section>
      <section className="block wrap" id="expertise">
        <div className="intro">
          <h2 className="h2" dangerouslySetInnerHTML={{__html:t('exp.title')}} />
          <p dangerouslySetInnerHTML={{__html:t('exp.sub')}} />
        </div>
        <div className="cols">
          <div>
            <span className="mono muted" dangerouslySetInnerHTML={{__html:t('exp.1.k')}} />
            <h3 dangerouslySetInnerHTML={{__html:t('exp.1.t')}} />
            <p dangerouslySetInnerHTML={{__html:t('exp.1.d')}} />
            <p className="stack">
              React · Next.js · React Native · Flutter
              <br />
              Node/Express · NestJS · FastAPI · Laravel · Django
              <br />
              PostgreSQL · MySQL · MongoDB · Docker
            </p>
          </div>
          <div>
            <span className="mono muted" dangerouslySetInnerHTML={{__html:t('exp.2.k')}} />
            <h3 dangerouslySetInnerHTML={{__html:t('exp.2.t')}} />
            <p dangerouslySetInnerHTML={{__html:t('exp.2.d')}} />
            <p className="stack">
              Whisper · MMS · Parler-TTS · Transformers
              <br />
              LangChain · RAG · PyTorch · TensorFlow
              <br />
              YOLOv8 · Power BI · RunPod · CUDA
            </p>
          </div>
          <div>
            <span className="mono muted" dangerouslySetInnerHTML={{__html:t('exp.3.k')}} />
            <h3 dangerouslySetInnerHTML={{__html:t('exp.3.t')}} />
            <p dangerouslySetInnerHTML={{__html:t('exp.3.d')}} />
            <p className="stack" dangerouslySetInnerHTML={{__html:t('exp.3.s')}} />
          </div>
        </div>
        <div className="process">
          <h2 dangerouslySetInnerHTML={{__html:t('proc.title')}} />
          <div className="steps4">
            <div>
              <b>
                1
              </b>
              <h3 dangerouslySetInnerHTML={{__html:t('proc.1.t')}} />
              <p dangerouslySetInnerHTML={{__html:t('proc.1.d')}} />
            </div>
            <div>
              <b>
                2
              </b>
              <h3 dangerouslySetInnerHTML={{__html:t('proc.2.t')}} />
              <p dangerouslySetInnerHTML={{__html:t('proc.2.d')}} />
            </div>
            <div>
              <b>
                3
              </b>
              <h3 dangerouslySetInnerHTML={{__html:t('proc.3.t')}} />
              <p dangerouslySetInnerHTML={{__html:t('proc.3.d')}} />
            </div>
            <div>
              <b>
                4
              </b>
              <h3 dangerouslySetInnerHTML={{__html:t('proc.4.t')}} />
              <p dangerouslySetInnerHTML={{__html:t('proc.4.d')}} />
            </div>
          </div>
        </div>
      </section>
      <section className="block wrap" id="parcours">
        <h2 className="h2" dangerouslySetInnerHTML={{__html:t('path.title')}} />
        <div className="path">
          <div>
            <h3 dangerouslySetInnerHTML={{__html:t('path.exp')}} />
            <div className="row">
              <time dangerouslySetInnerHTML={{__html:t('j0.d')}} />
              <div>
                <b dangerouslySetInnerHTML={{__html:t('j0.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('j0.s')}} />
              </div>
            </div>
            <div className="row">
              <time dangerouslySetInnerHTML={{__html:t('j1.d')}} />
              <div>
                <b dangerouslySetInnerHTML={{__html:t('j1.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('j1.s')}} />
              </div>
            </div>
            <div className="row">
              <time dangerouslySetInnerHTML={{__html:t('j2.d')}} />
              <div>
                <b dangerouslySetInnerHTML={{__html:t('j2.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('j2.s')}} />
              </div>
            </div>
            <div className="row">
              <time dangerouslySetInnerHTML={{__html:t('j3.d')}} />
              <div>
                <b dangerouslySetInnerHTML={{__html:t('j3.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('j3.s')}} />
              </div>
            </div>
            <div className="row">
              <time dangerouslySetInnerHTML={{__html:t('j4.d')}} />
              <div>
                <b dangerouslySetInnerHTML={{__html:t('j4.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('j4.s')}} />
              </div>
            </div>
            <div className="row">
              <time dangerouslySetInnerHTML={{__html:t('j5.d')}} />
              <div>
                <b dangerouslySetInnerHTML={{__html:t('j5.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('j5.s')}} />
              </div>
            </div>
          </div>
          <div className="edu">
            <h3 dangerouslySetInnerHTML={{__html:t('path.edu')}} />
            <div className="row">
              <time>
                2023 — 2026
              </time>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('e1.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('e1.s')}} />
              </div>
            </div>
            <div className="row">
              <time>
                2018 — 2021
              </time>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('e2.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('e2.s')}} />
              </div>
            </div>
            <div className="row">
              <time>
                2018
              </time>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('e3.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('e3.s')}} />
              </div>
            </div>
            <div className="row">
              <time dangerouslySetInnerHTML={{__html:t('e4.d')}} />
              <div>
                <b dangerouslySetInnerHTML={{__html:t('e4.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('e4.s')}} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="block wrap" id="contact">
        <div className="contact contact-band">
          <span className="mono band-k">
            CONTACT
          </span>
          <a className="round-badge" href="/contact" aria-hidden="true" tabIndex="-1">
            <svg viewBox="0 0 200 200">
              <defs>
                <path id="badgeCircle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <text>
                <textPath href="#badgeCircle" textLength="486" lengthAdjust="spacing">{t('badge')}</textPath>
              </text>
            </svg>
            <span className="rb-arrow">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </a>
          <h2 id="contactTitle" dangerouslySetInnerHTML={{__html:t('contact.title')}} />
          <div className="contact-row">
            <a className="pill solid magnetic big-cta" href="/contact">
              <span dangerouslySetInnerHTML={{__html:t('contact.cta')}} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <div className="socials">
              <a className="pill" href={"mailto:" + CONFIG.contactEmail}>
                {CONFIG.contactEmail}
              </a>
              <a className="pill" href={CONFIG.links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <OptionalLink kind="github" label="GitHub" />
              <CvLink />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

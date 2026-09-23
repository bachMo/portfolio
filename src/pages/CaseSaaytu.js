import { usePrefs } from '../i18n/PrefsContext';
import Tx from '../components/Tx';
import { useEffect, useRef, useState } from 'react';
import MiniWave from '../components/MiniWave';

export default function CaseSaaytu() {
  const { t } = usePrefs();
  // Lecture simulée des bulles vocales
  const [playing, setPlaying] = useState(null);
  const timer = useRef(null);
  const play = (id) => {
    clearTimeout(timer.current);
    if (playing === id) { setPlaying(null); return; }
    setPlaying(id);
    timer.current = setTimeout(() => setPlaying(null), id === 'a' ? 2400 : 3600);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <main id="case-saaytu">
      <div className="wrap">
        <div className="case-nav">
          <a className="pill" href="#travaux">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span dangerouslySetInnerHTML={{__html:t('case.back')}} />
          </a>
          <span className="mono muted">
            <span dangerouslySetInnerHTML={{__html:t('case.label')}} />
            {" 02 / 03"}
          </span>
        </div>
        <section className="case-hero">
          <span className="mono acc" dangerouslySetInnerHTML={{__html:t('sm.k')}} />
          <Tx as="h1" html={"Saaytu <em>Mbay</em>"} delay={250} />
          <p className="lede" dangerouslySetInnerHTML={{__html:t('sm.lede')}} />
          <div className="facts4">
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.role')}} />
              <span dangerouslySetInnerHTML={{__html:t('sm.role')}} />
            </div>
            <div>
              <small>
                CLIENT
              </small>
              <span>
                Jokalante
              </span>
            </div>
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.fund')}} />
              <span>
                AI Hub Sénégal
              </span>
            </div>
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.team')}} />
              <span>
                Boubacar Diallo, Ahmadou Ndiaye
              </span>
            </div>
          </div>
        </section>
        <div className="phone-stage">
          <div className="phone">
            <div className="chat-head">
              <span className="avatar">
                S
              </span>
              <div>
                <b style={{fontSize:"15px"}}>
                  Saaytu Mbay
                </b>
                <br />
                <span className="muted" style={{fontSize:"12px"}} dangerouslySetInnerHTML={{__html:t('sm.bot')}} />
              </div>
            </div>
            <div className="bubble me">
              <button className="play-btn" type="button" onClick={() => play("a")} aria-pressed={playing === "a"} aria-label={t('aria.playq')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <MiniWave seed={1.3} playing={playing === "a"} />
              <span className="mono muted" style={{fontSize:"11px"}}>
                0:12
              </span>
            </div>
            <span className="caption" style={{alignSelf:"flex-end",textAlign:"right"}} dangerouslySetInnerHTML={{__html:t('sm.cap1')}} />
            <div className="bubble bot">
              <button className="play-btn" type="button" onClick={() => play("b")} aria-pressed={playing === "b"} style={{color:"var(--accent)"}} aria-label={t('aria.playa')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <MiniWave seed={2.1} playing={playing === "b"} />
              <span className="mono muted" style={{fontSize:"11px"}}>
                0:24
              </span>
            </div>
            <span className="caption" dangerouslySetInnerHTML={{__html:t('sm.cap2')}} />
          </div>
          <div style={{maxWidth:"480px",display:"flex",flexDirection:"column",gap:"28px"}}>
            <span className="mono muted" dangerouslySetInnerHTML={{__html:t('sm.bet')}} />
            <p className="serif" style={{fontSize:"clamp(36px,3.4vw,48px)",lineHeight:"1.1"}} dangerouslySetInnerHTML={{__html:t('sm.bet.t')}} />
            <p className="muted" dangerouslySetInnerHTML={{__html:t('sm.bet.d')}} />
          </div>
        </div>
        <section className="block two">
          <h2 dangerouslySetInnerHTML={{__html:t('sm.h')}} />
          <div>
            <div className="item">
              <span className="n">
                01
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('sm.1.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('sm.1.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                02
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('sm.2.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('sm.2.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                03
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('sm.3.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('sm.3.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                04
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('sm.4.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('sm.4.d')}} />
              </div>
            </div>
          </div>
        </section>
        <section className="block">
          <h2 className="serif" style={{fontSize:"clamp(44px,4.5vw,64px)",lineHeight:"1",marginBottom:"48px"}}>
            Architecture
          </h2>
          <div className="arch">
            <svg viewBox="0 0 1248 300" fill="none" role="img" aria-label="WhatsApp → ASR → m2m100 → RAG + LLM → Parler-TTS → audio">
              <g fontFamily="JetBrains Mono, monospace" fontSize="12">
                <rect x="0.5" y="100.5" width="170" height="100" rx="14" stroke="var(--line-2)" fill="var(--surface)" />
                <text x="20" y="140" fill="var(--faint)" dangerouslySetInnerHTML={{__html:t('arch.in')}} />
                <text x="20" y="168" fill="var(--text)" fontSize="15">
                  WhatsApp
                </text>
                <rect x="215.5" y="100.5" width="170" height="100" rx="14" stroke="var(--line-2)" fill="var(--surface)" />
                <text x="235" y="140" fill="var(--faint)">
                  ASR
                </text>
                <text x="235" y="168" fill="var(--text)" fontSize="15">
                  MMS · Whisper
                </text>
                <rect x="430.5" y="100.5" width="170" height="100" rx="14" stroke="var(--line-2)" fill="var(--surface)" />
                <text x="450" y="140" fill="var(--faint)">
                  WO ⇄ FR
                </text>
                <text x="450" y="168" fill="var(--text)" fontSize="15">
                  m2m100
                </text>
                <rect x="645.5" y="80.5" width="200" height="140" rx="14" stroke="var(--accent)" fill="var(--hot)" />
                <text x="665" y="122" fill="var(--accent)">
                  RAG
                </text>
                <text x="665" y="150" fill="var(--text)" fontSize="15">
                  Embeddings
                </text>
                <text x="665" y="172" fill="var(--text)" fontSize="15">
                  + LLM
                </text>
                <text x="665" y="196" fill="var(--muted)">
                  FastAPI
                </text>
                <rect x="890.5" y="100.5" width="170" height="100" rx="14" stroke="var(--line-2)" fill="var(--surface)" />
                <text x="910" y="140" fill="var(--faint)">
                  TTS
                </text>
                <text x="910" y="168" fill="var(--text)" fontSize="15">
                  Parler-TTS
                </text>
                <rect x="1077.5" y="100.5" width="170" height="100" rx="14" stroke="var(--line-2)" fill="var(--surface)" />
                <text x="1097" y="140" fill="var(--faint)" dangerouslySetInnerHTML={{__html:t('arch.out')}} />
                <text x="1097" y="168" fill="var(--text)" fontSize="15" dangerouslySetInnerHTML={{__html:t('arch.audio')}} />
                <path className="flowline" d="M171 150h44M386 150h44M601 150h44M846 150h44M1061 150h16" stroke="var(--accent)" strokeWidth="1.5" />
                <rect x="645.5" y="250.5" width="200" height="44" rx="10" stroke="var(--line-2)" strokeDasharray="4 4" />
                <text x="665" y="278" fill="var(--muted)" dangerouslySetInnerHTML={{__html:t('arch.kb')}} />
                <path d="M745 221v29" stroke="var(--line-2)" strokeDasharray="4 4" />
                <rect x="215.5" y="0.5" width="845" height="44" rx="10" stroke="var(--line-2)" strokeDasharray="4 4" />
                <text x="235" y="28" fill="var(--muted)">
                  GPU · RunPod — API IA Wolof
                </text>
                <path d="M300 45v55M515 45v55M975 45v55" stroke="var(--line-2)" strokeDasharray="4 4" />
              </g>
            </svg>
          </div>
        </section>
        <section className="block panels">
          <div className="panel">
            <span className="mono muted" dangerouslySetInnerHTML={{__html:t('res')}} />
            <div className="nums">
              <div>
                <strong>
                  [X]
                </strong>
                <span dangerouslySetInnerHTML={{__html:t('sm.n1')}} />
              </div>
              <div>
                <strong>
                  [X]
                </strong>
                <span dangerouslySetInnerHTML={{__html:t('sm.n2')}} />
              </div>
              <div>
                <strong>
                  [X] %
                </strong>
                <span dangerouslySetInnerHTML={{__html:t('sm.n3')}} />
              </div>
              <div>
                <strong>
                  [X] s
                </strong>
                <span dangerouslySetInnerHTML={{__html:t('sm.n4')}} />
              </div>
            </div>
          </div>
          <div className="panel">
            <span className="mono muted" dangerouslySetInnerHTML={{__html:t('sm.learn')}} />
            <p className="big" dangerouslySetInnerHTML={{__html:t('sm.learn.t')}} />
            <p className="muted" dangerouslySetInnerHTML={{__html:t('sm.learn.d')}} />
          </div>
        </section>
        <div className="next">
          <span className="mono muted" dangerouslySetInnerHTML={{__html:t('case.next')}} />
          <a href="#/waluma">
            {"Waluma "}
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}

import { usePrefs } from '../i18n/PrefsContext';
import useLink from '../hooks/useLink';
import Tx from '../components/Tx';
import img from '../assets';

export default function CaseSunuChat() {
  const { t } = usePrefs();
  const L = useLink();
  return (
    <main id="case-sunuchat">
      <div className="wrap">
        <div className="case-nav">
          <a className="pill" href={L('home', 'travaux')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span dangerouslySetInnerHTML={{__html:t('case.back')}} />
          </a>
          <span className="mono muted">
            <span dangerouslySetInnerHTML={{__html:t('case.label')}} />
            {" 02 / 04"}
          </span>
        </div>
        <section className="case-hero">
          <span className="mono acc" dangerouslySetInnerHTML={{__html:t('sc.k')}} />
          <Tx as="h1" html={"Sunu<em>Chat</em>"} delay={250} />
          <p className="lede" dangerouslySetInnerHTML={{__html:t('sc.lede')}} />
          <div className="facts4">
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.role')}} />
              <span dangerouslySetInnerHTML={{__html:t('sc.role')}} />
            </div>
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.org')}} />
              <span dangerouslySetInnerHTML={{__html:t('sc.org')}} />
            </div>
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.fund')}} />
              <span>
                Grand Challenges Canada
              </span>
            </div>
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.period')}} />
              <span dangerouslySetInnerHTML={{__html:t('sc.period')}} />
            </div>
          </div>
        </section>
        <div className="browser">
          <div className="frame">
            <div className="bar">
              <i />
              <i />
              <i />
              <span>
                sunuchat.com
              </span>
            </div>
            <img src={img.sunuchat} alt="SunuChat" loading="lazy" />
          </div>
        </div>
        <section className="block two">
          <h2 dangerouslySetInnerHTML={{__html:t('sc.h')}} />
          <div>
            <div className="item">
              <span className="n">
                01
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('sc.1.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('sc.1.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                02
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('sc.2.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('sc.2.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                03
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('sc.3.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('sc.3.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                04
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('sc.4.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('sc.4.d')}} />
              </div>
            </div>
          </div>
        </section>
        <section className="block panels">
          <div className="panel">
            <span className="mono muted" dangerouslySetInnerHTML={{__html:t('res')}} />
            <div className="nums">
              <div>
                <strong>
                  108
                </strong>
                <span dangerouslySetInnerHTML={{__html:t('sc.n1')}} />
              </div>
              <div>
                <strong>
                  2308
                </strong>
                <span dangerouslySetInnerHTML={{__html:t('sc.n2')}} />
              </div>
              <div>
                <strong>
                  2
                </strong>
                <span dangerouslySetInnerHTML={{__html:t('sc.n3')}} />
              </div>
              <div>
                <strong>
                  2
                </strong>
                <span dangerouslySetInnerHTML={{__html:t('sc.n4')}} />
              </div>
            </div>
          </div>
          <div className="panel">
            <span className="mono muted" dangerouslySetInnerHTML={{__html:t('sc.team')}} />
            <p className="big" dangerouslySetInnerHTML={{__html:t('sc.team.t')}} />
            <p className="muted" dangerouslySetInnerHTML={{__html:t('sc.team.d')}} />
          </div>
        </section>
        <div className="next">
          <span className="mono muted" dangerouslySetInnerHTML={{__html:t('case.next')}} />
          <a href={L('saaytu')}>
            {"Saaytu Mbay "}
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}

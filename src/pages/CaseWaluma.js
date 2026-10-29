import { usePrefs } from '../i18n/PrefsContext';
import Tx from '../components/Tx';
import img from '../assets';

export default function CaseWaluma() {
  const { t } = usePrefs();
  return (
    <main id="case-waluma">
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
            {" 04 / 04"}
          </span>
        </div>
        <section className="case-hero">
          <span className="mono acc" dangerouslySetInnerHTML={{__html:t('wl.k')}} />
          <Tx as="h1" html={"Walu<em>ma</em>"} delay={250} />
          <p className="lede" dangerouslySetInnerHTML={{__html:t('wl.lede')}} />
          <div className="facts4">
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.role')}} />
              <span dangerouslySetInnerHTML={{__html:t('wl.role')}} />
            </div>
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.deliv')}} />
              <span dangerouslySetInnerHTML={{__html:t('wl.deliv')}} />
            </div>
            <div>
              <small>
                STACK
              </small>
              <span>
                Expo · Next.js · Express · Prisma
              </span>
            </div>
            <div>
              <small dangerouslySetInnerHTML={{__html:t('f.status')}} />
              <span dangerouslySetInnerHTML={{__html:t('wl.status')}} />
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
                waluma-api-d3hq.vercel.app
              </span>
            </div>
            <img src={img.waluma} alt="Waluma" loading="lazy" />
          </div>
        </div>
        <section className="block two">
          <h2 dangerouslySetInnerHTML={{__html:t('wl.h')}} />
          <div>
            <div className="item">
              <span className="n">
                01
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('wl.1.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('wl.1.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                02
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('wl.2.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('wl.2.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                03
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('wl.3.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('wl.3.d')}} />
              </div>
            </div>
            <div className="item">
              <span className="n">
                04
              </span>
              <div>
                <b dangerouslySetInnerHTML={{__html:t('wl.4.t')}} />
                <span dangerouslySetInnerHTML={{__html:t('wl.4.d')}} />
              </div>
            </div>
          </div>
        </section>
        <div className="next">
          <span className="mono muted" dangerouslySetInnerHTML={{__html:t('case.next')}} />
          <a href="/leeral">
            {"Leeral "}
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}

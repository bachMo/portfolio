import { usePrefs } from '../i18n/PrefsContext';
import { CONFIG } from '../config';
import Tx from '../components/Tx';
import Clock from '../components/Clock';
import ContactForm from '../components/ContactForm';
import { CvAll } from '../components/CvLink';

export default function Contact() {
  const { t } = usePrefs();
  return (
    <main id="page-contact">
      <div className="wrap">
        <div className="case-nav">
          <a className="pill" href="#top">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span dangerouslySetInnerHTML={{__html:t('cp.back')}} />
          </a>
          <span className="mono muted live">
            <span className="dot" />
            <Clock />
            {" "}
            <span dangerouslySetInnerHTML={{__html:t('cp.indkr')}} />
          </span>
        </div>
        <div className="contact-page">
          <aside className="cp-side">
            <span className="mono acc" dangerouslySetInnerHTML={{__html:t('cp.k')}} />
            <Tx as="h1" html={t('cp.title')} id="cpTitle" delay={250} />
            <p className="lede" dangerouslySetInnerHTML={{__html:t('cp.lede')}} />
            <dl className="cp-info">
              <div>
                <dt>
                  Email
                </dt>
                <dd>
                  <a href={"mailto:" + CONFIG.contactEmail}>
                    {CONFIG.contactEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt>
                  LinkedIn
                </dt>
                <dd>
                  <a href={CONFIG.links.linkedin} target="_blank" rel="noopener noreferrer">
                    linkedin.com/in/bachirsy
                  </a>
                </dd>
              </div>
              <div>
                <dt dangerouslySetInnerHTML={{__html:t('cp.base')}} />
                <dd dangerouslySetInnerHTML={{__html:t('cp.base.v')}} />
              </div>
              <div>
                <dt>
                  CV
                </dt>
                <dd>
                  <CvAll className="cv-all cv-inline" />
                </dd>
              </div>
              <div>
                <dt dangerouslySetInnerHTML={{__html:t('cp.langs')}} />
                <dd dangerouslySetInnerHTML={{__html:t('e4.t')}} />
              </div>
            </dl>
          </aside>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}

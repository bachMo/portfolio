import { usePrefs } from '../i18n/PrefsContext';
import Clock from './Clock';
import SocialLinks from './SocialLinks';
import useLink from '../hooks/useLink';

const FOOT = {
  fr: { svc: 'Services', s1: 'Création de site web', s2: 'Plateforme de gestion', s3: 'Chatbots, IA et automatisation', cases: 'Études de cas', social: 'Réseaux', contact: 'Contact' },
  en: { svc: 'Services', s1: 'Website development', s2: 'Business platform', s3: 'Chatbots, AI & automation', cases: 'Case studies', social: 'Social', contact: 'Contact' },
};

export default function Footer() {
  const { t, lang } = usePrefs();
  const L = useLink();
  const f = FOOT[lang] || FOOT.fr;
  return (
    <footer className="bigfoot">
      <div className="wrap">
        <div className="row1">
          <span className="mono muted" dangerouslySetInnerHTML={{__html:t('foot.made')}} />
          <a className="pill totop" href="#top">
            <span dangerouslySetInnerHTML={{__html:t('foot.top')}} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </a>
        </div>
        <nav className="footnav" aria-label={f.svc}>
          <div>
            <span className="mono muted">{f.svc}</span>
            <a href={L('svc-site')}>{f.s1}</a>
            <a href={L('svc-platform')}>{f.s2}</a>
            <a href={L('svc-ai')}>{f.s3}</a>
          </div>
          <div>
            <span className="mono muted">{f.cases}</span>
            <a href={L('leeral')}>Leeral</a>
            <a href={L('sunuchat')}>SunuChat</a>
            <a href={L('saaytu')}>Saaytu Mbay</a>
            <a href={L('waluma')}>Waluma</a>
          </div>
          <div>
            <span className="mono muted">{f.social}</span>
            <SocialLinks className="social-links stack" />
          </div>
          <div>
            <span className="mono muted">{f.contact}</span>
            <a href={L('contact')}>{t('nav.cta').replace(/<[^>]+>/g, '')}</a>
            <a href="mailto:contact@bachirsy.com">contact@bachirsy.com</a>
          </div>
        </nav>
        <div className="wordmark" aria-hidden="true">
          {'Bachir Sy'.split('').map((c, i) => (
            <span key={i} className="wl" style={{ '--i': i }}>{c === ' ' ? '\u00a0' : c}</span>
          ))}
          <em>
            <span className="wl" style={{ '--i': 9 }}>.</span>
          </em>
        </div>
        <div className="row2 mono">
          <span>
            © 2026 Mamadou Bachir Sy
          </span>
          <button type="button" className="kbd-hint" onClick={() => window.dispatchEvent(new Event('open-palette'))}>
            <kbd>⌘K</kbd> <span dangerouslySetInnerHTML={{__html:t('foot.kbd')}} />
          </button>
          <span>
            {"Dakar · "}
            <Clock />
            {" GMT"}
          </span>
        </div>
      </div>
    </footer>
  );
}

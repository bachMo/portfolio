import { usePrefs } from '../i18n/PrefsContext';
import Clock from './Clock';

export default function Footer() {
  const { t } = usePrefs();
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
        <div className="wordmark" aria-hidden="true">
          Bach Sy
          <em>
            .
          </em>
        </div>
        <div className="row2 mono">
          <span>
            © 2026 Mamadou Bachir Sy
          </span>
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

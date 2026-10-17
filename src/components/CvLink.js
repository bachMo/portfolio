import { usePrefs } from '../i18n/PrefsContext';
import { CV, CV_LIST } from '../data/cv';

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v12M6 11l6 6 6-6M5 20h14" />
  </svg>
);

/** Bouton CV : télécharge la version qui correspond à la langue et au thème affichés. */
export default function CvLink({ className = 'pill', label }) {
  const { lang, theme, t } = usePrefs();
  const cv = (CV[lang] || CV.fr)[theme === 'dark' ? 'dark' : 'light'];
  return (
    <a className={className} href={cv.href} download={cv.file}>
      <span dangerouslySetInnerHTML={{ __html: label || t('contact.cv') }} />
      <DownloadIcon />
    </a>
  );
}

/** Liste des quatre versions (FR/EN, clair/sombre). */
export function CvAll({ className = 'cv-all' }) {
  return (
    <span className={className}>
      {CV_LIST.map((cv) => (
        <a key={cv.href} href={cv.href} download={cv.file}>{cv.label}</a>
      ))}
    </span>
  );
}

import { usePrefs } from '../i18n/PrefsContext';
import CvLink, { CvAll } from './CvLink';
import img from '../assets';

const ORBIT = ['Web', 'Mobile', 'WhatsApp', 'Data', 'Wolof', 'LLM'];

/** Section de marque : la mascotte « goorgoorlu du digital » + téléchargement du CV. */
export default function Goorgoorlu() {
  const { t } = usePrefs();
  return (
    <section className="block wrap goor" id="goorgoorlu" aria-labelledby="goor-title">
      <figure className="goor-art">
        <span className="goor-sun" aria-hidden="true" data-par="-0.06" />
        <span className="goor-orbit" aria-hidden="true">
          {ORBIT.map((w, i) => (
            <i key={w} style={{ '--a': `${(360 / ORBIT.length) * i}deg` }}><b>{w}</b></i>
          ))}
        </span>
        <img data-par="0.04" src={img.mascotte} alt={t('goor.alt')} loading="lazy" width="620" height="1658" />
      </figure>
      <div className="goor-text">
        <span className="mono kicker" dangerouslySetInnerHTML={{ __html: t('goor.kicker') }} />
        <h2 className="h2" id="goor-title" dangerouslySetInnerHTML={{ __html: t('goor.title') }} />
        <p className="goor-lede" dangerouslySetInnerHTML={{ __html: t('goor.p1') }} />
        <p dangerouslySetInnerHTML={{ __html: t('goor.p2') }} />
        <div className="goor-cv">
          <CvLink className="pill solid magnetic" label={t('goor.cv')} />
          <div className="goor-cv-other">
            <span className="mono muted" dangerouslySetInnerHTML={{ __html: t('goor.cv.other') }} />
            <CvAll />
          </div>
        </div>
      </div>
    </section>
  );
}

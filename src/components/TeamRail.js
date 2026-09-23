import { usePrefs } from '../i18n/PrefsContext';
import team from '../data/team';

/** Projets en équipe : grille sur desktop, carrousel à glisser sur mobile. */
export default function TeamRail() {
  const { lang } = usePrefs();
  return (
    <div className="team">
      {team[lang].map((w, i) => {
        const inner = (
          <>
            <div className="top mono"><span>{w.org}</span><span>E{i + 1}</span></div>
            <h3>{w.title}</h3>
            <span className="role">{w.role}</span>
            <p>{w.desc}</p>
            <span className="foot">{w.foot}</span>
          </>
        );
        if (!w.href) return <article key={w.title} className="tcard">{inner}</article>;
        const external = w.href.startsWith('http');
        return (
          <a key={w.title} className="tcard" href={w.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {inner}
          </a>
        );
      })}
    </div>
  );
}

import socials from '../data/socials';

// Icônes simplifiées (traits), cohérentes avec le reste du site.
const ICONS = {
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5v.01" /></>,
  tiktok: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.2 4.4 5 4.6" />,
  facebook: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M15 8h-1.5A2.5 2.5 0 0 0 11 10.5V21M9 13h6" /></>,
  x: <path d="M4 4l16 16M20 4L4 20" />,
  github: <path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.9-2.3c3-.3 6-1.5 6-6.5a5 5 0 0 0-1.4-3.5 4.6 4.6 0 0 0-.1-3.5s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.5 0C6 1.4 4.9 1.7 4.9 1.7a4.6 4.6 0 0 0-.1 3.5A5 5 0 0 0 3.4 8.7c0 5 3 6.2 6 6.5a3 3 0 0 0-.9 2.3V21" />,
};

/** Liens vers les réseaux sociaux (icône + nom, ou icône seule avec `compact`). */
export default function SocialLinks({ compact = false, className = 'social-links' }) {
  return (
    <ul className={className}>
      {socials.map((s) => (
        <li key={s.id}>
          <a href={s.href} target="_blank" rel="noopener noreferrer me" aria-label={s.label}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[s.id]}</svg>
            {!compact && <span>{s.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

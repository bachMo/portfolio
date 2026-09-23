import { CONFIG } from '../config';

/** Bouton qui n'apparaît que si l'URL correspondante est renseignée dans le .env. */
export default function OptionalLink({ kind, label }) {
  const url = CONFIG.links[kind];
  if (!url) return null;
  const external = /^https?:/.test(url);
  return (
    <a className="pill" href={url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
       dangerouslySetInnerHTML={{ __html: label }} />
  );
}

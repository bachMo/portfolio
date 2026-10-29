// Toutes les URL du site (FR et EN) viennent de src/seo/pages.json :
// une seule source pour le routeur, les liens, le SEO et le script de build.
import SEO_DATA from './seo/pages.json';

export const SITE_URL = SEO_DATA.site;
export const ROUTES = SEO_DATA.pages;
export const PAGE_IDS = Object.keys(ROUTES);

const norm = (p) => (p || '/').replace(/\/+$/, '') || '/';

/** Langue déduite de l'URL : /en/... = anglais, le reste = français. */
export const langFromPath = (pathname = window.location.pathname) => (/^\/en(\/|$)/.test(pathname) ? 'en' : 'fr');

/** Retrouve la page correspondant à un chemin (FR ou EN). */
export function resolvePath(pathname) {
  const p = norm(pathname);
  for (const id of PAGE_IDS) {
    for (const lang of ['fr', 'en']) {
      if (norm(ROUTES[id][lang].path) === p) return { page: id, lang };
    }
  }
  return null;
}

/** Chemin d'une page dans une langue, avec ancre éventuelle (#travaux…). */
export function pathFor(id, lang = 'fr', hash) {
  const r = ROUTES[id] || ROUTES.home;
  const base = (r[lang] || r.fr).path;
  return hash ? `${base}#${hash}` : base;
}

/** Convertit un lien interne (« /waluma », « /#travaux ») vers la bonne langue. */
export function localize(href, lang) {
  if (!href || !href.startsWith('/')) return href;
  const [path, hash] = href.split('#');
  const hit = resolvePath(path);
  return hit ? pathFor(hit.page, lang, hash) : href;
}

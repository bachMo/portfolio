
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../build');

// Métadonnées partagées avec l'application React (src/seo/pages.json) :
// une seule source de vérité pour les titres, descriptions et l'URL du site.
const SEO = require('../src/seo/pages.json');

// URL de référence du site (domaine principal, sans www).
// Pour un déploiement de test : SEO_SITE_URL=https://mon-test.vercel.app npm run build
const SITE_URL = (process.env.SEO_SITE_URL || SEO.site).replace(/\/+$/, '');
const pages = SEO.pages;

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setMeta(html, attribute, key, content) {
  const escaped = escapeHtml(content);
  const regex = new RegExp(
    `<meta\\s+[^>]*${attribute}="${key}"[^>]*>`,
    'i'
  );
  const tag = `<meta ${attribute}="${key}" content="${escaped}">`;

  if (regex.test(html)) {
    return html.replace(regex, tag);
  }

  return html.replace('</head>', `  ${tag}\n</head>`);
}

function setLink(html, rel, href, hreflang) {
  const selector = hreflang
    ? new RegExp(
        `<link\\s+[^>]*rel="alternate"[^>]*hreflang="${hreflang}"[^>]*>`,
        'i'
      )
    : /<link\s+[^>]*rel="canonical"[^>]*>/i;

  const tag = hreflang
    ? `<link rel="alternate" hreflang="${hreflang}" href="${href}">`
    : `<link rel="canonical" href="${href}">`;

  if (selector.test(html)) {
    return html.replace(selector, tag);
  }

  return html.replace('</head>', `  ${tag}\n</head>`);
}

function outputPath(route) {
  if (route === '/') return path.join(BUILD_DIR, 'index.html');

  const cleanRoute = route.replace(/^\/+|\/+$/g, '');
  return path.join(BUILD_DIR, cleanRoute, 'index.html');
}

function generatePage(route, metadata, template) {
  const output = outputPath(route);
  const directory = path.dirname(output);

  fs.mkdirSync(directory, { recursive: true });

  const canonical = `${SITE_URL}${route}`;
  const frenchRoute = route.startsWith('/en/')
    ? route.slice(3) || '/'
    : route === '/en/'
      ? '/'
      : route;
  const englishRoute =
    frenchRoute === '/' ? '/en/' : `/en${frenchRoute}`;

  let html = template;

  html = html.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${metadata.lang}"`);
  html = html.replace(/<html(?![^>]*\slang=)/i, `<html lang="${metadata.lang}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);

  html = setMeta(html, 'name', 'description', metadata.description);
  html = setMeta(html, 'property', 'og:title', metadata.title);
  html = setMeta(html, 'property', 'og:description', metadata.description);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'property', 'og:locale', metadata.lang === 'en' ? 'en_US' : 'fr_FR');
  html = setMeta(html, 'name', 'twitter:title', metadata.title);
  html = setMeta(html, 'name', 'twitter:description', metadata.description);

  html = setLink(html, 'canonical', canonical);
  html = setLink(html, 'alternate', `${SITE_URL}${frenchRoute}`, 'fr');
  html = setLink(html, 'alternate', `${SITE_URL}${englishRoute}`, 'en');
  html = setLink(html, 'alternate', `${SITE_URL}${frenchRoute}`, 'x-default');
  html = setMeta(html, 'property', 'og:image', `${SITE_URL}/og-image.jpg`);
  html = setMeta(html, 'name', 'twitter:image', `${SITE_URL}/og-image.jpg`);

  // Les pages sont dans des sous-dossiers : les fichiers statiques
  // doivent donc être référencés depuis la racine du site.
  html = html.replace(/(["'])\.\/static\//g, '$1/static/');
  html = html.replace(/(["'])\.\/favicon\.svg/g, '$1/favicon.svg');
  html = html.replace(/(["'])\.\/manifest\.json/g, '$1/manifest.json');
  html = html.replace(/(["'])\.\/apple-touch-icon\.png/g, '$1/apple-touch-icon.png');

  fs.writeFileSync(output, html, 'utf8');
  console.log(`SEO généré : ${route} -> ${path.relative(BUILD_DIR, output)}`);
}

// Sitemap avec les variantes FR/EN (hreflang) et la date de génération.
function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const pairs = Object.keys(pages).filter((route) => !route.startsWith('/en'));
  const urls = [];
  for (const fr of pairs) {
    const en = fr === '/' ? '/en/' : `/en${fr}`;
    const alternates = [
      `    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}${fr}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${en}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${fr}"/>`,
    ].join('\n');
    for (const route of [fr, en]) {
      urls.push(`  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), xml, 'utf8');
  fs.writeFileSync(path.join(BUILD_DIR, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');
  console.log(`Sitemap généré : ${urls.length} URL`);
}

function main() {
  const templatePath = path.join(BUILD_DIR, 'index.html');

  if (!fs.existsSync(templatePath)) {
    throw new Error('build/index.html introuvable. Lance d’abord npm run build.');
  }

  const template = fs.readFileSync(templatePath, 'utf8');

  for (const [route, metadata] of Object.entries(pages)) {
    generatePage(route, metadata, template);
  }

  generateSitemap();
  console.log(`\nTerminé : ${Object.keys(pages).length} pages HTML générées + sitemap.xml.`);
}

main();

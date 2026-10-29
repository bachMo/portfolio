const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../build');

// Métadonnées partagées avec l'application React (src/seo/pages.json) :
// une seule source de vérité pour les URL, titres et descriptions FR/EN.
const SEO = require('../src/seo/pages.json');
// Contenu des pages services (aussi utilisé par src/pages/ServicePage.js).
const SERVICES = require('../src/data/servicePages.json');

// URL de référence du site (domaine principal, sans www).
// Pour un déploiement de test : SEO_SITE_URL=https://mon-test.vercel.app npm run build
const SITE_URL = (process.env.SEO_SITE_URL || SEO.site).replace(/\/+$/, '');
const pages = SEO.pages;
const LANGS = ['fr', 'en'];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Retire les balises (<em>…) d'un texte destiné au HTML statique.
const plain = (html) => String(html).replace(/<[^>]+>/g, '');

function setMeta(html, attribute, key, content) {
  const escaped = escapeHtml(content);
  const regex = new RegExp(`<meta\\s+[^>]*${attribute}="${key}"[^>]*>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${escaped}">`;
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function setLink(html, href, hreflang) {
  const selector = hreflang
    ? new RegExp(`<link\\s+[^>]*rel="alternate"[^>]*hreflang="${hreflang}"[^>]*>`, 'i')
    : /<link\s+[^>]*rel="canonical"[^>]*>/i;
  const tag = hreflang
    ? `<link rel="alternate" hreflang="${hreflang}" href="${href}">`
    : `<link rel="canonical" href="${href}">`;
  if (selector.test(html)) return html.replace(selector, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function outputPath(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return clean ? path.join(BUILD_DIR, clean, 'index.html') : path.join(BUILD_DIR, 'index.html');
}

// Contenu lisible directement dans le HTML (avant le chargement de React) :
// les moteurs de recherche et les aperçus de liens voient le vrai texte de la page.
// React remplace ce bloc dès qu'il démarre ; le contenu est identique à la page affichée.
function staticContent(id, lang, meta) {
  const svc = SERVICES.services[id];
  if (!svc) {
    return `<main class="seo-static"><h1>${escapeHtml(meta.title.split(' | ')[0].split(' — ')[0])}</h1><p>${escapeHtml(meta.description)}</p></main>`;
  }
  const s = svc[lang];
  const ui = SERVICES.ui[lang];
  const steps = SERVICES.process[lang];
  const li = (arr) => arr.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  return [
    '<main class="seo-static">',
    `<h1>${escapeHtml(plain(s.h1))}</h1>`,
    `<p>${escapeHtml(s.lede)}</p>`,
    `<h2>${escapeHtml(ui.problems)}</h2><ul>${s.problems.map((p) => `<li><strong>${escapeHtml(p.t)}</strong> ${escapeHtml(p.d)}</li>`).join('')}</ul>`,
    `<h2>${escapeHtml(ui.get)}</h2><ul>${li(s.get)}</ul>`,
    `<h2>${escapeHtml(ui.process)}</h2><ol>${steps.map((p) => `<li><strong>${escapeHtml(p.t)}</strong> ${escapeHtml(p.d)}</li>`).join('')}</ol>`,
    `<h2>${escapeHtml(ui.uses)}</h2><ul>${s.uses.map((p) => `<li><strong>${escapeHtml(p.t)}</strong> ${escapeHtml(p.d)}</li>`).join('')}</ul>`,
    `<h2>${escapeHtml(ui.work)}</h2><ul>${s.work.map((w) => `<li><strong>${escapeHtml(w.name)}</strong> ${escapeHtml(w.desc)}</li>`).join('')}</ul>`,
    `<h2>${escapeHtml(ui.faq)}</h2>${s.faq.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('')}`,
    '</main>',
  ].join('');
}

// Données structurées Service + FAQ pour les pages services.
function serviceJsonLd(id, lang, meta) {
  const svc = SERVICES.services[id];
  if (!svc) return '';
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: meta.title.split(' | ')[0].split(' — ')[0],
      description: meta.description,
      url: `${SITE_URL}${meta.path}`,
      areaServed: [{ '@type': 'Country', name: 'Senegal' }, { '@type': 'Place', name: 'West Africa' }],
      provider: { '@id': `${SITE_URL}/#person` },
      inLanguage: lang,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: svc[lang].faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  return `<script type="application/ld+json" id="ld-service">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function generatePage(id, lang, template) {
  const meta = pages[id][lang];
  const output = outputPath(meta.path);
  fs.mkdirSync(path.dirname(output), { recursive: true });

  const canonical = `${SITE_URL}${meta.path}`;
  let html = template;

  html = html.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`);
  html = html.replace(/<html(?![^>]*\slang=)/i, `<html lang="${lang}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

  html = setMeta(html, 'name', 'description', meta.description);
  html = setMeta(html, 'property', 'og:title', meta.title);
  html = setMeta(html, 'property', 'og:description', meta.description);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'property', 'og:locale', lang === 'en' ? 'en_US' : 'fr_FR');
  html = setMeta(html, 'property', 'og:image', `${SITE_URL}/og-image.jpg`);
  html = setMeta(html, 'name', 'twitter:title', meta.title);
  html = setMeta(html, 'name', 'twitter:description', meta.description);
  html = setMeta(html, 'name', 'twitter:image', `${SITE_URL}/og-image.jpg`);

  html = setLink(html, canonical);
  html = setLink(html, `${SITE_URL}${pages[id].fr.path}`, 'fr');
  html = setLink(html, `${SITE_URL}${pages[id].en.path}`, 'en');
  html = setLink(html, `${SITE_URL}${pages[id].fr.path}`, 'x-default');

  const ld = serviceJsonLd(id, lang, meta);
  if (ld) html = html.replace('</head>', `  ${ld}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${staticContent(id, lang, meta)}</div>`);

  // Les pages sont dans des sous-dossiers : les fichiers statiques
  // doivent donc être référencés depuis la racine du site.
  html = html.replace(/(["'])\.\/static\//g, '$1/static/');
  html = html.replace(/(["'])\.\/favicon\.svg/g, '$1/favicon.svg');
  html = html.replace(/(["'])\.\/manifest\.json/g, '$1/manifest.json');
  html = html.replace(/(["'])\.\/apple-touch-icon\.png/g, '$1/apple-touch-icon.png');

  fs.writeFileSync(output, html, 'utf8');
  console.log(`SEO généré : ${meta.path} -> ${path.relative(BUILD_DIR, output)}`);
}

// Sitemap avec les variantes FR/EN (hreflang) et la date de génération.
function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];
  for (const id of Object.keys(pages)) {
    const alternates = [
      `    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}${pages[id].fr.path}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${pages[id].en.path}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${pages[id].fr.path}"/>`,
    ].join('\n');
    for (const lang of LANGS) {
      urls.push(`  <url>\n    <loc>${SITE_URL}${pages[id][lang].path}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`);
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
  let count = 0;
  for (const id of Object.keys(pages)) {
    for (const lang of LANGS) {
      generatePage(id, lang, template);
      count += 1;
    }
  }
  generateSitemap();
  console.log(`\nTerminé : ${count} pages HTML générées + sitemap.xml.`);
}

main();

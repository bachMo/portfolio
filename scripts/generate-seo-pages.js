const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../build');

// Métadonnées partagées avec l'application React (src/seo/pages.json) :
// une seule source de vérité pour les URL, titres et descriptions FR/EN.
const SEO = require('../src/seo/pages.json');
// Contenu des pages services (aussi utilisé par src/pages/ServicePage.js).
const SERVICES = require('../src/data/servicePages.json');

// Textes de l'interface (src/i18n/*.js sont des modules ES : on les lit comme du texte).
function loadI18n(lang) {
  const src = fs.readFileSync(path.resolve(__dirname, `../src/i18n/${lang}.js`), 'utf8')
    .replace(/export default \w+;?/, '')
    .replace(/^const \w+ =/m, 'return');
  return new Function(src)(); // eslint-disable-line no-new-func
}
const I18N = { fr: loadI18n('fr'), en: loadI18n('en') };

// Études de cas : préfixe des textes, vidéo et date de mise en ligne de la vidéo.
const CASES = {
  leeral: { k: 'le', name: 'Leeral' },
  sunuchat: { k: 'sc', name: 'SunuChat' },
  saaytu: { k: 'sm', name: 'Saaytu Mbay' },
  waluma: { k: 'wl', name: 'Waluma' },
};
const VIDEO_DATE = '2026-10-30';
const SERVICE_IDS = ['svc-site', 'svc-platform', 'svc-ai'];

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
  const t = I18N[lang];
  const tx = (key) => escapeHtml(plain(t[key] || ''));
  const link = (pid, label) => `<a href="${pages[pid][lang].path}">${escapeHtml(label)}</a>`;
  // Liens internes communs : services et études de cas (aident à la découverte des pages).
  const nav = [
    '<nav>',
    `<h2>${lang === 'en' ? 'Services' : 'Services'}</h2><ul>`,
    ...SERVICE_IDS.map((sid) => `<li>${link(sid, plain(SERVICES.services[sid][lang].h1))}</li>`),
    `</ul><h2>${lang === 'en' ? 'Case studies' : 'Études de cas'}</h2><ul>`,
    ...Object.keys(CASES).map((cid) => `<li>${link(cid, CASES[cid].name)}</li>`),
    `</ul><p>${link('contact', lang === 'en' ? 'Contact' : 'Contact')}</p>`,
    '</nav>',
  ].join('');

  if (svc) {
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
      s.pricing ? `<h2>${escapeHtml(ui.pricing)}</h2><ul>${s.pricing.map((o) => `<li><strong>${escapeHtml(o.name)} : ${escapeHtml(ui.from.toLowerCase())} ${escapeHtml(o.price)}${o.unit ? ` ${escapeHtml(o.unit)}` : ''}${o.monthly ? ` ${escapeHtml(o.monthly)}` : ''}</strong> ${escapeHtml(o.desc)}</li>`).join('')}</ul><p>${ui.terms.map(escapeHtml).join(' · ')}</p>` : '',
      `<h2>${escapeHtml(ui.faq)}</h2>${s.faq.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('')}`,
      nav,
      '</main>',
    ].join('');
  }

  if (CASES[id]) {
    const k = CASES[id].k;
    const items = [1, 2, 3, 4, 5, 6].filter((n) => t[`${k}.${n}.t`])
      .map((n) => `<li><strong>${tx(`${k}.${n}.t`)}</strong> ${tx(`${k}.${n}.d`)}</li>`).join('');
    const extra = ['bet', 'team', 'learn', 'safe'].filter((x) => t[`${k}.${x}.t`])
      .map((x) => `<h2>${tx(`${k}.${x}.t`)}</h2><p>${tx(`${k}.${x}.d`)}</p>`).join('');
    return [
      '<main class="seo-static">',
      `<p>${tx(`${k}.k`)}</p>`,
      `<h1>${escapeHtml(CASES[id].name)}</h1>`,
      `<p>${tx(`${k}.lede`)}</p>`,
      `<h2>${tx(`${k}.h`)}</h2><ul>${items}</ul>`,
      extra,
      nav,
      '</main>',
    ].join('');
  }

  if (id === 'home') {
    return [
      '<main class="seo-static">',
      `<h1>${tx('hero.title')}</h1>`,
      `<p>${tx('hero.sub')}</p>`,
      `<h2>${tx('solo.title')}</h2><p>${tx('solo.sub')}</p>`,
      `<h2>${tx('exp.title')}</h2><p>${tx('exp.sub')}</p>`,
      `<ul>${[1, 2, 3].map((n) => `<li><strong>${tx(`exp.${n}.t`)}</strong> ${tx(`exp.${n}.d`)}</li>`).join('')}</ul>`,
      nav,
      '</main>',
    ].join('');
  }

  if (id === 'contact') {
    return [
      '<main class="seo-static">',
      `<h1>${tx('cp.title')}</h1>`,
      `<p>${tx('cp.lede')}</p>`,
      `<p>Email : <a href="mailto:contact@bachirsy.com">contact@bachirsy.com</a></p>`,
      nav,
      '</main>',
    ].join('');
  }

  return `<main class="seo-static"><h1>${escapeHtml(meta.title.split(' | ')[0].split(' — ')[0])}</h1><p>${escapeHtml(meta.description)}</p></main>`;
}

// Fil d'Ariane (toutes les pages sauf l'accueil).
function breadcrumbLd(id, lang, meta) {
  if (id === 'home') return null;
  const home = pages.home[lang];
  const items = [{ name: lang === 'en' ? 'Home' : 'Accueil', url: `${SITE_URL}${home.path}` }];
  if (SERVICE_IDS.includes(id)) items.push({ name: 'Services', url: `${SITE_URL}${home.path}${home.path.endsWith('/') ? '' : '/'}#services` });
  if (CASES[id]) items.push({ name: lang === 'en' ? 'Case studies' : 'Études de cas', url: `${SITE_URL}${home.path}${home.path.endsWith('/') ? '' : '/'}#travaux` });
  const name = CASES[id] ? CASES[id].name : (SERVICES.services[id] ? plain(SERVICES.services[id][lang].h1) : meta.title.split(' — ')[0]);
  items.push({ name, url: `${SITE_URL}${meta.path}` });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

// Étude de cas : projet + vidéo de présentation.
function caseLd(id, lang, meta) {
  const c = CASES[id];
  if (!c) return [];
  const t = I18N[lang];
  const desc = plain(t[`${c.k}.lede`] || meta.description);
  const url = `${SITE_URL}${meta.path}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: c.name,
      headline: meta.title.replace(/ \| Bachir Sy$/, ''),
      description: desc,
      url,
      inLanguage: lang,
      image: `${SITE_URL}/og/${id}-${lang}.jpg`,
      creator: { '@id': `${SITE_URL}/#person` },
      keywords: plain(t[`${c.k}.k`] || '').split('·').map((w) => w.trim()).filter(Boolean).join(', '),
      video: { '@id': `${url}#video` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': `${url}#video`,
      name: `${c.name} — ${lang === 'en' ? 'case study in 8 seconds' : 'l’étude de cas en 8 secondes'}`,
      description: desc,
      thumbnailUrl: [`${SITE_URL}/reels/${id}.jpg`],
      contentUrl: `${SITE_URL}/reels/${id}.mp4`,
      uploadDate: VIDEO_DATE,
      duration: 'PT8S',
      inLanguage: lang,
    },
  ];
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
      offers: (svc[lang].pricing || []).map((o) => ({
        '@type': 'Offer',
        name: o.name,
        description: o.desc,
        url: `${SITE_URL}${meta.path}`,
        priceCurrency: lang === 'en' ? 'EUR' : 'XOF',
        priceSpecification: { '@type': 'PriceSpecification', minPrice: Number(String(o.price).replace(/[^0-9]/g, '')), priceCurrency: lang === 'en' ? 'EUR' : 'XOF' },
      })),
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
  // Image de partage propre à la page si elle existe (public/og/<page>-<langue>.jpg)
  const ogFile = path.join(BUILD_DIR, 'og', `${id}-${lang}.jpg`);
  const ogImage = fs.existsSync(ogFile) ? `${SITE_URL}/og/${id}-${lang}.jpg` : `${SITE_URL}/og-image.jpg`;
  html = setMeta(html, 'property', 'og:image', ogImage);
  html = setMeta(html, 'property', 'og:image:alt', meta.title);
  html = setMeta(html, 'property', 'og:locale:alternate', lang === 'en' ? 'fr_FR' : 'en_US');
  html = setMeta(html, 'name', 'twitter:title', meta.title);
  html = setMeta(html, 'name', 'twitter:description', meta.description);
  html = setMeta(html, 'name', 'twitter:image', ogImage);

  html = setLink(html, canonical);
  html = setLink(html, `${SITE_URL}${pages[id].fr.path}`, 'fr');
  html = setLink(html, `${SITE_URL}${pages[id].en.path}`, 'en');
  html = setLink(html, `${SITE_URL}${pages[id].fr.path}`, 'x-default');

  const ld = serviceJsonLd(id, lang, meta);
  if (ld) html = html.replace('</head>', `  ${ld}\n</head>`);
  // Fil d'Ariane + étude de cas / vidéo (retirés par l'appli si l'on change de page sans recharger)
  const pageLd = [breadcrumbLd(id, lang, meta), ...caseLd(id, lang, meta)].filter(Boolean);
  if (pageLd.length) html = html.replace('</head>', `  <script type="application/ld+json" id="ld-page">${JSON.stringify(pageLd).replace(/</g, '\\u003c')}</script>\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${staticContent(id, lang, meta)}</div>`);

  // Les pages sont dans des sous-dossiers : les fichiers statiques
  // doivent donc être référencés depuis la racine du site.
  html = html.replace(/(["'])\.\/static\//g, '$1/static/');
  html = html.replace(/(["'])\.\/(favicon[\w.-]*|icon-192\.png)/g, '$1/$2');
  html = html.replace(/(["'])\.\/manifest\.json/g, '$1/manifest.json');
  html = html.replace(/(["'])\.\/apple-touch-icon\.png/g, '$1/apple-touch-icon.png');

  fs.writeFileSync(output, html, 'utf8');
  console.log(`SEO généré : ${meta.path} -> ${path.relative(BUILD_DIR, output)}`);
}

// Sitemap avec les variantes FR/EN (hreflang), l'image de partage et la vidéo des études de cas.
function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const x = (v) => escapeHtml(v);
  const urls = [];
  for (const id of Object.keys(pages)) {
    const alternates = [
      `    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}${pages[id].fr.path}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${pages[id].en.path}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${pages[id].fr.path}"/>`,
    ].join('\n');
    for (const lang of LANGS) {
      const meta = pages[id][lang];
      const og = fs.existsSync(path.join(BUILD_DIR, 'og', `${id}-${lang}.jpg`)) ? `${SITE_URL}/og/${id}-${lang}.jpg` : `${SITE_URL}/og-image.jpg`;
      const extra = [`    <image:image><image:loc>${og}</image:loc></image:image>`];
      if (CASES[id]) {
        const t = I18N[lang];
        extra.push([
          '    <video:video>',
          `      <video:thumbnail_loc>${SITE_URL}/reels/${id}.jpg</video:thumbnail_loc>`,
          `      <video:title>${x(`${CASES[id].name} — ${lang === 'en' ? 'case study in 8 seconds' : 'l’étude de cas en 8 secondes'}`)}</video:title>`,
          `      <video:description>${x(plain(t[`${CASES[id].k}.lede`] || meta.description))}</video:description>`,
          `      <video:content_loc>${SITE_URL}/reels/${id}.mp4</video:content_loc>`,
          '      <video:duration>8</video:duration>',
          `      <video:publication_date>${VIDEO_DATE}</video:publication_date>`,
          '    </video:video>',
        ].join('\n'));
      }
      urls.push(`  <url>\n    <loc>${SITE_URL}${meta.path}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n${extra.join('\n')}\n  </url>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), xml, 'utf8');
  fs.writeFileSync(path.join(BUILD_DIR, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');
  console.log(`Sitemap généré : ${urls.length} URL`);
}

// Page 404 autonome (sans React, pour ne pas afficher l'accueil sur une adresse inconnue).
function generate404() {
  const card = (lang) => {
    const L = (id) => pages[id][lang].path;
    const isEn = lang === 'en';
    return `<section lang="${lang}"><p class="k">${isEn ? 'ERROR 404' : 'ERREUR 404'}</p><h1>${isEn ? 'This page <em>does not exist.</em>' : 'Cette page <em>n’existe pas.</em>'}</h1><p>${isEn ? 'The link may be old or mistyped. Here is where to go instead:' : 'Le lien est peut-être ancien ou mal saisi. Voici où aller :'}</p><nav><a class="solid" href="${L('home')}">${isEn ? 'Home' : 'Accueil'}</a>${SERVICE_IDS.map((sid) => `<a href="${L(sid)}">${escapeHtml(plain(SERVICES.services[sid][lang].h1))}</a>`).join('')}<a href="${L('contact')}">Contact</a></nav></section>`;
  };
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page introuvable · Page not found — Bachir Sy</title><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Bricolage+Grotesque:opsz,wght@12..96,300..700&family=JetBrains+Mono&display=swap" rel="stylesheet"><style>
:root{--bg:#F7F0E5;--ink:#1A1612;--muted:#6B5F50;--line:#DDD1BE;--acc:#C4552B}
@media (prefers-color-scheme:dark){:root{--bg:#15120F;--ink:#F2EBDF;--muted:#A89C8B;--line:#2E2822;--acc:#E0703F}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Bricolage Grotesque',system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:48px clamp(20px,6vw,96px);gap:56px;background-image:radial-gradient(color-mix(in srgb,var(--ink) 10%,transparent) 1px,transparent 1.3px);background-size:24px 24px}
.top{font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.1em;color:var(--muted)}.top a{color:inherit}
section{max-width:900px}.k{font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.12em;color:var(--acc);margin:0 0 12px}
h1{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:clamp(48px,8vw,104px);line-height:.95;letter-spacing:-.03em;margin:0 0 18px}h1 em{color:var(--acc)}
p{font-size:18px;line-height:1.55;color:var(--muted);margin:0 0 22px}nav{display:flex;flex-wrap:wrap;gap:10px}
nav a{padding:12px 18px;border-radius:999px;border:1px solid var(--line);color:var(--ink);text-decoration:none;font-size:15px}nav a:hover{border-color:var(--acc);color:var(--acc)}
nav a.solid{background:var(--acc);border-color:var(--acc);color:#fff}hr{border:0;border-top:1px solid var(--line);margin:0;max-width:900px}
</style></head><body><div class="top"><a href="/">Bachir Sy</a> · bachirsy.com</div>${card('fr')}<hr>${card('en')}</body></html>`;
  fs.writeFileSync(path.join(BUILD_DIR, '404.html'), html, 'utf8');
  console.log('Page 404 générée');
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
  generate404();
  console.log(`\nTerminé : ${count} pages HTML générées + sitemap.xml.`);
}

main();

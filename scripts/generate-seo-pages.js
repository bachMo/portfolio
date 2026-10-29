
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '../build');

// URL de référence du site.
// Pour un déploiement de test, remplace cette valeur par l'URL du projet de test.
const SITE_URL = (process.env.SEO_SITE_URL || 'https://www.bachirsy.com')
  .replace(/\/+$/, '');

const pages = {
  '/': {
    lang: 'fr',
    title: 'Bachir Sy | Développeur freelance Full-Stack & IA à Dakar',
    description:
      'Mamadou Bachir Sy, développeur freelance Full-Stack et IA à Dakar, Sénégal. Applications web et mobiles, chatbots IA, assistants multilingues et automatisation.',
  },
  '/en/': {
    lang: 'en',
    title: 'Bachir Sy | Freelance Full-Stack Developer & AI in Dakar',
    description:
      'Mamadou Bachir Sy is a freelance full-stack developer and AI specialist in Dakar, Senegal. Web and mobile apps, AI chatbots, multilingual assistants and automation.',
  },
  '/leeral': {
    lang: 'fr',
    title: 'Leeral | Assistant IA multilingue en français, wolof et pulaar — Bachir Sy',
    description:
      'Découvrez Leeral, un assistant intelligent qui aide à comprendre les documents du quotidien grâce à l’IA, au texte et à la voix, en français, wolof et pulaar.',
  },
  '/en/leeral': {
    lang: 'en',
    title: 'Leeral | Multilingual AI assistant — Bachir Sy',
    description:
      'Discover Leeral, an intelligent assistant that makes everyday documents easier to understand using AI, text and voice in French, Wolof and Pulaar.',
  },
  '/sunuchat': {
    lang: 'fr',
    title: 'SunuChat | Assistant conversationnel de santé par IA — Bachir Sy',
    description:
      'Étude de cas SunuChat : assistant conversationnel de santé combinant IA générative, recherche documentaire et expérience multilingue texte et voix.',
  },
  '/en/sunuchat': {
    lang: 'en',
    title: 'SunuChat | AI-powered health conversational assistant — Bachir Sy',
    description:
      'SunuChat case study: a health conversational assistant combining generative AI, knowledge retrieval and a multilingual text and voice experience.',
  },
  '/saaytu': {
    lang: 'fr',
    title: 'Saaytu Mbay | Assistant IA pour l’agriculture — Bachir Sy',
    description:
      'Découvrez Saaytu Mbay, un assistant numérique agricole qui aide les producteurs à accéder à des informations pratiques grâce à l’intelligence artificielle.',
  },
  '/en/saaytu': {
    lang: 'en',
    title: 'Saaytu Mbay | AI assistant for agriculture — Bachir Sy',
    description:
      'Discover Saaytu Mbay, a digital agriculture assistant that helps farmers access practical information using artificial intelligence.',
  },
  '/waluma': {
    lang: 'fr',
    title: 'Waluma | Plateforme numérique de mise en relation santé — Bachir Sy',
    description:
      'Étude de cas Waluma : plateforme web et mobile pour faciliter la gestion des praticiens, des missions et des services de santé.',
  },
  '/en/waluma': {
    lang: 'en',
    title: 'Waluma | Digital healthcare platform — Bachir Sy',
    description:
      'Waluma case study: a web and mobile platform that simplifies the management of healthcare professionals, assignments and services.',
  },
  '/contact': {
    lang: 'fr',
    title: 'Contacter Bachir Sy | Développeur freelance Full-Stack & IA à Dakar',
    description:
      'Vous avez un projet web, mobile ou IA ? Contactez Bachir Sy, développeur freelance Full-Stack et IA basé à Dakar, Sénégal.',
  },
  '/en/contact': {
    lang: 'en',
    title: 'Contact Bachir Sy | Freelance Full-Stack Developer & AI in Dakar',
    description:
      'Have a web, mobile or AI project? Contact Bachir Sy, a freelance full-stack developer and AI specialist based in Dakar, Senegal.',
  },
};

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

  // Les pages sont dans des sous-dossiers : les fichiers statiques
  // doivent donc être référencés depuis la racine du site.
  html = html.replace(/(["'])\.\/static\//g, '$1/static/');
  html = html.replace(/(["'])\.\/favicon\.svg/g, '$1/favicon.svg');
  html = html.replace(/(["'])\.\/manifest\.json/g, '$1/manifest.json');
  html = html.replace(/(["'])\.\/apple-touch-icon\.png/g, '$1/apple-touch-icon.png');

  fs.writeFileSync(output, html, 'utf8');
  console.log(`SEO généré : ${route} -> ${path.relative(BUILD_DIR, output)}`);
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

  console.log(`\nTerminé : ${Object.keys(pages).length} pages HTML générées.`);
}

main();

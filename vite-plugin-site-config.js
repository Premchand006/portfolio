/* ───────────────────────────────────────────────────────────────
   vite-plugin-site-config

   Reads src/config/site.config.json at build/dev time and injects,
   into index.html:
     • all identity / SEO / OpenGraph / Twitter meta tags
     • both JSON-LD blocks (Person + WebSite)
     • a <style id="cfg-theme"> :root { … } block carrying the theme
       colours + typography tokens, so the palette/fonts are correct
       before first paint (no flash; index.css values are the fallback)
     • an optional web-font <link> when theme.typography.webFontUrl set

   index.html keeps a single <!--SITE_CONFIG_HEAD--> marker + a couple
   of %CFG_*% tokens; everything else here is generated. Editing the
   JSON re-skins the site and updates SEO with no manual HTML edits.
   ─────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, 'src/config/site.config.json');

/* Explicit camelCase key → CSS variable name map. Explicit (not derived)
   so numeric suffixes like surface-2 / border-shine-1 stay correct. */
const COLOR_VAR_MAP = {
    bgGlobe: '--bg-globe',
    bgPrimary: '--bg-primary',
    bgSecondary: '--bg-secondary',
    bgTertiary: '--bg-tertiary',
    bgGlass: '--bg-glass',
    surface: '--surface',
    surface2: '--surface-2',
    textPrimary: '--text-primary',
    textSecondary: '--text-secondary',
    textMuted: '--text-muted',
    accentGold: '--accent-gold',
    accentGoldSoft: '--accent-gold-soft',
    accentGoldDim: '--accent-gold-dim',
    accentGoldBright: '--accent-gold-bright',
    goldGlow: '--gold-glow',
    accentDeep: '--accent-deep',
    accentDrama: '--accent-drama',
    accentRed: '--accent-red',
    burgundyGlow: '--burgundy-glow',
    borderColor: '--border-color',
    borderSubtle: '--border-subtle',
    borderHover: '--border-hover',
    borderShine1: '--border-shine-1',
    borderShine2: '--border-shine-2',
    borderShine3: '--border-shine-3',
    navDotActive: '--nav-dot-active',
    navDotInactive: '--nav-dot-inactive',
    starColor: '--star-color',
    meteorColor: '--meteor-color',
    spinnerBg: '--spinner-bg',
    spinnerFill: '--spinner-fill',
    arceusAccent: '--arceus-accent',
    arceusHighlight: '--arceus-highlight',
    muteIcon: '--mute-icon',
    heroCanvasBg: '--hero-canvas-bg',
};

const esc = (s) =>
    String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

function readConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function buildHead(cfg) {
    const { meta = {}, theme = {}, assets = {} } = cfg;
    const og = meta.og || {};
    const tw = meta.twitter || {};
    const person = meta.person || {};
    const logo = assets.logo || '/logo.png';
    const ogImage = og.image || assets.ogImage || logo;
    const L = [];

    /* Identity / SEO */
    L.push(`<title>${esc(meta.title)}</title>`);
    L.push(`<meta name="description" content="${esc(meta.description)}" />`);
    L.push(`<meta name="author" content="${esc(meta.author)}" />`);
    L.push(`<meta name="keywords" content="${esc((meta.keywords || []).join(', '))}" />`);
    L.push(`<meta name="theme-color" content="${esc(meta.themeColorDark)}" media="(prefers-color-scheme: dark)" />`);
    L.push(`<meta name="theme-color" content="${esc(meta.themeColorLight)}" media="(prefers-color-scheme: light)" />`);
    L.push(`<meta name="color-scheme" content="dark light" />`);
    L.push(`<meta name="robots" content="${esc(meta.robots)}" />`);
    L.push(`<link rel="canonical" href="${esc(meta.canonical)}" />`);

    /* Favicons / app icons */
    L.push(`<link rel="icon" type="image/png" sizes="any" href="${esc(logo)}" />`);
    L.push(`<link rel="icon" type="image/png" sizes="32x32" href="${esc(logo)}" />`);
    L.push(`<link rel="icon" type="image/png" sizes="192x192" href="${esc(logo)}" />`);
    L.push(`<link rel="apple-touch-icon" href="${esc(logo)}" />`);
    L.push(`<link rel="shortcut icon" href="${esc(logo)}" />`);

    /* Open Graph */
    L.push(`<meta property="og:type" content="${esc(og.type || 'profile')}" />`);
    L.push(`<meta property="og:site_name" content="${esc(og.siteName)}" />`);
    L.push(`<meta property="og:title" content="${esc(og.title)}" />`);
    L.push(`<meta property="og:description" content="${esc(og.description)}" />`);
    L.push(`<meta property="og:url" content="${esc(meta.canonical)}" />`);
    L.push(`<meta property="og:image" content="${esc(ogImage)}" />`);
    L.push(`<meta property="og:image:type" content="${esc(og.imageType || 'image/png')}" />`);
    L.push(`<meta property="og:image:width" content="${esc(og.imageWidth)}" />`);
    L.push(`<meta property="og:image:height" content="${esc(og.imageHeight)}" />`);
    L.push(`<meta property="og:image:alt" content="${esc(og.imageAlt)}" />`);
    L.push(`<meta property="og:locale" content="${esc(og.locale)}" />`);
    L.push(`<meta property="profile:first_name" content="${esc(og.firstName)}" />`);
    L.push(`<meta property="profile:last_name" content="${esc(og.lastName)}" />`);

    /* Twitter / X */
    L.push(`<meta name="twitter:card" content="${esc(tw.card)}" />`);
    L.push(`<meta name="twitter:title" content="${esc(tw.title)}" />`);
    L.push(`<meta name="twitter:description" content="${esc(tw.description)}" />`);
    L.push(`<meta name="twitter:image" content="${esc(tw.image || ogImage)}" />`);
    L.push(`<meta name="twitter:image:alt" content="${esc(tw.imageAlt)}" />`);

    /* JSON-LD: Person + WebSite */
    const personLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: meta.author,
        alternateName: person.alternateName,
        givenName: person.givenName,
        familyName: person.familyName,
        url: meta.canonical,
        image: ogImage,
        jobTitle: person.jobTitle,
        description: person.description,
        alumniOf: (person.alumniOf || []).map((a) => ({
            '@type': 'CollegeOrUniversity',
            name: a.name,
            department: a.department,
        })),
        knowsAbout: person.knowsAbout,
        sameAs: person.sameAs,
    };
    const websiteLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: og.siteName,
        url: meta.canonical,
        publisher: { '@type': 'Person', name: meta.author },
    };
    L.push(`<script type="application/ld+json">\n${JSON.stringify(personLd, null, 2)}\n</script>`);
    L.push(`<script type="application/ld+json">\n${JSON.stringify(websiteLd, null, 2)}\n</script>`);

    /* Theme + typography tokens (pre-paint, fallback = index.css) */
    const colors = theme.colors || {};
    const typo = theme.typography || {};
    const decls = [];
    for (const [k, v] of Object.entries(colors)) {
        if (COLOR_VAR_MAP[k]) decls.push(`${COLOR_VAR_MAP[k]}:${v};`);
    }
    if (typo.display) decls.push(`--font-display:${typo.display};`);
    if (typo.body) decls.push(`--font-body:${typo.body};`);
    if (typo.mono) decls.push(`--font-mono:${typo.mono};`);
    L.push(`<style id="cfg-theme">:root{${decls.join('')}}</style>`);
    if (typo.webFontUrl) L.push(`<link rel="stylesheet" href="${esc(typo.webFontUrl)}" />`);

    return L.map((line) => '  ' + line).join('\n');
}

export default function siteConfigPlugin() {
    return {
        name: 'vite-plugin-site-config',
        transformIndexHtml: {
            order: 'pre',
            handler(html) {
                const cfg = readConfig();
                let out = html.replace('<!--SITE_CONFIG_HEAD-->', buildHead(cfg));

                const gh = (cfg.socials || []).find((s) => s.platform === 'GitHub');
                const fallbackUrl = gh ? gh.link : cfg.meta?.canonical || '#';
                out = out
                    .replace(/%CFG_NOSCRIPT_URL%/g, esc(fallbackUrl))
                    .replace(/%CFG_NOSCRIPT_LABEL%/g, esc(fallbackUrl.replace(/^https?:\/\//, '')));
                return out;
            },
        },
        /* Dev: reload the page when the config file changes so injected
           SEO/theme stay in sync (component content already HMRs). */
        configureServer(server) {
            server.watcher.add(CONFIG_PATH);
            server.watcher.on('change', (file) => {
                if (path.resolve(file) === CONFIG_PATH) {
                    server.ws.send({ type: 'full-reload' });
                }
            });
        },
    };
}

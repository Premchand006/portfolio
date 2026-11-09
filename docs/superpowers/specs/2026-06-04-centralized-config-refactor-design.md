# Centralized JSON Config Refactor — Design

**Date:** 2026-06-04
**Status:** Approved (pending spec review)
**Author:** Prem + Claude

## Goal

Make the portfolio fully data-driven from a **single JSON file**. Editing
`src/config/site.config.json` should change all copy, links, assets, navigation,
theme colors, typography, and SEO metadata — with **no code edits**.

Today content is partially centralized (`data.json`, `personal.js`, `images.js`)
but ~150 user-facing strings are still hardcoded across ~20 components, with
several duplication bugs. This refactor consolidates everything into one source
of truth, refactors the UI to render from it, and fixes the inconsistencies
found during the audit.

## Locked Decisions

| Decision | Choice |
| --- | --- |
| Scope | Content + links + assets **+ theme + typography + SEO meta** |
| File layout | **One** `site.config.json`; absorb `data.json` + `personal.js` + `images.js` |
| Old config files | **Delete** them; repoint all importers to `src/config` |
| API secrets | Stay in `src/config/api.js` via Vite env vars — **never** in JSON |
| Access pattern | **Accessor module** (`src/config/index.js`) — components never import raw JSON |
| SEO injection | **Build-time Vite plugin** (`transformIndexHtml`) |
| Theme/typography application | Same Vite plugin injects a `:root` `<style>` block (no FOUC); `index.css` keeps current values as fallback |
| Bug fixes | Folded into this refactor |
| Canonical email | `korukonda.lkmpremchand@gmail.com` (used for display **and** contact-form delivery) |

## Architecture

```
src/config/
  site.config.json     ← single source of truth (data only)
  index.js             ← accessor: imports JSON, exports named slices + helpers
  api.js               ← unchanged (env-based secrets)
vite-plugin-site-config.js   ← reads JSON at build/dev, rewrites index.html
                               (SEO tags + :root theme/typography style block)
vite.config.js         ← registers the plugin
index.html             ← keeps placeholders the plugin fills
src/index.css          ← CSS-variable fallbacks unchanged
```

**Data flow at build/dev:** Vite plugin reads `site.config.json` → injects SEO
meta + `:root` theme vars + optional web-font `<link>` into `index.html` before
paint. **Data flow at runtime:** components import named slices from
`src/config/index.js`, which reads `site.config.json`. No component imports the
raw JSON; no component hardcodes editable content.

### Access layer (`src/config/index.js`)

- Imports `site.config.json` once.
- Exports organized slices: `meta`, `identity`, `theme`, `assets`, `navigation`,
  `sections`, `techStack`, `projects`, `skills`, `experience`, `education`,
  `certificates`, `publications`, `awards`, `socials`, `journey`, `cta`,
  `availability`, `resume`, `footer`, `loading`, `arceus`.
- Helpers: `getSocial(platform)`, `interpolate(str, vars)` (replaces tokens like
  `{year}`), and small fallback wrappers so a missing optional key never throws.
- Re-export shims for the deleted files are **not** kept — importers are updated
  directly.

## JSON Schema (`site.config.json`)

Top-level keys (locked). Representative shapes:

```jsonc
{
  "meta": {
    "title": "Prem Chand · Embedded AI · Deep Learning · WebGL Engineer",
    "description": "…",
    "author": "Korukonda L K M Prem Chand",
    "keywords": ["Prem Chand", "Embedded AI", "STM32", "…"],
    "canonical": "https://premchand.dev/",
    "themeColorDark": "#050505",
    "themeColorLight": "#F5F1E8",
    "og": { "siteName": "…", "title": "…", "description": "…", "image": "https://premchand.dev/logo.png",
            "imageWidth": "460", "imageHeight": "460", "imageAlt": "…", "locale": "en_US" },
    "twitter": { "card": "summary_large_image", "title": "…", "description": "…", "image": "…", "imageAlt": "…" },
    "person": { "jobTitle": "…", "knowsAbout": ["…"], "alumniOf": [ … ], "sameAs": ["…"] }
  },

  "identity": {
    "name": "Korukonda L K M Prem Chand",
    "shortName": "Prem Chand",
    "initials": "PC",
    "tagline": "Welcome to my world",
    "jobTitle": "Embedded AI · Deep Learning · WebGL Engineer",
    "availabilityText": "Open to connect",
    "email": "korukonda.lkmpremchand@gmail.com",
    "phone": "",
    "location": "",
    "welcomeLanguages": [ { "code": "TELUGU", "text": "…" }, … ]
  },

  "resume": { "url": "/assets/resume/prem-chand-cv.pdf", "filename": "Prem-Chand-Korukonda-CV.pdf", "label": "Download résumé · PDF" },

  "theme": {
    "colors": {
      "bgGlobe": "#000000", "bgPrimary": "#000000", "bgSecondary": "#252628", "bgTertiary": "#1a1a1c",
      "textPrimary": "#FFFFFF", "textSecondary": "rgba(255,255,255,0.62)", "textMuted": "rgba(255,255,255,0.40)",
      "accentGold": "#d29f22", "accentGoldSoft": "#e0b23f", "accentDeep": "#5d0018",
      "borderShine1": "#d29f22", "borderShine2": "#e0b23f", "borderShine3": "#5d0018"
      /* …full set mirrors the --* vars in index.css; key→var mapping in the plugin */
    },
    "typography": {
      "display": "'Times New Roman', Times, serif",
      "body": "'Times New Roman', Times, serif",
      "mono": "'Times New Roman', Times, serif",
      "webFontUrl": ""   /* empty = system fonts (today); a Google Fonts URL loads web fonts */
    }
  },

  "assets": {
    "logo": "/logo.png", "loadingLogo": "/logo.png", "workDesk": "/assets/images/work-desk.png",
    "ogImage": "https://premchand.dev/logo.png", "earthMap": "/earth/8081_earthmap10k.jpg",
    "earthLights": "/earth/8081_earthlights10k.jpg"
  },

  "navigation": [
    { "id": "home",           "label": "Home",           "shortLabel": "Home",    "icon": "FiHome",     "inOmnibar": true, "inProgress": true },
    { "id": "about",          "label": "About",          "shortLabel": "About",   "icon": "FiUser",     "inOmnibar": true, "inProgress": true },
    { "id": "experience",     "label": "Experience",     "shortLabel": "Exp",     "icon": "FiBriefcase","inOmnibar": true, "inProgress": true },
    { "id": "projects",       "label": "Projects",       "shortLabel": "Projects","icon": "FiFolder",   "inOmnibar": true, "inProgress": true },
    { "id": "tech-stack",     "label": "Tech Stack",     "shortLabel": "Tech",    "icon": "FiCode",     "inOmnibar": true, "inProgress": true },
    { "id": "research",       "label": "Research",       "shortLabel": "Research","icon": "FiBookOpen", "inOmnibar": true, "inProgress": true },
    { "id": "certifications", "label": "Certifications", "shortLabel": "Certs",   "icon": "FiAward",    "inOmnibar": true, "inProgress": true },
    { "id": "education",      "label": "Education",      "shortLabel": "Edu",     "icon": "FiBookOpen", "inOmnibar": true, "inProgress": true },
    { "id": "journey",        "label": "Journey",        "shortLabel": "Journey", "icon": "FiCompass",  "inOmnibar": true, "inProgress": true },
    { "id": "contact",        "label": "Connect",        "shortLabel": "Connect", "icon": "FiMail",     "inOmnibar": true, "inProgress": true }
  ],

  "sections": {
    "home":     { "eyebrow": "Korukonda L K M Prem Chand", "placeholder": "Type a command or search…", "kbdHint": "Ctrl K" },
    "about":    { "label": "ABOUT", "heading": "About", "bio": "I am an Electrical and Computer Engineering…",
                  "interestsTitle": "Interests & Hobbies",
                  "interests": ["Physical AI","Embedded Systems","Cricket","Badminton","Swimming","Chess","Art","Western Dance"] },
    "experience":{ "label": "Career", "heading": "Work", "headingAccent": "Experience" },
    "projects": { "label": "Work", "heading": "Projects", "subtitle": "Selected works and experiments",
                  "systemSuffix": "_SYSTEM", "defaultKind": "Project" },
    "tech-stack":{ "label": "Skills", "heading": "Techstack", "subtitle": "Technologies and tools I work with" },
    "research": { "label": "Research", "heading": "Research", "headingAccent": "arsenal",
                  "spreadLabel": "Spread the deck", "restackLabel": "Re-stack the deck",
                  "descriptionTemplate": "{count} {papersWord} indexed across IEEE and SSRN. Click the button to fan out the deck — click any card to read." },
    "certifications": { "editorFilename": "certifications.c", "editorAuthor": "Prem" /* code body rendered from `certificates` */ },
    "education":{ "label": "Academic Journey", "heading": "My", "headingAccent": "Education" },
    "journey":  { "label": "Milestones", "heading": "My", "headingAccent": "Journey",
                  "description": "Key events and milestones from my professional and academic path. Slides auto-advance — hover to pause, click the arrows or dots to navigate.",
                  "linkLabel": "View on LinkedIn", "autoplayMs": 5000 },
    "contact":  { "label": "Get in touch", "heading": "Let's start a", "headingAccent": "conversation",
                  "description": "…",
                  "inquiryTypes": [ { "id": "general", "label": "Just saying hi" }, … ],
                  "maxFiles": 3, "maxTotalBytes": 10485760,
                  "form": { "nameLabel": "Name", "namePlaceholder": "Your name", "emailLabel": "Email",
                            "emailPlaceholder": "you@domain.com", "messageLabel": "Message", "messagePlaceholder": "…",
                            "linkLabel": "Link", "linkOptional": "(optional)", "linkPlaceholder": "https:// — …",
                            "attachmentsPlaceholder": "Add brief, deck, image…",
                            "submitIdle": "Send message", "submitSending": "Sending…", "submitSent": "Sent ✓" },
                  "messages": { /* success / error strings keyed by code */ } }
  },

  "techStack": {
    "row1": [ { "name": "Python", "slug": "python", "color": "#3776AB", "url": "https://…" }, … ],
    "row2": [ { "name": "TensorFlow", "slug": "tensorflow", "color": "#FF6F00", "url": "https://…" }, … ]
  },

  "projects":     [ /* migrated from data.json (id,title,kind,description,image,alt,tags,category,link) */ ],
  "skills":       [ /* migrated */ ],
  "experience":   [ /* migrated */ ],
  "education":    [ /* migrated */ ],
  "certificates": [ /* migrated — also feeds the VSCode editor body */ ],
  "publications": [ /* migrated */ ],
  "awards":       [ /* migrated */ ],
  "socials":      [ /* migrated — now the single source for Footer + Contact too */ ],
  "journey":      [ /* migrated */ ],

  "cta":          { "primary": { "label": "Hire me", "href": "#contact" }, "secondary": { "label": "View work", "href": "#projects" } },
  "availability": { "status": "open-research", "label": "Open to research roles", "tone": "live" },

  "footer":  { "copyrightTemplate": "© {year} L K M Prem Chand Korukonda · Built with intention, designed for clarity.", "logoAlt": "Prem Chand · Logo" },
  "loading": { "headline": "My world is loading" },
  "arceus":  { "greeting": "Hi — I am Arceus. Ask me about Prem, or jump straight to a section.",
               "placeholderReply": "I'm Arceus. My full intelligence is being calibrated. Ask me anything soon." }
}
```

Notes:
- `arceus.sectionHints` is **derived from `navigation`** (id→label), not duplicated.
- The VSCode editor's C source is **generated from `certificates`** + `sections.certifications` strings, removing the hardcoded duplicate.
- `theme.colors` keys map to existing `--*` CSS variables via a fixed key→var table inside the Vite plugin.
- React icon names (`FiHome`, …) are stored as **strings**; Omnibar keeps a small `{ FiHome, … }` lookup map (JSX can't live in JSON).
- Animation-timing constants that are **not** user-facing content (e.g. typewriter ms, loader spin ms) stay in their components — out of scope. `journey.autoplayMs` is included because it's a reasonable editorial knob.

## Vite Plugin (`vite-plugin-site-config.js`)

`transformIndexHtml(html)`:
1. Read `src/config/site.config.json`.
2. Replace SEO tags from `meta`: `<title>`, description, keywords, author, canonical, theme-color, all `og:*`, all `twitter:*`, and regenerate both JSON-LD `<script>` blocks (Person + WebSite) from `meta`/`identity`.
3. Inject a `<style id="cfg-theme">:root{ … }</style>` built from `theme.colors` (key→var map) and `theme.typography` (`--font-display/body/mono`).
4. If `theme.typography.webFontUrl` is non-empty, inject the `<link rel="stylesheet">`.

Runs in both `serve` and `build`. `index.html` keeps marker comments / placeholder
tags the plugin targets. `index.css` values remain as the fallback if the plugin
is ever disabled.

## Component Refactor Map

| File | Change |
| --- | --- |
| `App.jsx` | `SECTION_IDS` derived from `navigation` |
| `sections/HomeSection.jsx` | eyebrow, placeholder, kbd hint ← `sections.home` |
| `sections/AboutSection.jsx` | heading, bio, interests title + list ← `sections.about` |
| `sections/ExperienceSection.jsx` | labels ← `sections.experience`; data ← `experience`; image ← `assets.workDesk` |
| `sections/ProjectsSection.jsx` | labels/suffix/defaultKind ← `sections.projects`; data ← `projects` |
| `sections/TechstackSection.jsx` | labels ← `sections.tech-stack` |
| `sections/ResearchSection.jsx` | labels/template/buttons ← `sections.research` (**typo fixed**); data ← `publications` |
| `sections/CodeSection.jsx` | id stays `certifications` |
| `sections/EducationSection.jsx` | labels ← `sections.education`; data ← `education` |
| `sections/JourneySection.jsx` | labels/description/linkLabel/autoplay ← `sections.journey`; data ← `journey` |
| `sections/ContactSection.jsx` | all labels/placeholders/inquiry types/messages/limits ← `sections.contact`; socials ← `socials`; **email unified**; resume ← `resume` |
| `components/InfiniteMarquee.jsx` | both rows ← `techStack` |
| `components/Omnibar.jsx` | nav + icon map ← `navigation`; search ← content slices |
| `components/SectionProgress.jsx` | items ← `navigation` (shortLabel) |
| `components/SectionNavigator.jsx` | first/last ← `navigation`; labels ← config |
| `components/Footer.jsx` | copyright ← `footer` (with `{year}`); **GitHub/LinkedIn ← `socials`** |
| `components/LoadingScreen.jsx` | headline ← `loading`; initials ← `identity.initials`; logo ← `assets.loadingLogo` |
| `components/Arceus.jsx` | greeting/placeholderReply ← `arceus`; hints ← `navigation` |
| `components/VSCodeEditor.jsx` | C body generated from `certificates` + `sections.certifications` |
| `components/LiveStatus.jsx` | ← `identity.availabilityText` (already centralized; repoint import) |
| `components/ResumeButton.jsx` | ← `resume` (repoint import) |
| `components/MultilingualHeadline.jsx` | ← `identity.welcomeLanguages` (repoint import) |
| `components/StickyCTA.jsx` | ← `cta` (repoint import) |
| `components/CertificateRollout.jsx` | ← `certificates`/`awards` (repoint import) |

## Bug Fixes (folded in)

1. **Email mismatch** → unify to `korukonda.lkmpremchand@gmail.com` for both display and contact-form delivery.
2. **Footer hardcoded links** → read from `socials`.
3. **Nav defined 3×** → single `navigation` array.
4. **Cert data duplicated** in VSCodeEditor → generated from `certificates`.
5. **"arsenel" typo** → "arsenal".
6. **Résumé in two places** → single `resume`.

## Out of Scope

- API secrets (stay in `api.js`/env).
- Non-content animation-timing constants in components.
- 3D/shader internals, Earth textures beyond the asset path.
- Redesign / new visuals — this preserves current appearance exactly (theme JSON
  is seeded from today's `index.css` values).

## Verification

1. `bun run build` and `bun run dev` complete without errors.
2. Each of the 10 sections renders identical content to pre-refactor (visual spot-check).
3. `grep` confirms no remaining hardcoded editable strings in refactored components.
4. Editing a JSON value visibly updates the site: (a) a section heading, (b) an
   `accentGold` color, (c) `typography.display` font stack, (d) `meta.title`
   (verify in built `index.html`).
5. Contact form posts to the unified email; Footer links resolve from `socials`.

## Docs

Update `CONTENT.md` and `CUSTOMIZATION.md` to point at the single
`site.config.json` (they currently describe the now-removed split and reference
config files that never existed, e.g. `social.js`, `projects.js`).

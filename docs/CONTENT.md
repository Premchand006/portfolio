# CONTENT.md — One file edits the whole site

Everything customisable lives in **one** file:

```text
src/config/site.config.json
```

Edit it, drop any new assets into `/public/assets/...`, and the site updates —
**no code changes needed** for content, links, images, theme, typography or SEO.
The UI renders dynamically from this config (via `src/config/index.js`); a Vite
plugin injects the SEO meta + theme tokens into `index.html` at build/dev time.

> The only thing NOT in the JSON is **secrets** — API keys stay in environment
> variables (see `.env.example` / §6).

---

## How it fits together

| Piece | Role |
|---|---|
| `src/config/site.config.json` | **Single source of truth** — all editable content/links/assets/theme/SEO |
| `src/config/index.js` | Accessor the components import (`identity`, `sections`, `projects`, …) |
| `vite-plugin-site-config.js` | Reads the JSON, injects `<title>`/meta/OG/JSON-LD + a `:root` theme block into `index.html` |
| `src/config/api.js` | Env-based secrets only (EmailJS / Arceus keys) |
| `index.css` | Holds the same theme values as **fallback** if the plugin is disabled |

---

## What lives where in `site.config.json`

| Key | Controls |
|---|---|
| `meta` | Browser title, description, keywords, canonical, OpenGraph + Twitter cards, JSON-LD Person/WebSite, theme-colors |
| `identity` | Name, short name, initials, tagline, job title, availability badge text, email, phone, location, multilingual hero cycle (`welcomeLanguages`) |
| `resume` | Résumé URL, download filename, button label |
| `theme.colors` | Every palette colour (maps to the `--*` CSS variables) |
| `theme.typography` | `display` / `body` / `mono` font stacks + optional `webFontUrl` (empty = system Times New Roman) |
| `assets` | `logo`, `loadingLogo`, `workDesk`, `ogImage`, `earthMap`, `earthLights` |
| `navigation` | **One** ordered list driving the command palette, the right-edge progress rail, the up/down navigator and the active-section observer (`id`, `label`, `shortLabel`, `icon`) |
| `sections` | Per-section copy: headings, eyebrows, accents, subtitles, descriptions, the About bio + interests, the contact form labels/placeholders/messages/inquiry chips, research deck copy, the VS-Code editor strings, etc. |
| `techStack` | The two marquee rows (`row1` / `row2`) — `name`, `slug`, `color`, `url`, optional `iconUrl` |
| `projects` / `skills` / `experience` / `education` / `certificates` / `publications` / `awards` / `journey` | The list content for each section |
| `socials` | All profile links — also feeds the footer + contact band (single source) |
| `cta` | Sticky call-to-action buttons (primary/secondary label + href) |
| `footer` | Copyright line (`{year}` is filled in automatically) + logo alt |
| `loading` | Loading-screen headline + "LOADING EARTH" text |
| `arceus` | Assistant greeting, placeholder reply, title/subtitle, input placeholder, quicklink count |
| `omnibar` | Command-palette search placeholder, brand mark, "Navigate" label, Ask-AI intro + suggestion chips |

---

## Theme & typography (re-skin from JSON)

`theme.colors` mirrors the CSS variables in `index.css`. Change a value here and
the Vite plugin writes it into a `:root { … }` block injected **before first
paint** (no flash). To switch fonts, edit `theme.typography.display/body/mono`.
To load a web font, set `theme.typography.webFontUrl` to a stylesheet URL (e.g. a
Google Fonts link) and reference the family in the font stacks; leave it empty to
keep the system Times New Roman.

---

## Assets — drop files into `public/assets/...`

| Type | Path (set in JSON) | Notes |
|---|---|---|
| Brand / favicon / OG logo | `assets.logo`, `assets.ogImage` → `public/logo.png` | Square PNG |
| Loading-screen logo | `assets.loadingLogo` | Falls back to the `identity.initials` chip if missing |
| Experience backdrop | `assets.workDesk` → `public/assets/images/work-desk.png` | ~2:1 landscape |
| Project covers | `projects[].image` → `public/assets/work/{slug}.svg` | 16:9; empty string shows a letter placeholder |
| Company / education logos | `experience[].logo`, `education[].logo` | Square SVG; `Logo` falls back to initials |
| Journey images | `journey[].image` / `journey[].images[]` | First image is the cover |
| Certificate images | `certificates[].image` | Optional |
| Earth textures | `assets.earthMap`, `assets.earthLights` → `public/earth/*.jpg` | Equirectangular — replace at own risk |
| Résumé PDF | `resume.url` → `public/assets/resume/prem-chand-cv.pdf` | Linked by contact form + résumé button |

Missing files render a graceful fallback or hide — no AI placeholders ship.

---

## API keys & environment — `.env` (local) / Vercel (prod)

Copy `.env.example` → `.env`. The site degrades gracefully when keys are missing
(contact form falls back to `mailto:`, the assistant disables itself). See the
table in `.env.example`. Keys are read in `src/config/api.js` — **never** put
secrets in `site.config.json`.

---

## Deploying

1. Push to GitHub.
2. Vercel → **Add New Project** → import the repo (auto-detected as Vite).
3. **Settings → Environment variables** → add the keys from `.env.example`.
4. Deploy. The Vite plugin injects all SEO/theme at build time, so the deployed
   `index.html` already has the correct tags and palette.

---

## Changelog

- `2026-06-04` — consolidated all content/links/assets/theme/typography/SEO into a single `src/config/site.config.json`; UI now renders dynamically from it via `src/config/index.js`; SEO + theme injected by `vite-plugin-site-config.js`. Removed the old split (`data.json`, `personal.js`, `images.js`).
- `2026-05-11` — initial CONTENT doc + AI assistant + cinematic refinements.
- `<DATE>` — your future edits…

# Customization Guide — Prem's Portfolio

Built with **React 19 + Vite 7** and Three.js for the globe. Everything that
changes for a new persona/deploy lives in **one JSON file** plus `/public/assets/`.
No code edits required for normal content, theme, typography or SEO updates.

> Requires **Node.js 20.19+ or 22.12+** (Vite 7). On older Node the build fails
> with `crypto.hash is not a function`.

---

## Quick start

```bash
bun install        # or npm install
bun run dev        # http://localhost:5173
bun run build      # production bundle to /dist
```

Deploys to Vercel out of the box (see `vercel.json`). The contact form expects
the Vercel function at `api/contact.js` for Resend — without it the form falls
back to `mailto:`.

---

## The single source of truth

| File | What it controls |
| --- | --- |
| `src/config/site.config.json` | **Everything editable** — content, links, assets, navigation, theme colours, typography, SEO/OpenGraph/JSON-LD |
| `src/config/index.js` | Accessor module the UI imports (named slices + `getSocial`/`interpolate` helpers) — components never touch the raw JSON |
| `vite-plugin-site-config.js` | Reads the JSON at build/dev and injects SEO meta, JSON-LD and a `:root` theme/typography `<style>` block into `index.html` |
| `src/config/api.js` | API credentials only, read from `import.meta.env` (secrets stay out of the JSON and out of git) |
| `src/index.css` | The same theme values as a **fallback** if the plugin is ever disabled |

See `CONTENT.md` for the full key-by-key map of `site.config.json`.

---

## Common edits

- **Rename / re-tagline / change email** → `identity` (email is unified — used for
  both display and the contact-form `mailto:` fallback).
- **Add a project / paper / job / school / milestone** → the matching top-level
  array (`projects`, `publications`, `experience`, `education`, `journey`).
- **Change any section heading or copy** → `sections.<id>`.
- **Edit the tech marquee** → `techStack.row1` / `techStack.row2`.
- **Change nav labels / order** → `navigation` (drives the command palette, the
  progress rail, the up/down navigator and the active-section observer at once).
- **Re-skin colours** → `theme.colors`. **Change fonts** → `theme.typography`.
- **SEO / share card** → `meta` (title, description, OG/Twitter, JSON-LD).

---

## Environment variables

Create `.env.local` (gitignored):

```env
# Contact form (Resend backend — keep on Vercel)
VITE_TURNSTILE_SITE_KEY=...
RESEND_API_KEY=...

# Optional EmailJS path
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...

# Arceus AI assistant
VITE_ARCEUS_API_KEY=...
VITE_ARCEUS_MODEL=...
```

Missing keys gracefully no-op — nothing breaks.

---

## Assets to provide

Drop files into the matching path; the JSON references them. Anything missing
renders a fallback or hides.

| Asset | Path (key in JSON) | Notes |
| --- | --- | --- |
| Brand / favicon / OG logo | `public/logo.png` (`assets.logo`, `assets.ogImage`) | Square PNG |
| Loading-screen logo | `assets.loadingLogo` | Falls back to the `identity.initials` chip |
| About / experience backdrop | `public/assets/images/work-desk.png` (`assets.workDesk`) | ~2:1 landscape |
| Project images | `public/assets/work/*.svg` (`projects[].image`) | Empty string → letter placeholder |
| Education / company logos | `public/assets/edu/*`, `public/assets/work/*-logo.svg` | Square SVG; `Logo` falls back to initials |
| Résumé PDF | `public/assets/resume/prem-chand-cv.pdf` (`resume.url`) | |
| Earth textures | `public/earth/*.jpg` (`assets.earthMap`, `assets.earthLights`) | Equirectangular |

---

## Theme palette

`theme.colors` in `site.config.json` maps 1:1 to the CSS variables in
`src/index.css` (e.g. `accentGold → --accent-gold`, `surface2 → --surface-2`).
The Vite plugin writes them into a `:root` block injected before first paint, so
editing the JSON re-skins the whole site with no flash. `index.css` keeps the
current values as a fallback.

Typography: set `theme.typography.display / body / mono` to any font stack. To
load a web font, set `theme.typography.webFontUrl` (e.g. a Google Fonts URL) and
reference the family in the stacks; leave it empty for the default system
Times New Roman.

---

## Section IDs (nav, badge click, arrow nav, Arceus quicklinks)

Defined once in `navigation`:
`home → about → experience → projects → tech-stack → research → certifications → education → journey → contact`

The active section is reflected on `<html data-active-section="...">`; per-section
backgrounds, star/meteor visibility and Arceus quicklinks key off this attribute.

---

## Fixed chrome (where things live)

| Element | Position | File |
| --- | --- | --- |
| Live status badge | top-left | `components/LiveStatus.jsx` (text ← `identity.availabilityText`) |
| Résumé button | top-right | `components/ResumeButton.jsx` (← `resume`) |
| Section progress rail | right edge | `components/SectionProgress.jsx` (← `navigation`) |
| Up/Down navigator | bottom-left | `components/SectionNavigator.jsx` (← `navigation`) |
| Mute toggle | left edge | `components/MuteToggle.jsx` |
| Arceus AI | bottom-right | `components/Arceus.jsx` (← `arceus`) |
| Sticky CTA | bottom-centre | `components/StickyCTA.jsx` (← `cta`) |
| Footer | end of contact | `components/Footer.jsx` (← `footer`, `socials`) |

---

## Arceus AI

UI is complete. `fetchArceusReply` in `components/Arceus.jsx` returns
`arceus.placeholderReply` until you wire a backend:

1. Set `VITE_ARCEUS_API_KEY` (and optionally `VITE_ARCEUS_MODEL`).
2. Replace the body of `fetchArceusReply` with your fetch/SDK call.

---

## Tech stack

- React 19, Vite 7, Three.js + @react-three/fiber + @react-three/drei (globe)
- Framer Motion (transitions, drawer, section reveals)
- Resend (contact backend via Vercel functions) + Cloudflare Turnstile (bot check)
- Optional: EmailJS fallback; Arceus AI key for the assistant

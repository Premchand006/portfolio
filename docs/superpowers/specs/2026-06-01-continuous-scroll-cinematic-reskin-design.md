# Design: Continuous Scroll + Cinematic Black/Gold/Burgundy Re-skin

**Date:** 2026-06-01
**Status:** Approved (pending written-spec review)
**Repo:** portfolio-main (React 19 + Vite + Three.js, package manager: bun)

## Summary

Two coordinated changes to the portfolio:

1. **Continuous scroll** — replace the section-by-section scroll-snapped structure with one
   continuous single-page flow, smoothed with Lenis momentum scrolling.
2. **Cinematic re-skin** — rebuild the color system onto a strict five-color palette
   (black / muted gold / dark gray / deep burgundy / white), with every section on a black
   canvas carrying a subtle burgundy atmospheric wash.

Both touch the same core files (`App.jsx`, `App.css`, `Sections.css`, `index.css`), so they
ship as one redesign.

## Goals

- Free, continuous, momentum-smoothed scrolling — no snapping, no one-screen-per-section jumps.
- Each section keeps a full-screen floor (`min-height: 100vh`) and grows when content needs more
  room (no clipping).
- A unified, premium, "darkened-theatre" look built only from the five palette colors plus
  white-at-opacity neutrals.
- Preserve every existing feature: hero globe, per-section background morph, progress chrome,
  jump navigation, sounds, command palette, chatbot.

## Non-Goals / Carve-outs

- **The hero WebGL globe is untouched** — its blue atmosphere (`#2244aa`), night lights, and
  geometry stay exactly as they are (explicit user instruction). `EarthShaders*.jsx` is not edited.
- **Two semantic color exceptions remain:** the VS Code mock's editor-chrome blue (`#007acc`) and
  the green "available" status dot (`#22c55e`). Everything else uses the palette.
- No content/copy changes, no new sections, no layout restructuring beyond sizing.
- No framework migration (Next.js, etc. — out of scope for this pass).

---

## Color Palette

| Hex | Name | Role |
|-----|------|------|
| `#000000` | Full Black | Canvas — every section background |
| `#252628` | Dark Gray | Cards, panels, inputs, raised surfaces |
| `#d29f22` | Muted Gold | Primary accent — CTAs, highlights, links, active states, focus, progress |
| `#5d0018` | Deep Burgundy | Secondary accent — atmospheric washes, secondary button, card top-accents, dividers |
| `#ffffff` | White | Primary text |

**Derived neutrals (white at opacity only — no new hues):**

- `--text-secondary: rgba(255,255,255,0.62)` — body copy
- `--text-muted: rgba(255,255,255,0.40)` — captions / metadata
- `--border-subtle: rgba(255,255,255,0.10)` — hairlines / dividers
- `--surface-2: #1a1a1c` — nested/elevated surface a step below `#252628`

Burgundy is dark, so it is used only as **fill / glow / border**, never as small text.

---

## Workstream 1 — Continuous Scroll (Lenis)

### Architecture

Keep the existing inner `.snap-container` as the scroll element (the "wrapper"); Lenis manages it.
App owns the Lenis instance and shares it through a small React context so readers and jump
buttons coordinate through one source of truth.

```text
App
 └ LenisProvider                (creates instance, runs rAF loop, provides context)
    ├ .snap-container  (wrapper, ref)
    │   └ .snap-content (content, ref)  ← sections moved inside this new wrapper div
    └ context value: { lenis, scrollTo(target, opts), subscribe(cb) }
```

### New files

- **`src/context/LenisContext.jsx`** — `LenisContext` + `LenisProvider` + `useLenis()` hook.
  - `LenisProvider` receives `wrapperRef` and `contentRef`, creates
    `new Lenis({ wrapper, content, lerp: ~0.1, smoothWheel: true })`, runs the
    `requestAnimationFrame` loop, and destroys/cancels on unmount.
  - Exposes `{ lenis, scrollTo, subscribe }`. `scrollTo(target, opts)` wraps `lenis.scrollTo`;
    `subscribe(cb)` wraps `lenis.on('scroll', cb)` and returns an unsubscribe.
  - **Reduced motion:** when `matchMedia('(prefers-reduced-motion: reduce)')` matches, do NOT
    instantiate Lenis. `scrollTo` falls back to `wrapper.scrollTo({top, behavior:'auto'})` /
    `el.scrollIntoView`; `subscribe` attaches a native `'scroll'` listener on the wrapper.
  - **Touch:** leave Lenis touch defaults (native touch scrolling) so mobile feel is unchanged.

### CSS changes

- **`App.css`**
  - `.snap-container`: remove `scroll-snap-type: y mandatory`. Keep `height:100vh;
    overflow-y:scroll` (Lenis wrapper) and the hidden scrollbar.
  - Add `.snap-content {}` wrapper rule (block; min-height auto).
- **`src/sections/Sections.css`**
  - Base `.section`: `height: 100vh` → `min-height: 100vh; height: auto`. Remove
    `scroll-snap-align: start`. Keep flex centering and `overflow: hidden` (clips decorative
    absolute layers, not content). The redundant about/certifications/contact height overrides
    are simplified; `.section--contact` keeps `overflow: visible`.
- **`src/index.css`**
  - `html { scroll-behavior: smooth }` → `auto` (Lenis owns smoothness; CSS smooth fights
    `lenis.scrollTo`). The existing `prefers-reduced-motion { scroll-behavior:auto !important }`
    stays.

### Wire-up

- **`App.jsx`** — wrap the ten sections in `<div className="snap-content" ref={contentRef}>`;
  mount `LenisProvider` around the scroller. Hero `scrollProgress` is computed from
  `subscribe(({scroll}) => Math.min(1, scroll / clientHeight))`. The active-section
  `IntersectionObserver` (root: container) stays as-is — it tracks element visibility, not scroll
  position, so Lenis does not affect it; the nav sound stays. Initial reset adds
  `lenis.scrollTo(0, { immediate: true })`. Optionally `lenis.stop()` while the loader shows,
  `lenis.start()` after.
- **Scroll readers** → replace native `container.addEventListener('scroll', …)` with `subscribe()`
  (math unchanged): `ProgressBar`, `StickyCTA` (visibility), `SectionProgress` (active + ring
  progress).
- **Jump surfaces** → route through `scrollTo()` for eased navigation (replacing
  `container.scrollTo` / `el.scrollIntoView`):
  `SectionNavigator`, `SectionProgress` dots, `StickyCTA` buttons, **Omnibar** (`scrollToSection`),
  **Arceus**, **LiveStatus**.

### Dependency

- `bun add lenis`.

---

## Workstream 2 — Cinematic Re-skin

### Token system (`src/index.css :root`)

Retune the existing tokens to the palette (the leverage point — most components read these):

| Token | Old | New |
|-------|-----|-----|
| `--bg-globe` | `#000000` | `#000000` (unchanged) |
| `--bg-primary` | `#0F1424` | `#000000` |
| `--bg-secondary` | `#1E1F27` | `#252628` |
| `--bg-tertiary` | `#15161E` | `#1a1a1c` |
| `--accent-gold` | `#FFD71A` | `#d29f22` |
| `--accent-gold-soft` | `#FFDE3D` | `#e0b23f` (derived lighter gold) |
| `--accent-drama` | `#400F29` | `#5d0018` |
| `--accent-red` | `#FF3333` | `#5d0018` (folded into burgundy) |
| `--text-primary` | `#FFFFFF` | `#ffffff` (unchanged) |
| `--text-secondary` | `#B7B9C6` | `rgba(255,255,255,0.62)` |
| `--text-muted` | `#6E7187` | `rgba(255,255,255,0.40)` |
| `--star-color` | `#FFD71A` | `#d29f22` |
| `--meteor-color` | `#FFDE3D` | `#e0b23f` |
| `--nav-dot-active` | `#FFD71A` | `#d29f22` |
| `--arceus-accent` | `#400F29` | `#5d0018` |
| `--hero-canvas-bg` | `#000000` | `#000000` (unchanged — globe needs absolute black) |

Add new tokens: `--surface-2: #1a1a1c`, `--accent-deep: #5d0018`, gold-glow rgba helpers
(e.g. `--gold-glow: rgba(210,159,34,0.4)`), and burgundy-glow rgba helpers.

### Background rhythm (`.bg-layer`, `index.css` lines ~490–499)

The fixed `.bg-layer` currently morphs between blue tints per active section. Retune so:

- The base color for every section is **black / a shade of black** (`#000000`, `#050505`,
  `#08080a`, up to a faint `#0d0d0f`) — no blue.
- **All sections carry a subtle burgundy atmospheric wash** layered over the black: a large,
  soft radial `#5d0018` glow anchored at a varying corner per section, low opacity for most,
  stronger on Hero, Projects, and Contact. This is the consistently-cinematic backdrop the user
  chose.
- **Hero exception (to protect the globe):** the home section's wash is confined to the outer
  edges/corners only; the central region behind the globe stays pure `#000000` so the untouched
  globe's atmospheric rim and night-lights still read against absolute darkness.
- Implementation: keep the single fixed `.bg-layer` for the black base-color morph (per
  `data-active-section`), and add the burgundy radial as a background gradient layer (either a
  second fixed pseudo/layer that also keys off `data-active-section`, or per-section absolute
  decorative layers). Starfield + meteor stay gold and home-only.

### Accent rules (CRO hierarchy)

- **Primary CTA** — solid `#d29f22`, near-black text (`#000`), soft gold glow. The single
  converting button; used consistently (StickyCTA primary, contact submit, "Get in touch").
- **Secondary button** — burgundy, subordinate: quiet burgundy-tint outline at rest
  (`#5d0018` border + faint wash + warm-white label), deepening to a **solid `#5d0018` fill on
  hover**. Never out-shouts the gold primary.
- **Links / highlights / active nav / progress fills / input focus rings** — gold.
- **Tags / chips** — gold-outline (default/tech) + a burgundy "featured/spotlight" variant
  (`rgba(93,0,24,…)` fill + burgundy border).
- **Cards** — `#252628` surface, `--border-subtle` hairline, optional 2px burgundy top-accent;
  hover lifts with a gold border/glow (matching today's project-card behavior, recolored).

### Color sweep (hardcoded values)

After retuning `:root`, sweep hardcoded values to tokens/new values. Audit found ~85 bright-gold
references plus blue-blacks, alt-gold, and old burgundy across these files:

- **CSS:** `index.css`, `sections/Sections.css`, `components/Arceus.css`, `Footer.css`,
  `LiveStatus.css`, `LoadingScreen.css`, `MultilingualHeadline.css`, `Omnibar.css`,
  `ResumeButton.css`, `SectionNavigator.css`, `sections/EducationSection.css`,
  `sections/ExperienceSection.css` (+ any others surfaced during the sweep).
- **JSX inline/SVG colors:** `sections/EducationSection.jsx`, and any component using inline
  color literals (excluding the globe/`EarthShaders*` and the VS Code editor blue).

Replacement rules:
- `#FFD71A` / `rgb(255,215,26)` / `rgba(255,215,26,a)` → `#d29f22` / `rgba(210,159,34,a)`
- `#FFDE3D` / alt gold `#d4af37` / `#9c7c18` → unify to the gold ramp (`#d29f22` / `#e0b23f`)
- Blue-blacks (`#0F1424`, `#151825`, `#0a0c18`, `#080810`, `#0c0a10`, `#0a0a12`, `#0e0e16`,
  `#06060e`, `#151617`, etc.) → black / `#252628` / derived black shades
- `#400f29` / `#FF3333` → `#5d0018`
- Grays (`#888`, `#ccc`, `#444`, `#3a3a3a`, `#1e1e1e`, …) → consolidate to white-opacity neutrals
  or `#252628`/`#1a1a1c`
- **Do not change:** `#007acc` (VS Code chrome), `#22c55e` (status dot), `EarthShaders*` globe colors

---

## Edge Cases

- **prefers-reduced-motion:** Lenis disabled, native scroll, instant/CSS jumps; existing
  reduced-motion CSS blocks preserved.
- **Touch / mobile:** native touch scrolling (Lenis default); existing `max-width:768px` rules
  (sections already `height:auto`) remain valid.
- **Resize / orientation:** Lenis auto-resizes; call `lenis.resize()` if a programmatic layout
  change requires it.
- **Loader:** scroll locked (`lenis.stop()`) while `LoadingScreen` is shown; `lenis.start()` +
  `scrollTo(0,{immediate:true})` on dismiss.
- **Globe contrast:** hero burgundy wash kept to outer edges so the globe's dark backing is
  preserved.

## Verification (manual primary — no scroll/visual tests exist)

Run `bun dev` and confirm:

- Continuous, eased, momentum scroll; no snapping; each section ≥ one full screen; content-heavy
  sections (Contact form, Projects, Education) not clipped.
- Hero globe reacts over the first screen (unchanged); `data-active-section` background morph
  works; progress rings/bar/sticky-CTA track; all six jump surfaces (arrows, dots, sticky CTA,
  Omnibar, Arceus, LiveStatus) ease-scroll.
- Reduced-motion falls back to native scroll + instant jumps; mobile touch stays native.
- Every surface is black / shades of black; gold is the only highlight/CTA color; burgundy wash
  present on all sections (stronger on hero/projects/contact); secondary button burgundy
  hover-fill; VS Code blue + status green intact.
- **Contrast:** verify gold `#d29f22` on `#000` and white-62% on `#000` meet WCAG AA for their
  text sizes; gold-on-`#252628` for tags.
- `bun run lint` (eslint) clean. Extract the section/scroll progress math into a small pure
  helper and add a `*.test.js` unit test (repo already uses this pattern).

## Risks

- **Lenis ↔ native scroll events:** readers move to `lenis.on('scroll')` rather than relying on
  native events firing — explicit and reliable.
- **Color sweep breadth:** ~13+ files; mitigated by leading with `:root` tokens, then a
  grep-driven file-by-file pass with the explicit replacement rules above.
- **Globe coexistence:** burgundy wash confined away from the globe center; globe code untouched.

## File Inventory (estimate)

- New: `src/context/LenisContext.jsx` (+ optional test for the progress helper)
- Edited (scroll): `App.jsx`, `App.css`, `sections/Sections.css`, `index.css`,
  `components/{ProgressBar,StickyCTA,SectionProgress,SectionNavigator,Omnibar,Arceus,LiveStatus}.jsx`
- Edited (re-skin): `index.css` (tokens + bg-layer) + the ~13 CSS/JSX files listed in the sweep
- `package.json` / `bun.lock`: add `lenis`
- Untouched: `EarthShaders*.jsx`, globe assets; VS Code blue; status green

# Responsive Rules — Keep This Site Fluid Forever

This portfolio is **permanently fluid from 1024px (small laptop) to 2560px+ (ultrawide)**.
The responsiveness is driven by **CSS** (`clamp()` / `vw` / `%` + design tokens), not by
JavaScript breakpoints. Follow these rules and new sections/components stay responsive by
default — no per-deploy fiddling.

> Scope: laptop & desktop only (≥1024px). We do **not** add mobile breakpoints.

---

## 1. The single source of truth

- **`src/responsive.css`** — fluid tokens (spacing, sizing, type). Loaded first, in `src/main.jsx`.
- **`src/index.css`** — base palette tokens, reset, typography classes (`.display-xl`, `.heading-1`, …).
- **`src/hooks/useResponsive.js`** — JS helpers (`useViewport`, `useElementSize`, `vwToPx`, `clampValue`)
  for the rare component that must compute a pixel value in JS.

Never create a competing tokens file. Extend `responsive.css`.

---

## 2. The golden rule

> **Never hardcode px for `font-size`, `width`, `height`, `margin`, or `padding`.**
> Use `clamp()`, `%`, `vw`/`vh`, or a token variable.

**Cosmetic px are fine** and should stay px: border widths (`1–2px`), `border-radius`,
`box-shadow` blur/offset, tiny icon/dot sizes, hairline rules. These don't break on resize.

---

## 3. The `clamp()` formula

```
clamp(MIN, PREFERRED_vw, MAX)
```

- **MIN** = the value you want at ~1024px (the floor).
- **MAX** = the value you want at ~2560px (the ceiling).
- **PREFERRED** = the `vw` that connects them. Rough rule: `PREFERRED ≈ MAXpx / 25.6` → that many `vw`.
  (Because `2560px × 1vw = 25.6px`.) Tune by eye.

Examples already in the codebase:

```css
--font-hero:        clamp(2.5rem, 8vw, 6rem);
--space-section-y:  clamp(3rem, 8vw, 8rem);
--card-width:       clamp(280px, 30vw, 420px);
height:             clamp(340px, 40vh, 460px);   /* vh for vertical sizing */
```

Use existing tokens before inventing a new clamp:
`--space-3xl`, `--space-4xl`, `--space-fluid-md/lg/xl`, `--card-width`, `--reading-width`,
`--section-padding-x`, `--section-padding-y`, `--font-hero`, `--font-title`, `--font-body-fluid`.

---

## 4. Layout rules

- Containers: `width: 100%` + `max-width: var(--container-max)` + `margin: 0 auto` + padding.
  Use the `.container` class. **The 1400px cap is intentional** — content scales fluidly up to
  it and centers, with deliberate gutters on ultrawide. Don't remove the cap without a design decision.
- Heights: prefer `min-height` or `aspect-ratio`. Only use fixed/`clamp()` height when the
  element genuinely needs a fixed box (e.g. a card deck).
- Multi-column: CSS Grid `repeat(auto-fit, minmax(<floor>, 1fr))` or `1fr`/fractional tracks.
  Never fixed px column widths.
- `position: absolute/fixed`: layout-critical offsets use `%` / `vw` / `vh` / `rem`, never raw px.
  (Viewport-anchored overlays may use small `rem` insets — that's fine.)

---

## 5. Animation rules (Framer Motion + CSS — there is no GSAP here)

Animations are the #1 thing that breaks on resize. For **any movement across the screen**:

- **CSS `@keyframes`**: use `%` or `vw`/`vh` for `translate`, never px.
  *(e.g. the meteor travels `translateX(-150vw)`, not `-700px`.)*
- **Framer Motion**: bare numbers are **px**. For anything bigger than a tiny entrance fade,
  pass a **string `%`** so it's relative to the element:
  ```jsx
  initial={{ y: '-30%' }}            // ✅ scales with element height
  animate={{ x: `${6 + i * 2}%` }}   // ✅
  // initial={{ y: -180 }}           // ❌ fixed px — disproportionate across screens
  ```
  Small entrance fades (`y: 10–40`) are acceptable — they read the same at any width.
- **Measuring an element in JS** (e.g. an SVG border that wraps a button): use
  `useElementSize(ref)` from `useResponsive.js` — it re-measures via `ResizeObserver` on every
  resize/reflow. **Never** read `offsetWidth` once in a mount-only effect.
- **Need a px value from the viewport in JS**: use `vwToPx(vw)` and `clampValue(min, pref, max)`.
- `<canvas>` backgrounds already reseed on resize and cap `devicePixelRatio` — keep that pattern
  if you add a new one. Use `clientWidth/clientHeight`-relative coordinates, not absolute px.

---

## 6. Image & media rules

- Every `<img>` gets `width` + `height` attributes (intrinsic ratio → no layout shift) and
  `loading="lazy"` unless it's above the fold.
- Images in fixed boxes: container sets `aspect-ratio` + the img uses `object-fit: cover|contain`.
- Background images: `background-size: cover; background-position: center;`.
- Galleries/grids: CSS Grid `auto-fit`/`auto-fill` with `minmax()`, never fixed columns.
- Decorative SVGs scale via `%`/`vw` or the parent box; inline icons keep explicit `width/height`.

---

## 7. Pre-deploy checklist (run before every Vercel push)

- [ ] `bun run build` (or `npm run build`) passes with no errors.
- [ ] No new raw px in `font-size` / `width` / `height` / `margin` / `padding` (cosmetic px OK).
- [ ] New `@keyframes` / Framer moves use `%` / `vw`, not px (except tiny entrance fades).
- [ ] New `<img>` has `width` + `height` (+ `loading="lazy"` if below fold).
- [ ] New JS measurement uses `useElementSize`, not a one-shot `offsetWidth` read.
- [ ] Eyeball the page at **1024 / 1280 / 1440 / 1920 / 2560** and drag-resize 1024→1920:
      no overflow (no horizontal scrollbar), no jumps, animations scale fluidly.
- [ ] New large sections use `--space-3xl` / `--space-4xl` / `--section-padding-*`, not fixed gaps.

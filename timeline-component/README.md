# Timeline Component

A fully portable, standalone implementation of the **snake-path timeline** — extracted from Veeshal's portfolio site. Drop this folder into any project and wire it up in minutes.

---

## Folder Structure

```
timeline-component/
├── index.html            ← Standalone demo (open in browser to preview)
├── css/
│   ├── design-system.css ← Design tokens, reset, loader, cursor, header, footer
│   ├── timeline-skin.css ← v2 skin overrides (typography, card styles, pill tags)
│   └── timeline.css      ← Timeline-specific styles (snake path, slider, modal)
├── js/
│   ├── loader.js         ← Pit-lane wheel loader + page transitions (GSAP)
│   ├── subpage.js        ← Cursor, scroll-progress wheel, reveal animation
│   └── timeline.js       ← Snake SVG path, scroll fill, image slider, fullscreen modal
└── README.md
```

---

## Quick Preview

Just open `index.html` in a browser — no build step required.

---

## How to Integrate Into Your Project

### 1. Copy the CSS files

```html
<!-- In your <head> — load order matters -->
<link rel="stylesheet" href="path/to/design-system.css" />
<link rel="stylesheet" href="path/to/timeline-skin.css" />
<link rel="stylesheet" href="path/to/timeline.css" />
```

> **Tip:** If your project already has CSS custom properties (`:root` variables) set, you
> can skip `design-system.css` and just map your own token names — or adjust the variable
> names inside `timeline.css` and `timeline-skin.css`.

### 2. Copy the fonts

The design system uses three typefaces. Add these to your `<head>`:

```html
<!-- JetBrains Mono (Google Fonts — free) -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,500&display=swap" rel="stylesheet" />

<!-- Clash Display + General Sans (Fontshare — free) -->
<style>
  @import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap');
</style>
```

### 3. Add the Chrome layer (grain + cursor + scroll wheel)

```html
<div class="grain" aria-hidden="true"></div>
<div class="cursor-dot"  aria-hidden="true"></div>
<div class="cursor-ring" aria-hidden="true"></div>

<button class="scroll-wheel" aria-label="Back to top">
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="rgba(17,17,16,0.85)" />
    <g class="sw-rotor">
      <circle cx="50" cy="50" r="36" fill="none" stroke="#3a3a3e" stroke-width="5" />
      <line x1="50" y1="50" x2="50"   y2="16"   stroke="#5a5a60" stroke-width="4" />
      <line x1="50" y1="50" x2="82.3" y2="60.5" stroke="#5a5a60" stroke-width="4" />
      <line x1="50" y1="50" x2="30"   y2="77.5" stroke="#5a5a60" stroke-width="4" />
      <line x1="50" y1="50" x2="17.7" y2="39.5" stroke="#5a5a60" stroke-width="4" />
      <line x1="50" y1="50" x2="70"   y2="22.5" stroke="#5a5a60" stroke-width="4" />
      <circle cx="50" cy="50" r="9" fill="#F9B646" />
    </g>
    <circle class="sw-progress" cx="50" cy="50" r="44" />
  </svg>
</button>
```

### 4. Add the Timeline HTML block

Paste the following **inside your page wrapper** (`.home > .homeContainer`):

```html
<div class="timeline-container">

  <!-- Title -->
  <div class="timeline-title">
    <div class="code-label">
      <span class="code-fn">console</span><span class="code-dot">.</span><span
      class="code-method">log</span><span class="code-paren">(</span><span
      class="code-var">currentLife</span><span class="code-paren">)</span>
    </div>
    <h1>Glory<br />Logged.</h1>
  </div>

  <!-- Snake SVG progress line (JS draws this automatically) -->
  <div class="timeline-progress-wrapper" id="timelineProgressWrapper">
    <svg id="snakeSvg" class="snake-svg" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path id="snakePathBase" class="snake-path-base" fill="none" stroke="#d1d1d1" stroke-width="4" />
      <path id="snakePathFill" class="snake-path-fill" fill="none" stroke="#F9B646" stroke-width="4" stroke-linecap="round" />
    </svg>
  </div>

  <!-- Timeline items -->
  <div class="timeline" id="timelineItems">

    <!-- ITEM TEMPLATE (alternate .left / .right for each entry) -->
    <div class="timeline-item left"
         data-images='["url-to-image-1.jpg", "url-to-image-2.jpg"]'>

      <div class="timeline-content">
        <div class="tag-row">
          <span class="tag">Winner</span>
          <span class="date">DD MMM YYYY</span>
        </div>
        <h2>Event Title Here</h2>
        <p>A short description of the event or achievement.</p>
      </div>

      <div class="timeline-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      </div>

      <div class="timeline-image">
        <!-- Single image: add class "single" to .img-slider -->
        <!-- Multiple images: omit "single", add more .slider-img + dots -->
        <div class="img-slider single">
          <img src="url-to-image-1.jpg" alt="Event Title" class="slider-img active" />
          <button class="slider-btn slider-prev" aria-label="Previous">&#8249;</button>
          <button class="slider-btn slider-next" aria-label="Next">&#8250;</button>
          <div class="slider-dots"><span class="dot active"></span></div>
        </div>
      </div>
    </div>
    <!-- /ITEM -->

  </div><!-- /.timeline -->
</div><!-- /.timeline-container -->
```

### 5. Add the Fullscreen Modal

Place this **after** your `#home` div, before closing `</body>`:

```html
<div id="timelineModal" class="timeline-modal">
  <div class="timeline-modal-content">
    <span class="close-modal">&times;</span>
    <button class="modal-arrow modal-prev" aria-label="Previous">&#8249;</button>
    <img id="timelinePopupImg" alt="Fullscreen view" />
    <button class="modal-arrow modal-next" aria-label="Next">&#8250;</button>
    <div class="modal-dots" id="modalDots"></div>
  </div>
</div>
<div id="toast-container"></div>
```

### 6. Add the Scripts

GSAP **must** load before the component scripts:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="js/loader.js"></script>
<script src="js/subpage.js"></script>
<script src="js/timeline.js"></script>
```

---

## Required Page Wrapper Classes

The loader/reveal system expects this nesting structure:

```html
<div id="home" class="home">
  <div class="homeContainer">
    <!-- header + timeline section go here -->
  </div>
  <!-- footer goes here -->
</div>
```

The JS adds `.is-ready` to `<body>` when the loader finishes — this triggers the CSS reveal animation.

---

## Adding / Removing Timeline Items

Each item follows this pattern:

| Class | Layout |
|-------|--------|
| `.timeline-item.left`  | Text card → Icon → Image (left-to-right) |
| `.timeline-item.right` | Image → Icon → Text card (reversed via `flex-direction: row-reverse`) |

**Alternate left/right** for the zigzag snake path to work correctly.

**`data-images` attribute** — pass a JSON array of image URLs. The JS reads this to populate the fullscreen modal slider.

**Single image** — add class `single` to `.img-slider` to hide arrow buttons and dots.

---

## Customising the Design Tokens

All colours and fonts are defined as CSS variables in `design-system.css`:

| Token | Default | Usage |
|-------|---------|-------|
| `--paper` | `#f8f7f3` | Page background |
| `--ink`   | `#111110` | Text, borders   |
| `--amber` | `#F9B646` | Accent, snake path fill, tags |
| `--muted` | `#6f6c62` | Secondary text  |
| `--line`  | `#e2dfd6` | Card borders    |
| `--font-display` | Clash Display | Headings |
| `--font-mono`    | JetBrains Mono | Code, tags, dates |
| `--font-body`    | General Sans  | Body copy |

Override any token on `:root` in your own stylesheet **after** importing `design-system.css`.

---

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.

GSAP gracefully degrades: if JS is unavailable the loader is hidden via CSS and content is shown normally.

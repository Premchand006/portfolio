/* ============================================================================
   useResponsive — live, ResizeObserver-based viewport + element sizing.
   ----------------------------------------------------------------------------
   The responsive backbone of this site is CSS (clamp/vw/% — see responsive.css),
   so most components need NO JS. Use these helpers ONLY when a component must
   compute a pixel value in JS for animation/measurement (e.g. an SVG border
   that wraps a measured element). Prefer ResizeObserver over window 'resize'
   events: it fires for element-size changes too (font reflow, layout shifts),
   not just window resizes.
   ========================================================================== */

import { useState, useEffect } from 'react';

/* Convert a vw amount to px against the current viewport width. */
export function vwToPx(vw) {
  if (typeof window === 'undefined') return 0;
  return (vw / 100) * window.innerWidth;
}

/* clamp(min, preferred, max) — the JS twin of the CSS clamp() we use in CSS.
   `preferred` is already a resolved number (e.g. from vwToPx). */
export function clampValue(min, preferred, max) {
  return Math.min(Math.max(min, preferred), max);
}

/* Live viewport size. Observes the document element so it reacts to browser
   tab resizing without attaching a window 'resize' listener. */
export function useViewport() {
  const [size, setSize] = useState(() => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.documentElement;
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  return size;
}

/* Live size of a specific element via ResizeObserver. Pass a ref; get back
   { width, height } that updates on any layout/font/viewport change. */
export function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref?.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      // borderBoxSize matches offsetWidth/offsetHeight; fall back to rect.
      const box = entry.borderBoxSize?.[0];
      if (box) {
        setSize({ width: box.inlineSize, height: box.blockSize });
      } else {
        const rect = el.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

export default useViewport;

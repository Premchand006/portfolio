/* ============================================================================
   useTheme — light / dark mode for the WHOLE site (desktop + mobile).
   ----------------------------------------------------------------------------
   Promoted out of src/mobile/useTheme.js so the desktop App can share it.
   • Initial value: saved choice → legacy mobile key → system preference → dark
     (brand default stays the cinematic dark theatre).
   • Persists to localStorage so the visitor's choice survives reloads.
   • Writes `data-theme="light|dark"` to <html>.
       – Mobile styles scope themed tokens under `html.m-active[data-theme=…]`.
       – Desktop styles scope light overrides under
         `html[data-theme="light"]` (desktop never sets `.m-active`, and the
         mobile chunk never loads desktop CSS, so the two can't collide).
   ========================================================================== */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pc-theme';
/* Pre-unification key used by the mobile-only toggle — read once as a
   fallback so an earlier saved choice still wins over system preference. */
const LEGACY_KEY = 'pc-mobile-theme';

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  /* ?theme=light|dark overrides everything (debug / shareable links) — must
     match the pre-paint script in index.html. */
  const param = new URLSearchParams(window.location.search).get('theme');
  if (param === 'light' || param === 'dark') return param;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* localStorage blocked (private mode) — fall through */ }
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle, setTheme };
}

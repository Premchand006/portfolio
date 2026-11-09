/* ============================================================================
   useIsMobile — device-specific loading switch.
   ----------------------------------------------------------------------------
   The desktop experience (Three.js globe, meteors, starfield, magnetic cursor)
   is intentionally heavy and tuned for ≥1024px (see RESPONSIVE_RULES.md). On
   real phones we instead mount a separate, lightweight MobileApp. This hook is
   the single source of truth for that decision.

   A device counts as "mobile" when EITHER:
     • the user-agent is a phone (Android *Mobile*, iPhone, iPod, …), OR
     • the viewport is ≤ 767px wide.

   Tablets (incl. iPadOS, which now reports as desktop Safari) are deliberately
   NOT matched by the phone UA regex and sit at ≥ 768px, so they keep getting
   the full desktop version — exactly as requested.

   It re-evaluates on resize / orientation change so dragging a desktop window
   narrow (or rotating a phone) swaps experiences live.
   ========================================================================== */

import { useState, useEffect } from 'react';

/* ≤ 767px → phones · ≥ 768px → tablets & desktop. */
export const MOBILE_MAX_WIDTH = 767;

/* Phones only. Note "Android.+Mobile" (Android tablets omit the Mobile token)
   and the absence of iPad — so tablets fall through to the desktop build. */
const PHONE_UA = /Android.+Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Mobi/i;

export function detectMobile() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  const isPhoneUA = PHONE_UA.test(ua);
  const isNarrow = window.innerWidth <= MOBILE_MAX_WIDTH;
  return isPhoneUA || isNarrow;
}

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(detectMobile);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const update = () => setIsMobile(detectMobile());

    // matchMedia covers the width crossover; resize/orientation cover the rest.
    mq.addEventListener('change', update);
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update);
    update();

    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return isMobile;
}

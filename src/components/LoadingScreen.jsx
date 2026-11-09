import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assets, loading, identity } from '../config';
import './LoadingScreen.css';

/* ─────────────────────────────────────────────────────────────
   LoadingScreen — coin-spin logo wrapped in a light-grey buffer
   ring, with a horizontal load bar beneath, on pure black.

   Plays on every page load/refresh. Pure black backdrop. The
   logo spins like a coin (rotateY, infinite). A subtle grey arc
   orbits around it as a loading buffer. A thin gold line below
   fills left → right while loading. When the parent signals
   ready, the whole overlay fades to opacity 0.

   All animation timings live in T below for easy tuning.
   ───────────────────────────────────────────────────────────── */
const T = {
    COIN_SPIN:    1100,    // One full rotateY (coin flip) — 1.1s
    LOAD_DUR:     2600,    // Loading line fills left → right over 2.6s
    SHIMMER_DUR:  4800,    // Ambient gold shimmer drift across the backdrop
    BAR_GLINT:    1800,    // Travelling highlight on the loading bar
    BUFFER_SPIN:  1200,    // Light-grey buffer ring rotation — 1.2s/turn
    TEXT_AT:       320,    // Typewriter headline starts at 0.32s
    TEXT_STEP:     110,    // …adds one char every 110ms (19 chars ≈ 2.1s)
    EXIT_FADE:     800,    // Overlay fades to 0 over 0.8s when ready
    MIN_HOLD:     3200,    // Stay up at least this long so the bar finishes
};

const HEADLINE = loading.headline;

const LoadingScreen = ({ onComplete }) => {
    const [visible, setVisible] = useState(true);
    const [logoFailed, setLogoFailed] = useState(false);
    const [typed, setTyped] = useState('');
    const mountedAt = useRef(0);

    /* Record mount time so the overlay can enforce a minimum hold. */
    useEffect(() => {
        mountedAt.current = Date.now();
    }, []);

    /* JS-driven typewriter — adds exactly one real glyph per tick.
       Avoids the CSS `steps()` jitter you get when the box width is
       split into N equal slices but glyphs have variable widths. */
    useEffect(() => {
        let interval;
        const start = setTimeout(() => {
            let i = 0;
            interval = setInterval(() => {
                i += 1;
                setTyped(HEADLINE.slice(0, i));
                if (i >= HEADLINE.length) clearInterval(interval);
            }, T.TEXT_STEP);
        }, T.TEXT_AT);
        return () => {
            clearTimeout(start);
            if (interval) clearInterval(interval);
        };
    }, []);

    /* Parent invokes finish() once window load + globe are ready.
       We hold for MIN_HOLD so the bar visibly completes its travel. */
    useEffect(() => {
        if (typeof onComplete !== 'function') return;
        const finish = () => {
            const elapsed = Date.now() - mountedAt.current;
            const remaining = Math.max(0, T.MIN_HOLD - elapsed);
            setTimeout(() => setVisible(false), remaining);
        };
        onComplete(finish);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="lsx"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: T.EXIT_FADE / 1000, ease: [0.65, 0, 0.35, 1] }}
                    style={{
                        '--coin-spin':   `${T.COIN_SPIN}ms`,
                        '--load-dur':    `${T.LOAD_DUR}ms`,
                        '--shimmer-dur': `${T.SHIMMER_DUR}ms`,
                        '--bar-glint':   `${T.BAR_GLINT}ms`,
                        '--buffer-spin': `${T.BUFFER_SPIN}ms`,
                        '--exit-fade':   `${T.EXIT_FADE}ms`,
                    }}
                    aria-label="Loading"
                    aria-live="polite"
                    role="status"
                >
                    {/* Ambient golden shimmer drifting across the black backdrop */}
                    <div className="lsx__shimmer" aria-hidden="true" />

                    {/* Centre — coin-spinning logo wrapped in a grey buffer ring */}
                    <div className="lsx__stage">
                        <div className="lsx__coin">
                            <div className="lsx__buffer" aria-hidden="true" />
                            <div className="lsx__coin-face">
                                {logoFailed ? (
                                    <>
                                        <div className="lsx__logo lsx__logo--fallback lsx__logo--front" aria-hidden="true">
                                            {identity.initials}
                                        </div>
                                        <div className="lsx__logo lsx__logo--fallback lsx__logo--back" aria-hidden="true">
                                            {identity.initials}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={assets.loadingLogo}
                                            alt=""
                                            className="lsx__logo lsx__logo--front"
                                            width="110"
                                            height="110"
                                            onError={() => setLogoFailed(true)}
                                        />
                                        <img
                                            src={assets.loadingLogo}
                                            alt=""
                                            className="lsx__logo lsx__logo--back"
                                            width="110"
                                            height="110"
                                            onError={() => setLogoFailed(true)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Typewriter headline. Ghost span reserves final width so
                            the box doesn't reflow as characters appear. */}
                        <p className="lsx__headline" aria-label={HEADLINE}>
                            <span className="lsx__headline-ghost" aria-hidden="true">{HEADLINE}</span>
                            <span className="lsx__headline-text" aria-hidden="true">
                                {typed}
                                <span className="lsx__caret" />
                            </span>
                        </p>

                        {/* Loading line — fills left → right, gold glint travels through */}
                        <div className="lsx__loader" aria-hidden="true">
                            <div className="lsx__loader-track">
                                <div className="lsx__loader-fill" />
                                <div className="lsx__loader-glint" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;

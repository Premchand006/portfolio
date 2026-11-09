import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { identity } from '../config';
import './MultilingualHeadline.css';

const welcomeLanguages = identity.welcomeLanguages;

/* ─────────────────────────────────────────────────────────────
   MultilingualHeadline — hero typewriter that cycles through
   `identity.welcomeLanguages` from site.config.json. For each language:
     1. types in grapheme-by-grapheme (uses Intl.Segmenter so Indic
        scripts with combining marks render correctly)
     2. holds for HOLD_MS
     3. deletes grapheme-by-grapheme
     4. moves to the next language

   A small uppercase label below names the current language in
   --accent-gold @ 40% opacity, fading with each cycle.
   ───────────────────────────────────────────────────────────── */

const TYPE_MS = 78;
const DELETE_MS = 45;
const HOLD_MS = 2000;
const PAUSE_BETWEEN_MS = 360;

/* Grapheme-aware splitter. Falls back to Array.from where Segmenter
   is unavailable (older Safari). For pure ASCII like English the two
   approaches produce identical results. */
const splitGraphemes = (str) => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        return Array.from(seg.segment(str), (s) => s.segment);
    }
    return Array.from(str);
};

const MultilingualHeadline = () => {
    const [text, setText] = useState('');
    const [langIndex, setLangIndex] = useState(0);
    const [labelVisible, setLabelVisible] = useState(true);
    const [fit, setFit] = useState(1);
    const timeoutRef = useRef(null);
    const measureRef = useRef(null);

    const current = welcomeLanguages[langIndex] || welcomeLanguages[0];

    /* ── Single-line auto-fit ───────────────────────────────────────
       Each greeting must stay on ONE line. Scripts vary wildly in
       length (e.g. Hindi / Malayalam are far longer than English), so
       instead of hardcoding a size per language we measure the full
       phrase at the natural font size and scale the headline down only
       when it would overflow the viewport. Recomputed on phrase change,
       on resize, and once web fonts finish loading. */
    useLayoutEffect(() => {
        const measure = measureRef.current;
        if (!measure) return;
        let cancelled = false;

        const compute = () => {
            if (cancelled) return;
            const full = measure.getBoundingClientRect().width;
            if (!full) return;
            const gutter = Math.max(24, window.innerWidth * 0.06);
            const available = window.innerWidth - gutter * 2;
            setFit(full > available ? available / full : 1);
        };

        compute();
        window.addEventListener('resize', compute);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(compute);
        }

        return () => {
            cancelled = true;
            window.removeEventListener('resize', compute);
        };
    }, [current.text]);

    useEffect(() => {
        const graphemes = splitGraphemes(current.text);
        let cancelled = false;
        let i = 0;

        const clear = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

        const typeNext = () => {
            if (cancelled) return;
            if (i < graphemes.length) {
                i += 1;
                setText(graphemes.slice(0, i).join(''));
                timeoutRef.current = setTimeout(typeNext, TYPE_MS);
            } else {
                timeoutRef.current = setTimeout(startDelete, HOLD_MS);
            }
        };

        const startDelete = () => {
            if (cancelled) return;
            setLabelVisible(false);
            deleteNext();
        };

        const deleteNext = () => {
            if (cancelled) return;
            if (i > 0) {
                i -= 1;
                setText(graphemes.slice(0, i).join(''));
                timeoutRef.current = setTimeout(deleteNext, DELETE_MS);
            } else {
                timeoutRef.current = setTimeout(() => {
                    if (cancelled) return;
                    setLangIndex((idx) => (idx + 1) % welcomeLanguages.length);
                    setLabelVisible(true);
                }, PAUSE_BETWEEN_MS);
            }
        };

        timeoutRef.current = setTimeout(typeNext, 80);

        return () => {
            cancelled = true;
            clear();
        };
    }, [langIndex, current.text]);

    return (
        <div className="ml-headline" aria-live="polite">
            {/* Hidden full-phrase probe — always rendered at the natural
                font size so the auto-fit logic can measure true width. */}
            <span ref={measureRef} className="ml-headline__measure" aria-hidden="true">
                {current.text}
            </span>
            <h1
                className="ml-headline__title display-xl home__title--shadow"
                lang={current.code.toLowerCase()}
                style={{ fontSize: `calc(clamp(2.5rem, 8vw, 6rem) * ${fit})` }}
            >
                <span className="ml-headline__text">{text}</span>
                <span className="ml-headline__caret" aria-hidden="true" />
            </h1>
            <span
                className={`ml-headline__lang${labelVisible ? ' is-visible' : ''}`}
                aria-hidden="true"
            >
                {current.code}
            </span>
        </div>
    );
};

export default MultilingualHeadline;

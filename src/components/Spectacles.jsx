import { useEffect, useRef } from 'react';
import './Spectacles.css';

/* ── Spectacles ──────────────────────────────────────────────────
   A pair of round, gold wire-frame glasses on a black panel. Each
   lens holds an eyeball whose pupil follows the cursor — the gaze is
   computed per-eye from the pointer's screen position, eased for a
   smooth, lifelike track. Pure decoration; pauses when off-screen and
   freezes (centred gaze) under prefers-reduced-motion.
   ───────────────────────────────────────────────────────────────── */

// Geometry in SVG user units (viewBox 0 0 400 210).
const MAX_TRAVEL = 18;   // furthest the pupil drifts from lens centre
const EASE_DIST  = 240;  // px of cursor distance over which gaze ramps to full
const LERP       = 0.18; // pupil follow smoothing

const Spectacles = () => {
    const wrapRef        = useRef(null);
    const leftLensRef    = useRef(null);
    const rightLensRef   = useRef(null);
    const leftPupilRef   = useRef(null);
    const rightPupilRef  = useRef(null);
    const targetRef      = useRef({ x: -9999, y: -9999 });
    const rafRef         = useRef(0);
    const runningRef     = useRef(false);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

        const reduced = false;

        // Current (eased) pupil offsets per eye.
        const cur = { l: { x: 0, y: 0 }, r: { x: 0, y: 0 } };

        const onMove = (e) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
        };

        const gaze = (lensEl, state, pupilEl) => {
            const rect = lensEl.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = targetRef.current.x - cx;
            const dy = targetRef.current.y - cy;
            const dist = Math.hypot(dx, dy) || 1;
            const ramp = Math.min(1, dist / EASE_DIST);
            const ox = (dx / dist) * MAX_TRAVEL * ramp;
            const oy = (dy / dist) * MAX_TRAVEL * ramp;
            state.x += (ox - state.x) * LERP;
            state.y += (oy - state.y) * LERP;
            pupilEl.setAttribute('transform', `translate(${state.x.toFixed(2)} ${state.y.toFixed(2)})`);
        };

        const loop = () => {
            if (leftLensRef.current && leftPupilRef.current) gaze(leftLensRef.current, cur.l, leftPupilRef.current);
            if (rightLensRef.current && rightPupilRef.current) gaze(rightLensRef.current, cur.r, rightPupilRef.current);
            if (runningRef.current) rafRef.current = requestAnimationFrame(loop);
        };

        if (reduced) return; // leave pupils centred

        window.addEventListener('mousemove', onMove, { passive: true });

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !runningRef.current) {
                        runningRef.current = true;
                        rafRef.current = requestAnimationFrame(loop);
                    } else if (!entry.isIntersecting) {
                        runningRef.current = false;
                        cancelAnimationFrame(rafRef.current);
                    }
                });
            },
            { threshold: 0.05 }
        );
        io.observe(wrap);

        return () => {
            io.disconnect();
            window.removeEventListener('mousemove', onMove);
            runningRef.current = false;
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <aside
            ref={wrapRef}
            className="specs-panel"
            aria-label="A pair of spectacles whose eyes follow your cursor"
        >
            <svg
                className="specs-svg"
                viewBox="0 0 400 210"
                role="img"
                aria-hidden="true"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <radialGradient id="specsSclera" cx="40%" cy="35%" r="70%">
                        <stop offset="0%"   stopColor="#ffffff" />
                        <stop offset="65%"  stopColor="#ececee" />
                        <stop offset="100%" stopColor="#bfbfc6" />
                    </radialGradient>
                    <radialGradient id="specsIris" cx="38%" cy="32%" r="75%">
                        <stop offset="0%"   stopColor="#3a3a3a" />
                        <stop offset="55%"  stopColor="#141414" />
                        <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                </defs>

                {/* ── Eyeballs (behind the frame) ─────────────────── */}
                <g className="specs-eye">
                    {/* Left */}
                    <circle ref={leftLensRef} cx="118" cy="105" r="40" fill="url(#specsSclera)" />
                    <g ref={leftPupilRef}>
                        <circle cx="118" cy="105" r="18" fill="url(#specsIris)" />
                        <circle cx="126" cy="96" r="5.5" fill="#ffffff" opacity="0.85" />
                        <circle cx="112" cy="112" r="2.2" fill="#ffffff" opacity="0.35" />
                    </g>

                    {/* Right */}
                    <circle ref={rightLensRef} cx="282" cy="105" r="40" fill="url(#specsSclera)" />
                    <g ref={rightPupilRef}>
                        <circle cx="282" cy="105" r="18" fill="url(#specsIris)" />
                        <circle cx="290" cy="96" r="5.5" fill="#ffffff" opacity="0.85" />
                        <circle cx="276" cy="112" r="2.2" fill="#ffffff" opacity="0.35" />
                    </g>
                </g>

                {/* ── Gold wire frame (on top of the eyes) ────────── */}
                <g
                    className="specs-frame"
                    fill="none"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Lenses */}
                    <circle cx="118" cy="105" r="72" />
                    <circle cx="282" cy="105" r="72" />
                    {/* Bridge — shallow keyhole bow between the lenses */}
                    <path d="M 190 98 Q 200 80 210 98" />
                    {/* Temple arms */}
                    <path d="M 47 96 L 8 87" />
                    <path d="M 353 96 L 392 87" />
                    {/* Hinges */}
                    <circle cx="48" cy="97" r="3.4" fill="currentColor" stroke="none" />
                    <circle cx="352" cy="97" r="3.4" fill="currentColor" stroke="none" />
                </g>
            </svg>
        </aside>
    );
};

export default Spectacles;

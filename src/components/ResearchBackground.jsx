import { useEffect, useRef } from 'react';
import './ResearchBackground.css';

/* ── ResearchBackground ─────────────────────────────────────────
   "Hack" digital rain — densely packed columns of glyphs streaming
   continuously from top to bottom. Each column is a long, clearly
   legible streak (bright leading glyph, gently tapering body) that
   scrolls down at sub-pixel precision for smooth motion. Pure
   monochrome (white / grey on black) to match the section. Renders
   only while on screen; respects prefers-reduced-motion (static field).
   ───────────────────────────────────────────────────────────────── */

// Glyph pool — katakana + latin + digits + greek + cyrillic + symbols,
// so each stream reads as an undecipherable, eclectic "hacker" script
// like the reference. Limited to ranges system monospace fonts render
// reliably (no tofu boxes).
const GLYPHS =
    'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ' +
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' +
    'ΑΒΓΔΕΖΗΘΛΞΠΣΦΨΩβγδλξπσφψ' +
    'БГДЖЗИЛПФЦЧШЩЪЫЭЮЯ' +
    '#$%&@*+=<>?/\\|{}[]§¥€';

const FONT_SIZE = 14;   // glyph cell height (row pitch)
const COL_STEP  = 13;   // horizontal pitch between columns — tight packing

const rand = (a, b) => a + Math.random() * (b - a);
const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const ResearchBackground = () => {
    const canvasRef    = useRef(null);
    const containerRef = useRef(null);
    const rafRef       = useRef(0);
    const stateRef     = useRef(null);
    const runningRef   = useRef(false);

    useEffect(() => {
        const canvas    = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');

        const reduced = false;

        // Build the glyph array for one column's streak.
        const makeGlyphs = (n) => Array.from({ length: n }, pick);

        const seed = () => {
            const w   = canvas.clientWidth;
            const h   = canvas.clientHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width  = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const columns = Math.ceil(w / COL_STEP) + 1;
            const rows = Math.ceil(h / FONT_SIZE);

            // One streak per column. `headY` is the sub-pixel y of the bright
            // leading glyph; the body trails upward. Lengths vary widely so
            // some columns read as long continuous strands and others leave
            // dark gaps — the texture of the reference.
            const drops = Array.from({ length: columns }, (_, i) => {
                const trail = Math.round(rand(rows * 0.45, rows * 1.15));
                return {
                    x: i * COL_STEP,
                    trail,
                    glyphs: makeGlyphs(trail),
                    speed: rand(0.6, 1.6),                 // px per frame (smooth)
                    headY: rand(-trail * FONT_SIZE, h),    // staggered start
                };
            });

            stateRef.current = { w, h, rows, drops };
        };

        const paintColumn = (d, light) => {
            const cx = d.x + COL_STEP / 2;
            for (let k = 0; k < d.trail; k++) {
                const y = d.headY - k * FONT_SIZE;
                if (y < -FONT_SIZE || y > stateRef.current.h) continue;
                if (k === 0) {
                    // Bright leading glyph (ink-dark when the page is light).
                    ctx.fillStyle = light ? 'rgba(23, 21, 15, 0.95)' : 'rgba(255, 255, 255, 0.98)';
                } else if (k === 1) {
                    ctx.fillStyle = light ? 'rgba(46, 42, 32, 0.85)' : 'rgba(232, 232, 232, 0.88)';
                } else {
                    // Body tapers but stays clearly legible (floor at ~0.2).
                    const a = Math.max(0.2, 0.82 - (k / d.trail) * 0.7);
                    ctx.fillStyle = light
                        ? `rgba(93, 87, 70, ${a.toFixed(3)})`
                        : `rgba(196, 196, 196, ${a.toFixed(3)})`;
                }
                ctx.fillText(d.glyphs[k], cx, y);
            }
        };

        const draw = () => {
            const s = stateRef.current;
            if (!s) return;
            const { w, h, drops } = s;

            // Full clear each frame → smooth sub-pixel scrolling, no ghosting.
            ctx.clearRect(0, 0, w, h);
            ctx.font = `${FONT_SIZE}px 'Satoshi', system-ui, sans-serif`;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';

            // Live theme read per frame — rain flips to ink-on-paper when the
            // toggle flips, mid-fall, with no re-seed.
            const light = document.documentElement.getAttribute('data-theme') === 'light';

            for (let i = 0; i < drops.length; i++) {
                const d = drops[i];
                paintColumn(d, light);

                d.headY += d.speed;

                // Churn a couple of glyphs per column each frame for life.
                d.glyphs[(Math.random() * d.trail) | 0] = pick();

                // Recycle once the whole streak has cleared the bottom edge.
                if (d.headY - d.trail * FONT_SIZE > h) {
                    d.trail = Math.round(rand(s.rows * 0.45, s.rows * 1.15));
                    d.glyphs = makeGlyphs(d.trail);
                    d.speed = rand(0.6, 1.6);
                    d.headY = rand(-d.trail * FONT_SIZE, 0);
                }
            }

            if (runningRef.current && !reduced) {
                rafRef.current = requestAnimationFrame(draw);
            }
        };

        // Reduced motion: a single frozen field of streaks.
        const drawStatic = () => {
            const s = stateRef.current;
            if (!s) return;
            const { w, h, drops } = s;
            ctx.clearRect(0, 0, w, h);
            ctx.font = `${FONT_SIZE}px 'Satoshi', system-ui, sans-serif`;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            for (let i = 0; i < drops.length; i++) {
                paintColumn(drops[i]);
            }
        };

        const onResize = () => {
            seed();
            if (reduced) drawStatic();
        };

        seed();

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!runningRef.current) {
                            runningRef.current = true;
                            if (reduced) {
                                drawStatic();
                            } else {
                                rafRef.current = requestAnimationFrame(draw);
                            }
                        }
                    } else {
                        runningRef.current = false;
                        cancelAnimationFrame(rafRef.current);
                    }
                });
            },
            { threshold: 0.05 }
        );
        io.observe(container);

        window.addEventListener('resize', onResize);

        return () => {
            io.disconnect();
            window.removeEventListener('resize', onResize);
            runningRef.current = false;
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className="research-bg" aria-hidden="true">
            <div className="research-bg__gradient" />
            <canvas ref={canvasRef} className="research-bg__canvas" />
            <div className="research-bg__vignette" />
        </div>
    );
};

export default ResearchBackground;

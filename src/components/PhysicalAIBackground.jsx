import { useEffect, useRef } from 'react';
import './PhysicalAIBackground.css';

/* ── PhysicalAIBackground ─────────────────────────────────────────
   A canvas-driven backdrop scoped to the Tech Stack section.
   Three layered effects:
     1. Sparse vertical "data rain" pixel streams — distant signal.
     2. A central braid of slow, breathing neural curves with glow
        packets travelling along them — physical-AI dataflow.
     3. Drifting bokeh particles for depth.
   Renders only while the host section is intersecting the viewport.
   Respects prefers-reduced-motion (renders one static frame instead).
   ───────────────────────────────────────────────────────────────── */

const STREAM_SPACING = 38;       // px between vertical rain columns
const STREAM_DROP_LEN = 14;      // drops per column
const CURVE_COUNT = 6;           // braid lines through the center
const PACKET_PER_CURVE = 2;      // glow packets travelling each curve
const PARTICLE_COUNT = 28;

const rand = (a, b) => a + Math.random() * (b - a);

const PhysicalAIBackground = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const rafRef = useRef(0);
    const stateRef = useRef(null);
    const runningRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');

        const reduced = false;

        /* ── Initialise sim state for current canvas size ──────── */
        const seed = () => {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Vertical data rain
            const colCount = Math.ceil(w / STREAM_SPACING);
            const streams = Array.from({ length: colCount }, (_, i) => ({
                x: i * STREAM_SPACING + rand(-6, 6),
                speed: rand(18, 55),       // px/s
                offset: rand(0, h),        // initial scroll offset
                gap: rand(6, 16),          // px between dots
                brightAt: Math.floor(rand(0, STREAM_DROP_LEN)),
                dim: rand(0.04, 0.16),     // base alpha for normal dots
            }));

            // Central braid — 6 curves drawn each frame from a set of
            // anchor control points that drift on slow sine waves
            const curves = Array.from({ length: CURVE_COUNT }, (_, i) => {
                const cxBase = w / 2 + (i - (CURVE_COUNT - 1) / 2) * 22;
                return {
                    cxBase,
                    amp: rand(60, 130),
                    freq: rand(0.6, 1.4),
                    phase: rand(0, Math.PI * 2),
                    thickness: rand(0.6, 1.4),
                    alpha: rand(0.08, 0.22),
                    packets: Array.from({ length: PACKET_PER_CURVE }, () => ({
                        t: Math.random(),
                        speed: rand(0.06, 0.13),
                        size: rand(1.6, 3.0),
                    })),
                };
            });

            const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: rand(1.6, 3.2),
                vy: -rand(2, 9),
                vx: rand(-2, 2),
                hue: rand(180, 200),
                alpha: rand(0.18, 0.55),
                twinkle: rand(0, Math.PI * 2),
            }));

            stateRef.current = { w, h, streams, curves, particles, t0: performance.now() };
        };

        /* ── Per-frame draw ─────────────────────────────────────── */
        const draw = (nowMs) => {
            const s = stateRef.current;
            if (!s) return;
            const { w, h, streams, curves, particles, t0 } = s;
            const t = (nowMs - t0) / 1000;

            // Clear the canvas each frame to prevent a semi-transparent overlay from fading the background image
            ctx.clearRect(0, 0, w, h);
            const light = document.documentElement.getAttribute('data-theme') === 'light';

            /* Layer 1 — vertical data rain (Removed) */

            /* Layer 2 — neural braid curves with travelling packets */
            ctx.save();
            ctx.lineCap = 'round';
            for (const c of curves) {
                // Sample 24 points along a vertical span, x perturbed by sin(t)
                const steps = 28;
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const py = (i / steps) * h;
                    const wave = Math.sin((py / h) * Math.PI * c.freq + t * 0.55 + c.phase);
                    const px = c.cxBase + wave * c.amp;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                // Main stroke — soft white at night, warm ink in daylight
                ctx.lineWidth = c.thickness;
                ctx.strokeStyle = light
                    ? `rgba(58, 54, 44, ${c.alpha})`
                    : `rgba(235, 235, 235, ${c.alpha})`;
                ctx.shadowColor = light ? 'rgba(93, 0, 24, 0.35)' : 'rgba(255, 255, 255, 0.45)';
                ctx.shadowBlur = 6;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Packets — bright glows sliding along
                for (const pkt of c.packets) {
                    pkt.t += pkt.speed * (1 / 60);
                    if (pkt.t > 1) pkt.t -= 1;
                    const py = pkt.t * h;
                    const wave = Math.sin((py / h) * Math.PI * c.freq + t * 0.55 + c.phase);
                    const px = c.cxBase + wave * c.amp;
                    const grd = ctx.createRadialGradient(px, py, 0, px, py, pkt.size * 5);
                    if (light) {
                        // Burgundy signal pulses travelling along ink braids.
                        grd.addColorStop(0, 'rgba(93, 0, 24, 0.85)');
                        grd.addColorStop(0.35, 'rgba(93, 0, 24, 0.35)');
                        grd.addColorStop(1, 'rgba(93, 0, 24, 0)');
                    } else {
                        grd.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                        grd.addColorStop(0.35, 'rgba(220, 220, 220, 0.5)');
                        grd.addColorStop(1, 'rgba(180, 180, 180, 0)');
                    }
                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.arc(px, py, pkt.size * 5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = light ? 'rgba(93, 0, 24, 0.9)' : 'rgba(255, 255, 255, 0.95)';
                    ctx.beginPath();
                    ctx.arc(px, py, pkt.size * 0.65, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();

            /* Layer 3 — bokeh particles (Removed) */

            if (runningRef.current && !reduced) {
                rafRef.current = requestAnimationFrame(draw);
            }
        };

        /* ── Resize handling ────────────────────────────────────── */
        const onResize = () => {
            seed();
            if (reduced) draw(performance.now());
        };

        seed();

        /* ── Gate the rAF loop on section visibility ────────────── */
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!runningRef.current) {
                            runningRef.current = true;
                            if (reduced) {
                                draw(performance.now());
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
        <div ref={containerRef} className="phys-ai-bg" aria-hidden="true">
            <div className="phys-ai-bg__gradient" />
            <canvas ref={canvasRef} className="phys-ai-bg__canvas" />
            <div className="phys-ai-bg__vignette" />
        </div>
    );
};

export default PhysicalAIBackground;

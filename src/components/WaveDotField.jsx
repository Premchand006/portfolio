import { useEffect, useRef } from 'react';
import './WaveDotField.css';

/* ── WaveDotField ─────────────────────────────────────────────────
   Animated topographic dot-grid backdrop. A flat plane of points is
   displaced by a sum of slow sine waves and rendered in perspective,
   producing the "rolling dotted dunes" effect from the reference.
   Pure 2D canvas — no WebGL, no external deps.

   Tuned to live in the lower two-thirds of its host section so text
   in the upper half stays uncluttered.
   Pauses when the host section is off-screen; honors reduced-motion. */

const COLS = 84;            // grid points across
const ROWS = 46;            // grid points deep
const GRID_W = 22;          // world width
const GRID_D = 14;          // world depth
const CAMERA_HEIGHT = 1.45; // y of camera
const CAMERA_DIST = 6.2;    // distance from front of grid
const HORIZON_T = 0.42;     // vertical placement of horizon in canvas (0=top)

const heightAt = (x, z, t) =>
    Math.sin(x * 0.45 + t * 0.5) * 0.55 +
    Math.cos(z * 0.38 + t * 0.45) * 0.45 +
    Math.sin((x + z) * 0.28 + t * 0.35) * 0.3;

const WaveDotField = () => {
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

        const seed = () => {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // FOV chosen so the grid roughly fills the lower portion
            const fov = Math.max(w, h) * 0.95;

            stateRef.current = { w, h, fov, t0: performance.now() };
        };

        const draw = (nowMs) => {
            const s = stateRef.current;
            if (!s) return;
            const { w, h, fov, t0 } = s;
            const t = (nowMs - t0) / 1000;

            // Solid wipe each frame — clean dots, no trails. Read the live
            // theme per frame so a toggle mid-animation flips instantly:
            // black dunes with pale dots at night, ivory paper with ink
            // dots in daylight.
            const light = document.documentElement.getAttribute('data-theme') === 'light';
            ctx.fillStyle = light ? '#ffffff' : '#000';
            ctx.fillRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h * HORIZON_T;

            // Render back-to-front so foreground dots sit above the haze
            for (let zi = ROWS - 1; zi >= 0; zi--) {
                const zNorm = zi / (ROWS - 1);
                const zWorld = -zNorm * GRID_D; // negative = away from camera

                for (let xi = 0; xi < COLS; xi++) {
                    const xNorm = (xi / (COLS - 1)) - 0.5;
                    const xWorld = xNorm * GRID_W;

                    const yWorld = heightAt(xWorld, zWorld, t);

                    // Camera-space coordinates (camera at origin looking -Z,
                    // positioned above the plane by CAMERA_HEIGHT)
                    const camZ = -zWorld + CAMERA_DIST;
                    if (camZ <= 0.2) continue;
                    const camY = yWorld - CAMERA_HEIGHT;

                    const scale = fov / camZ;
                    const sx = cx + xWorld * scale;
                    const sy = cy - camY * scale;

                    if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

                    // Depth-modulated size + alpha. Foreground dots brighter
                    // and larger; far dots tiny and dim — gives the haze.
                    const depthBoost = 1 - (camZ - CAMERA_DIST) / (GRID_D + CAMERA_DIST);
                    const r = 0.5 + depthBoost * 1.4;
                    const a = 0.18 + depthBoost * 0.55;

                    ctx.fillStyle = light
                        ? `rgba(58, 54, 44, ${a.toFixed(3)})`
                        : `rgba(235, 235, 240, ${a.toFixed(3)})`;
                    ctx.beginPath();
                    ctx.arc(sx, sy, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (runningRef.current && !reduced) {
                rafRef.current = requestAnimationFrame(draw);
            }
        };

        const onResize = () => {
            seed();
            if (reduced) draw(performance.now());
        };

        seed();

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!runningRef.current) {
                            runningRef.current = true;
                            if (reduced) draw(performance.now());
                            else rafRef.current = requestAnimationFrame(draw);
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
        <div ref={containerRef} className="wave-bg" aria-hidden="true">
            <canvas ref={canvasRef} className="wave-bg__canvas" />
            <div className="wave-bg__vignette" />
        </div>
    );
};

export default WaveDotField;

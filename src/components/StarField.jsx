import { useEffect, useState } from 'react';
import './StarField.css';

/**
 * StarField — fixed full-viewport layer of twinkling pinpoint stars.
 *
 * The field is regenerated from scratch (random COUNT, random POSITIONS
 * and a random COLOUR per star) every time it is "freshly seen":
 *   • on first mount / page reload, and
 *   • whenever the watched section (`#home` by default) scrolls back into
 *     view after having left it.
 *
 * Each star picks one of four colours — Blue, Red, Yellow, White — and
 * carries a matching glow so the halo never clashes with the core. Stars
 * are 1–4.5px, twinkle on staggered CSS animations, and animate only
 * opacity + transform so the layer stays GPU-composited.
 */
// Colour mix is weighted, not uniform: White 45%, Blue 35%, Red 10%, Yellow 10%.
// `weight` values are relative and need not sum to 1 — pickColor normalises.
// One palette for both themes: the field only shows on the home section,
// which keeps its black space backdrop even in light mode.
const STAR_COLORS = [
    { core: '#ffffff', glow: '255, 255, 255', weight: 60 }, // White
    { core: '#6fa8ff', glow: '110, 168, 255', weight: 20 }, // Blue
    { core: '#fc251a', glow: '255, 91, 82', weight: 10 },   // Red
    { core: '#fcda60', glow: '255, 216, 77', weight: 10 },  // Yellow
];

const TOTAL_WEIGHT = STAR_COLORS.reduce((sum, c) => sum + c.weight, 0);

// Weighted pick: walk the palette subtracting each weight until the roll lands.
const pickColor = () => {
    let roll = Math.random() * TOTAL_WEIGHT;
    for (const color of STAR_COLORS) {
        roll -= color.weight;
        if (roll < 0) return color;
    }
    return STAR_COLORS[0]; // fallback (floating-point edge)
};

const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

const generateStars = (min, max) => {
    const count = randInt(min, max);
    return Array.from({ length: count }, (_, i) => {
        const sizeRoll = Math.random();
        const size = sizeRoll < 0.7 ? 2 : sizeRoll < 0.95 ? 3 : 4.5;
        const opacity = 0.35 + Math.random() * 0.5;   // 0.35 – 0.85
        const color = pickColor();
        return {
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size,
            opacity,
            core: color.core,
            glow: color.glow,
            // Slow, well-staggered blink so the field reads as a calm
            // twinkle rather than a fast flicker.
            delay: Math.random() * 10,
            duration: 6 + Math.random() * 8,   // 6s – 14s per blink cycle
        };
    });
};

const StarField = ({ min = 20, max = 25, watch = '#home' }) => {
    const [stars, setStars] = useState(() => generateStars(min, max));

    // Regenerate the whole field when the watched section returns to view.
    useEffect(() => {
        const target = document.querySelector(watch);
        if (!target) return;

        // Home is on-screen at load (the initial field is already generated),
        // so only a genuine "left → came back" transition should regenerate.
        let wasVisible = true;
        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting;
                if (visible && !wasVisible) {
                    setStars(generateStars(min, max));
                }
                wasVisible = visible;
            },
            { threshold: 0.25 },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [min, max, watch]);

    return (
        <div className="starfield" aria-hidden="true">
            {stars.map((s) => (
                <span
                    key={s.id}
                    className="starfield__star"
                    style={{
                        top: `${s.top}%`,
                        left: `${s.left}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        background: s.core,
                        '--star-opacity': s.opacity,
                        '--star-glow': s.glow,
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default StarField;

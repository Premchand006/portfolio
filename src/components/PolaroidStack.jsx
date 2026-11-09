import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { assets } from '../config';
import './PolaroidStack.css';

/* Photos come from `assets.portraits` in site.config.json (single source of
   truth — the mobile hero reads the same list). `tilt` is the resting angle of
   each card when it is the active (pinned) one; kept here as a design constant.
   Falls back to the bundled portraits if the config list is ever empty. */
const TILTS = [-4, 3, -2];
const PORTRAITS = (assets.portraits && assets.portraits.length)
    ? assets.portraits
    : ['/assets/portraits/pic1.JPG', '/assets/portraits/pic2.jpg', '/assets/portraits/pic3.png'];
const DEFAULT_POLAROIDS = PORTRAITS.map((src, i) => ({ id: i + 1, src, tilt: TILTS[i] ?? 0 }));

/* Maps a card's offset relative to the active one to its transform. */
const polaroidTransform = (offset, baseTilt = 0) => {
    if (offset === 0) {
        return { x: 0, y: 0, rotate: baseTilt, scale: 1, opacity: 1, filter: 'blur(0px)' };
    }
    // Offsets are expressed as % of the card's OWN size (Framer interprets
    // x/y string '%' relative to the element), so the deck scales with the
    // fluid card width instead of using fixed px that drift on small/large
    // screens. The percentages below match the original px feel at the card's
    // ~440px design width.
    if (offset > 0) {
        // Upcoming — tucked under and below-right, peeking out
        return {
            x: `${6 + offset * 2.3}%`,
            y: `${8 + offset * 3}%`,
            rotate: baseTilt + 6 + offset * 2,
            scale: 0.96 - offset * 0.03,
            opacity: offset <= 2 ? 1 : 0,
            filter: offset <= 1 ? 'blur(0px)' : 'blur(2px)',
        };
    }
    // Past — drift up-left and fade out, slightly more travel for a smoother lift
    return {
        x: `${-20 + offset * 3.2}%`,
        y: `${-19 + offset * 1.3}%`,
        rotate: baseTilt - 10 + offset * 2,
        scale: 0.9 + offset * 0.02,
        opacity: offset >= -2 ? 0.4 : 0,
        filter: 'blur(1.5px)',
    };
};

const PolaroidStack = ({ items = DEFAULT_POLAROIDS }) => {
    const [index, setIndex] = useState(0);
    const wrapRef = useRef(null);
    const lockRef = useRef(false);

    const setSafe = useCallback((next) => {
        if (next < 0 || next >= items.length) return false;
        setIndex(next);
        return true;
    }, [items.length]);

    /* Wheel anywhere on the page advances/retreats through the stack while the
       About section is the active snap target. We swallow the wheel until the
       user reaches the last card (scrolling down) or the first (scrolling up);
       only then does the wheel fall through to the snap container, allowing
       the page to advance to the next / previous section. */
    useEffect(() => {
        const onWheel = (e) => {
            const active = document.documentElement.getAttribute('data-active-section');
            if (active !== 'about') return;

            const dir = e.deltaY > 0 ? 1 : -1;
            const next = index + dir;
            // At the edge in the scroll direction — let the snap container handle it.
            if (next < 0 || next >= items.length) return;

            e.preventDefault();
            e.stopPropagation();
            if (lockRef.current) return;
            lockRef.current = true;
            setTimeout(() => { lockRef.current = false; }, 540);
            setSafe(next);
        };

        window.addEventListener('wheel', onWheel, { passive: false, capture: true });
        return () => window.removeEventListener('wheel', onWheel, { capture: true });
    }, [index, items.length, setSafe]);

    /* Keyboard nav when the stack has focus. */
    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            setSafe(index + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            setSafe(index - 1);
        }
    };

    return (
        <div
            ref={wrapRef}
            className="polaroid-stack"
            role="region"
            aria-label="Photos"
            aria-roledescription="carousel"
            tabIndex={0}
            onKeyDown={onKeyDown}
        >
            {/* Anchor pin — fixed at top, the deck rotates around its world */}
            <div className="polaroid-stack__pin" aria-hidden="true">
                <span className="polaroid-stack__pin-ring" />
                <span className="polaroid-stack__pin-dot" />
            </div>

            <div className="polaroid-stack__deck">
                {items.map((item, i) => {
                    const offset = i - index;
                    const t = polaroidTransform(offset, item.tilt ?? 0);
                    const isActive = offset === 0;
                    return (
                        <motion.figure
                            key={item.id}
                            className={`polaroid${isActive ? ' polaroid--active' : ''}`}
                            initial={false}
                            animate={t}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            style={{ zIndex: 100 - Math.abs(offset) }}
                            aria-hidden={!isActive}
                        >
                            <div className="polaroid__photo">
                                {item.src ? (
                                    <img src={item.src} alt="Portrait" width="600" height="600" loading="lazy" draggable={false} />
                                ) : (
                                    <span className="polaroid__placeholder">
                                        Photo {i + 1}
                                    </span>
                                )}
                            </div>
                        </motion.figure>
                    );
                })}
            </div>

            <div className="polaroid-stack__footer">
                <div className="polaroid-stack__dots" role="tablist" aria-label="Photos">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`polaroid-stack__dot${i === index ? ' is-active' : ''}`}
                            onClick={() => setSafe(i)}
                            aria-label={`Show photo ${i + 1} of ${items.length}`}
                            aria-selected={i === index}
                            role="tab"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PolaroidStack;

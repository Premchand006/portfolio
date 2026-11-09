import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import './MagneticCursor.css';

/**
 * MagneticCursor — custom arrow cursor + a single, site-wide hover
 * language. Every interactive element (a, button, [data-magnetic],
 * .magnetic-item) gets the clockwise `.shine-border` sweep on hover and
 * stays exactly where it is: there is NO magnetic pull, the elements are
 * never translated toward the pointer. The arrow scales up while hovering
 * an interactive target.
 */
const SELECTOR = 'a, button, [data-magnetic], .magnetic-item';

const MagneticCursor = () => {
    /* Raw motion values for zero-latency 1:1 cursor tracking. */
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const [variant, setVariant] = useState('default'); // 'default' | 'hover' | 'click'
    const overRef = useRef(false);

    /* ── Pointer position + press state ── */
    useEffect(() => {
        const onMove = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
        const onDown = () => setVariant('click');
        const onUp = () => setVariant(overRef.current ? 'hover' : 'default');

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
        };
    }, [mouseX, mouseY]);

    /* ── Site-wide hover language ──
       Give every interactive element the shine-border sweep (once, and for
       any element mounted later). We never touch their transform, so they
       stay put. Elements that already use a ::before for their own artwork
       (e.g. the project nav arrows) are skipped so we don't clobber it. */
    useEffect(() => {
        const enhance = (el) => {
            if (el.dataset.shine === '1' || el.hasAttribute('data-no-shine')) return;
            el.dataset.shine = '1';
            const before = window.getComputedStyle(el, '::before').content;
            if (before && before !== 'none') return; // element owns its ::before
            el.classList.add('shine-border');
        };
        const scan = (node) => {
            if (!node || node.nodeType !== 1) return;
            if (node.matches?.(SELECTOR)) enhance(node);
            node.querySelectorAll?.(SELECTOR).forEach(enhance);
        };

        scan(document.body);

        const mo = new MutationObserver((mutations) => {
            for (const m of mutations) m.addedNodes.forEach(scan);
        });
        mo.observe(document.body, { childList: true, subtree: true });

        /* Cursor hover state via delegation — covers dynamic elements too. */
        const onOver = (e) => {
            if (e.target.closest?.(SELECTOR)) { overRef.current = true; setVariant('hover'); }
        };
        const onOut = (e) => {
            if (e.target.closest?.(SELECTOR)) { overRef.current = false; setVariant('default'); }
        };
        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', onOut);

        return () => {
            mo.disconnect();
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
        };
    }, []);

    const isHover = variant === 'hover';
    const isClick = variant === 'click';

    return (
        <motion.div
            className="mc-arrow"
            style={{
                x: mouseX,
                y: mouseY,
            }}
            animate={{
                scale: isClick ? 0.85 : isHover ? 1.15 : 1,
                rotate: isClick ? -10 : 0
            }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25
            }}
        >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className="mc-arrow-gradient-start" />
                        <stop offset="100%" className="mc-arrow-gradient-end" />
                    </linearGradient>
                </defs>
                {/* Arrow Path based on reference image - slanted, rounded arrow */}
                <path
                    d="M15 15L85 45L45 55L35 90L15 15Z"
                    fill="url(#arrowGradient)"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        </motion.div>
    );
};

export default MagneticCursor;

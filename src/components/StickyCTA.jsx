import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cta } from '../config';
import './StickyCTA.css';

/**
 * StickyCTA — primary recruiter conversion surface.
 * Hidden until the user scrolls past the hero (scrollProgress > 0.6),
 * hidden again once they reach the contact section so it doesn't
 * compete with the form.
 *
 * Reads CTA labels from data.json.cta so copy can be tuned without code.
 */
const StickyCTA = ({ containerRef }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const container = containerRef?.current;
        if (!container) return;

        const onScroll = () => {
            const progress = container.scrollTop / container.clientHeight;
            const contactEl = container.querySelector('#contact');
            const contactTop = contactEl ? contactEl.offsetTop : Infinity;
            const nearContact = container.scrollTop + container.clientHeight > contactTop + 200;
            setVisible(progress > 0.6 && !nearContact);
        };
        onScroll();
        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll);
    }, [containerRef]);

    if (!cta?.primary) return null;

    const handleClick = (href) => {
        const container = containerRef?.current;
        if (!container) { window.location.hash = href; return; }
        const target = container.querySelector(href);
        if (target) {
            container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="sticky-cta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    role="complementary"
                    aria-label="Quick actions"
                >
                    {cta.secondary && (
                        <button
                            type="button"
                            className="sticky-cta__btn sticky-cta__btn--secondary"
                            onClick={() => handleClick(cta.secondary.href)}
                            data-magnetic
                        >
                            {cta.secondary.label}
                        </button>
                    )}
                    <button
                        type="button"
                        className="sticky-cta__btn sticky-cta__btn--primary"
                        onClick={() => handleClick(cta.primary.href)}
                        data-magnetic
                    >
                        <span className="sticky-cta__dot" aria-hidden="true" />
                        {cta.primary.label}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StickyCTA;

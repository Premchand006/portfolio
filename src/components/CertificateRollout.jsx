import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { certificates as cfgCertificates, awards } from '../config';
import './CertificateRollout.css';

/**
 * CertificateRollout — full-viewport overlay that "unrolls" each
 * certificate as a paper from a collapsed line, accompanied by gold
 * sparkle stars. Click arrows / dots / arrow keys to navigate. Esc
 * or click backdrop to close.
 *
 * Source data: data.certificates (with fallback to data.awards if
 * certificates is empty so legacy entries still render).
 */

const SPARKLE_COUNT = 14;

/* Random sparkle distribution baked once per certificate-overlay open.
   React purity rules forbid Math.random in render bodies; we use a lazy
   useState initialiser instead so the values are stable across re-renders. */
const generateSparkles = () =>
    Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
        id: i,
        angle: (Math.PI * 2 * i) / SPARKLE_COUNT + (Math.random() - 0.5) * 0.4,
        distance: 60 + Math.random() * 140,
        delay: Math.random() * 0.25,
        size: 2 + Math.random() * 3,
    }));

const Sparkles = () => {
    const [sparkles] = useState(generateSparkles);

    return (
        <div className="cert-sparkles" aria-hidden="true">
            {sparkles.map((s) => {
                const tx = Math.cos(s.angle) * s.distance;
                const ty = Math.sin(s.angle) * s.distance;
                return (
                    <motion.span
                        key={s.id}
                        className="cert-sparkle"
                        style={{ width: s.size, height: s.size }}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                        animate={{ x: tx, y: ty, opacity: [0, 1, 0], scale: [0.4, 1.2, 0] }}
                        transition={{ duration: 1.4, delay: s.delay, ease: [0.22, 1, 0.36, 1] }}
                    />
                );
            })}
        </div>
    );
};

const CertificateRollout = ({ open, onClose, startIndex = 0 }) => {
    const certificates =
        (Array.isArray(cfgCertificates) && cfgCertificates.length > 0)
            ? cfgCertificates
            : (awards || []).map((a, i) => ({
                id: a.id || `aw${i}`,
                title: a.title,
                issuer: a.organization || a.description || '',
                date: '',
                url: '',
            }));

    const [idx, setIdx] = useState(startIndex);
    const total = certificates.length;
    const current = certificates[idx];

    /* When opening, snap back to startIndex (usually 0). */
    useEffect(() => {
        if (open) {
            setIdx(startIndex);
        }
    }, [open, startIndex]);

    /* Keyboard nav while overlay is open */
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
            else if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, total - 1));
            }
            else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, total, onClose]);

    /* Body scroll lock while overlay is open */
    useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = prev; };
        }
    }, [open]);

    const next = useCallback(() => {
        if (idx >= total - 1) return;
        setIdx((i) => i + 1);
    }, [idx, total]);

    const prev = useCallback(() => {
        if (idx <= 0) return;
        setIdx((i) => i - 1);
    }, [idx]);

    const openLink = useCallback(() => {
        if (!current?.url) return;
        window.open(current.url, '_blank', 'noopener,noreferrer');
    }, [current]);

    return (
        <AnimatePresence>
            {open && current && (
                <motion.div
                    className="cert-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Certificate ${idx + 1} of ${total}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={onClose}
                >
                    <div className="cert-overlay__grain" aria-hidden="true" />

                    {/* Stage — Paper unrolls top/bottom from a centred line */}
                    <div className="cert-stage" onClick={(e) => e.stopPropagation()}>
                        <AnimatePresence mode="wait">
                            <motion.article
                                key={current.id}
                                className="cert-paper"
                                initial={{ scaleY: 0, opacity: 0 }}
                                animate={{ scaleY: 1, opacity: 1 }}
                                exit={{ scaleY: 0.04, opacity: 0 }}
                                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                                style={{ transformOrigin: '50% 50%' }}
                            >
                                <Sparkles />

                                <div className="cert-paper__rule cert-paper__rule--top" aria-hidden="true" />
                                <div className="cert-paper__rule cert-paper__rule--bottom" aria-hidden="true" />

                                <motion.div
                                    className="cert-paper__content"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.55 }}
                                >
                                    <span className="cert-paper__eyebrow">Certificate · {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
                                    <h2 className="cert-paper__title">{current.title}</h2>
                                    <p className="cert-paper__issuer">{current.issuer}</p>
                                    {current.date && (
                                        <p className="cert-paper__date">{current.date}</p>
                                    )}

                                    {/* Optional certificate image if uploaded */}
                                    {current.image && (
                                        <img
                                            src={current.image}
                                            alt=""
                                            className="cert-paper__image"
                                            width="800"
                                            height="1000"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            loading="lazy"
                                        />
                                    )}

                                    {current.url && (
                                        <button
                                            type="button"
                                            className="cert-paper__cta"
                                            onClick={openLink}
                                        >
                                            Verify certificate <span aria-hidden="true">↗</span>
                                        </button>
                                    )}
                                </motion.div>

                                {/* Decorative wax-seal mark */}
                                <span className="cert-paper__seal" aria-hidden="true">
                                    <svg viewBox="0 0 48 48" width="42" height="42">
                                        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                        <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                        <path d="M24 14 L26 22 L34 22 L28 27 L30 35 L24 30 L18 35 L20 27 L14 22 L22 22 Z" fill="currentColor" />
                                    </svg>
                                </span>
                            </motion.article>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="cert-nav" aria-label="Certificate navigation">
                            <button
                                type="button"
                                className="cert-nav__arrow"
                                onClick={prev}
                                disabled={idx === 0}
                                aria-label="Previous certificate"
                            >
                                ←
                            </button>
                            <div className="cert-nav__dots" role="tablist">
                                {certificates.map((c, i) => (
                                    <button
                                        key={c.id || i}
                                        type="button"
                                        className={`cert-nav__dot${i === idx ? ' is-active' : ''}`}
                                        onClick={() => setIdx(i)}
                                        aria-label={`Go to certificate ${i + 1}`}
                                        aria-current={i === idx}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                className="cert-nav__arrow"
                                onClick={next}
                                disabled={idx >= total - 1}
                                aria-label="Next certificate"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    <button type="button" className="cert-close" onClick={onClose} aria-label="Close certificates">
                        ✕
                        <span className="cert-close__hint">ESC</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CertificateRollout;

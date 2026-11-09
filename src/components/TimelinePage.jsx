import {
    useEffect, useLayoutEffect, useRef, useState, useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { timeline, identity, navigation, assets } from '../config';
import DinoRunner from './DinoRunner';
import './TimelinePage.css';

/**
 * Fallback items matching the exact demo data in timeline-component
 */
const DEFAULT_ITEMS = [
    {
        status: 'Winner',
        date: '26-28 Mar 2026',
        title: 'AI & Innovation at NEGC 2026, USTM',
        description: 'AI & Innovation — Awarded competition conducted during North East Graduate Congress-2026 held at University of Science & Technology Meghalaya from 26th–28th March, 2026.',
        images: [
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/AI%20%26%20Inno%202026%20-%201st.webp',
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/AI%20%26%20Inno%20-%201.webp',
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/AI%20%26%20Inno%20-%202.webp'
        ]
    },
    {
        status: 'Winner',
        date: '11-14 Mar 2026',
        title: 'Prajukti 2026 GCU Hackathon',
        description: 'Prajukti 2026 GCU Hackathon held during GCU Varsity Week: EUPHUISM 2026 (Roots and Resilience) from 11th to 14th March, 2026.',
        images: [
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/Prajukti%202026%20-%201st.webp',
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/Prajukti%20-%201.webp',
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/Prajukti%20-%202.webp'
        ]
    },
    {
        status: 'First Runner Up',
        date: '26 Feb 2026',
        title: 'Codestellation, under CodeWar 7.0 at AEC',
        description: 'This Hackathon was held by Assam Engineering College (AEC) under CodeWar 7.0 part of Pyrokinesis 2026 organised by Coding Club, AEC named as Codestellation on 26 Feb 2026.',
        images: [
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/CodeWar%202026%20-%202nd.webp',
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/CodeWar%20-%201.webp',
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/CodeWar%20-%202.webp'
        ]
    },
    {
        status: 'Winner',
        date: '27 Nov 2024',
        title: 'Ideathon — Where Ideas Compile',
        description: 'First place at the Ideathon competition — a stage where raw ideas meet real execution. Pitched a solution that stood out from the crowd and brought home the win.',
        images: [
            'https://pub-fe9b85f97c6a4773bbf0ceb5f53c430b.r2.dev/achievement/Idea%20Comp%202024%20-%201st.webp'
        ]
    }
];

/* ── Ribbon / Award Icon (matching timeline-component SVG) ── */
const AwardRibbonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
);

/* ── Image Slider Component ───────────────────────────────────── */
const TimelineSlider = ({ images, title, onOpenModal }) => {
    const pics = (images || []).filter(Boolean);
    const [current, setCurrent] = useState(0);
    const [prevIdx, setPrevIdx] = useState(null);
    const [direction, setDirection] = useState('next');
    const [isAnimating, setIsAnimating] = useState(false);
    const timerRef = useRef(null);

    const isSingle = pics.length <= 1;

    const goTo = useCallback((newIdx, dir = 'next') => {
        if (isAnimating || isSingle || !pics.length) return;
        setIsAnimating(true);
        setPrevIdx(current);
        setDirection(dir);
        setCurrent((newIdx + pics.length) % pics.length);
        setTimeout(() => {
            setIsAnimating(false);
            setPrevIdx(null);
        }, 650);
    }, [current, pics.length, isAnimating, isSingle]);

    useEffect(() => {
        if (isSingle) return undefined;
        timerRef.current = setInterval(() => {
            goTo(current + 1, 'next');
        }, 5000);
        return () => clearInterval(timerRef.current);
    }, [current, goTo, isSingle]);

    const handleMouseEnter = () => clearInterval(timerRef.current);
    const handleMouseLeave = () => {
        if (isSingle) return;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => goTo(current + 1, 'next'), 5000);
    };

    if (!pics.length) return null;

    return (
        <div
            className={`img-slider ${isSingle ? 'single' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onOpenModal(pics, current, title)}
            role="button"
            tabIndex={0}
            aria-label={`View images for ${title}`}
            onKeyDown={(e) => { if (e.key === 'Enter') onOpenModal(pics, current, title); }}
        >
            {pics.map((img, i) => {
                let statusClass = '';
                if (i === current) {
                    statusClass = 'active';
                } else if (i === prevIdx) {
                    statusClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
                }
                return (
                    <img
                        key={img + i}
                        src={img}
                        alt={`${title} - image ${i + 1}`}
                        className={`slider-img ${statusClass}`}
                        loading="lazy"
                        draggable={false}
                    />
                );
            })}

            {!isSingle && (
                <>
                    <button
                        type="button"
                        className="slider-btn slider-prev"
                        aria-label="Previous image"
                        onClick={(e) => {
                            e.stopPropagation();
                            goTo(current - 1, 'prev');
                        }}
                    >
                        &#8249;
                    </button>
                    <button
                        type="button"
                        className="slider-btn slider-next"
                        aria-label="Next image"
                        onClick={(e) => {
                            e.stopPropagation();
                            goTo(current + 1, 'next');
                        }}
                    >
                        &#8250;
                    </button>
                    <div className="slider-dots">
                        {pics.map((_, i) => (
                            <span
                                key={i}
                                className={`dot ${i === current ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goTo(i, i > current ? 'next' : 'prev');
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ── Fullscreen Modal Component ───────────────────────────────── */
const TimelineModal = ({ data, onClose }) => {
    const [idx, setIdx] = useState(data.idx || 0);
    const pics = data.images || [];

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % pics.length);
            else if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + pics.length) % pics.length);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [pics.length, onClose]);

    if (!pics.length) return null;

    return (
        <div className="timeline-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label="Certificate Preview">
            <div className="timeline-modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="close-modal" onClick={onClose} aria-label="Close modal">
                    &times;
                </button>

                {pics.length > 1 && (
                    <button
                        type="button"
                        className="modal-arrow modal-prev"
                        onClick={() => setIdx((i) => (i - 1 + pics.length) % pics.length)}
                        aria-label="Previous"
                    >
                        &#8249;
                    </button>
                )}

                <img
                    src={pics[idx]}
                    alt={data.title || 'Fullscreen Certificate'}
                    id="timelinePopupImg"
                />

                {pics.length > 1 && (
                    <button
                        type="button"
                        className="modal-arrow modal-next"
                        onClick={() => setIdx((i) => (i + 1) % pics.length)}
                        aria-label="Next"
                    >
                        &#8250;
                    </button>
                )}

                {pics.length > 1 && (
                    <div className="modal-dots" id="modalDots">
                        {pics.map((_, i) => (
                            <span
                                key={i}
                                className={`dot ${i === idx ? 'active' : ''}`}
                                onClick={() => setIdx(i)}
                                role="button"
                                tabIndex={0}
                                aria-label={`View slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Main Timeline View ───────────────────────────────────────── */
const TimelineView = ({ onClose }) => {
    // Pick active timeline items: prefer non-empty config, fallback to default
    const entries = (timeline && timeline.length && timeline[0].title !== 'Your first achievement')
        ? timeline
        : DEFAULT_ITEMS;

    const scrollRef = useRef(null);
    const containerRef = useRef(null);
    const iconRefs = useRef([]);
    const fillPathRef = useRef(null);
    const ptsRef = useRef([]);

    const [pathD, setPathD] = useState('');
    const [totalLen, setTotalLen] = useState(0);
    const [fillProgress, setFillProgress] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [rotorAngle, setRotorAngle] = useState(0);
    const [showScrollWheel, setShowScrollWheel] = useState(false);
    const [modalData, setModalData] = useState(null);

    /* Measure centers of each timeline icon and build smooth cubic bezier */
    const measure = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const icons = iconRefs.current.filter(Boolean);
        if (!icons.length) return;

        const pts = icons.map((icon) => {
            let x = icon.offsetLeft + icon.offsetWidth / 2;
            let y = icon.offsetTop + icon.offsetHeight / 2;
            let el = icon.offsetParent;
            while (el && el !== container) {
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent;
            }
            return { x, y };
        });

        ptsRef.current = pts;

        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const midY = (prev.y + curr.y) / 2;
            d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
        }

        setPathD(d);
    }, []);

    useLayoutEffect(() => {
        measure();
        const container = containerRef.current;
        if (!container) return undefined;

        const ro = new ResizeObserver(() => measure());
        ro.observe(container);
        window.addEventListener('resize', measure);

        const t1 = setTimeout(measure, 100);
        const t2 = setTimeout(measure, 400);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [measure]);

    /* Update total path length when path changes */
    useLayoutEffect(() => {
        if (fillPathRef.current) {
            try {
                const len = fillPathRef.current.getTotalLength();
                setTotalLen(len);
            } catch (e) {
                /* SVG not yet measured */
            }
        }
    }, [pathD]);

    /* Scroll listener for progressive path fill and rotor animation */
    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        const container = containerRef.current;
        const pts = ptsRef.current;

        if (!el || !container || !pts.length) return;

        const firstY = pts[0].y;
        const lastY = pts[pts.length - 1].y;

        const scrollStart = firstY - el.clientHeight * 0.6;
        const scrollEnd = lastY - el.clientHeight * 0.4;
        const current = el.scrollTop;

        const p = Math.min(1, Math.max(0, (current - scrollStart) / (scrollEnd - scrollStart || 1)));
        setFillProgress(p);

        const maxScroll = el.scrollHeight - el.clientHeight;
        const overall = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
        setOverallProgress(overall);
        setRotorAngle(overall * 1080);
        setShowScrollWheel(el.scrollTop > 300);
    }, []);

    /* Lock body scroll while open and handle ESC */
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !modalData) {
                onClose();
            }
        };
        window.addEventListener('keydown', onKey);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [modalData, onClose]);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToSection = (id) => {
        onClose();
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
    };

    const brandName = identity.shortName ? `${identity.shortName.toLowerCase()}.` : 'vee.';

    return (
        <div className="tlc-scroll" ref={scrollRef} onScroll={handleScroll}>
            {/* Film grain overlay */}
            <div className="tlc-grain" aria-hidden="true" />

            {/* Site Header */}
            <header className="tlc-header">
                <div className="tlc-header-left">
                    <button type="button" className="tlc-brand" onClick={onClose} aria-label="Back to home">
                        <span className="tlc-brand-text">
                            {identity.shortName ? (
                                <>
                                    {identity.shortName.toLowerCase().replace(/\.$/, '')}
                                    <span className="amber">.</span>
                                </>
                            ) : (
                                <>vee<span className="amber">.</span></>
                            )}
                        </span>
                    </button>
                </div>

                <nav className="tlc-nav" aria-label="Timeline navigation">
                    <ul>
                        <li><button type="button" onClick={onClose}>Home</button></li>
                        <li><button type="button" className="active">Timeline</button></li>
                        <li><button type="button" onClick={() => goToSection('projects')}>Projects</button></li>
                        <li><button type="button" onClick={() => goToSection('blogs')}>Blogs</button></li>
                        <li><button type="button" onClick={() => goToSection('contact')}>Contact</button></li>
                    </ul>
                </nav>

                <div className="tlc-header-right">
                    <button type="button" className="tlc-close-btn" onClick={onClose} aria-label="Close timeline">
                        <span>✕</span>
                        <span className="tlc-close-hint">ESC</span>
                    </button>
                </div>
            </header>

            {/* Timeline Section */}
            <div className="timeline-container" ref={containerRef}>
                {/* Title */}
                <div className="timeline-title">
                    <div className="code-label">
                        <span className="code-fn">console</span>
                        <span className="code-dot">.</span>
                        <span className="code-method">log</span>
                        <span className="code-paren">(</span>
                        <span className="code-var">currentLife</span>
                        <span className="code-paren">)</span>
                    </div>
                    <h1>Glory<br />Logged.</h1>
                </div>

                {/* Snake SVG Progress Line */}
                <div className="timeline-progress-wrapper" id="timelineProgressWrapper">
                    <svg id="snakeSvg" className="snake-svg" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path id="snakePathBase" className="snake-path-base" d={pathD} />
                        <path
                            ref={fillPathRef}
                            id="snakePathFill"
                            className="snake-path-fill"
                            d={pathD}
                            style={{
                                strokeDasharray: totalLen || 1000,
                                strokeDashoffset: (totalLen || 1000) * (1 - fillProgress)
                            }}
                        />
                    </svg>
                </div>

                {/* Timeline Items */}
                <div className="timeline" id="timelineItems">
                    {entries.map((item, i) => {
                        const isLeft = i % 2 === 0;
                        const directionClass = isLeft ? 'left' : 'right';

                        return (
                            <motion.div
                                key={`${item.title}-${i}`}
                                className={`timeline-item ${directionClass}`}
                                initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="timeline-content">
                                    <div className="tag-row">
                                        {item.status && <span className="tag">{item.status}</span>}
                                        {item.date && <span className="date">{item.date}</span>}
                                    </div>
                                    <h2>{item.title}</h2>
                                    <p>{item.description}</p>
                                </div>

                                <div
                                    className="timeline-icon"
                                    ref={(el) => { iconRefs.current[i] = el; }}
                                    aria-hidden="true"
                                >
                                    <AwardRibbonIcon />
                                </div>

                                <div className="timeline-image">
                                    <TimelineSlider
                                        images={item.images}
                                        title={item.title}
                                        onOpenModal={(imgs, idx, ttl) => setModalData({ images: imgs, idx, title: ttl })}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Dino Rider between black timeline section and footer */}
            <DinoRunner />

            {/* Giant Site Footer */}
            <footer className="tlc-footer">
                <div className="tlc-footer-top">
                    <div className="tlc-brand">
                        <span className="tlc-brand-text" style={{ color: 'var(--paper)' }}>
                            {identity.shortName ? (
                                <>
                                    {identity.shortName.toLowerCase().replace(/\.$/, '')}
                                    <span className="amber">.</span>
                                </>
                            ) : (
                                <>vee<span className="amber">.</span></>
                            )}
                        </span>
                    </div>
                    <nav className="tlc-footer-nav" aria-label="Footer navigation">
                        <ul>
                            <li><button type="button" onClick={onClose}>Home</button></li>
                            <li><button type="button" className="active">Timeline</button></li>
                            <li><button type="button" onClick={() => goToSection('projects')}>Projects</button></li>
                            <li><button type="button" onClick={() => goToSection('blogs')}>Blogs</button></li>
                            <li><button type="button" onClick={() => goToSection('contact')}>Contact</button></li>
                        </ul>
                    </nav>
                </div>

                <div className="tlc-footer-giant">
                    <span className="row"><span className="ghost">fall back<span className="amber">?</span></span></span>
                    <span className="row"><span>redesign<span className="amber">..!</span></span></span>
                </div>

                <div className="tlc-footer-bottom">
                    <span>&copy; 2026 {identity.fullName || identity.name || 'timeline component'}</span>
                    <span>engineered with precision &mdash; crafted with passion</span>
                </div>
            </footer>

            {/* Scroll Progress Rotor Wheel Button */}
            <button
                type="button"
                className={`tlc-scroll-wheel ${showScrollWheel ? 'is-visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="rgba(17,17,16,0.9)" />
                    <g
                        className="tlc-sw-rotor"
                        style={{
                            transform: `rotate(${rotorAngle}deg)`,
                            transformOrigin: '50% 50%'
                        }}
                    >
                        <circle cx="50" cy="50" r="36" fill="none" stroke="#3a3a3e" strokeWidth="5" />
                        <line x1="50" y1="50" x2="50" y2="16" stroke="#5a5a60" strokeWidth="4" />
                        <line x1="50" y1="50" x2="82.3" y2="60.5" stroke="#5a5a60" strokeWidth="4" />
                        <line x1="50" y1="50" x2="30" y2="77.5" stroke="#5a5a60" strokeWidth="4" />
                        <line x1="50" y1="50" x2="17.7" y2="39.5" stroke="#5a5a60" strokeWidth="4" />
                        <line x1="50" y1="50" x2="70" y2="22.5" stroke="#5a5a60" strokeWidth="4" />
                        <circle cx="50" cy="50" r="9" fill="#F9B646" />
                    </g>
                    <circle
                        className="tlc-sw-progress"
                        cx="50"
                        cy="50"
                        r="44"
                        style={{
                            strokeDasharray: 276.46,
                            strokeDashoffset: 276.46 * (1 - overallProgress)
                        }}
                    />
                </svg>
            </button>

            {/* Fullscreen Certificate Modal */}
            {modalData && (
                <TimelineModal data={modalData} onClose={() => setModalData(null)} />
            )}
        </div>
    );
};

/* ── TimelinePage Overlay Shell ───────────────────────────────── */
const TimelinePage = ({ open, onClose }) => (
    <AnimatePresence>
        {open && (
            <motion.div
                className="tlc-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                role="dialog"
                aria-modal="true"
                aria-label="Glory Logged — achievements timeline"
            >
                <TimelineView onClose={onClose} />
            </motion.div>
        )}
    </AnimatePresence>
);

export default TimelinePage;

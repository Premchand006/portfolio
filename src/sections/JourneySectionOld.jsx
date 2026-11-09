import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { timeline, sections } from '../config';
import { flowContainerProps, flowTitleProps } from '../hooks/useSectionFlow';
import ResearchBackground from '../components/ResearchBackground';
import './Sections.css';
import './JourneySection.css';

const copy = sections.journey || {
    label: 'console.log(currentLife)',
    heading: 'Glory',
    headingAccent: 'Logged.',
    description: 'Milestones, competition wins, research publications, and key leadership achievements along the way.'
};

const AwardIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
);

const Chevron = ({ left }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {left ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
);

const buildPath = (nodes, width, height) => {
    if (!nodes.length) return '';
    const lineX = nodes[0].x;
    const amp = width >= 768 ? Math.min(width * 0.16, 90) : 0;
    const ys = [0, ...nodes.map((n) => n.y), height];

    let d = `M ${lineX.toFixed(1)} ${ys[0].toFixed(1)}`;
    for (let i = 1; i < ys.length; i++) {
        const ya = ys[i - 1];
        const yb = ys[i];
        const side = i % 2 === 0 ? 1 : -1;
        const bx = (lineX + side * amp).toFixed(1);
        const c1y = (ya + (yb - ya) / 3).toFixed(1);
        const c2y = (yb - (yb - ya) / 3).toFixed(1);
        d += ` C ${bx} ${c1y}, ${bx} ${c2y}, ${lineX.toFixed(1)} ${yb.toFixed(1)}`;
    }
    return d;
};

const ConnectorPath = ({ pathD, width, height, progress }) => {
    if (!pathD) return null;
    return (
        <svg
            className="journey__snake-svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path d={pathD} stroke="rgba(255, 255, 255, 0.12)" strokeWidth="3" strokeLinecap="round" />
            <motion.path
                d={pathD}
                stroke="#F9B646"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ pathLength: progress }}
            />
        </svg>
    );
};

const ImageSlider = ({ images, alt, onOpen }) => {
    const pics = (images || []).filter(Boolean);
    const [idx, setIdx] = useState(0);

    if (pics.length === 0) {
        return <div className="journey__image journey__image--placeholder" />;
    }

    const prev = (e) => {
        e?.stopPropagation();
        setIdx((i) => (i - 1 + pics.length) % pics.length);
    };

    const next = (e) => {
        e?.stopPropagation();
        setIdx((i) => (i + 1) % pics.length);
    };

    return (
        <div className="journey__slider">
            <div className="journey__slider-frame" onClick={() => onOpen(pics, idx)}>
                <img
                    src={pics[idx]}
                    alt={`${alt} (${idx + 1}/${pics.length})`}
                    className="journey__slider-img"
                    loading="lazy"
                />
                <span className="journey__slider-hint">Click to enlarge</span>
            </div>

            {pics.length > 1 && (
                <>
                    <button type="button" className="journey__slider-btn journey__slider-btn--prev" onClick={prev} aria-label="Previous image">
                        <Chevron left />
                    </button>
                    <button type="button" className="journey__slider-btn journey__slider-btn--next" onClick={next} aria-label="Next image">
                        <Chevron />
                    </button>
                    <div className="journey__slider-dots">
                        {pics.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`journey__slider-dot ${i === idx ? 'is-active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ModalLightbox = ({ modalData, onClose }) => {
    if (!modalData) return null;
    const { pics, index: initialIdx } = modalData;
    const [idx, setIdx] = useState(initialIdx);

    const prev = (e) => {
        e?.stopPropagation();
        setIdx((i) => (i - 1 + pics.length) % pics.length);
    };

    const next = (e) => {
        e?.stopPropagation();
        setIdx((i) => (i + 1) % pics.length);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="journey__modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <div className="journey__modal-content" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="journey__modal-close" onClick={onClose} aria-label="Close modal">
                        &times;
                    </button>
                    {pics.length > 1 && (
                        <button type="button" className="journey__modal-arrow journey__modal-arrow--prev" onClick={prev} aria-label="Previous">
                            <Chevron left />
                        </button>
                    )}
                    <img src={pics[idx]} alt="Fullscreen achievement" className="journey__modal-img" />
                    {pics.length > 1 && (
                        <button type="button" className="journey__modal-arrow journey__modal-arrow--next" onClick={next} aria-label="Next">
                            <Chevron />
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const JourneySectionOld = () => {
    const events = (timeline || []).filter(Boolean);
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const nodeRefs = useRef([]);
    const [modalData, setModalData] = useState(null);

    const [trackSize, setTrackSize] = useState({ width: 0, height: 0 });
    const [nodeCoords, setNodeCoords] = useState([]);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start']
    });

    const measure = () => {
        if (!trackRef.current) return;
        const trackRect = trackRef.current.getBoundingClientRect();
        setTrackSize({ width: trackRect.width, height: trackRect.height });

        const coords = nodeRefs.current
            .filter(Boolean)
            .map((el) => {
                const r = el.getBoundingClientRect();
                return {
                    x: r.left + r.width / 2 - trackRect.left,
                    y: r.top + r.height / 2 - trackRect.top,
                };
            });
        setNodeCoords(coords);
    };

    useLayoutEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (trackRef.current) ro.observe(trackRef.current);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [events.length]);

    const pathD = buildPath(nodeCoords, trackSize.width, trackSize.height);

    if (events.length === 0) return null;

    return (
        <section className="section section--journey" id="journey-old" ref={sectionRef}>
            <div className="journey__rain" aria-hidden="true">
                <ResearchBackground />
            </div>

            <motion.div className="section__content container journey__container" {...flowContainerProps}>
                <motion.header className="section__header journey__header" {...flowTitleProps}>
                    <div className="journey__code-label">
                        <span className="code-fn">console</span>
                        <span className="code-dot">.</span>
                        <span className="code-method">log</span>
                        <span className="code-paren">(</span>
                        <span className="code-var">currentLife</span>
                        <span className="code-paren">)</span>
                    </div>
                    <h2 className="heading-1 section__title">
                        {copy.heading} <span className="text-accent">{copy.headingAccent}</span>
                    </h2>
                    <p className="section__subtitle text-secondary">
                        {copy.description}
                    </p>
                </motion.header>

                <div className="journey__track" ref={trackRef}>
                    <ConnectorPath
                        pathD={pathD}
                        width={trackSize.width}
                        height={trackSize.height}
                        progress={scrollYProgress}
                    />

                    {events.map((current, idx) => {
                        const isEven = idx % 2 === 0;
                        const statusTag = current.status || current.badge;
                        const images = Array.isArray(current.images) && current.images.length > 0
                            ? current.images
                            : (current.image ? [current.image] : []);

                        return (
                            <motion.div
                                key={current.id || idx}
                                className={`journey__item ${isEven ? 'journey__item--left' : 'journey__item--right'}`}
                                initial={{ opacity: 0, y: 35 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="journey__card">
                                    <div className="journey__card-meta">
                                        {statusTag && <span className="journey__tag">{statusTag}</span>}
                                        <span className="journey__date">{current.date}</span>
                                    </div>
                                    <h3 className="journey__card-title">{current.title}</h3>
                                    <p className="journey__card-desc">{current.description}</p>
                                </div>

                                <div
                                    className="journey__node"
                                    ref={(el) => { nodeRefs.current[idx] = el; }}
                                >
                                    <div className="journey__node-badge">
                                        <AwardIcon />
                                    </div>
                                </div>

                                <div className="journey__media">
                                    <ImageSlider
                                        images={images}
                                        alt={current.title}
                                        onOpen={(pics, index) => setModalData({ pics, index })}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            <ModalLightbox modalData={modalData} onClose={() => setModalData(null)} />
        </section>
    );
};

export default JourneySectionOld;

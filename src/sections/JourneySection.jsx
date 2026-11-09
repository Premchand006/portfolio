import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { timeline, sections } from '../config';
import './Sections.css';
import './JourneySection.css';

const copy = sections.journey || {
    label: 'console.log(currentLife)',
    heading: 'Glory',
    headingAccent: 'Logged.'
};

/* ── Image Slider Component (Exact logic from timeline-component) ────── */
const ImageSliderComponent = ({ images, title, onOpenModal }) => {
    const pics = (images || []).filter(Boolean);
    const [currentIdx, setCurrentIdx] = useState(0);

    if (!pics.length) return null;

    const isSingle = pics.length === 1;

    const goPrev = (e) => {
        e.stopPropagation();
        setCurrentIdx((prev) => (prev - 1 + pics.length) % pics.length);
    };

    const goNext = (e) => {
        e.stopPropagation();
        setCurrentIdx((prev) => (prev + 1) % pics.length);
    };

    return (
        <div
            className={`img-slider ${isSingle ? 'single' : ''}`}
            onClick={() => onOpenModal(pics, currentIdx)}
        >
            {pics.map((imgUrl, i) => (
                <img
                    key={i}
                    src={imgUrl}
                    alt={title || 'Achievement Image'}
                    className={`slider-img ${i === currentIdx ? 'active' : ''}`}
                    loading="lazy"
                />
            ))}

            {!isSingle && (
                <>
                    <button
                        type="button"
                        className="slider-btn slider-prev"
                        onClick={goPrev}
                        aria-label="Previous Image"
                    >
                        &#8249;
                    </button>
                    <button
                        type="button"
                        className="slider-btn slider-next"
                        onClick={goNext}
                        aria-label="Next Image"
                    >
                        &#8250;
                    </button>
                    <div className="slider-dots">
                        {pics.map((_, i) => (
                            <span
                                key={i}
                                className={`dot ${i === currentIdx ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIdx(i);
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ── Standalone Timeline Component — Exact Integration ───────────────── */
const JourneySection = () => {
    const events = (timeline || []).filter(Boolean);
    const containerRef = useRef(null);
    const iconRefs = useRef([]);
    const pathFillRef = useRef(null);

    const [pathD, setPathD] = useState('');
    const [totalLength, setTotalLength] = useState(0);
    const [strokeOffset, setStrokeOffset] = useState(0);

    /* Lightbox modal state */
    const [modalActive, setModalActive] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    const [modalIdx, setModalIdx] = useState(0);

    /* Calculate dynamic Snake Path through .timeline-icon centers */
    const recalculatePath = useCallback(() => {
        const container = containerRef.current;
        const validIcons = iconRefs.current.filter(Boolean);
        if (!container || !validIcons.length) return;

        const getIconCenter = (icon) => {
            let x = icon.offsetLeft + icon.offsetWidth / 2;
            let y = icon.offsetTop + icon.offsetHeight / 2;
            let el = icon.offsetParent;
            while (el && el !== container) {
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent;
            }
            return { x, y };
        };

        const pts = validIcons.map(getIconCenter);
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
        recalculatePath();
        window.addEventListener('resize', recalculatePath);
        return () => window.removeEventListener('resize', recalculatePath);
    }, [events.length, recalculatePath]);

    /* Update total stroke length once SVG path updates */
    useEffect(() => {
        if (pathFillRef.current && pathD) {
            const len = pathFillRef.current.getTotalLength();
            setTotalLength(len);
            setStrokeOffset(len);
        }
    }, [pathD]);

    /* Scroll listener for drawing line down as section is scrolled */
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !totalLength) return;

        const handleScroll = () => {
            const rect = container.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            /* Calculate how far into the container we've scrolled */
            const scrollDist = viewHeight * 0.7 - rect.top;
            const totalDist = rect.height;
            const progress = Math.min(Math.max(scrollDist / totalDist, 0), 1);

            setStrokeOffset(totalLength * (1 - progress));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [totalLength]);

    const handleOpenModal = (pics, index) => {
        setModalImages(pics);
        setModalIdx(index);
        setModalActive(true);
    };

    const handleCloseModal = () => {
        setModalActive(false);
    };

    const modalPrev = (e) => {
        e.stopPropagation();
        setModalIdx((prev) => (prev - 1 + modalImages.length) % modalImages.length);
    };

    const modalNext = (e) => {
        e.stopPropagation();
        setModalIdx((prev) => (prev + 1) % modalImages.length);
    };

    if (!events.length) return null;

    return (
        <section className="section section--journey" id="journey">
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
                    <h1>
                        {copy.heading}<br />{copy.headingAccent}
                    </h1>
                </div>

                {/* Snake SVG Progress Line */}
                <div className="timeline-progress-wrapper">
                    <svg className="snake-svg" preserveAspectRatio="none">
                        <path className="snake-path-base" d={pathD} />
                        <path
                            ref={pathFillRef}
                            className="snake-path-fill"
                            d={pathD}
                            style={{
                                strokeDasharray: totalLength,
                                strokeDashoffset: strokeOffset,
                            }}
                        />
                    </svg>
                </div>

                {/* Timeline Items */}
                <div className="timeline">
                    {events.map((item, idx) => {
                        const isLeft = idx % 2 === 0;
                        const statusTag = item.status || item.badge;
                        const images = Array.isArray(item.images) && item.images.length > 0
                            ? item.images
                            : (item.image ? [item.image] : []);

                        return (
                            <div
                                key={item.id || idx}
                                className={`timeline-item ${isLeft ? 'left' : 'right'}`}
                                style={{ opacity: 1 }}
                            >
                                <div className="timeline-content">
                                    <div className="tag-row">
                                        {statusTag && <span className="tag">{statusTag}</span>}
                                        {item.date && <span className="date">{item.date}</span>}
                                    </div>
                                    <h2>{item.title}</h2>
                                    <p>{item.description}</p>
                                </div>

                                <div
                                    className="timeline-icon"
                                    ref={(el) => { iconRefs.current[idx] = el; }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="7"></circle>
                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                                    </svg>
                                </div>

                                <div className="timeline-image">
                                    <ImageSliderComponent
                                        images={images}
                                        title={item.title}
                                        onOpenModal={handleOpenModal}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fullscreen Image Lightbox Modal */}
            <div
                className={`timeline-modal ${modalActive ? 'active' : ''}`}
                onClick={handleCloseModal}
            >
                <div className="timeline-modal-content" onClick={(e) => e.stopPropagation()}>
                    <span className="close-modal" onClick={handleCloseModal}>&times;</span>

                    {modalImages.length > 1 && (
                        <button type="button" className="modal-arrow modal-prev" onClick={modalPrev} aria-label="Previous">
                            &#8249;
                        </button>
                    )}

                    {modalImages[modalIdx] && (
                        <img src={modalImages[modalIdx]} alt="Fullscreen achievement certificate" />
                    )}

                    {modalImages.length > 1 && (
                        <button type="button" className="modal-arrow modal-next" onClick={modalNext} aria-label="Next">
                            &#8250;
                        </button>
                    )}

                    {modalImages.length > 1 && (
                        <div className="modal-dots">
                            {modalImages.map((_, i) => (
                                <span
                                    key={i}
                                    className={`dot ${i === modalIdx ? 'active' : ''}`}
                                    onClick={() => setModalIdx(i)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default JourneySection;

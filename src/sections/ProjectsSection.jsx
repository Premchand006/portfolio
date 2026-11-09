import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { projects, sections, assets } from '../config';
import { flowContainerProps, flowItemProps, flowTitleProps } from '../hooks/useSectionFlow';
import './Sections.css';

const copy = sections.projects;

/* ── Project carousel ───────────────────────────────────────────
   Shows three cards at a time, centered on the page. The right /
   left chevrons slide the row by exactly one card so the user can
   reach all seven entries one step at a time.                    */



const computeVisible = (w) => {
    if (w <= 640) return 1;
    if (w <= 1024) return 2;
    return 3;
};

const TILT = 6;     // deg of 3D lean toward the pointer
const SLIDE = 12;   // px the card glides toward the pointer

const ProjectCard = ({ project, index, visible }) => {
    const cardRef = useRef(null);
    const reduced = useRef(
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    /* Cursor-follow hover flourish. Pointer position within the card is
       normalised to -0.5..0.5 and smoothed by a spring so the card glides
       (rather than snaps) toward the cursor, leaning slightly in 3D. It
       resets to 0 on leave so the card eases back to rest. This is purely
       an add-on — the arrows, dots, and arrow-keys still drive all the
       actual carousel navigation. */
    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const spring = { stiffness: 260, damping: 22, mass: 0.6 };
    const sx = useSpring(px, spring);
    const sy = useSpring(py, spring);
    const x = useTransform(sx, [-0.5, 0.5], [-SLIDE, SLIDE]);
    const y = useTransform(sy, [-0.5, 0.5], [-SLIDE, SLIDE]);
    const rotateY = useTransform(sx, [-0.5, 0.5], [-TILT, TILT]);
    const rotateX = useTransform(sy, [-0.5, 0.5], [TILT, -TILT]);

    const handleMove = useCallback((e) => {
        if (reduced.current) return;
        const el = cardRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
    }, [px, py]);

    const handleLeave = useCallback(() => {
        px.set(0);
        py.set(0);
    }, [px, py]);

    const open = useCallback(() => {
        if (project.link && project.link !== '#') {
            window.open(project.link, '_blank', 'noopener');
        }
    }, [project.link]);

    const idx = String(index + 1).padStart(3, '0');

    return (
        <motion.div
            className="proj-card-wrap"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.55, delay: (index % visible) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <motion.article
                ref={cardRef}
                className="proj-card"
                style={{ x, y, rotateX, rotateY }}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                onClick={open}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
                role="link"
                tabIndex={0}
                aria-label={`Open ${project.title}`}
            >
                {/* Card HUD chrome — corner brackets, tick scale, system index */}
                <span className="proj-card__bracket proj-card__bracket--tl" aria-hidden="true" />
                <span className="proj-card__bracket proj-card__bracket--tr" aria-hidden="true" />
                <span className="proj-card__bracket proj-card__bracket--bl" aria-hidden="true" />
                <span className="proj-card__bracket proj-card__bracket--br" aria-hidden="true" />

                <div className="proj-card__chrome" aria-hidden="true">
                    <span className="proj-card__sysid">{idx}{copy.systemSuffix}</span>
                    <span className="proj-card__chrome-ticks" />
                </div>

                <div className="proj-card__media">
                    <span className="proj-card__media-scan" aria-hidden="true" />
                    {project.image ? (
                        <img
                            src={project.image}
                            alt={project.alt || project.title}
                            className="proj-card__img"
                            width="800"
                            height="500"
                            loading="lazy"
                            draggable={false}
                        />
                    ) : (
                        <div className="proj-card__placeholder" aria-hidden="true">
                            <span className="proj-card__placeholder-glyph">
                                {project.title.slice(0, 1)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="proj-card__body">
                    <div className="proj-card__meta">
                        <span className="proj-card__kind">{project.kind || copy.defaultKind}</span>
                        <span className="proj-card__index" aria-hidden="true">{`// ${idx}`}</span>
                    </div>
                    <h3 className="proj-card__title">{project.title}</h3>
                    <p className="proj-card__desc">{project.description}</p>
                    <div className="proj-card__tags">
                        {project.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="proj-card__tag">{tag}</span>
                        ))}
                        {project.tags.length > 4 && (
                            <span className="proj-card__tag proj-card__tag--more">
                                +{project.tags.length - 4}
                            </span>
                        )}
                    </div>
                </div>
            </motion.article>
        </motion.div>
    );
};

const ProjectsSection = () => {
    const total = projects.length;
    const [visible, setVisible] = useState(() =>
        typeof window === 'undefined' ? 3 : computeVisible(window.innerWidth)
    );
    const [start, setStart] = useState(0);
    const maxStart = Math.max(0, total - visible);

    /* Keep the visible-count in sync with the viewport, and clamp the
       start index so we never end up showing fewer cards than possible. */
    useEffect(() => {
        const onResize = () => {
            const next = computeVisible(window.innerWidth);
            setVisible(next);
            setStart((s) => Math.min(s, Math.max(0, total - next)));
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [total]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (document.documentElement.getAttribute('data-active-section') !== 'projects') return;
            if (e.key === 'ArrowLeft') {
                setStart((s) => (s === 0 ? s : s - 1));
            } else if (e.key === 'ArrowRight') {
                setStart((s) => (s === maxStart ? s : s + 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [maxStart]);

    const goPrev = () => {
        if (start === 0) return;
        setStart((s) => Math.max(0, s - 1));
    };

    const goNext = () => {
        if (start === maxStart) return;
        setStart((s) => Math.min(maxStart, s + 1));
    };

    return (
        <section className="section section--projects" id="projects" aria-label="Projects">
            {/* Background photo layer — sits behind the content. A dark
                scrim keeps the cards and header readable and lets the
                section still blend into the surrounding black palette. */}
            <div className="proj-bg" aria-hidden="true">
                <div
                    className="proj-bg__photo"
                    style={{ backgroundImage: `url(${assets.projectsBg})` }}
                />
                <div className="proj-bg__scrim" />
            </div>

            <div className="section__content">
                <motion.header className="proj-header container" {...flowContainerProps}>
                    <motion.span className="section-label" {...flowItemProps}>{copy.label}</motion.span>
                    
                    <motion.div className="dawn-heading-wrapper" {...flowTitleProps}>
                        {copy.heading.split(' ').map((word, idx) => (
                            <div key={idx} className={`dawn-heading-layer dawn-heading-line${idx + 1}`}>
                                {word === 'I' ? <span style={{ color: 'var(--accent-gold)' }}>I</span> : word}
                            </div>
                        ))}
                    </motion.div>
                </motion.header>

                <div className="proj-stage container">
                    <button
                        type="button"
                        className="proj-nav proj-nav--prev"
                        onClick={goPrev}
                        disabled={start === 0}
                        aria-label="Previous projects"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <div className="proj-viewport" role="list">
                        <div
                            className="proj-track"
                            style={{ '--start': start, '--visible': visible }}
                        >
                            {projects.map((project, i) => (
                                <div key={project.id} className="proj-cell" role="listitem">
                                    <ProjectCard project={project} index={i} visible={visible} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="proj-nav proj-nav--next"
                        onClick={goNext}
                        disabled={start === maxStart}
                        aria-label="Next projects"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                <div className="proj-footer container">
                    <div className="proj-dots" role="tablist" aria-label="Project pagination">
                        {Array.from({ length: maxStart + 1 }, (_, i) => (
                            <button
                                key={i}
                                role="tab"
                                aria-selected={i === start}
                                aria-label={`Show projects ${i + 1} to ${i + visible}`}
                                className={`proj-dot${i === start ? ' proj-dot--active' : ''}`}
                                onClick={() => setStart(i)}
                            />
                        ))}
                    </div>
                    <span className="proj-counter" aria-live="polite">
                        {String(start + 1).padStart(2, '0')} – {String(Math.min(start + visible, total)).padStart(2, '0')} / {String(total).padStart(2, '0')}
                    </span>
                </div>
            </div>
        </section>
    );
};

export default ProjectsSection;

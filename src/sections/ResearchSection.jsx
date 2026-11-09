import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { publications, sections, interpolate, assets } from '../config';
import { flowContainerProps, flowItemProps, flowTitleProps } from '../hooks/useSectionFlow';
import MindsetRibbon from '../components/MindsetRibbon';
import './Sections.css';
import './ResearchSection.css';

const copy = sections.research;

/**
 * ResearchSection — publications presented as a deck of cards stacked
 * on the right at rest. Click the deck → cards spread horizontally in a
 * line. Click any card → opens the paper's URL in a new tab. Click the
 * stack icon again to re-stack.
 *
 * Pulls from data.publications. Empty list → renders nothing.
 */
const ResearchSection = () => {
    const [spread, setSpread] = useState(false);
    const papers = publications || [];

    const toggleSpread = useCallback(() => {
        setSpread((s) => !s);
    }, []);

    const openPaper = useCallback((url) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    if (papers.length === 0) return null;

    return (
        <section className="section section--research" id="research" aria-label="Research and publications">
            {/* Background photo (arsenal) with a dark scrim so the deck and
                heading stay legible and the edges blend into black. */}
            <div className="research-bg-photo" aria-hidden="true">
                <div
                    className="research-bg-photo__img"
                    style={{ backgroundImage: `url(${assets.researchBg})` }}
                />
                <div className="research-bg-photo__scrim" />
            </div>
            <div className="section__content container">
                <header className="section__header research__header">
                    <motion.div className="research__heading" {...flowContainerProps}>
                        <motion.span className="section-label" {...flowItemProps}>{copy.label}</motion.span>
                        <motion.h2 className="heading-1 section__title" {...flowTitleProps}>
                            {copy.heading} <span className="text-accent">{copy.headingAccent}</span>
                        </motion.h2>
                        <motion.p className="research__lead text-secondary" {...flowItemProps}>
                            {interpolate(copy.descriptionTemplate, {
                                count: papers.length,
                                paperWord: papers.length === 1 ? copy.paperWordSingular : copy.paperWordPlural,
                            })}
                        </motion.p>

                        <button
                            type="button"
                            className="research__toggle"
                            onClick={toggleSpread}
                            aria-pressed={spread}
                            aria-label={spread ? copy.restackLabel : copy.spreadLabel}
                            data-magnetic
                        >
                            <span className="research__toggle-dot" />
                            {spread ? copy.restackLabel : copy.spreadLabel}
                        </button>
                    </motion.div>

                    {/* The deck lives at right at rest, spreads across the row when active.
                        Spread is controlled ONLY by the button — clicking the deck or a
                        stacked card does nothing; spread cards open their paper. */}
                    <div
                        className={`research__deck ${spread ? 'is-spread' : 'is-stacked'}`}
                        role="list"
                    >
                        {papers.map((paper, i) => {
                            const stackOffset = i * 6;          // px translate stagger
                            const stackRotate = (i - 1) * 4;    // small rotation per layer
                            const mid = (papers.length - 1) / 2;
                            // Tighter spread offset for >3 cards so they all stay on-screen
                            const spreadStep = papers.length > 3 ? 90 : 110;

                            return (
                                <motion.button
                                    key={paper.id}
                                    type="button"
                                    className="research__card shine-border"
                                    role="listitem"
                                    initial={false}
                                    animate={
                                        spread
                                            ? {
                                                x: `${(i - mid) * spreadStep}%`,
                                                y: 0,
                                                rotate: (i - mid) * 2,
                                                scale: 1,
                                                opacity: 1,
                                            }
                                            : {
                                                x: -stackOffset,
                                                y: stackOffset * 0.8,
                                                rotate: stackRotate,
                                                scale: 1 - i * 0.02,
                                                opacity: 1,
                                            }
                                    }
                                    transition={{
                                        type: 'spring',
                                        stiffness: 220,
                                        damping: 26,
                                        mass: 0.9,
                                        delay: spread ? i * 0.08 : (papers.length - i) * 0.05,
                                    }}
                                    style={{ zIndex: spread ? i + 1 : papers.length - i }}
                                    tabIndex={spread ? 0 : -1}
                                    data-no-magnet
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!spread) return;
                                        openPaper(paper.url);
                                    }}
                                    aria-label={`${paper.title} — ${paper.venue}${paper.url ? ' — opens in new tab' : ''}`}
                                >
                                    <span className="research__card-rule" aria-hidden="true" />
                                    <span className="research__card-venue">{paper.venue}</span>
                                    <h3 className="research__card-title">{paper.title}</h3>
                                    <p className="research__card-desc">{paper.description}</p>
                                    <span className="research__card-cta">
                                        {paper.url ? copy.readLabel : copy.comingSoonLabel} <span aria-hidden="true">↗</span>
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </header>

                {/* Research-lifecycle roadmap — a continuously looping reel
                    of the mindset stages that flows left → right. */}
                <MindsetRibbon />
            </div>
        </section>
    );
};

export default ResearchSection;

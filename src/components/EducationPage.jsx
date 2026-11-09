import { motion } from 'framer-motion';
import { education, sections } from '../config';
import Logo from '../components/Logo';
import { flowContainerProps, flowItemProps, flowTitleProps } from '../hooks/useSectionFlow';
import './EducationSection.css';

const copy = sections.education;

/* ─────────────────────────────────────────────────────────────
   EducationSection — year-wise academic timeline.
   Desktop: a single centred horizontal timeline with nodes
   alternating above/below the connecting line.
   Mobile : timeline stacks vertically.
   ───────────────────────────────────────────────────────────── */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.18, delayChildren: 0.35 },
    },
};

const nodeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
    },
};

const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 2.2, ease: [0.22, 0.61, 0.36, 1] },
    },
};

const EducationSection = () => {
    // Dynamically calculate the start and end of the line so it perfectly 
    // connects the center of the first logo to the center of the last logo.
    const nodesCount = education.length;
    const startX = (1000 / nodesCount) / 2;
    const endX = 1000 - startX;

    return (
        <section className="section section--education" id="education">
            <motion.div className="section__content container" {...flowContainerProps}>
                <motion.header className="section__header" {...flowTitleProps}>
                    <span className="section-label">{copy.label}</span>
                    <h2 className="heading-1 section__title">
                        {copy.heading} <span className="text-accent">{copy.headingAccent}</span>
                    </h2>
                </motion.header>

                <div className="edu-stage">
                    <motion.div
                        className="edu-timeline"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                    >
                        {/* Continuous winding path — written end-to-end. The
                            path enters from x=0, passes through all four nodes
                            at x=125/375/625/875, and exits at x=1000. */}
                        <div 
                            className="edu-timeline__line" 
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: `${(100 / nodesCount) / 2}%`,
                                right: `${(100 / nodesCount) / 2}%`,
                                height: '2px',
                                background: 'linear-gradient(90deg, rgba(210, 159, 34, 0.2) 0%, rgba(210, 159, 34, 0.8) 50%, rgba(210, 159, 34, 0.2) 100%)',
                                transform: 'translateY(-50%)',
                                zIndex: 1,
                                display: 'var(--desktop-line-display, none)' // hidden on mobile by CSS
                            }}
                        />

                        <ul className="edu-timeline__nodes">
                            {education.map((edu, i) => {
                                const variant = i % 2 === 0 ? 'top' : 'bottom';
                                return (
                                    <motion.li
                                        key={edu.id}
                                        className={`edu-node edu-node--${variant}`}
                                        variants={nodeVariants}
                                    >
                                        <div className="edu-node__circle">
                                            <Logo
                                                src={edu.logo}
                                                name={edu.institution}
                                                alt={`${edu.institution} logo`}
                                                size={72}
                                                shape="circle"
                                            />
                                            {edu.url && (
                                                <>
                                                    <a
                                                        className="edu-node__cover-link"
                                                        href={edu.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`${edu.institution} — opens in new tab`}
                                                    />
                                                    <div className="edu-node__preview-tooltip">
                                                        <div className="edu-node__preview-content">
                                                            <img 
                                                                src={`https://s0.wp.com/mshots/v1/${encodeURIComponent(edu.url.includes('amrita.edu') ? 'https://www.amrita.edu/' : edu.url)}?w=1280`} 
                                                                alt={`${edu.institution} preview`} 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="edu-node__label">
                                            <span className="edu-node__year">{edu.period}</span>
                                            <h3 className="edu-node__title">{edu.institution}</h3>
                                            <p className="edu-node__degree">{edu.degree}</p>
                                            <p className="edu-node__detail">{edu.focus}</p>
                                        </div>
                                    </motion.li>
                                );
                            })}
                        </ul>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default EducationSection;

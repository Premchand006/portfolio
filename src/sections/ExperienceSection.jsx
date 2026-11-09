import { motion } from 'framer-motion';
import { experience, assets, sections } from '../config';
import Logo from '../components/Logo';
import { flowContainerProps, flowItemProps, flowTitleProps } from '../hooks/useSectionFlow';
import './ExperienceSection.css';

const copy = sections.experience;

const ExperienceSection = () => {
    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.55, ease: [0.215, 0.61, 0.355, 1] },
        },
    };

    return (
        <section className="section section--experience" id="experience">
            {/* Photo backdrop: the desk flat-lay drops in from above and
                "settles" with a slight overshoot, so the items in the
                composition read as being placed onto the surface. */}
            <motion.div
                className="exp-bg-frame"
                aria-hidden="true"
                /* Drop-in distance is % of the frame's own height (which is
                   itself fluid: clamp(220px,38vw,600px)), so the entrance reads
                   identically from small laptops to ultrawide instead of the
                   old fixed -180px that pulled the photo off-frame on narrow
                   viewports. */
                initial={{ y: '-30%', opacity: 0 }}
                whileInView={{
                    y: ['-30%', '2%', '0%'],
                    opacity: [0, 1, 1],
                }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                    duration: 1.15,
                    ease: [0.22, 1, 0.36, 1],
                    times: [0, 0.72, 1],
                }}
            >
                <div
                    className="exp-bg-photo"
                    style={{
                        '--bg-image': `url(${assets.workDesk})`,
                        '--bg-image-light': `url(${assets.workDeskLight || assets.workDesk})`
                    }}
                />
                <div className="exp-bg-scrim" />
            </motion.div>

            <motion.div className="section__content container" {...flowContainerProps}>
                <motion.header className="section__header" {...flowTitleProps} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="section-label">{copy.label}</span>
                    <div className="movie-title-wrapper">
                        <div className="movie-title-top">THE</div>
                        <div className="movie-title-middle">PROFESSIONAL</div>
                        <div className="movie-title-bottom" style={{ color: 'var(--accent-red)' }}>ARC</div>
                    </div>
                </motion.header>

                <motion.ul
                    className="exp-list"
                    variants={listVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.2 }}
                >
                    {experience.map((exp) => {
                        const Inner = (
                            <>
                                <div className="exp-card__body">
                                    <h3 className="exp-card__title">{exp.title}</h3>
                                    <p className="exp-card__org">{exp.company}</p>
                                    <p className="exp-card__period">{exp.period}</p>
                                    <ul className="exp-card__points">
                                        <li>{exp.description}</li>
                                    </ul>
                                </div>
                                <div className="exp-card__logo" aria-hidden="true">
                                    <Logo
                                        src={exp.logo}
                                        name={exp.company}
                                        alt={`${exp.company} logo`}
                                        size={96}
                                        shape="rounded"
                                    />
                                </div>
                            </>
                        );

                        return exp.url ? (
                            <motion.li key={exp.id} variants={itemVariants} className="exp-list__item">
                                <a
                                    className="exp-card exp-card--link"
                                    href={exp.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${exp.title} at ${exp.company} — opens ${exp.company} in new tab`}
                                    data-magnetic
                                >
                                    {Inner}
                                </a>
                            </motion.li>
                        ) : (
                            <motion.li key={exp.id} variants={itemVariants} className="exp-list__item">
                                <div className="exp-card">{Inner}</div>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            </motion.div>
        </section>
    );
};

export default ExperienceSection;

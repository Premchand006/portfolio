import { motion } from 'framer-motion';
import InfiniteMarquee from '../components/InfiniteMarquee';
import PhysicalAIBackground from '../components/PhysicalAIBackground';
import { sections } from '../config';
import { flowContainerProps, flowItemProps, flowTitleProps } from '../hooks/useSectionFlow';
import './Sections.css';

const copy = sections['tech-stack'];

const TechstackSection = () => {
    return (
        <section className="section section--tech-stack" id="tech-stack" aria-label="Tech Stack">
            <PhysicalAIBackground />
            <motion.div className="section__content container" {...flowContainerProps}>
                {/* Wrap in a centered block so the section-label keeps its
                    natural inline-flex layout — the gold dash stays attached
                    to "Skills" instead of floating to the left edge. */}
                <motion.div
                    style={{ textAlign: 'center' }}
                    {...flowItemProps}
                >
                    <span className="section-label">{copy.label}</span>
                </motion.div>

                <motion.div className="tech-heading-wrapper" {...flowTitleProps}>
                    <div className="tech-heading-bottom">
                        <span className="tech-heading-arrow"></span>
                        <span className="tech-heading-accent">{copy.heading}</span>
                        <span className="tech-heading-arrow-icon">→</span>
                    </div>
                    <div className="tech-heading-subtitle">
                        {copy.subtitle}
                    </div>
                </motion.div>

                <motion.div {...flowItemProps}>
                    <InfiniteMarquee />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default TechstackSection;

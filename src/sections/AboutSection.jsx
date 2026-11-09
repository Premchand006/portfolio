import { motion } from 'framer-motion';
import PolaroidStack from '../components/PolaroidStack';
import WaveDotField from '../components/WaveDotField';
import { sections } from '../config';
import { flowContainerProps, flowItemProps, flowTitleProps } from '../hooks/useSectionFlow';
import './Sections.css';
import './AboutSection.css';

const about = sections.about;
const interests = about.interests;

const AboutSection = () => {
    return (
        <section className="section section--about" id="about" aria-label="About">
            {/* Background elements */}
            <div className="about-new__glow" />

            <WaveDotField />
            <motion.div className="section__content container" {...flowContainerProps}>
                <motion.div className="section__header section__header--left-stylized" {...flowTitleProps}>
                    <h2 className="stylized-heading">
                        <span className="stylized-heading__line1">
                            <span className="stylized-star">✦</span>
                            <span className="stylized-script">The Human</span>
                            <span className="stylized-star">✦</span>
                        </span>
                        <span className="stylized-heading__line2">BEHIND</span>
                        <span className="stylized-heading__line3">
                            <span className="stylized-script">the Screen</span>
                        </span>
                    </h2>
                </motion.div>

                <div className="about-new">
                    <div className="about-new__container">
                        <div className="about-new__top">
                            <div className="about-new__info">
                                <motion.p
                                    className="about-new__description"
                                    {...flowItemProps}
                                >
                                    {about.bio}
                                </motion.p>

                                <motion.div
                                    className="about-new__interests"
                                    {...flowItemProps}
                                >
                                    <div className="about-new__interests-title">{about.interestsTitle}</div>
                                    <ul className="about-new__interests-list">
                                        {interests.map((interest, idx) => (
                                            <li key={idx}>{interest}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>

                            <motion.div
                                {...flowItemProps}
                                className="about-new__polaroids"
                            >
                                <PolaroidStack />
                            </motion.div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default AboutSection;

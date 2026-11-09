import { motion } from 'framer-motion';
import EarthShadersCanvas from '../components/EarthShadersCanvas';
import MultilingualHeadline from '../components/MultilingualHeadline';
import { identity, sections } from '../config';
import './Sections.css';

const home = sections.home;

/* ── Component ─────────────────────────────────────────────── */
const HomeSection = ({ onOpenOmnibar, scrollProgress = 0, onReady, paused = false }) => {

    const handleOpen = () => {
        onOpenOmnibar?.();
    };

    return (
        <section className="section section--home" id="home" aria-label="Hero">
            <EarthShadersCanvas glitching={false} scrollProgress={scrollProgress} onReady={onReady} paused={paused} />

            <div className="section__content section__content--center home__overlay">
                {/* Eyebrow label */}
                <motion.span
                    className="home__eyebrow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {identity.name}
                </motion.span>

                {/* Multilingual headline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ cursor: 'default', userSelect: 'none', position: 'relative' }}
                >
                    <MultilingualHeadline />
                </motion.div>

                {/* Command palette trigger — search bar style */}
                <motion.button
                    type="button"
                    className="home__cmd-trigger"
                    onClick={handleOpen}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 1.0 }}
                    aria-label="Open command palette (Ctrl+K)"
                    data-magnetic
                >
                    <svg
                        className="home__cmd-icon"
                        width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    <span className="home__cmd-placeholder">{home.placeholder}</span>
                    <kbd className="home__cmd-kbd">{home.kbdHint}</kbd>
                </motion.button>
            </div>
        </section>
    );
};

export default HomeSection;

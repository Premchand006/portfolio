import { motion } from 'framer-motion';
import './LiveStatus.css';

/**
 * LiveStatus — fixed top-left "Open to connect" badge.
 * Click jumps instantly to the Contact section. Constant gold glow
 * pulse signals availability; an underline sweeps in on hover.
 */
const LiveStatus = () => {
    const handleClick = () => {
        const target = document.getElementById('contact');
        if (!target) return;
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    return (
        <motion.button
            type="button"
            className="live-status live-status--live"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleClick}
            aria-label="Contact — open contact section"
        >
            <span className="live-status__dot" aria-hidden="true">
                <span className="live-status__dot-pulse" />
                <span className="live-status__dot-core" />
            </span>
            <span className="live-status__label">Contact</span>
        </motion.button>
    );
};

export default LiveStatus;

import { motion } from 'framer-motion';
import './AnimatedText.css';

const AnimatedText = ({
    text,
    className = '',
    tag = 'p',
    delay = 0,
    staggerDelay = 0.02
}) => {
    const words = text.split(' ');

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay * 4,
                delayChildren: delay,
            },
        },
    };

    const wordVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };

    const charVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    const Tag = tag;

    return (
        <motion.div
            className={`animated-text ${className}`}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
        >
            {words.map((word, wordIndex) => (
                <motion.span
                    key={wordIndex}
                    className="animated-text__word"
                    variants={wordVariants}
                >
                    {word.split('').map((char, charIndex) => (
                        <motion.span
                            key={charIndex}
                            className="animated-text__char"
                            variants={charVariants}
                        >
                            {char}
                        </motion.span>
                    ))}
                    <span className="animated-text__space">&nbsp;</span>
                </motion.span>
            ))}
        </motion.div>
    );
};

export default AnimatedText;

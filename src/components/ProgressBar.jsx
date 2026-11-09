import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ProgressBar.css';

const ProgressBar = ({ containerRef }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const container = containerRef?.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const scrollProgress = scrollTop / (scrollHeight - clientHeight);
            setProgress(scrollProgress);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [containerRef]);

    return (
        <div className="progress-bar">
            <motion.div
                className="progress-bar__fill"
                style={{ scaleY: progress }}
            />
            <div className="progress-bar__sections">
                {['Home', 'About', 'Exp', 'Projects', 'Tech', 'Research', 'Certs', 'Edu', 'Journey', 'Connect'].map((label, i, arr) => (
                    <div
                        key={label}
                        className="progress-bar__marker"
                        style={{ top: `${(i / (arr.length - 1)) * 100}%` }}
                    >
                        <span className="progress-bar__label">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;

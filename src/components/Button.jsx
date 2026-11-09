import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useElementSize } from '../hooks/useResponsive';
import './Button.css';

const Button = ({
    children,
    onClick,
    variant = 'default',
    size = 'md',
    className = '',
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef(null);
    // ResizeObserver-based measurement: the animated SVG border re-syncs on
    // every viewport resize / font reflow, not just on mount, so it never
    // desyncs from the button box on different screen sizes.
    const dimensions = useElementSize(buttonRef);

    const perimeter = 2 * (dimensions.width + dimensions.height);

    const handleClick = (e) => {
        onClick?.(e);
    };

    return (
        <button
            ref={buttonRef}
            className={`button button--${variant} button--${size} ${className}`}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            <span className="button__content">{children}</span>

            <svg
                className="button__border"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
            >
                <motion.rect
                    x="0.5"
                    y="0.5"
                    width={dimensions.width - 1}
                    height={dimensions.height - 1}
                    fill="none"
                    stroke="var(--accent-gold)"
                    strokeWidth="1"
                    initial={{ strokeDasharray: perimeter, strokeDashoffset: perimeter }}
                    animate={{
                        strokeDashoffset: isHovered ? 0 : perimeter,
                        opacity: isHovered ? 1 : 0
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                />
            </svg>
        </button>
    );
};

export default Button;

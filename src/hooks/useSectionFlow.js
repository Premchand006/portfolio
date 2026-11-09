/* useSectionFlow — Canva-style "flow" transition primitives for sections.
   Wrap each section's content tree in a motion.div using `flowContainer`,
   and wrap each block (heading, card, image, paragraph) with motion.div
   using `flowItem`. Children fade-blur-up into place when the section
   enters the viewport, and reverse out when it leaves. The container
   staggers its children at 0.08s. */

const EASE = [0.4, 0, 0.2, 1];

export const flowContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.45,
            ease: EASE,
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
};

export const flowItem = {
    hidden: {
        opacity: 0,
        y: 40,
        filter: 'blur(4px)',
        transition: { duration: 0.5, ease: EASE },
    },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.65, ease: EASE },
    },
};

export const flowTitle = {
    hidden: {
        opacity: 0,
        y: 80,
        scale: 0.9,
        rotateX: 15,
        filter: 'blur(12px)',
        transition: { duration: 0.5, ease: EASE },
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)',
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }, // Cinematic smooth spring
    },
};

/* Drop-in props for a section-level motion wrapper. */
export const flowContainerProps = {
    variants: flowContainer,
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: false, amount: 0.2 },
};

/* Drop-in props for a single motion item inside a flowContainer. */
export const flowItemProps = {
    variants: flowItem,
};

export const flowTitleProps = {
    variants: flowTitle,
};

/* Standalone (no parent stagger) — for one-off blocks that aren't
   children of a flowContainer. Each one observes itself. */
export const flowSoloProps = {
    initial: { opacity: 0, y: 40, filter: 'blur(4px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: false, amount: 0.25 },
    transition: { duration: 0.65, ease: EASE },
};

import { navigation } from '../config';
import './SectionNavigator.css';

const FIRST = navigation[0];
const LAST = navigation[navigation.length - 1];
const FIRST_SECTION_ID = FIRST.id;
const LAST_SECTION_ID = LAST.id;

const Arrow = ({ up }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {up ? <polyline points="6 15 12 9 18 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
);

const scrollTo = (id, containerRef) => {
    const target = document.getElementById(id);
    if (!target) return;
    const container = containerRef?.current;
    if (container) {
        container.scrollTo({ top: target.offsetTop, behavior: 'auto' });
    } else {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
};

const SectionNavigator = ({ containerRef }) => {
    const goUp = () => {
        scrollTo(FIRST_SECTION_ID, containerRef);
    };

    const goDown = () => {
        scrollTo(LAST_SECTION_ID, containerRef);
    };

    return (
        <div className="section-nav" role="navigation" aria-label="Jump to start or end">
            <button
                type="button"
                className="section-nav__btn"
                onClick={goUp}
                aria-label="Jump to top"
                title="Top"
            >
                <Arrow up />
            </button>
            <button
                type="button"
                className="section-nav__btn"
                onClick={goDown}
                aria-label={`Jump to ${LAST.label.toLowerCase()}`}
                title={LAST.label}
            >
                <Arrow />
            </button>
        </div>
    );
};

export default SectionNavigator;

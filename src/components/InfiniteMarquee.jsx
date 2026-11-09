import { techStack } from '../config';
import './InfiniteMarquee.css';

/* -------------------------------------------------------
   Tech stack — each chip links to the official docs or
   home site of the tech. Icons via cdn.simpleicons.org.
   The two rows live in site.config.json under `techStack`
   (row1 / row2) — edit the `url`, `color` or `slug` there
   to retarget a specific stack. Provide `iconUrl` to use a
   custom logo for tech not on Simple Icons.
------------------------------------------------------- */
const ROW_1 = techStack.row1;
const ROW_2 = techStack.row2;

const TechChip = ({ name, slug, color, url, iconUrl }) => {
    // Prefer an explicit icon URL when provided (e.g. for logos not on
    // Simple Icons), otherwise build the recoloured Simple Icons URL.
    const resolvedIcon = iconUrl
        || (slug ? `https://cdn.simpleicons.org/${slug}/${color.replace('#', '')}` : null);

    const onClick = () => {
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <a
            className="marquee__chip"
            style={{ '--chip-color': color }}
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.preventDefault(); onClick(); }}
            aria-label={`Open ${name} documentation in a new tab`}
            data-magnetic
        >
            <span className="marquee__chip-icon">
                {resolvedIcon ? (
                    <img src={resolvedIcon} alt="" width="22" height="22" loading="lazy" />
                ) : (
                    <span className="marquee__chip-letter">{name.charAt(0)}</span>
                )}
            </span>
            <span className="marquee__chip-name">{name}</span>
        </a>
    );
};

const MarqueeRow = ({ items, reverse = false }) => {
    /* Duplicate for seamless loop. Note: aria-hidden on the wrapper since
       each link will independently be reachable by tab key on the live items.
       For full a11y, the original list also appears in Omnibar search. */
    const doubled = [...items, ...items];

    return (
        <div className="marquee__track-wrapper">
            <div className={`marquee__track ${reverse ? 'marquee__track--reverse' : ''}`}>
                {doubled.map((tech, i) => (
                    <TechChip key={`${tech.name}-${i}`} {...tech} />
                ))}
            </div>
        </div>
    );
};

const InfiniteMarquee = () => {
    return (
        <div className="marquee" aria-label="Technology stack — click any to open docs">
            <MarqueeRow items={ROW_1} />
            <MarqueeRow items={ROW_2} reverse />
        </div>
    );
};

export default InfiniteMarquee;

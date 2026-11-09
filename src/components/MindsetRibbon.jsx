import { sections } from '../config';
import './MindsetRibbon.css';

/* ───────────────────────────────────────────────────────────────
   MindsetRibbon — the research-lifecycle "roadmap" presented as a
   ribbon reel that flows continuously from the left edge to the right
   in a seamless loop. ALL content — label, and each stage's title, desc
   and icon — is editable in site.config.json → sections.research.roadmap.
   Add / remove / reorder stages freely; `icon` selects a built-in glyph by
   name or points at a custom image path/URL. Each cell is [stage + arrow]
   so the track is an exact 2× duplicate — translateX(-50%) loops with no
   seam.
   ─────────────────────────────────────────────────────────────── */

const STAGES = sections.research.roadmap || [];
const RIBBON_LABEL = sections.research.roadmapLabel || 'Research mindset';

/* Built-in icon set, selectable from config by name (stage.icon). Flat,
   solid-fill (no gradient <defs> — the track duplicates each icon and
   duplicate gradient ids would collide). Colours echo the reference
   artwork while sitting cleanly on the dark theme. */
const ICONS = {
    lightbulb: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="9.5" r="6.4" fill="#FFC107" />
            <circle cx="9.8" cy="7.6" r="1.9" fill="#FFE082" />
            <rect x="9" y="15.4" width="6" height="2.1" rx="1" fill="#B0BEC5" />
            <rect x="9.7" y="17.7" width="4.6" height="1.7" rx="0.85" fill="#90A4AE" />
            <path d="M10.4 19.6h3.2c-.2 1-.9 1.5-1.6 1.5s-1.4-.5-1.6-1.5z" fill="#78909C" />
        </svg>
    ),
    book: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 5.5c2.8-1 5.6-1 8 0v13c-2.4-1-5.2-1-8 0v-13z" fill="#42A5F5" />
            <path d="M21 5.5c-2.8-1-5.6-1-8 0v13c2.4-1 5.2-1 8 0v-13z" fill="#1E88E5" />
            <path d="M5 8h4M5 10.4h4M15 8h4M15 10.4h4" stroke="#E3F2FD" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    hierarchy: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 7v4M6 11h12M6 11v3M12 11v3M18 11v3" stroke="#64B5F6" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <rect x="9.5" y="3" width="5" height="4" rx="1" fill="#1E88E5" />
            <rect x="3.5" y="14" width="5" height="4" rx="1" fill="#42A5F5" />
            <rect x="9.5" y="14" width="5" height="4" rx="1" fill="#42A5F5" />
            <rect x="15.5" y="14" width="5" height="4" rx="1" fill="#42A5F5" />
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.6" y="13" width="3.2" height="7" rx="0.6" fill="#26C6DA" />
            <rect x="8.6" y="10" width="3.2" height="10" rx="0.6" fill="#29B6F6" />
            <rect x="13.6" y="11.5" width="3.2" height="8.5" rx="0.6" fill="#42A5F5" />
            <rect x="18.6" y="8" width="3.2" height="12" rx="0.6" fill="#1E88E5" />
            <path d="M4.5 9 10 6 15 8 20.5 3.6" stroke="#AB47BC" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="4.5" cy="9" r="1.3" fill="#CE93D8" />
            <circle cx="20.5" cy="3.6" r="1.3" fill="#CE93D8" />
        </svg>
    ),
    presentation: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="4" width="17" height="11" rx="1.2" fill="#1E88E5" />
            <rect x="5.4" y="6" width="13.2" height="7" rx="0.8" fill="#0D47A1" />
            <path d="M11 9.4a2.1 2.1 0 1 0 2.1-2.1V9.4H11z" fill="#FFCA28" />
            <path d="M13.3 7.3a2.1 2.1 0 0 1 2 2.1h-2z" fill="#EF5350" />
            <rect x="14.4" y="7.1" width="3" height="0.95" rx="0.47" fill="#90CAF9" />
            <rect x="14.4" y="9" width="3" height="0.95" rx="0.47" fill="#90CAF9" />
            <rect x="14.4" y="10.9" width="2.2" height="0.95" rx="0.47" fill="#90CAF9" />
            <path d="M12 15v3M9 19l3-1 3 1" stroke="#90A4AE" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

/* Shown when stage.icon names no built-in glyph — so any edited / newly
   added stage still renders something rather than a blank space. */
const FALLBACK_ICON = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="#d29f22" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.6" fill="#d29f22" />
    </svg>
);

/* Resolve a stage's icon from config: a custom image path/URL, else a
   built-in name (falls back to the stage id for older configs), else the
   neutral fallback glyph. */
const renderIcon = (stage) => {
    const key = stage.icon || stage.id;
    if (typeof key === 'string' && (key.startsWith('/') || key.startsWith('http') || key.includes('.'))) {
        return <img src={key} alt="" loading="lazy" draggable={false} />;
    }
    return ICONS[key] || FALLBACK_ICON;
};

const Arrow = () => (
    <span className="ribbon__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    </span>
);

const RibbonCell = ({ stage, hidden }) => (
    <div className="ribbon__cell" aria-hidden={hidden || undefined}>
        <div className="ribbon__stage">
            <span className="ribbon__icon">{renderIcon(stage)}</span>
            <span className="ribbon__title">{stage.title}</span>
            <span className="ribbon__desc">{stage.desc}</span>
        </div>
        <Arrow />
    </div>
);

const MindsetRibbon = () => {
    if (STAGES.length === 0) return null;

    // Duplicate the sequence; with each cell carrying its own trailing
    // arrow, the two halves are identical width → translateX(-50%) seam-free.
    const doubled = [...STAGES, ...STAGES];

    return (
        <div className="ribbon" aria-label={`${RIBBON_LABEL} — research lifecycle`}>
            {RIBBON_LABEL && <span className="ribbon__label section-label">{RIBBON_LABEL}</span>}
            <div className="ribbon__viewport">
                <div className="ribbon__track">
                    {doubled.map((stage, i) => (
                        <RibbonCell
                            key={`${stage.id}-${i}`}
                            stage={stage}
                            hidden={i >= STAGES.length}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MindsetRibbon;

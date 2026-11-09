import './DinoRunner.css';

/* ── DinoRunner ───────────────────────────────────────────────────
   A pure-CSS replica of the Chrome offline T-Rex game styled for
   the dark theme. The dino sprite crosses the full width of its
   container from the leftmost to the rightmost end on a continuous
   loop, jumping over a sequence of cacti placed along the way.
   Legs cycle via a 2-frame steps() animation; cactus positions and
   the dino's vertical jump-keyframes are kept in sync via a shared
   8-second master tempo. Decorative only — aria-hidden.            */

/* Inline pixel-art SVG dino — traced rect-by-rect, 1:1, from the
   reference Chrome T-Rex icon on a 20×21 pixel grid (each "pixel"
   is a 4-unit square; the grid is inset by 4 / 6 units so it sits
   centered inside the original 88×96 viewBox, keeping the CSS
   layout untouched). The silhouette is exact: a chunky square head
   with the eye notched out, a recessed snout and jutting lower jaw,
   a curved neck dropping into the chest, a wedge tail at the upper
   back, a tiny forward arm stub, and two legs whose lower segments
   alternate to read as a running cycle. */
const DinoSvg = ({ leg }) => (
    <svg
        className={`dino-runner__dino-svg dino-runner__dino-svg--${leg}`}
        viewBox="0 0 88 96"
        shapeRendering="crispEdges"
        aria-hidden="true"
        fill="currentColor"
    >
        {/* ── Head: flat-topped block, eye notched out at row 1 ── */}
        <rect x="44" y="6"  width="40" height="4" />
        <rect x="44" y="10" width="8"  height="4" />   {/* left of eye  */}
        <rect x="56" y="10" width="28" height="4" />   {/* right of eye */}
        <rect x="44" y="14" width="40" height="4" />
        <rect x="44" y="18" width="40" height="4" />
        <rect x="44" y="22" width="40" height="4" />

        {/* ── Snout (recessed) then jutting lower jaw / chin ───── */}
        <rect x="44" y="26" width="20" height="4" />   {/* upper mouth */}
        <rect x="44" y="30" width="32" height="4" />   {/* lower jaw   */}

        {/* ── Neck curving down from the head into the chest ───── */}
        <rect x="40" y="34" width="20" height="4" />
        <rect x="32" y="38" width="28" height="4" />

        {/* ── Tail — pointed wedge growing out of the upper back ─ */}
        <rect x="4"  y="34" width="4"  height="4" />
        <rect x="4"  y="38" width="4"  height="4" />
        <rect x="4"  y="42" width="8"  height="4" />
        <rect x="4"  y="46" width="12" height="4" />

        {/* ── Body mass + tiny forward arm stub ────────────────── */}
        <rect x="28" y="42" width="40" height="4" />
        <rect x="24" y="46" width="36" height="4" />
        <rect x="64" y="46" width="4"  height="4" />   {/* arm tip */}
        <rect x="4"  y="50" width="56" height="4" />
        <rect x="4"  y="54" width="56" height="4" />
        <rect x="8"  y="58" width="52" height="4" />
        <rect x="12" y="62" width="44" height="4" />
        <rect x="16" y="66" width="36" height="4" />
        <rect x="20" y="70" width="28" height="4" />   {/* hips */}

        {/* ── Legs (shared upper segments) ─────────────────────── */}
        <rect x="24" y="74" width="12" height="4" />   {/* back thigh  */}
        <rect x="40" y="74" width="8"  height="4" />   {/* front thigh */}

        {/* ── Legs (alternating lower segments → run cycle) ────── */}
        {leg === 'left' && (
            <>
                {/* Back leg planted to the foot */}
                <rect x="24" y="78" width="8"  height="4" />
                <rect x="24" y="82" width="4"  height="4" />
                <rect x="24" y="86" width="8"  height="4" />
                {/* Front leg lifted (lower segment raised) */}
                <rect x="44" y="78" width="4"  height="4" />
            </>
        )}
        {leg === 'right' && (
            <>
                {/* Back leg lifted (lower segment raised) */}
                <rect x="24" y="78" width="8"  height="4" />
                {/* Front leg planted to the foot */}
                <rect x="44" y="78" width="4"  height="4" />
                <rect x="44" y="82" width="4"  height="4" />
                <rect x="44" y="86" width="8"  height="4" />
            </>
        )}
    </svg>
);

const CactusSmall = () => (
    <svg
        className="dino-runner__cactus-svg"
        viewBox="0 0 20 40"
        shapeRendering="crispEdges"
        aria-hidden="true"
    >
        <path
            fill="currentColor"
            d="M 8 0 H 12 V 30 H 16 V 12 H 20 V 30 H 16 V 40 H 4 V 22 H 0 V 8 H 4 Z"
        />
    </svg>
);

const CactusLarge = () => (
    <svg
        className="dino-runner__cactus-svg dino-runner__cactus-svg--lg"
        viewBox="0 0 34 56"
        shapeRendering="crispEdges"
        aria-hidden="true"
    >
        <path
            fill="currentColor"
            d="M 12 0 H 22 V 38 H 28 V 14 H 34 V 44 H 28 V 56 H 6 V 26 H 0 V 10 H 6 V 0 H 12 Z"
        />
    </svg>
);

/* Cactus positions are tuned so the dino's jump apex
   (keyframed in DinoRunner.css) lands exactly over each one. */
const CACTI = [
    { left: '22%', variant: 'small' },
    { left: '48%', variant: 'large' },
    { left: '74%', variant: 'small' },
];

const DinoRunner = () => (
    <div className="dino-runner" aria-hidden="true">
        <div className="dino-runner__sky" />

        {/* Sequence of cacti the dino jumps over. */}
        {CACTI.map((c, i) => (
            <span
                key={i}
                className={`dino-runner__cactus dino-runner__cactus--${c.variant}`}
                style={{ left: c.left }}
            >
                {c.variant === 'large' ? <CactusLarge /> : <CactusSmall />}
            </span>
        ))}

        {/* Dino — outer translates X, inner translates Y (the jump arc).
            Splitting them onto two elements keeps both on the compositor
            and avoids transform-property conflicts on a single node. */}
        <div className="dino-runner__dino">
            <div className="dino-runner__dino-jump">
                {/* The two leg poses live in the DOM at once; the legs-cycle
                    animation toggles their opacity in 2 steps to read as a
                    running cycle without sprite-sheet plumbing. */}
                <DinoSvg leg="left" />
                <DinoSvg leg="right" />
            </div>
        </div>

        {/* Ground line — a 1-px high band with periodic ticks. */}
        <div className="dino-runner__ground" />
    </div>
);

export default DinoRunner;

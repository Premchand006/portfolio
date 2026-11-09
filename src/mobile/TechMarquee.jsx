/* ============================================================================
   TechMarquee — mobile tech-stack strip.
   ----------------------------------------------------------------------------
   Same idea as the desktop InfiniteMarquee (two rows auto-looping in opposite
   directions, brand-coloured Simple Icons, seamless via duplicated items) but
   styled against the mobile theme tokens so it reads on BOTH light and dark.
   ========================================================================== */

import { techStack } from '../config';

const ROW_1 = techStack.row1;
const ROW_2 = techStack.row2;

function Chip({ name, slug, color, url, iconUrl }) {
  // Pure white (#FFFFFF, e.g. Next.js) is invisible on the light theme — swap
  // it for a mid-grey that reads on both themes. Everything else keeps brand.
  const hex = (color || '').toLowerCase() === '#ffffff' ? '888888' : (color || '888888').replace('#', '');
  const icon = iconUrl || (slug ? `https://cdn.simpleicons.org/${slug}/${hex}` : null);

  return (
    <a className="m-mq__chip" href={url || '#'} target="_blank" rel="noopener noreferrer"
       aria-label={`Open ${name} documentation`}>
      <span className="m-mq__icon">
        {icon
          ? <img src={icon} alt="" width="20" height="20" loading="lazy" />
          : <span className="m-mq__letter">{name.charAt(0)}</span>}
      </span>
      <span className="m-mq__name">{name}</span>
    </a>
  );
}

function Row({ items, reverse = false }) {
  const doubled = [...items, ...items];   // 2× for a seamless -50% loop
  return (
    <div className="m-mq__row" aria-hidden={reverse ? 'true' : undefined}>
      <div className={`m-mq__track${reverse ? ' m-mq__track--rev' : ''}`}>
        {doubled.map((t, i) => <Chip key={`${t.name}-${i}`} {...t} />)}
      </div>
    </div>
  );
}

export default function TechMarquee() {
  return (
    <div className="m-mq" aria-label="Technology stack — tap any to open its docs">
      <Row items={ROW_1} />
      <Row items={ROW_2} reverse />
    </div>
  );
}

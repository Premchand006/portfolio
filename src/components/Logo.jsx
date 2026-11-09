import { useState } from 'react';
import './Logo.css';

/**
 * Logo — renders an uploaded logo image if it loads, otherwise falls
 * back to a tasteful gold-bordered text-initial chip. Lets the user
 * drop logos into /public/assets/... whenever they're ready, without
 * the layout collapsing if a file is missing.
 *
 * Props:
 *   src      — path to the logo file (e.g. /assets/work/sima-logo.svg)
 *   alt      — accessible label
 *   name     — display name; first 1-2 chars used for the fallback chip
 *   size     — px (default 44)
 *   shape    — 'rounded' | 'square' | 'circle' (default 'rounded')
 */
const Logo = ({ src, alt = '', name = '', size = 44, shape = 'rounded' }) => {
    const [errored, setErrored] = useState(false);
    const hasSrc = src && !errored;
    const initials = (name || '?')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return (
        <span
            className={`logo logo--${shape}`}
            style={{ width: size, height: size, fontSize: size * 0.42 }}
            role="img"
            aria-label={alt || name}
        >
            {hasSrc ? (
                <img
                    src={src}
                    alt=""
                    width="64"
                    height="64"
                    loading="lazy"
                    draggable={false}
                    onError={() => setErrored(true)}
                />
            ) : (
                <span className="logo__initials" aria-hidden="true">{initials}</span>
            )}
        </span>
    );
};

export default Logo;

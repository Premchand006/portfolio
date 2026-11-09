import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigation, assets, identity } from '../config';
import './TopNav.css';

/**
 * TopNav — the primary navigation surface: a centred floating pill with
 * the brand logo on the left and a link to every section. It replaces the
 * old vertical progress rail.
 *
 * The active highlight mirrors the `data-active-section` attribute that
 * App's IntersectionObserver writes onto <html>, so the nav always agrees
 * with the scroll position without re-implementing the observer here.
 */
const HOME_ID = navigation[0].id;

/* Sun / moon glyphs for the theme toggle — both always rendered; CSS
   crossfades them based on <html data-theme> (same trick as mobile). */
const SunIcon = () => (
    <svg className="topnav__ticon topnav__ticon--sun" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.2v2.4M12 19.4v2.4M4.2 12H1.8M22.2 12h-2.4M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
    </svg>
);

const MoonIcon = () => (
    <svg className="topnav__ticon topnav__ticon--moon" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />
    </svg>
);

const TopNav = ({ onJourney, onResearch, onBlogs, theme = 'dark', onToggleTheme }) => {
    const [active, setActive] = useState(() =>
        (typeof document !== 'undefined' &&
            document.documentElement.getAttribute('data-active-section')) || HOME_ID
    );
    const [logoFailed, setLogoFailed] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        const sync = () => setActive(root.getAttribute('data-active-section') || HOME_ID);
        sync();
        const mo = new MutationObserver(sync);
        mo.observe(root, { attributes: true, attributeFilter: ['data-active-section'] });
        return () => mo.disconnect();
    }, []);

    const go = (id) => {
        /* "Journey", "Research", and "Blogs" open dedicated full-page components */
        if (id === 'journey' && onJourney) { onJourney(); return; }
        if (id === 'research' && onResearch) { onResearch(); return; }
        if (id === 'blogs' && onBlogs) { onBlogs(); return; }
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    /* The user requested this dashboard be available in all sections. */
    return (
        <AnimatePresence>
            <motion.nav
                    className="topnav"
                    aria-label="Primary"
                    initial={{ opacity: 0, y: -18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <button
                        type="button"
                        className={'topnav__logo' + (assets.logo && !logoFailed ? '' : ' topnav__logo--text')}
                        onClick={() => go(HOME_ID)}
                        aria-label={`${identity.shortName} — back to top`}
                        title={identity.shortName}
                    >
                        {assets.logo && !logoFailed ? (
                            <img
                                src={assets.logo}
                                alt=""
                                width="52"
                                height="52"
                                draggable={false}
                                onError={() => setLogoFailed(true)}
                            />
                        ) : (
                            <span className="topnav__logo-initials" aria-hidden="true">
                                {identity.initials}
                            </span>
                        )}
                    </button>

                    <ul className="topnav__pill" role="list">
                        {/* "Connect/Contact" is intentionally omitted here — the
                           top-left status badge is the contact entry point. */}
                        {navigation.filter((item) => ['home', 'about', 'research', 'journey', 'blogs'].includes(item.id)).map((item) => {
                            const isActive = active === item.id;
                            const isContact = item.id === 'contact';
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        className={
                                            'topnav__link' +
                                            (isActive ? ' is-active' : '') +
                                            (isContact ? ' topnav__link--contact' : '')
                                        }
                                        onClick={() => go(item.id)}
                                        aria-current={isActive ? 'true' : undefined}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                        {onToggleTheme && (
                            <li>
                                <button
                                    type="button"
                                    className="topnav__link topnav__theme"
                                    onClick={onToggleTheme}
                                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                    aria-pressed={theme === 'dark'}
                                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                                >
                                    <SunIcon />
                                    <MoonIcon />
                                </button>
                            </li>
                        )}
                    </ul>
                </motion.nav>
        </AnimatePresence>
    );
};

export default TopNav;

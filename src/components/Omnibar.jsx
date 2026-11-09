import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    navigation, omnibar, projects, skills, experience, education,
    certificates, publications, awards, socials, journey,
} from '../config';
import './Omnibar.css';

/* Inline SVG icon set — keeps the palette dependency-light. */
const I = (paths, viewBox = '0 0 24 24') => (props) => (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        {paths}
    </svg>
);
const FiHome      = I(<><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>);
const FiUser      = I(<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>);
const FiCode      = I(<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>);
const FiBriefcase = I(<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>);
const FiFolder    = I(<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>);
const FiAward     = I(<><circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 22 12 19 17 22 15.79 13.88"/></>);
const FiMail      = I(<><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/></>);
const FiBookOpen  = I(<><path d="M2 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8z"/></>);
const FiCompass   = I(<><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></>);
const FiSearch    = I(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>);

/* ─────────────────────────────────────────────────────────────
   Command Palette — primary navigation surface.
   - Ctrl+K / ⌘K opens
   - search filters across sections + project / skill / paper data
   - Up/Down arrows + Enter to jump
   - "Ask AI" stays as a secondary mode toggle in the header
   ───────────────────────────────────────────────────────────── */

/* Map the icon names stored in config to their components (JSX can't
   live in JSON). The navigation list itself is the single source. */
const ICONS = { FiHome, FiUser, FiCode, FiBriefcase, FiFolder, FiAward, FiMail, FiBookOpen, FiCompass, FiSearch };

const navigationLinks = navigation.map((n) => ({
    name: n.label,
    id: n.id,
    Icon: ICONS[n.icon] || FiSearch,
}));

/* Extras searchable but not surfaced in the default list. */
const extraSections = [];

const allSections = [...navigationLinks, ...extraSections];

const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
};

const flattenData = () => {
    const items = [];
    projects?.forEach((it) => items.push({ ...it, type: 'Project' }));
    skills?.forEach((it) => items.push({ ...it, type: 'Skill', title: it.name }));
    experience?.forEach((it) => items.push({ ...it, type: 'Experience' }));
    education?.forEach((it) => items.push({ ...it, type: 'Education', title: it.degree }));
    certificates?.forEach((it) => items.push({ ...it, type: 'Certificate' }));
    publications?.forEach((it) => items.push({ ...it, type: 'Publication' }));
    awards?.forEach((it) => items.push({ ...it, type: 'Award' }));
    socials?.forEach((it) => items.push({ ...it, type: 'Social', title: it.platform }));
    journey?.forEach((it) => items.push({ ...it, type: 'Journey' }));
    return items;
};

const typeToSectionId = {
    Project: 'projects',
    Skill: 'tech-stack',
    Experience: 'experience',
    Education: 'education',
    Certificate: 'certifications',
    Publication: 'projects',
    Award: 'about',
    Social: 'contact',
    Journey: 'journey',
};

const Omnibar = ({ isOpen, onClose, onResearch, onBlogs, onJourney }) => {
    const [mode, setMode] = useState('search');
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    /* Assistant state (ask mode only) */
    const [askInput, setAskInput] = useState('');
    const [askPending, setAskPending] = useState(false);
    const [askHistory, setAskHistory] = useState([]);
    const askScrollRef = useRef(null);

    const allItems = useMemo(() => flattenData(), []);
    const isSearching = query.trim().length > 0;

    /* Filter sections AND content data by the query. */
    const filteredSections = useMemo(() => {
        if (!isSearching) return navigationLinks;
        const q = query.toLowerCase();
        return allSections.filter((s) => s.name.toLowerCase().includes(q));
    }, [isSearching, query]);

    const searchResults = useMemo(() => {
        if (!isSearching) return [];
        const lowerQuery = query.toLowerCase();
        return allItems.filter((item) => {
            const title = item.title || item.name || '';
            const description = item.description || '';
            const tags = item.tags?.join(' ') || '';
            return (
                title.toLowerCase().includes(lowerQuery) ||
                description.toLowerCase().includes(lowerQuery) ||
                tags.toLowerCase().includes(lowerQuery)
            );
        }).slice(0, 8);
    }, [query, allItems, isSearching]);

    const scrollToSection = useCallback((id) => {
        if (!id) return;
        const cleanId = id.replace(/^#/, '');
        
        if (cleanId === 'research' && onResearch) { onResearch(); return; }
        if (cleanId === 'blogs' && onBlogs) { onBlogs(); return; }
        if (cleanId === 'journey' && onJourney) { onJourney(); return; }
        
        const el = document.getElementById(cleanId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        onClose();
        setQuery('');
    }, [onClose, onResearch, onBlogs, onJourney]);

    const openLinkOrSection = useCallback((item) => {
        const externalTypes = { Social: 'link', Project: 'link', Certificate: 'url', Publication: 'url' };
        const linkKey = externalTypes[item.type];
        if (linkKey && item[linkKey]) {
            window.open(item[linkKey], '_blank', 'noopener,noreferrer');
            onClose();
            return;
        }
        scrollToSection(typeToSectionId[item.type] || 'home');
    }, [scrollToSection, onClose]);

    /* Combined keyboard list — sections first, then content matches. */
    const keyboardList = useMemo(() => {
        if (isSearching) {
            return [
                ...filteredSections.map((s) => ({ kind: 'section', ref: s })),
                ...searchResults.map((r) => ({ kind: 'item', ref: r })),
            ];
        }
        return navigationLinks.map((s) => ({ kind: 'section', ref: s }));
    }, [isSearching, filteredSections, searchResults]);

    useEffect(() => { setSelectedIndex(0); }, [query, mode]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setAskInput('');
            setAskHistory([]);
            setMode('search');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    /* Keyboard nav (search mode only) */
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
            if (mode !== 'search') return;
            const items = keyboardList;
            const maxIndex = items.length - 1;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((p) => Math.min(p + 1, maxIndex));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((p) => Math.max(p - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const picked = items[selectedIndex];
                if (!picked) return;
                if (picked.kind === 'section') scrollToSection(picked.ref.id);
                else openLinkOrSection(picked.ref);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, keyboardList, selectedIndex, scrollToSection, openLinkOrSection, onClose, mode]);

    useEffect(() => {
        if (askScrollRef.current) askScrollRef.current.scrollTop = askScrollRef.current.scrollHeight;
    }, [askHistory, askPending]);

    const submitAsk = useCallback(async () => {
        const q = askInput.trim();
        if (!q || askPending) return;
        setAskPending(true);
        setAskHistory((h) => [...h, { q, a: null }]);
        setAskInput('');
        try {
            const res = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q }),
            });
            const body = await res.json().catch(() => ({}));
            if (res.status === 404) {
                setAskHistory((h) => {
                    const next = [...h];
                    next[next.length - 1] = {
                        q,
                        a: "Assistant API not reachable in local Vite dev. Run `vercel dev` (with GEMINI_API_KEY set), or it'll work once deployed to Vercel.",
                        error: true,
                    };
                    return next;
                });
            } else if (!res.ok || !body.ok) {
                setAskHistory((h) => {
                    const next = [...h];
                    next[next.length - 1] = {
                        q,
                        a: body.error === 'assistant_not_configured'
                            ? "I'm not configured yet — set GEMINI_API_KEY in env."
                            : body.error === 'rate_limited'
                                ? 'Hit the rate limit for this window — try again in a few minutes.'
                                : 'Something went wrong reaching the assistant. Try again in a moment.',
                        error: true,
                    };
                    return next;
                });
            } else {
                setAskHistory((h) => {
                    const next = [...h];
                    next[next.length - 1] = { q, a: body.reply, section: body.suggestSection };
                    return next;
                });
            }
        } catch {
            setAskHistory((h) => {
                const next = [...h];
                next[next.length - 1] = { q, a: 'Network hiccup — try again.', error: true };
                return next;
            });
        } finally {
            setAskPending(false);
        }
    }, [askInput, askPending]);

    let runningIndex = -1;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="cmdp-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="cmdp"
                        initial={{ opacity: 0, scale: 0.96, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -16 }}
                        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Command palette"
                    >
                        {/* ── Top: search input + esc tag ── */}
                        <div className="cmdp__top">
                            <FiSearch className="cmdp__search-icon" aria-hidden="true" />
                            <input
                                type="text"
                                className="cmdp__input"
                                placeholder={omnibar.searchPlaceholder}
                                value={mode === 'search' ? query : askInput}
                                onChange={(e) => mode === 'search'
                                    ? setQuery(e.target.value)
                                    : setAskInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (mode === 'ask' && e.key === 'Enter') {
                                        e.preventDefault();
                                        submitAsk();
                                    }
                                }}
                                autoFocus
                                aria-label={mode === 'search' ? 'Search portfolio' : 'Ask AI'}
                            />
                            <button
                                type="button"
                                className={`cmdp__mode-toggle${mode === 'ask' ? ' is-active' : ''}`}
                                onClick={() => setMode((m) => (m === 'search' ? 'ask' : 'search'))}
                                aria-pressed={mode === 'ask'}
                            >
                                {mode === 'ask' ? 'Search' : 'Ask AI'}
                            </button>
                            <kbd className="cmdp__esc">Esc</kbd>
                        </div>

                        {mode === 'search' ? (
                            <>
                                <div className="cmdp__body">
                                    <div className="cmdp__label">{omnibar.navigateLabel}</div>
                                    <ul className="cmdp__list" role="listbox">
                                        {filteredSections.map((s) => {
                                            runningIndex += 1;
                                            const i = runningIndex;
                                            const active = i === selectedIndex;
                                            const Icon = s.Icon;
                                            return (
                                                <li key={s.id}>
                                                    <button
                                                        type="button"
                                                        className={`cmdp__row${active ? ' is-active' : ''}`}
                                                        onMouseEnter={() => setSelectedIndex(i)}
                                                        onClick={() => scrollToSection(s.id)}
                                                        role="option"
                                                        aria-selected={active}
                                                    >
                                                        <Icon className="cmdp__row-icon" aria-hidden="true" />
                                                        <span className="cmdp__row-name">
                                                            {highlightText(s.name, query)}
                                                        </span>
                                                        <span className="cmdp__row-arrow" aria-hidden="true">↵</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {isSearching && searchResults.length > 0 && (
                                        <>
                                            <div className="cmdp__label cmdp__label--secondary">
                                                Matches ({searchResults.length})
                                            </div>
                                            <ul className="cmdp__list" role="listbox">
                                                {searchResults.map((item) => {
                                                    runningIndex += 1;
                                                    const i = runningIndex;
                                                    const active = i === selectedIndex;
                                                    return (
                                                        <li key={`${item.type}-${item.id ?? item.title}`}>
                                                            <button
                                                                type="button"
                                                                className={`cmdp__row${active ? ' is-active' : ''}`}
                                                                onMouseEnter={() => setSelectedIndex(i)}
                                                                onClick={() => openLinkOrSection(item)}
                                                                role="option"
                                                                aria-selected={active}
                                                            >
                                                                <span className="cmdp__row-tag">{item.type}</span>
                                                                <span className="cmdp__row-name">
                                                                    {highlightText(item.title || item.name, query)}
                                                                </span>
                                                                <span className="cmdp__row-arrow" aria-hidden="true">↵</span>
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </>
                                    )}

                                    {isSearching && filteredSections.length === 0 && searchResults.length === 0 && (
                                        <div className="cmdp__empty">
                                            No results for &ldquo;{query}&rdquo;.
                                        </div>
                                    )}
                                </div>

                                <div className="cmdp__footer">
                                    <span className="cmdp__brand">{omnibar.brand}</span>
                                    <div className="cmdp__hints">
                                        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                                        <span><kbd>↵</kbd> go</span>
                                        <span><kbd>Esc</kbd> close</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="cmdp__body cmdp__body--ask" ref={askScrollRef} aria-live="polite">
                                    {askHistory.length === 0 && !askPending && (
                                        <div className="cmdp__ask-intro">
                                            <p>{omnibar.askIntro}</p>
                                            <div className="cmdp__ask-suggestions">
                                                {omnibar.askSuggestions.map((s) => (
                                                    <button key={s} type="button" className="cmdp__ask-chip" onClick={() => setAskInput(s)}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {askHistory.map((turn, i) => (
                                        <div key={i} className="cmdp__ask-turn">
                                            <div className="cmdp__ask-q">{turn.q}</div>
                                            {turn.a ? (
                                                <div className={`cmdp__ask-a${turn.error ? ' is-error' : ''}`}>
                                                    {turn.a}
                                                    {turn.section && (
                                                        <button type="button" className="cmdp__ask-jump" onClick={() => scrollToSection(turn.section)}>
                                                            Jump to {turn.section.replace('#', '')} →
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="cmdp__ask-thinking" aria-label="Thinking"><span /><span /><span /></div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="cmdp__footer">
                                    <span className="cmdp__brand">{omnibar.brand}</span>
                                    <div className="cmdp__hints">
                                        <span><kbd>↵</kbd> send</span>
                                        <span><kbd>Esc</kbd> close</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Omnibar;

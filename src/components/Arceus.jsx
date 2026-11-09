import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { arceus as arceusCfg, navigation } from '../config';
import './Arceus.css';

const PLACEHOLDER_REPLY = arceusCfg.placeholderReply;

/* Section id → display label, derived from the single navigation list. */
const SECTION_HINTS = Object.fromEntries(navigation.map((n) => [n.id, n.label]));

const RobotIcon = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="7" width="16" height="12" rx="3" />
        <circle cx="9" cy="13" r="1.4" fill="currentColor" />
        <circle cx="15" cy="13" r="1.4" fill="currentColor" />
        <path d="M12 7V4" />
        <path d="M10 4h4" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

/* Ask the Gemini-backed /api/assistant (the same endpoint the Omnibar
   "Ask" tab uses). Returns { reply, section } — `section` is a suggested
   "#id" to scroll to. Falls back to the canned reply when the API isn't
   reachable, e.g. plain `vite` dev which doesn't serve /api (use
   `vercel dev`, or it works once deployed to Vercel). */
const fetchArceusReply = async (text) => {
    try {
        const res = await fetch('/api/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text }),
        });
        if (res.status === 404) return { reply: PLACEHOLDER_REPLY };
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.ok) {
            const reply =
                body.error === 'rate_limited'
                    ? 'I’m getting a lot of questions right now — give me a few minutes and try again.'
                    : body.error === 'assistant_not_configured'
                        ? 'The assistant isn’t configured yet — GEMINI_API_KEY needs to be set in the environment.'
                        : 'Something went wrong reaching me. Please try again in a moment.';
            return { reply };
        }
        return { reply: body.reply, section: body.suggestSection };
    } catch {
        return { reply: PLACEHOLDER_REPLY };
    }
};

const jumpToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
};

/* Turn bare URLs in a reply (paper links, GitHub, résumé, …) into real,
   clickable anchors without using innerHTML. */
const URL_RE = /https?:\/\/[^\s<>()]+/g;
const linkify = (text) => {
    if (!text) return text;
    const out = [];
    let last = 0;
    let m;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(text)) !== null) {
        let url = m[0];
        let trail = '';
        const tm = url.match(/[.,;:!?)\]]+$/); // don't swallow trailing punctuation
        if (tm) { trail = tm[0]; url = url.slice(0, -trail.length); }
        if (m.index > last) out.push(text.slice(last, m.index));
        out.push(
            <a key={`${m.index}-${url}`} className="arceus-link" href={url} target="_blank" rel="noopener noreferrer">
                {url}
            </a>
        );
        if (trail) out.push(trail);
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out.length ? out : text;
};

const Arceus = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'arceus', text: arceusCfg.greeting },
    ]);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, open]);

    const toggle = () => setOpen((prev) => !prev);

    const handleSend = async (e) => {
        e?.preventDefault();
        const text = draft.trim();
        if (!text || sending) return;
        setDraft('');
        setSending(true);
        setMessages((m) => [...m, { role: 'user', text }]);

        const { reply, section } = await fetchArceusReply(text);
        setMessages((m) => [...m, { role: 'arceus', text: reply }]);
        setSending(false);

        /* If the assistant points at a section (e.g. "#about"), scroll
           there once the reply has rendered. */
        if (section) {
            setTimeout(() => jumpToSection(section.replace(/^#/, '')), 450);
        }
    };

    return (
        <>
            <button
                type="button"
                className="arceus-trigger"
                onClick={toggle}
                aria-label={open ? 'Close Arceus assistant' : 'Open Arceus assistant'}
                title="Arceus"
            >
                <RobotIcon />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="arceus-backdrop"
                        className="arceus-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={toggle}
                        aria-hidden="true"
                    />
                )}
                {open && (
                    <motion.aside
                        key="arceus-drawer"
                        className="arceus-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        role="dialog"
                        aria-label="Arceus assistant"
                    >
                        <header className="arceus-drawer__header">
                            <div>
                                <h2 className="arceus-drawer__title">{arceusCfg.title}</h2>
                                <p className="arceus-drawer__subtitle"><em>{arceusCfg.subtitle}</em></p>
                            </div>
                            <button
                                type="button"
                                className="arceus-drawer__close"
                                onClick={toggle}
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                        </header>

                        <div className="arceus-drawer__messages" ref={listRef}>
                            {messages.map((m, i) => (
                                <div key={i} className={`arceus-msg arceus-msg--${m.role}`}>
                                    {m.role === 'arceus' ? linkify(m.text) : m.text}
                                </div>
                            ))}
                            {sending && (
                                <div className="arceus-msg arceus-msg--arceus arceus-msg--typing">
                                    <span></span><span></span><span></span>
                                </div>
                            )}
                        </div>

                        <div className="arceus-drawer__quicklinks" aria-label="Jump to section">
                            {Object.entries(SECTION_HINTS).slice(0, arceusCfg.quicklinkCount).map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    className="arceus-quicklink"
                                    onClick={() => jumpToSection(id)}
                                >
                                    {arceusCfg.quicklinkPrefix} {label} →
                                </button>
                            ))}
                        </div>

                        <form className="arceus-drawer__input" onSubmit={handleSend}>
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder={arceusCfg.inputPlaceholder}
                                aria-label="Message Arceus"
                                maxLength={400}
                            />
                            <button type="submit" aria-label="Send" disabled={!draft.trim() || sending}>
                                <SendIcon />
                            </button>
                        </form>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

export default Arceus;

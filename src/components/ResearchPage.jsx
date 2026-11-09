import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import ResearchSection from '../sections/ResearchSection';
import { identity, assets, navigation } from '../config';

const ResearchPage = ({ open, onClose }) => {
    // Navigation helper for footer links
    const goToSection = (id) => {
        onClose();
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
    };

    // Esc to close, lock body scroll
    useEffect(() => {
        if (!open) return;
        
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="tlx-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Research and publications"
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto' }}
                >
                    <header className="tlx-topbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
                        <button type="button" className="tlx-brand" onClick={onClose}
                            aria-label={`${identity.shortName} — back to site`} title="Back to site">
                            {assets.logo
                                ? <img src={assets.logo} alt="" width="36" height="36" draggable={false} />
                                : <span className="tlx-brand-initials">{identity.initials}</span>}
                        </button>
                        <button type="button" className="tlx-topbar-close" onClick={onClose} aria-label="Close">
                            <span aria-hidden="true">✕</span><span className="tlx-topbar-close-hint">ESC</span>
                        </button>
                    </header>
                    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
                        <ResearchSection />
                    </div>

                    <footer className="tlx-footer">
                        <button type="button" className="tlx-brand tlx-brand--footer" onClick={onClose} aria-label="Back to site">
                            {assets.logo
                                ? <img src={assets.logo} alt="" width="40" height="40" draggable={false} />
                                : <span className="tlx-brand-initials">{identity.initials}</span>}
                        </button>
                        <nav className="tlx-footer-nav" aria-label="Site">
                            {navigation.map((n) => (
                                <button key={n.id} type="button" className="tlx-footer-link"
                                    onClick={() => (n.id === 'journey' ? onClose() : goToSection(n.id))}>
                                    {n.label}
                                </button>
                            ))}
                        </nav>
                        <p className="tlx-footer-credit">
                            © 2026 {identity.shortName} — engineered with precision, crafted with passion.
                        </p>
                    </footer>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResearchPage;

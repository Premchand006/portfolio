import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { identity, assets, blogs, navigation, sections } from '../config';
import './BlogsPage.css';

const BlogsPage = ({ open, onClose }) => {
    const blogsConfig = sections?.blogs || {};
    const CATEGORIES = blogsConfig.categories || ['VIEW ALL'];
    const [selectedCategory, setSelectedCategory] = useState('VIEW ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 6;

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

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    const filteredBlogs = (blogs || []).filter((b) => {
        const matchesCategory = selectedCategory === 'VIEW ALL' || (b.category && b.category.toUpperCase() === selectedCategory);
        const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
    const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="tlx-overlay blogs-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Blogs - thoughts in ink"
                >
                    <header className="tlx-topbar blogs-topbar">
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
                    
                    <div className="blogs-page-content">
                        <header className="blogs-header">
                            <div className="blogs-layered-title">
                                <span className="blogs-layered-bg">
                                    <span style={{ color: 'var(--accent-gold, #d29f22)' }}>
                                        {blogsConfig.headingBgAccent || 'PAGES'}
                                    </span>
                                    {' '}
                                    {blogsConfig.headingBg || 'I SPELT'}
                                </span>
                                <span className="blogs-layered-fg">{blogsConfig.headingFg || 'Ink On'}</span>
                            </div>
                            <p className="blogs-lead">
                                {blogsConfig.description ? (
                                    Array.isArray(blogsConfig.description) 
                                        ? blogsConfig.description.map((line, idx) => (
                                            <span key={idx}>{line}<br/></span>
                                          ))
                                        : blogsConfig.description
                                ) : (
                                    <>
                                        Notes on technology, building systems, and how things work under the hood<br/>
                                        — written while learning, published while it still hurts.
                                    </>
                                )}
                            </p>
                        </header>
                        
                        <div className="blogs-main-layout">
                            <aside className="blogs-sidebar">
                                <h2 className="blogs-sidebar-title">Categories</h2>
                                <ul className="blogs-category-list">
                                    {CATEGORIES.map(cat => (
                                        <li key={cat}>
                                            <button 
                                                type="button" 
                                                className={`blogs-category-btn ${selectedCategory === cat ? 'is-active' : ''}`}
                                                onClick={() => setSelectedCategory(cat)}
                                            >
                                                {cat}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                            
                            <div className="blogs-feed">
                                <div className="blogs-feed-header">
                                    <h2 className="blogs-feed-title">recent posts</h2>
                                    <div className="blogs-search-wrapper">
                                        <input 
                                            type="text" 
                                            placeholder="Search" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="blogs-search-input"
                                        />
                                    </div>
                                </div>
                                
                                <div className="blogs-grid">
                                    {paginatedBlogs.length > 0 ? (
                                        paginatedBlogs.map((blog, i) => (
                                            <motion.a 
                                                key={blog.id || i}
                                                href={blog.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="blog-card"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <div className="blog-card-image" style={{ backgroundImage: `url(${blog.image})` }}>
                                                    <span className="blog-card-category-badge">{blog.category}</span>
                                                </div>
                                                <div className="blog-card-content">
                                                    <div className="blog-card-title-row">
                                                        <h3 className="blog-card-title">{blog.title}</h3>
                                                        <span className="blog-card-arrow">↗</span>
                                                    </div>
                                                    <div className="blog-card-meta">
                                                        <span className="blog-card-date">{blog.date}</span>
                                                    </div>
                                                </div>
                                            </motion.a>
                                        ))

                                    ) : (
                                        <div className="blogs-empty">No posts found.</div>
                                    )}
                                </div>
                                
                                {totalPages > 1 && (
                                    <div className="blogs-pagination">
                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <button 
                                                key={index + 1} 
                                                className={`blogs-page-btn ${currentPage === index + 1 ? 'is-active' : ''}`}
                                                onClick={() => setCurrentPage(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
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

export default BlogsPage;

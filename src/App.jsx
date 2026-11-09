import { useState, useEffect, useRef, useCallback } from 'react';

import HomeSection from './sections/HomeSection';
import AboutSection from './sections/AboutSection';
import TechstackSection from './sections/TechstackSection';
import CodeSection from './sections/CodeSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import ProjectsSection from './sections/ProjectsSection';
import ContactSection from './sections/ContactSection';

import Omnibar from './components/Omnibar';
import MeteorBackground from './components/MeteorBackground';
import MagneticCursor from './components/MagneticCursor';
import TopNav from './components/TopNav';
import LoadingScreen from './components/LoadingScreen';
import LiveStatus from './components/LiveStatus';
import StickyCTA from './components/StickyCTA';
import StarField from './components/StarField';

import ResumeButton from './components/ResumeButton';
import SectionNavigator from './components/SectionNavigator';
import Arceus from './components/Arceus';
import TimelinePage from './components/TimelinePage';
import ResearchPage from './components/ResearchPage';
import BlogsPage from './components/BlogsPage';

import { sectionIds as SECTION_IDS } from './config';
import useTheme from './hooks/useTheme';
import './App.css';

/* Ordered section ids come from the single navigation list in
   src/config/site.config.json — used by the IntersectionObserver to set
   the active section on <html> so the background + starfield can react. */

function App() {
    const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showResearch, setShowResearch] = useState(false);
    const [showBlogs, setShowBlogs] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    /* Loader runs on every page load/refresh — no skip logic, no session check. */
    const [showLoader, setShowLoader] = useState(true);

    /* Light/dark theme — writes data-theme to <html>; every themed style keys
       off it. Shared hook with the mobile build (same saved preference). */
    const { theme, toggle: toggleTheme } = useTheme();

    const containerRef = useRef(null);
    const finishLoadRef = useRef(null);
    const timerDoneRef = useRef(false);
    const globeDoneRef = useRef(false);

    /* ── Always start at hero ── */
    useEffect(() => {
        window.scrollTo(0, 0);
        if (containerRef.current) containerRef.current.scrollTop = 0;
        document.documentElement.setAttribute('data-active-section', 'home');
    }, []);

    /* ── Scroll-jacked globe ── */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const onScroll = () => {
            const prog = Math.min(1, container.scrollTop / container.clientHeight);
            setScrollProgress(prog);
        };
        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Active-section observer ── */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const elements = SECTION_IDS
            .map((id) => container.querySelector(`#${id}`))
            .filter(Boolean);

        /* Long-scroll: sections vary in height and many exceed the viewport, so
           an absolute intersectionRatio threshold can't reliably fire (a section
           taller than root/0.75 never reaches 0.75). Instead watch a thin band at
           the vertical centre of the scroll container — whichever section crosses
           that centre line becomes active. This is height-independent. */
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
                    const prev = document.documentElement.getAttribute('data-active-section');
                    if (prev !== id) {
                        document.documentElement.setAttribute('data-active-section', id);
                    }
                });
            },
            { root: container, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [showLoader]);

    /* ── Magnetic cursor ── */
    useEffect(() => {
        document.documentElement.classList.add('mc-active');
        return () => document.documentElement.classList.remove('mc-active');
    }, []);

    const tryDismiss = useCallback(() => {
        if (!showLoader) return;
        if (timerDoneRef.current && globeDoneRef.current) {
            finishLoadRef.current?.();
            setTimeout(() => setShowLoader(false), 900);
        }
    }, [showLoader]);

    useEffect(() => {
        if (!showLoader) return;
        const id = setTimeout(() => {
            timerDoneRef.current = true;
            tryDismiss();
        }, 5000);
        return () => clearTimeout(id);
    }, [showLoader, tryDismiss]);

    const onGlobeReady = useCallback(() => {
        if (!showLoader) {
            globeDoneRef.current = true;
            return;
        }
        globeDoneRef.current = true;
        tryDismiss();
    }, [showLoader, tryDismiss]);

    useEffect(() => {
        if (!showLoader) return;
        const id = setTimeout(() => {
            globeDoneRef.current = true;
            timerDoneRef.current = true;
            finishLoadRef.current?.();
            setTimeout(() => setShowLoader(false), 900);
        }, 8000);
        return () => clearTimeout(id);
    }, [showLoader]);

    const onLoadingScreenMount = useCallback((finishFn) => {
        finishLoadRef.current = finishFn;
    }, []);

    /* ── Omnibar ── */
    const openOmnibar = () => { setIsOmnibarOpen(true); };
    const closeOmnibar = () => { setIsOmnibarOpen(false); };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOmnibarOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="app">
            {/* Dynamic per-section background layer */}
            <div className="bg-layer" aria-hidden="true" />

            {showLoader && <LoadingScreen onComplete={onLoadingScreenMount} />}

            {!showLoader && (
                <>
                    <TopNav
                        onJourney={() => setShowTimeline(true)}
                        onResearch={() => setShowResearch(true)}
                        onBlogs={() => setShowBlogs(true)}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                    />
                    <LiveStatus />
                    <ResumeButton />
                    <SectionNavigator containerRef={containerRef} />
                    <Arceus />
                    <StickyCTA containerRef={containerRef} />
                </>
            )}

            <StarField min={20} max={25} />
            <MeteorBackground number={24} />
            <MagneticCursor />

            <div className="snap-container" ref={containerRef}>
                <HomeSection
                    onOpenOmnibar={openOmnibar}
                    scrollProgress={scrollProgress}
                    onReady={onGlobeReady}
                    paused={showTimeline}
                />
                <AboutSection />
                <ExperienceSection />{/*  */}
                <ProjectsSection />
                <TechstackSection />
                <CodeSection />
                <EducationSection />
                <ContactSection />
            </div>

            <Omnibar
                isOpen={isOmnibarOpen}
                onClose={closeOmnibar}
                onJourney={() => setShowTimeline(true)}
                onResearch={() => setShowResearch(true)}
                onBlogs={() => setShowBlogs(true)}
            />
            <TimelinePage open={showTimeline} onClose={() => setShowTimeline(false)} />
            <ResearchPage open={showResearch} onClose={() => setShowResearch(false)} />
            <BlogsPage open={showBlogs} onClose={() => setShowBlogs(false)} />
        </div>
    );
}

export default App;

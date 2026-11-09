/* ============================================================
   VEESHAL.ME — shared loader + seamless page transitions
   include on every page BEFORE the page script.
   body[data-loader="full"]  → full pit-lane burst (home)
   otherwise                 → quick spin-up (~1.4s)
   Fires `page:reveal` on document when the curtain lifts.
   ============================================================ */

window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
    const loader = document.querySelector('.loader');
    const counterEl = document.getElementById('loaderCounter');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fullMode = document.body.dataset.loader === 'full';

    function reveal() {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
        document.dispatchEvent(new CustomEvent('page:reveal'));
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    function killLoader() {
        if (loader) loader.style.display = 'none';
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    if (!loader || prefersReducedMotion || typeof gsap === 'undefined') {
        if (counterEl) counterEl.textContent = '100';
        killLoader();
        reveal();
        return;
    }

    // ---- shared pieces -------------------------------------------------
    const spin = gsap.to('#lwRotor', {
        rotation: '+=360',
        svgOrigin: '200 200',
        duration: 0.35,
        repeat: -1,
        ease: 'none',
    });

    const countDur = fullMode ? 1.7 : 0.5;
    const speed = { v: 0 };
    gsap.to(speed, {
        v: 100,
        duration: countDur,
        ease: 'power2.inOut',
        onUpdate: () => {
            if (counterEl) counterEl.textContent = String(Math.round(speed.v)).padStart(3, '0');
        },
    });
    gsap.to('.loader-line i', { scaleX: 1, duration: countDur, ease: 'power2.inOut' });

    const tl = gsap.timeline();

    if (fullMode) {
        // speed streaks flying past the wheel
        const streakBox = document.getElementById('loaderStreaks');
        const streaks = [];
        if (streakBox) {
            for (let i = 0; i < 16; i++) {
                const s = document.createElement('div');
                s.className = 'streak' + (i % 3 === 0 ? ' white' : '');
                s.style.top = (8 + Math.random() * 84) + '%';
                streakBox.appendChild(s);
                streaks.push(s);
            }
            streaks.forEach((s) => {
                gsap.fromTo(s,
                    { x: '110vw', opacity: 0 },
                    {
                        x: '-40vw',
                        opacity: () => 0.25 + Math.random() * 0.75,
                        duration: 0.45 + Math.random() * 0.5,
                        repeat: -1,
                        delay: Math.random() * 0.8,
                        ease: 'none',
                    }
                );
            });
        }

        tl.fromTo('.loader-wheel-wrap',
            { x: '-130vw' },
            { x: 0, duration: 1.05, ease: 'power3.out' }
        )
            .to('.loader-wheel-wrap', { y: -14, duration: 0.12, ease: 'power1.out' }, 1.0)
            .to('.loader-wheel-wrap', { y: 0, duration: 0.3, ease: 'bounce.out' }, 1.12)
            .add(() => {
                spin.timeScale(2.2);
                gsap.to(streaks, { opacity: 0, duration: 0.3, stagger: 0.012 });
            }, 1.7)
            .to('.loader-wheel-wrap', { x: '130vw', duration: 0.55, ease: 'power4.in' }, 1.85)
            .to('.loader-meta, .loader-speedo, .loader-line, .loader-road', { autoAlpha: 0, duration: 0.3 }, 2.05)
            .add(reveal, 2.15)
            .to(loader, {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 0.75,
                ease: 'power4.inOut',
            }, 2.15)
            .add(() => { spin.kill(); killLoader(); });
    } else {
        // quick mode: wheel spins up in place, short and seamless
        tl.fromTo('.loader-wheel-wrap',
            { scale: 0.82, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power3.out' }
        )
            .add(() => { spin.timeScale(1.8); }, 0.35)
            .to('.loader-wheel-wrap', { scale: 0.9, autoAlpha: 0, duration: 0.3, ease: 'power3.in' }, 0.5)
            .to('.loader-meta, .loader-speedo, .loader-line, .loader-road', { autoAlpha: 0, duration: 0.2 }, 0.5)
            .add(reveal, 0.62)
            .to(loader, {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 0.55,
                ease: 'power4.inOut',
            }, 0.62)
            .add(() => { spin.kill(); killLoader(); });
    }

    // ---- outbound transition: ink panel wipes down, then navigate ------
    const out = document.createElement('div');
    out.className = 'page-out';
    // Critical inline styles — guarantees correct rendering even with stale CSS cache
    Object.assign(out.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '9991',
        background: '#111110',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        clipPath: 'inset(0% 0% 100% 0%)',
        opacity: '0',
        pointerEvents: 'none',
    });
    out.innerHTML =
        '<svg viewBox="0 0 100 100" style="width:84px;height:84px">' +
        '<circle cx="50" cy="50" r="42" fill="none" stroke="#2a2a2e" stroke-width="8"/>' +
        '<circle cx="50" cy="50" r="42" fill="none" stroke="#F9B646" stroke-width="8" stroke-dasharray="58 206" stroke-linecap="round"/>' +
        '<circle cx="50" cy="50" r="9" fill="#F9B646"/>' +
        '</svg>';
    document.body.appendChild(out);

    let leaving = false;

    function leaveTo(href) {
        if (leaving) return;
        leaving = true;
        out.style.pointerEvents = 'auto';
        gsap.to(out.querySelector('svg'), { rotation: '+=360', duration: 0.8, repeat: -1, ease: 'none' });
        gsap.fromTo(out,
            { clipPath: 'inset(0% 0% 100% 0%)', autoAlpha: 1 },
            {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 0.5,
                ease: 'power4.inOut',
                onComplete: () => { window.location.href = href; },
            }
        );
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return;

        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        const url = new URL(a.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // same-page hash jump
        if (url.pathname === window.location.pathname && url.hash) return;

        e.preventDefault();
        leaveTo(a.href);
    });

    // back/forward cache restore: never leave a stuck curtain
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            leaving = false;
            gsap.set(out, { clipPath: 'inset(0% 0% 100% 0%)', autoAlpha: 0 });
            out.style.pointerEvents = 'none';
            killLoader();
            document.body.classList.remove('is-loading');
            document.body.classList.add('is-ready');
        }
    });
})();

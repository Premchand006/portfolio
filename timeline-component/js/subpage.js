/* ============================================================
   VEESHAL.ME — shared subpage engine
   cursor · scroll progress wheel · reveal intro
   (loader + transitions live in js/loader.js)
   ============================================================ */

(function () {
    if (typeof gsap === 'undefined') return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    /* entrance when the loader lifts */
    document.addEventListener('page:reveal', () => {
        if (prefersReducedMotion) return;
        const targets = document.querySelectorAll('.site-header, .sub-hero, .timeline-title');
        if (targets.length) {
            gsap.from(targets, { y: 28, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
        }
    });

    /* custom cursor */
    if (isFinePointer && !prefersReducedMotion) {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');

        if (dot && ring) {
            const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
            const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
            const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
            const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

            window.addEventListener('mousemove', (e) => {
                dotX(e.clientX); dotY(e.clientY);
                ringX(e.clientX); ringY(e.clientY);
            });

            document.addEventListener('mouseover', (e) => {
                if (e.target.closest('a, button, .blog-card, .chaicode-card, .timeline-content')) {
                    document.body.classList.add('cursor-hover');
                } else {
                    document.body.classList.remove('cursor-hover');
                }
            });
        }
    }

    /* scroll progress wheel */
    const swRotor = document.querySelector('.scroll-wheel .sw-rotor');
    const swProgress = document.querySelector('.scroll-wheel .sw-progress');

    if (swRotor && swProgress && window.ScrollTrigger) {
        const r = swProgress.r.baseVal.value;
        const circ = 2 * Math.PI * r;
        swProgress.style.strokeDasharray = circ;
        swProgress.style.strokeDashoffset = circ;

        ScrollTrigger.create({
            start: 0,
            end: () => document.documentElement.scrollHeight - window.innerHeight,
            onUpdate: (self) => {
                gsap.set(swRotor, { rotation: self.progress * 1080, transformOrigin: '50% 50%' });
                swProgress.style.strokeDashoffset = circ * (1 - self.progress);
            },
        });

        document.querySelector('.scroll-wheel').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();

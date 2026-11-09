// ============================================================
//  Timeline Script — Snake Path + Scroll Fill + Image Slider
// ============================================================

gsap.registerPlugin(ScrollTrigger);

(function(__run){ if (document.readyState !== 'loading') __run(); else document.addEventListener("DOMContentLoaded", __run); })(() => {

    // ──────────────────────────────────────────────────────────
    // 1.  GSAP ITEM ANIMATIONS
    // ──────────────────────────────────────────────────────────
    const timelineItems = document.querySelectorAll(".timeline-item");

    timelineItems.forEach((item) => {
        const direction = item.classList.contains("left") ? -60 : 60;

        gsap.fromTo(
            item,
            { opacity: 0, x: direction, y: 30 },
            {
                opacity: 1, x: 0, y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                // Rebuild path after item lands so the line stays accurate
                onComplete: () => {
                    snakeData = buildSnakePath();
                    updateScrollFill();
                }
            }
        );
    });

    // ──────────────────────────────────────────────────────────
    // 2.  SNAKE SVG PATH
    //     Build a zigzag path through the icon centres
    // ──────────────────────────────────────────────────────────
    const wrapper   = document.getElementById("timelineProgressWrapper");
    const pathBase  = document.getElementById("snakePathBase");
    const pathFill  = document.getElementById("snakePathFill");
    const container = document.querySelector(".timeline-container");

    /**
     * getIconCenter — uses offsetLeft/offsetTop (unaffected by CSS transforms)
     * so GSAP's initial x/y offsets don't corrupt the path coordinates.
     * Walks the offsetParent chain up to .timeline-container.
     */
    function getIconCenter(icon) {
        let x = icon.offsetLeft + icon.offsetWidth  / 2;
        let y = icon.offsetTop  + icon.offsetHeight / 2;
        let el = icon.offsetParent;
        while (el && el !== container) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }
        // wrapper is position:absolute top:0 left:0 inside container
        // so SVG (0,0) == container top-left == offsetLeft/Top reference origin
        return { x, y };
    }

    function buildSnakePath() {
        const icons = document.querySelectorAll(".timeline-icon");
        if (!icons.length) return null;

        const pts = [];
        icons.forEach(icon => pts.push(getIconCenter(icon)));

        // Build smooth SVG path (cubic bezier through each icon centre)
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const midY = (prev.y + curr.y) / 2;
            d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
        }

        pathBase.setAttribute("d", d);
        pathFill.setAttribute("d", d);

        const totalLen = pathFill.getTotalLength();
        pathFill.style.strokeDasharray  = totalLen;
        pathFill.style.strokeDashoffset = totalLen;

        return { pts, totalLen };
    }

    // ──────────────────────────────────────────────────────────
    // 3.  SCROLL-DRIVEN FILL (yellow line grows as you scroll)
    // ──────────────────────────────────────────────────────────
    let snakeData = null;

    function updateScrollFill() {
        if (!snakeData) return;

        const { totalLen } = snakeData;
        const icons = document.querySelectorAll(".timeline-icon");
        if (!icons.length) return;

        // Use offsetTop-based positions for scroll range too
        const firstCenter = getIconCenter(icons[0]);
        const lastCenter  = getIconCenter(icons[icons.length - 1]);

        // Convert layout y (relative to container) to absolute page y
        const containerTop = container.getBoundingClientRect().top + window.scrollY;
        const scrollStart  = containerTop + firstCenter.y - window.innerHeight * 0.6;
        const scrollEnd    = containerTop + lastCenter.y  - window.innerHeight * 0.4;

        const progress = Math.min(1, Math.max(0,
            (window.scrollY - scrollStart) / (scrollEnd - scrollStart)
        ));

        pathFill.style.strokeDashoffset = totalLen * (1 - progress);
    }

    window.addEventListener("scroll", updateScrollFill, { passive: true });

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            snakeData = buildSnakePath();
            updateScrollFill();
        }, 200);
    });

    // Build after layout settles (images loaded can shift heights)
    setTimeout(() => { snakeData = buildSnakePath(); updateScrollFill(); }, 50);
    setTimeout(() => { snakeData = buildSnakePath(); updateScrollFill(); }, 500);
    window.addEventListener("load",   () => { snakeData = buildSnakePath(); updateScrollFill(); });

    // ──────────────────────────────────────────────────────────
    // 4.  IMAGE SLIDER
    //     - 5 second auto-advance
    //     - Directional slide: current exits LEFT, next enters RIGHT
    //       (and vice versa when going backward)
    // ──────────────────────────────────────────────────────────
    const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

    document.querySelectorAll(".img-slider").forEach(slider => {
        if (slider.classList.contains("single")) return;

        const imgs    = Array.from(slider.querySelectorAll(".slider-img"));
        const dots    = Array.from(slider.querySelectorAll(".dot"));
        const prevBtn = slider.querySelector(".slider-prev");
        const nextBtn = slider.querySelector(".slider-next");

        let current     = 0;
        let autoTimer   = null;
        let isAnimating = false;

        // On init: make first image "active" (translateX 0), rest wait off-right
        imgs.forEach((img, i) => {
            img.style.transition = "none";
            img.style.transform  = i === 0 ? "translateX(0)" : "translateX(100%)";
            img.classList.toggle("active", i === 0);
        });

        /**
         * goTo(newIdx, direction)
         *   direction: 'next'  → current exits left,  incoming from right
         *              'prev'  → current exits right, incoming from left
         */
        function goTo(newIdx, direction = "next") {
            if (isAnimating) return;
            newIdx = (newIdx + imgs.length) % imgs.length;
            if (newIdx === current) return;

            isAnimating = true;

            const outImg = imgs[current];
            const inImg  = imgs[newIdx];

            const outTarget = direction === "next" ? "-100%" : "100%";
            const inStart   = direction === "next" ?  "100%" : "-100%";

            // Position incoming off-screen instantly (no transition)
            inImg.style.transition = "none";
            inImg.style.transform  = `translateX(${inStart})`;
            inImg.classList.add("active");

            // Force reflow so transition applies
            inImg.offsetWidth;

            // Animate both simultaneously
            const ease = "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)";
            inImg.style.transition  = ease;
            inImg.style.transform   = "translateX(0)";

            outImg.style.transition = ease;
            outImg.style.transform  = `translateX(${outTarget})`;

            current = newIdx;

            // Update dots
            dots.forEach((d, i) => d.classList.toggle("active", i === current));

            setTimeout(() => {
                // Clean up: reset outgoing image back to off-right, remove active
                outImg.classList.remove("active");
                outImg.style.transition = "none";
                outImg.style.transform  = "translateX(100%)";
                isAnimating = false;
            }, 670);
        }

        function startAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => goTo(current + 1, "next"), AUTO_SLIDE_INTERVAL);
        }

        function stopAuto() { clearInterval(autoTimer); }

        prevBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            goTo(current - 1, "prev");
            stopAuto(); startAuto();
        });

        nextBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            goTo(current + 1, "next");
            stopAuto(); startAuto();
        });

        dots.forEach((dot, i) => {
            dot.addEventListener("click", (e) => {
                e.stopPropagation();
                const dir = i > current ? "next" : "prev";
                goTo(i, dir);
                stopAuto(); startAuto();
            });
        });

        startAuto();

        // Open modal on slider click
        slider.addEventListener("click", () => {
            const item   = slider.closest(".timeline-item");
            const images = JSON.parse(item.dataset.images || "[]");
            openModal(images, current);
        });
    });

    // Single-image sliders open modal too
    document.querySelectorAll(".img-slider.single").forEach(slider => {
        // Make the single image visible (translateX 0)
        const singleImg = slider.querySelector(".slider-img");
        if (singleImg) {
            singleImg.style.transition = "none";
            singleImg.style.transform  = "translateX(0)";
            singleImg.classList.add("active");
        }

        slider.addEventListener("click", () => {
            const item   = slider.closest(".timeline-item");
            const images = JSON.parse(item.dataset.images || "[]");
            openModal(images, 0);
        });
    });

    // ──────────────────────────────────────────────────────────
    // 5.  FULLSCREEN MODAL WITH SLIDER
    // ──────────────────────────────────────────────────────────
    const modal     = document.getElementById("timelineModal");
    const modalImg  = document.getElementById("timelinePopupImg");
    const closeBtn  = document.querySelector(".close-modal");
    const modalPrev = document.querySelector(".modal-prev");
    const modalNext = document.querySelector(".modal-next");
    const modalDots = document.getElementById("modalDots");

    let modalImages  = [];
    let modalCurrent = 0;

    function openModal(images, startIdx) {
        modalImages  = images;
        modalCurrent = startIdx;
        renderModal();
        modal.classList.add("active");
    }

    function renderModal() {
        modalImg.src = modalImages[modalCurrent];

        modalDots.innerHTML = "";
        if (modalImages.length > 1) {
            modalImages.forEach((_, i) => {
                const d = document.createElement("span");
                d.className = "dot" + (i === modalCurrent ? " active" : "");
                d.addEventListener("click", () => { modalCurrent = i; renderModal(); });
                modalDots.appendChild(d);
            });
        }

        modalPrev.classList.toggle("hidden", modalImages.length <= 1);
        modalNext.classList.toggle("hidden", modalImages.length <= 1);
    }

    modalPrev?.addEventListener("click", (e) => {
        e.stopPropagation();
        modalCurrent = (modalCurrent - 1 + modalImages.length) % modalImages.length;
        renderModal();
    });

    modalNext?.addEventListener("click", (e) => {
        e.stopPropagation();
        modalCurrent = (modalCurrent + 1) % modalImages.length;
        renderModal();
    });

    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("active")) return;
        if (e.key === "ArrowLeft")  { modalCurrent = (modalCurrent - 1 + modalImages.length) % modalImages.length; renderModal(); }
        if (e.key === "ArrowRight") { modalCurrent = (modalCurrent + 1) % modalImages.length; renderModal(); }
        if (e.key === "Escape")     modal.classList.remove("active");
    });

    closeBtn?.addEventListener("click",  () => modal.classList.remove("active"));
    modal?.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });

});

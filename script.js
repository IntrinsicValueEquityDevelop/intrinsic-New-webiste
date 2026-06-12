/**
 * Intrinsic Value Equity Advisors
 * Core Interactivity & Animations Script (Velvet Marigold Theme)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. SCROLL-SENSITIVE HEADER EFFECT
    // ==========================================================================
    const header = document.querySelector('.main-header');
    let lastScrollY = window.scrollY;
    
    const checkScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Smart Header Reveal Logic
        if (currentScrollY <= 80) {
            // Always show header at the very top of the page
            header.classList.remove('header-hidden');
        } else if (currentScrollY > lastScrollY) {
            // Scrolling down -> Hide header
            header.classList.add('header-hidden');
        } else {
            // Scrolling up -> Reveal header
            header.classList.remove('header-hidden');
        }
        
        lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Run on load in case page is refreshed while scrolled down

    // ==========================================================================
    // 2. MOBILE MENU DRAWER CONTROLLER
    // ==========================================================================
    const menuTrigger = document.querySelector('.menu-trigger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuTrigger && navMenu) {
        menuTrigger.addEventListener('click', () => {
            const isOpen = menuTrigger.classList.toggle('open');
            navMenu.classList.toggle('open', isOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        
        // Close menu when clicking links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuTrigger.classList.remove('open');
                navMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }



    // ==========================================================================
    // 5. CURRENT PAGE HIGHLIGHTER
    // ==========================================================================
    const currentPath = window.location.pathname;
    const pageLinks = document.querySelectorAll('.nav-link');
    
    pageLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Simple matching logic for standard paths
        if (currentPath.endsWith(linkPath) || (currentPath === '/' && linkPath === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Initialize 3D Philosophy Spiral Carousel
    init3DSpiral();

    // Initialize Featured In dynamic section
    initFeaturedSection();

    // Initialize Case Studies section and modals
    initCaseStudies();

    // Initialize Stats Counter Animation
    initStatsCounters();

    // Initialize Comparison Modal
    initComparisonModal();
});



// ==========================================================================
// 3D SPIRAL PHILOSOPHY CAROUSEL
// ==========================================================================
function init3DSpiral() {
    const philosophySection = document.getElementById('philosophy');
    const carousel = document.querySelector('.spiral-carousel');
    const spiralCards = document.querySelectorAll('.spiral-card');
    
    if (philosophySection && carousel && spiralCards.length > 0) {
        // Dynamic adjustments for helix spacing depending on device width
        const getSpiralRadius = () => {
            return window.innerWidth <= 480 ? 150 : (window.innerWidth <= 768 ? 200 : 380);
        };
        
        const getSpiralYSpacingFactor = () => {
            return window.innerWidth <= 480 ? 0.75 : (window.innerWidth <= 768 ? 1.05 : 1.35);
        };
        
        // Bind hover listeners for scale pop
        spiralCards.forEach(card => {
            card.isHovered = false;
            card.currentHoverScale = 1.0;
            card.addEventListener('mouseenter', () => {
                card.isHovered = true;
            });
            card.addEventListener('mouseleave', () => {
                card.isHovered = false;
            });
        });
        
        // Helix geometry configuration constants
        const totalRange = 540;   // 1.5 full turns track length (540 degrees)
        const spacing = 60;       // 60 degrees spacing between cards (9 cards * 60 = 540)
        const startAngle = -270;  // Track starts at -270 degrees and wraps to +270
        
        let idleOffsetAngle = 0;
        let targetScrollOffsetAngle = 0;
        let currentScrollOffsetAngle = 0;
        
        const heroSec = document.querySelector('.iv-hero');
        const philosophySticky = document.querySelector('.spiral-philosophy-sticky');
        const featuredSec = document.querySelector('.iv-featured-section');
        const casesSec = document.querySelector('.iv-cases-section');
        const pricingSecEl = document.getElementById('pricing-scroll-section');

        // Setup lerped values for the sections to make all viewport transitions buttery smooth
        const sectionsState = {
            hero: {
                el: heroSec,
                currOpacity: 1, targetOpacity: 1,
                currY: 0, targetY: 0,
                currScale: 1, targetScale: 1,
                pointerEvents: 'auto'
            },
            philosophy: {
                el: philosophySticky,
                currOpacity: 0, targetOpacity: 0,
                currY: 60, targetY: 60,
                currScale: 0.95, targetScale: 0.95,
                pointerEvents: 'none'
            },
            featured: {
                el: featuredSec,
                currOpacity: 0, targetOpacity: 0,
                currY: 60, targetY: 60,
                currScale: 0.95, targetScale: 0.95,
                pointerEvents: 'none',
                hasEntered: false
            },
            cases: {
                el: casesSec,
                currOpacity: 0, targetOpacity: 0,
                currY: 60, targetY: 60,
                currScale: 0.95, targetScale: 0.95,
                pointerEvents: 'none',
                hasEntered: false
            },
            pricing: {
                el: pricingSecEl,
                currOpacity: 0, targetOpacity: 0,
                currY: 60, targetY: 60,
                currScale: 0.95, targetScale: 0.95,
                pointerEvents: 'none'
            }
        };

        const pricingTitle = document.querySelector('.pricing-title-block');
        const pricingCards = document.querySelectorAll('.pricing-card-3d');
        
        const pricingState = {
            hasAnimatedCounter: false,
            counterTimeout: null,
            title: {
                el: pricingTitle,
                currZ: -600, targetZ: -600,
                currScale: 0.3, targetScale: 0.3,
                currOpacity: 0, targetOpacity: 0
            },
            cards: Array.from(pricingCards).map(card => ({
                el: card,
                currZ: -600, targetZ: -600,
                currScale: 0.3, targetScale: 0.3,
                currOpacity: 0, targetOpacity: 0,
                currRotateX: 15, targetRotateX: 15,
                currY: 50, targetY: 50
            }))
        };

        const handleScrollTransitions = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;

            // Define scroll transition checkpoints relative to viewport height
            const heroFadeEnd = 1.0 * windowHeight;

            const philFadeInStart = 0.5 * windowHeight;
            const philFadeInEnd = 1.0 * windowHeight;
            const philSpinStart = 1.0 * windowHeight;
            const philSpinEnd = 3.2 * windowHeight;
            const philFadeOutStart = 3.2 * windowHeight;
            const philFadeOutEnd = 3.7 * windowHeight;

            const featuredFadeInStart = 3.2 * windowHeight;
            const featuredFadeInEnd = 3.7 * windowHeight;
            const featuredFadeOutStart = 4.8 * windowHeight;
            const featuredFadeOutEnd = 5.3 * windowHeight;

            const casesFadeInStart = 4.8 * windowHeight;
            const casesFadeInEnd = 5.3 * windowHeight;
            const casesFadeOutStart = 6.8 * windowHeight;
            const casesFadeOutEnd = 7.3 * windowHeight;

            const pricingFadeInStart = 6.8 * windowHeight;
            const pricingFadeInEnd = 7.3 * windowHeight;
            const pricingZoomStart = 7.3 * windowHeight;
            const pricingZoomEnd = 9.3 * windowHeight;
            const pricingFadeOutStart = 9.3 * windowHeight;
            const pricingFadeOutEnd = 9.8 * windowHeight;

            // 1. Hero Section Fade & Translate (outward)
            if (heroSec) {
                if (scrollY <= heroFadeEnd) {
                    const progress = scrollY / heroFadeEnd;
                    sectionsState.hero.targetOpacity = 1 - progress;
                    sectionsState.hero.targetY = -progress * 60;
                    sectionsState.hero.targetScale = 1 - progress * 0.05;
                    sectionsState.hero.pointerEvents = 'auto';
                } else {
                    sectionsState.hero.targetOpacity = 0;
                    sectionsState.hero.targetY = -60;
                    sectionsState.hero.targetScale = 0.95;
                    sectionsState.hero.pointerEvents = 'none';
                }
            }

            // 2. Philosophy Section (Entrance, Card Spin, and Exit)
            if (philosophySticky) {
                if (scrollY >= philFadeInStart && scrollY <= philFadeInEnd) {
                    // Fade In Phase
                    const progress = (scrollY - philFadeInStart) / (philFadeInEnd - philFadeInStart);
                    sectionsState.philosophy.targetOpacity = progress;
                    sectionsState.philosophy.targetY = 60 * (1 - progress);
                    sectionsState.philosophy.targetScale = 0.95 + 0.05 * progress;
                    sectionsState.philosophy.pointerEvents = progress > 0.5 ? 'auto' : 'none';
                    targetScrollOffsetAngle = 0;
                } else if (scrollY > philFadeInEnd && scrollY < philFadeOutStart) {
                    // Active Spin Phase
                    sectionsState.philosophy.targetOpacity = 1;
                    sectionsState.philosophy.targetY = 0;
                    sectionsState.philosophy.targetScale = 1;
                    sectionsState.philosophy.pointerEvents = 'auto';

                    const spinProgress = (scrollY - philSpinStart) / (philSpinEnd - philSpinStart);
                    const clampedProgress = Math.max(0, Math.min(1, spinProgress));
                    targetScrollOffsetAngle = clampedProgress * 540;
                } else if (scrollY >= philFadeOutStart && scrollY <= philFadeOutEnd) {
                    // Fade Out Phase
                    const progress = (scrollY - philFadeOutStart) / (philFadeOutEnd - philFadeOutStart);
                    sectionsState.philosophy.targetOpacity = 1 - progress;
                    sectionsState.philosophy.targetY = -progress * 60;
                    sectionsState.philosophy.targetScale = 1 - progress * 0.05;
                    sectionsState.philosophy.pointerEvents = (1 - progress) > 0.5 ? 'auto' : 'none';
                    targetScrollOffsetAngle = 540;
                } else if (scrollY > philFadeOutEnd) {
                    // Past Exit
                    sectionsState.philosophy.targetOpacity = 0;
                    sectionsState.philosophy.targetY = -60;
                    sectionsState.philosophy.targetScale = 0.95;
                    sectionsState.philosophy.pointerEvents = 'none';
                    targetScrollOffsetAngle = 540;
                } else {
                    // Before Entrance (scrollY < philFadeInStart, i.e. in Hero Section)
                    sectionsState.philosophy.targetOpacity = 0;
                    sectionsState.philosophy.targetY = 60;
                    sectionsState.philosophy.targetScale = 0.95;
                    sectionsState.philosophy.pointerEvents = 'none';
                    targetScrollOffsetAngle = 0;
                }
            }

            // 3. Featured Section Fade & Translate (inward & outward)
            if (featuredSec) {
                if (scrollY >= featuredFadeInStart && scrollY <= featuredFadeInEnd) {
                    // Fade In Phase
                    const progress = (scrollY - featuredFadeInStart) / (featuredFadeInEnd - featuredFadeInStart);
                    sectionsState.featured.targetOpacity = progress;
                    sectionsState.featured.targetY = 60 * (1 - progress);
                    sectionsState.featured.targetScale = 0.95 + 0.05 * progress;
                    sectionsState.featured.pointerEvents = progress > 0.5 ? 'auto' : 'none';
                    sectionsState.featured.hasEntered = true;
                } else if (scrollY > featuredFadeInEnd && scrollY < featuredFadeOutStart) {
                    // Active Phase
                    sectionsState.featured.targetOpacity = 1;
                    sectionsState.featured.targetY = 0;
                    sectionsState.featured.targetScale = 1;
                    sectionsState.featured.pointerEvents = 'auto';
                    sectionsState.featured.hasEntered = true;
                } else if (scrollY >= featuredFadeOutStart && scrollY <= featuredFadeOutEnd) {
                    // Fade Out Phase
                    const progress = (scrollY - featuredFadeOutStart) / (featuredFadeOutEnd - featuredFadeOutStart);
                    sectionsState.featured.targetOpacity = 1 - progress;
                    sectionsState.featured.targetY = -progress * 60;
                    sectionsState.featured.targetScale = 1 - progress * 0.05;
                    sectionsState.featured.pointerEvents = (1 - progress) > 0.5 ? 'auto' : 'none';
                    sectionsState.featured.hasEntered = true;
                } else if (scrollY > featuredFadeOutEnd) {
                    // Past Exit
                    sectionsState.featured.targetOpacity = 0;
                    sectionsState.featured.targetY = -60;
                    sectionsState.featured.targetScale = 0.95;
                    sectionsState.featured.pointerEvents = 'none';
                    sectionsState.featured.hasEntered = false;
                } else {
                    sectionsState.featured.targetOpacity = 0;
                    sectionsState.featured.targetY = 60;
                    sectionsState.featured.targetScale = 0.95;
                    sectionsState.featured.pointerEvents = 'none';
                    sectionsState.featured.hasEntered = false;
                }
            }

            // 4. Case Studies Section Fade & Translate (inward & outward)
            if (casesSec) {
                if (scrollY >= casesFadeInStart && scrollY <= casesFadeInEnd) {
                    // Fade In Phase
                    const progress = (scrollY - casesFadeInStart) / (casesFadeInEnd - casesFadeInStart);
                    sectionsState.cases.targetOpacity = progress;
                    sectionsState.cases.targetY = 60 * (1 - progress);
                    sectionsState.cases.targetScale = 0.95 + 0.05 * progress;
                    sectionsState.cases.pointerEvents = progress > 0.5 ? 'auto' : 'none';
                    sectionsState.cases.hasEntered = true;
                } else if (scrollY > casesFadeInEnd && scrollY < casesFadeOutStart) {
                    // Active Phase
                    sectionsState.cases.targetOpacity = 1;
                    sectionsState.cases.targetY = 0;
                    sectionsState.cases.targetScale = 1;
                    sectionsState.cases.pointerEvents = 'auto';
                    sectionsState.cases.hasEntered = true;
                } else if (scrollY >= casesFadeOutStart && scrollY <= casesFadeOutEnd) {
                    // Fade Out Phase
                    const progress = (scrollY - casesFadeOutStart) / (casesFadeOutEnd - casesFadeOutStart);
                    sectionsState.cases.targetOpacity = 1 - progress;
                    sectionsState.cases.targetY = -progress * 60;
                    sectionsState.cases.targetScale = 1 - progress * 0.05;
                    sectionsState.cases.pointerEvents = (1 - progress) > 0.5 ? 'auto' : 'none';
                    sectionsState.cases.hasEntered = true;
                } else if (scrollY > casesFadeOutEnd) {
                    // Past Exit
                    sectionsState.cases.targetOpacity = 0;
                    sectionsState.cases.targetY = -60;
                    sectionsState.cases.targetScale = 0.95;
                    sectionsState.cases.pointerEvents = 'none';
                    sectionsState.cases.hasEntered = false;
                } else {
                    sectionsState.cases.targetOpacity = 0;
                    sectionsState.cases.targetY = 60;
                    sectionsState.cases.targetScale = 0.95;
                    sectionsState.cases.pointerEvents = 'none';
                    sectionsState.cases.hasEntered = false;
                }
            }

            // 5. Pricing Section Fade & Translate (inward & outward)
            const pricingSec = sectionsState.pricing.el;
            if (pricingSec) {
                if (scrollY >= pricingFadeInStart && scrollY <= pricingFadeInEnd) {
                    // Fade In Phase
                    const progress = (scrollY - pricingFadeInStart) / (pricingFadeInEnd - pricingFadeInStart);
                    sectionsState.pricing.targetOpacity = progress;
                    sectionsState.pricing.targetY = 60 * (1 - progress);
                    sectionsState.pricing.targetScale = 0.95 + 0.05 * progress;
                    sectionsState.pricing.pointerEvents = progress > 0.5 ? 'auto' : 'none';
                    
                    // Reset zoom state to initial
                    pricingState.title.targetZ = -600;
                    pricingState.title.targetScale = 0.3;
                    pricingState.title.targetOpacity = 0;
                    pricingState.cards.forEach(c => {
                        c.targetZ = -600;
                        c.targetScale = 0.3;
                        c.targetOpacity = 0;
                        c.targetRotateX = 15;
                        c.targetY = 50;
                    });
                    if (pricingState.counterTimeout) {
                        clearTimeout(pricingState.counterTimeout);
                        pricingState.counterTimeout = null;
                    }
                } else if (scrollY > pricingFadeInEnd && scrollY < pricingFadeOutStart) {
                    // Active Phase (Zoom entrance triggers based on scroll progress)
                    sectionsState.pricing.targetOpacity = 1;
                    sectionsState.pricing.targetY = 0;
                    sectionsState.pricing.targetScale = 1;
                    sectionsState.pricing.pointerEvents = 'auto';

                    const zoomProgress = (scrollY - pricingZoomStart) / (pricingZoomEnd - pricingZoomStart);
                    const clampedZoom = Math.max(0, Math.min(1, zoomProgress));

                    // Title: 0.0 -> 0.4
                    const titleProg = Math.max(0, Math.min(1, clampedZoom / 0.4));
                    pricingState.title.targetZ = -600 + 600 * titleProg;
                    pricingState.title.targetScale = 0.3 + 0.7 * titleProg;
                    pricingState.title.targetOpacity = titleProg;

                    // Cards: All together 0.2 -> 0.8
                    const cardsProg = Math.max(0, Math.min(1, (clampedZoom - 0.2) / 0.6));
                    pricingState.cards.forEach(c => {
                        c.targetZ = -600 + 600 * cardsProg;
                        c.targetScale = 0.3 + 0.7 * cardsProg;
                        c.targetOpacity = cardsProg;
                        c.targetRotateX = 15 * (1 - cardsProg);
                        c.targetY = 50 * (1 - cardsProg);
                    });

                    // Trigger dynamic count-down when cards zoom entrance is 90% complete (visible properly)
                    if (cardsProg >= 0.9) {
                        if (!pricingState.hasAnimatedCounter && !pricingState.counterTimeout) {
                            pricingState.counterTimeout = setTimeout(() => {
                                animatePriceCounter();
                                pricingState.hasAnimatedCounter = true;
                                pricingState.counterTimeout = null;
                            }, 500);
                        }
                    } else {
                        if (pricingState.counterTimeout) {
                            clearTimeout(pricingState.counterTimeout);
                            pricingState.counterTimeout = null;
                        }
                    }
                } else if (scrollY >= pricingFadeOutStart && scrollY <= pricingFadeOutEnd) {
                    // Fade Out Phase
                    const progress = (scrollY - pricingFadeOutStart) / (pricingFadeOutEnd - pricingFadeOutStart);
                    sectionsState.pricing.targetOpacity = 1 - progress;
                    sectionsState.pricing.targetY = -progress * 60;
                    sectionsState.pricing.targetScale = 1 - progress * 0.05;
                    sectionsState.pricing.pointerEvents = (1 - progress) > 0.5 ? 'auto' : 'none';

                    // Title & Cards remain zoomed forward
                    pricingState.title.targetZ = 0;
                    pricingState.title.targetScale = 1;
                    pricingState.title.targetOpacity = 1;
                    pricingState.cards.forEach(c => {
                        c.targetZ = 0;
                        c.targetScale = 1;
                        c.targetOpacity = 1;
                        c.targetRotateX = 0;
                        c.targetY = 0;
                    });
                    if (pricingState.counterTimeout) {
                        clearTimeout(pricingState.counterTimeout);
                        pricingState.counterTimeout = null;
                    }
                } else if (scrollY > pricingFadeOutEnd) {
                    // Past Exit
                    sectionsState.pricing.targetOpacity = 0;
                    sectionsState.pricing.targetY = -60;
                    sectionsState.pricing.targetScale = 0.95;
                    sectionsState.pricing.pointerEvents = 'none';
                    if (pricingState.counterTimeout) {
                        clearTimeout(pricingState.counterTimeout);
                        pricingState.counterTimeout = null;
                    }
                } else {
                    // Before Entrance
                    sectionsState.pricing.targetOpacity = 0;
                    sectionsState.pricing.targetY = 60;
                    sectionsState.pricing.targetScale = 0.95;
                    sectionsState.pricing.pointerEvents = 'none';
                    if (pricingState.counterTimeout) {
                        clearTimeout(pricingState.counterTimeout);
                        pricingState.counterTimeout = null;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScrollTransitions);
        handleScrollTransitions(); // Run initially
        
        // Continuous Animation Loop
        function animateSpiral() {
            // Idle rotation (slowly clockwise, moving cards upward)
            idleOffsetAngle += 0.05; 
            
            // Smooth linear interpolation (lerp) for scroll-driven rotation
            currentScrollOffsetAngle += (targetScrollOffsetAngle - currentScrollOffsetAngle) * 0.08;
            
            const baseAngle = idleOffsetAngle + currentScrollOffsetAngle;
            const radius = getSpiralRadius();
            const ySpacingFactor = getSpiralYSpacingFactor();
            
            // A. Smoothly update and apply section transitions (buttery smooth scroll transitions)
            const sectionLerp = 0.08;
            for (const key in sectionsState) {
                const s = sectionsState[key];
                if (s.el) {
                    s.currOpacity += (s.targetOpacity - s.currOpacity) * sectionLerp;
                    s.currY += (s.targetY - s.currY) * sectionLerp;
                    s.currScale += (s.targetScale - s.currScale) * sectionLerp;
                    
                    s.el.style.opacity = s.currOpacity.toFixed(3);
                    s.el.style.transform = `translateY(${s.currY.toFixed(2)}px) scale(${s.currScale.toFixed(3)})`;
                    s.el.style.pointerEvents = s.pointerEvents;
                    
                    // Hide completely when inactive to prevent blocking clicks
                    if (s.currOpacity < 0.01 && s.targetOpacity === 0) {
                        s.el.style.display = 'none';
                    } else {
                        s.el.style.display = '';
                    }
                    
                    // Toggle the entered class for trigger animations in case studies / featured
                    if (key === 'featured' || key === 'cases') {
                        if (s.hasEntered) {
                            s.el.classList.add('entered');
                        } else {
                            s.el.classList.remove('entered');
                        }
                    }
                }
            }
            
            // B. Position each card along the helix track coordinates with smooth flying/fading/blur transitions
            spiralCards.forEach((card, idx) => {
                const angle = baseAngle + idx * spacing;
                
                // Wrap the angle to stay within the repeating track range [-270, 270)
                let wrapped = (angle - startAngle) % totalRange;
                if (wrapped < 0) wrapped += totalRange;
                const trackAngle = startAngle + wrapped;
                
                const rotY = trackAngle;
                const y = -trackAngle * ySpacingFactor; // Negative to make increasing angle translate card upward
                
                // 1. Fade out cards near boundaries to make wrapping jumps invisible
                let boundaryOpacity = 1.0;
                const fadeWidth = 80; // degrees
                if (trackAngle < startAngle + fadeWidth) {
                    boundaryOpacity = (trackAngle - startAngle) / fadeWidth;
                } else if (trackAngle > (startAngle + totalRange - fadeWidth)) {
                    boundaryOpacity = (startAngle + totalRange - trackAngle) / fadeWidth;
                }
                boundaryOpacity = Math.max(0, Math.min(1, boundaryOpacity));
                
                // 2. Continuous flying & faded/blurred rotation based on angle from front (0 degrees)
                let normAngle = rotY % 360;
                if (normAngle < 0) normAngle += 360;
                
                let angleDiff = Math.abs(normAngle);
                if (angleDiff > 180) angleDiff = 360 - angleDiff; // [0, 180], where 0 is front, 180 is back
                
                let frontProgress = (180 - angleDiff) / 180; // 0 in back, 1 in front
                let t = (1 - Math.cos(frontProgress * Math.PI)) / 2; // Smooth cosine curve
                
                // Lerp scale, radius (depth), depth opacity, and blur amount
                let currentScale = 0.62 + 0.43 * t; // scales from 0.62 (back) to 1.05 (front)
                let currentRadius = radius * (0.55 + 0.53 * t); // tight core (0.55*R) to expanded front (1.08*R)
                let depthOpacity = 0.08 + 0.92 * t; // fades to 0.08 in back to keep the helix populated
                let finalOpacity = boundaryOpacity * depthOpacity;
                let blurAmount = (1 - t) * 7.5; // up to 7.5px blur in back, 0px in front
                
                // 3. Smooth hover pop factor interpolation
                const targetHoverScale = card.isHovered ? 1.06 : 1.0;
                card.currentHoverScale += (targetHoverScale - card.currentHoverScale) * 0.15;
                currentScale *= card.currentHoverScale;
                
                // Apply computed styles
                card.style.transform = `rotateY(${rotY.toFixed(1)}deg) translateZ(${currentRadius.toFixed(1)}px) scale(${currentScale.toFixed(3)}) translateY(${y.toFixed(1)}px)`;
                card.style.opacity = finalOpacity.toFixed(3);
                card.style.filter = blurAmount > 0.15 ? `blur(${blurAmount.toFixed(2)}px)` : 'none';
                
                // Disable clicks and visibility of back-facing/out-of-bounds cards
                const isBackside = (normAngle > 85 && normAngle < 275);
                if (boundaryOpacity < 0.08 || finalOpacity < 0.05) {
                    card.style.visibility = 'hidden';
                    card.style.pointerEvents = 'none';
                } else {
                    card.style.visibility = 'visible';
                    card.style.pointerEvents = isBackside ? 'none' : 'auto';
                }
            });
            
            // C. Smoothly update and apply Pricing Section elements
            if (pricingSecEl) {
                const pricingLerp = 0.08;
                
                // Interpolate Title
                pricingState.title.currZ += (pricingState.title.targetZ - pricingState.title.currZ) * pricingLerp;
                pricingState.title.currScale += (pricingState.title.targetScale - pricingState.title.currScale) * pricingLerp;
                pricingState.title.currOpacity += (pricingState.title.targetOpacity - pricingState.title.currOpacity) * pricingLerp;
                
                if (pricingState.title.el) {
                    pricingState.title.el.style.transform = `translate3d(0, 0, ${pricingState.title.currZ.toFixed(1)}px) scale(${pricingState.title.currScale.toFixed(3)})`;
                    pricingState.title.el.style.opacity = pricingState.title.currOpacity.toFixed(3);
                }
                
                // Interpolate Cards
                pricingState.cards.forEach(c => {
                    c.currZ += (c.targetZ - c.currZ) * pricingLerp;
                    c.currScale += (c.targetScale - c.currScale) * pricingLerp;
                    c.currOpacity += (c.targetOpacity - c.currOpacity) * pricingLerp;
                    c.currRotateX += (c.targetRotateX - c.currRotateX) * pricingLerp;
                    c.currY += (c.targetY - c.currY) * pricingLerp;
                    
                    if (c.el) {
                        c.el.style.transform = `translate3d(0, ${c.currY.toFixed(1)}px, ${c.currZ.toFixed(1)}px) scale(${c.currScale.toFixed(3)}) rotateX(${c.currRotateX.toFixed(1)}deg)`;
                        c.el.style.opacity = c.currOpacity.toFixed(3);
                    }
                });
            }
            
            requestAnimationFrame(animateSpiral);
        }
        
        requestAnimationFrame(animateSpiral);
        
        // Bind click events on cards to trigger modals natively
        const modals = document.querySelectorAll('.modal[id^="services_item"]');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 400);
                });
            }
            
            // Close on background overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 400);
                }
            });
        });
        
        const spiralLinks = document.querySelectorAll('.spiral-card a');
        spiralLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = link.getAttribute('href');
                const targetModal = document.querySelector(modalId);
                if (targetModal) {
                    targetModal.style.display = 'flex';
                    void targetModal.offsetWidth; // Force layout repaint
                    targetModal.classList.add('active');
                }
            });
        });
    }
}

// ==========================================================================
// DYNAMIC FEATURED IN (PRESS & RECOGNITION) SECTION
// ==========================================================================
function initFeaturedSection() {
    const section = document.getElementById('featured');
    const displayQuote = document.querySelector('.featured-quote');
    const displaySource = document.querySelector('.featured-source');
    const cardsRow = document.querySelector('.featured-cards-row');
    const paginationDot = document.querySelector('.featured-pagination-dot');
    
    if (!section || !cardsRow) return;
    
    // 1. Clone cards for infinite loop marquee scroll
    const originalCardsList = Array.from(cardsRow.children);
    originalCardsList.forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.remove('active');
        cardsRow.appendChild(clone);
    });
    
    // Query ALL cards including the newly cloned ones
    const cards = document.querySelectorAll('.featured-logo-card');
    if (cards.length === 0) return;
    
    let currentIndex = 0;
    let isPaused = false;
    let scrollSpeed = 0.7; // Speed of auto scroll in pixels per frame
    let halfScrollWidth = 0;
    let animationFrameId = null;
    
    // Calculate the wrap-around scroll width once layout is ready
    function initScrollMetrics() {
        if (cards.length > 16) {
            // offset of 17th card (index 16, start of cloned set) minus 1st card
            halfScrollWidth = cards[16].offsetLeft - cards[0].offsetLeft;
        }
    }
    
    // Recalculate metrics once window is fully loaded to ensure styles/fonts are ready
    if (document.readyState === 'complete') {
        setTimeout(initScrollMetrics, 100);
    } else {
        window.addEventListener('load', initScrollMetrics);
    }
    
    // Recalculate when any image finishes loading (to handle layout shifts/cache)
    cardsRow.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', initScrollMetrics);
    });
    
    // Run metrics recalculation on window resize
    window.addEventListener('resize', initScrollMetrics);
    
    // 3. Swapping function to update display quote with animations
    function updateDisplay(index, shouldScroll = true) {
        if (index < 0 || index >= cards.length) return;
        
        const card = cards[index];
        const quote = card.getAttribute('data-quote');
        const source = card.getAttribute('data-source');
        const dataIndex = parseInt(card.getAttribute('data-index'), 10);
        
        // Remove active class from all logo cards
        cards.forEach(c => c.classList.remove('active'));
        
        // Highlight all cards carrying this exact index (both original and clones)
        cards.forEach(c => {
            if (parseInt(c.getAttribute('data-index'), 10) === dataIndex) {
                c.classList.add('active');
            }
        });
        
        // Only trigger swap animation if content actually changes
        const currentDataIndex = parseInt(cards[currentIndex]?.getAttribute('data-index') || '-1', 10);
        if (dataIndex !== currentDataIndex) {
            displayQuote.classList.add('swapping');
            displaySource.classList.add('swapping');
            
            setTimeout(() => {
                displayQuote.innerHTML = quote;
                displaySource.innerHTML = source;
                
                displayQuote.classList.remove('swapping');
                displaySource.classList.remove('swapping');
            }, 220);
        }
        
        // Position pagination indicator dot
        updatePaginationDot(dataIndex);
        
        if (shouldScroll) {
            centerActiveCard(card);
        }
        
        currentIndex = index;
    }
    
    // 4. Position dynamic pagination indicator dot
    function updatePaginationDot(dataIndex) {
        if (!paginationDot) return;
        const totalOriginalCards = 16; // We have 16 unique cards
        const trackWidth = 120; // matches CSS pagination track width (120px)
        const dotWidth = 15;   // matches CSS dot width (15px)
        
        const step = (trackWidth - dotWidth) / (totalOriginalCards - 1);
        const leftPos = dataIndex * step;
        paginationDot.style.left = `${leftPos}px`;
    }
    
    // 5. Center active card in overflow scroll area (used on hover/click interaction)
    function centerActiveCard(card) {
        if (!cardsRow) return;
        const rowWidth = cardsRow.clientWidth;
        const cardLeft = card.offsetLeft;
        const cardWidth = card.clientWidth;
        
        const scrollTarget = cardLeft - (rowWidth / 2) + (cardWidth / 2);
        cardsRow.scrollTo({
            left: scrollTarget,
            behavior: 'smooth'
        });
    }
    
    // 6. Find which card is closest to the middle of the scroll viewport
    function updateActiveCardFromScroll() {
        const rowCenter = cardsRow.scrollLeft + (cardsRow.clientWidth / 2);
        let closestIndex = 0;
        let minDistance = Infinity;
        
        cards.forEach((card, idx) => {
            const cardCenter = card.offsetLeft + (card.clientWidth / 2);
            const distance = Math.abs(rowCenter - cardCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = idx;
            }
        });
        
        // Update selection quietly without centering scroll
        const currentDataIndex = parseInt(cards[currentIndex]?.getAttribute('data-index') || '-1', 10);
        const closestDataIndex = parseInt(cards[closestIndex]?.getAttribute('data-index'), 10);
        if (closestDataIndex !== currentDataIndex) {
            updateDisplay(closestIndex, false);
        }
    }
    
    // 7. Auto Scroll Loop (marquee animation)
    function tickScroll() {
        if (halfScrollWidth === 0) {
            initScrollMetrics();
        }
        if (!isPaused && halfScrollWidth > 0) {
            cardsRow.scrollLeft += scrollSpeed;
            
            // Loop around seamlessly
            if (cardsRow.scrollLeft >= halfScrollWidth) {
                cardsRow.scrollLeft -= halfScrollWidth;
            }
            
            // Auto update active card as it scrolls through the middle
            updateActiveCardFromScroll();
        }
        animationFrameId = requestAnimationFrame(tickScroll);
    }
    
    // 8. Event Listeners for Cards
    cards.forEach((card, idx) => {
        // Hover to preview and pause scroll
        card.addEventListener('mouseenter', () => {
            isPaused = true;
            updateDisplay(idx, false);
        });
        
        // Click to open outbound link
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-link');
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        });
    });
    
    // Pause auto scroll when hovering anywhere inside the cards row
    cardsRow.addEventListener('mouseenter', () => {
        isPaused = true;
    });
    
    // Resume scroll on mouse leave
    cardsRow.addEventListener('mouseleave', () => {
        isPaused = false;
    });
    
    // Support touchscreen touch drag pausing
    cardsRow.addEventListener('touchstart', () => {
        isPaused = true;
    });
    cardsRow.addEventListener('touchend', () => {
        setTimeout(() => {
            isPaused = false;
        }, 1500); // Resume scroll shortly after swipe ends
    });
    
    // 9. Initialize & Run
    initScrollMetrics();
    updateDisplay(0, false);
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(tickScroll);
}

// ==========================================================================
// CASE STUDIES MODALS & INTERACTIVE HANDLERS
// ==========================================================================
function initCaseStudies() {
    const wrappers = document.querySelectorAll('.company-card-wrapper');
    const container = document.querySelector('.cases-buttons-container');

    if (wrappers.length === 0) return;

    wrappers.forEach(wrapper => {
        const trigger = wrapper.querySelector('.btn-company-trigger');
        
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                const isAlreadyExpanded = wrapper.classList.contains('expanded');

                // 1. Collapse all other wrappers first
                wrappers.forEach(w => w.classList.remove('expanded'));

                // 2. Toggle this wrapper if it wasn't already expanded
                if (!isAlreadyExpanded) {
                    wrapper.classList.add('expanded');
                    if (container) {
                        container.classList.add('has-expanded');
                    }
                } else {
                    if (container) {
                        container.classList.remove('has-expanded');
                    }
                }
            });
        }

        // 3. Prevent click propagation inside report links
        const reportLinks = wrapper.querySelectorAll('.btn-report-item');
        reportLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    });

    // 4. Select/Expand the first company card wrapper by default
    if (wrappers[0]) {
        wrappers[0].classList.add('expanded');
        if (container) {
            container.classList.add('has-expanded');
        }
    }
}

// ==========================================================================
// HERO STATS COUNTER ANIMATION
// ==========================================================================
function initStatsCounters() {
    const counters = document.querySelectorAll('.count-up');
    if (counters.length === 0) return;

    // Options for Intersection Observer
    const options = {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px"
    };

    const countUp = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        const duration = 3500; // Animation duration in ms (3.5 seconds)
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Easing function: easeOutQuad
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(easeProgress * target);

            counter.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                counter.textContent = target; // Ensure exact final value
            }
        };

        requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target); // Run only once
            }
        });
    }, options);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// PRICING COMPARISON MODAL CONTROLLER
// ==========================================================================
function initComparisonModal() {
    const comparisonModal = document.getElementById('comparisonModal');
    const openComparisonBtns = document.querySelectorAll('.open-comparison-btn');
    
    if (comparisonModal) {
        const closeBtn = comparisonModal.querySelector('.comparison-close');
        
        openComparisonBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                comparisonModal.style.display = 'flex';
                void comparisonModal.offsetWidth; // Force layout repaint
                comparisonModal.classList.add('active');
            });
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                comparisonModal.classList.remove('active');
                setTimeout(() => {
                    comparisonModal.style.display = 'none';
                }, 400);
            });
        }
        
        comparisonModal.addEventListener('click', (e) => {
            if (e.target === comparisonModal) {
                comparisonModal.classList.remove('active');
                setTimeout(() => {
                    comparisonModal.style.display = 'none';
                }, 400);
            }
        });
    }
}

// ==========================================================================
// PRICE COUNTDOWN COUNTER ANIMATION
// ==========================================================================
function animatePriceCounter() {
    const counterSpan = document.querySelector('.pricing-discount-counter');
    if (!counterSpan) return;
    
    const startVal = 45000;
    const endVal = 39871;
    const duration = 2500; // 2.5 seconds countdown (slower rate)
    const startTime = performance.now();
    
    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out cubic: starts fast, slows down at the end
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentVal = Math.round(startVal - (startVal - endVal) * easeProgress);
        
        // Format with Indian commas
        counterSpan.textContent = currentVal.toLocaleString('en-IN');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}


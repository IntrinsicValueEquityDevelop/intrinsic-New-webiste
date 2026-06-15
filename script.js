/**
 * Intrinsic Value Equity Advisors
 * Core Interactivity & Animations Script (Velvet Marigold Theme)
 */

// Global cached window dimensions to avoid mobile address bar scroll jumping
let cachedWindowHeight = window.innerHeight;
let cachedWindowWidth = window.innerWidth;

document.addEventListener('DOMContentLoaded', () => {
    // Force scroll restoration to manual and scroll to top on reload/load to reset layout states
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Lock scroll stack height on load to prevent jumping when mobile address bar hides/shows
    const scrollStack = document.querySelector('.scroll-stack');
    if (scrollStack) {
        scrollStack.style.height = `${8.4 * cachedWindowHeight}px`;
    }

    // Update dimensions on resize, ignoring minor height shifts (like mobile browser URL bar collapsing)
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        // Trigger recalculation if width changes (desktop resize) or height changes significantly (orientation swap)
        if (Math.abs(newWidth - cachedWindowWidth) > 5 || Math.abs(newHeight - cachedWindowHeight) > 100) {
            cachedWindowHeight = newHeight;
            cachedWindowWidth = newWidth;
            if (scrollStack) {
                scrollStack.style.height = `${8.4 * cachedWindowHeight}px`;
            }
        }
    });

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

        const menuTrigger = document.querySelector('.menu-trigger');
        const isMenuOpen = menuTrigger && menuTrigger.classList.contains('open');

        if (currentScrollY <= 80 || isMenuOpen) {
            // Always show header at the very top of the page or if mobile menu is open
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

    window.hasReachedBottom = false;

    // Truncate long philosophy text and bind to modals
    initPhilosophyModals();

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

    // Initialize Stacked Testimonials
    initTestimonials();

    // Initialize Collapsible FAQs
    initFAQs();

    // Initialize Regulatory Disclosures Accordion
    initDisclosures();
});



// ==========================================================================
// PHILOSOPHY TEXT TRUNCATION & MODAL BINDING
// ==========================================================================
function initPhilosophyModals() {
    const spiralCards = document.querySelectorAll('.spiral-card');
    spiralCards.forEach(card => {
        const p = card.querySelector('p');
        const link = card.querySelector('a');
        if (!p || !link) return;
        
        const fullText = p.innerHTML; // get original HTML content
        const textContent = p.textContent.trim();
        
        // Find the target modal
        const modalId = link.getAttribute('href');
        if (modalId && modalId.startsWith('#')) {
            const targetModal = document.querySelector(modalId);
            if (targetModal) {
                const modalParagraph = targetModal.querySelector('p');
                if (modalParagraph) {
                    // Populate modal with full text from the card
                    modalParagraph.innerHTML = fullText;
                }
            }
        }
        
        // Truncate card text to a clean preview (e.g. 110 characters)
        const maxLength = 110;
        if (textContent.length > maxLength) {
            p.textContent = textContent.substring(0, maxLength).trim() + '...';
        }
    });
}

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
            return window.innerWidth <= 480 ? 165 : (window.innerWidth <= 768 ? 190 : 380);
        };
        
        const getSpiralYSpacingFactor = () => {
            return window.innerWidth <= 480 ? 2.5 : (window.innerWidth <= 768 ? 1.7 : 1.35);
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
        
        // touch / drag rotation for mobile view (x-axis drag rotates the 3D helix)
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartAngle = 0;
        
        const sceneEl = document.querySelector('.spiral-scene');
        if (sceneEl) {
            sceneEl.addEventListener('touchstart', (e) => {
                if (window.innerWidth <= 768) {
                    isDragging = true;
                    dragStartX = e.touches[0].clientX;
                    dragStartY = e.touches[0].clientY;
                    dragStartAngle = targetScrollOffsetAngle;
                }
            }, { passive: false });
            
            sceneEl.addEventListener('touchmove', (e) => {
                if (isDragging && window.innerWidth <= 768) {
                    const clientX = e.touches[0].clientX;
                    const clientY = e.touches[0].clientY;
                    const deltaX = clientX - dragStartX;
                    const deltaY = clientY - dragStartY;
                    
                    // If drag is primarily horizontal, prevent page scrolling so helix rotates smoothly
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        if (e.cancelable) e.preventDefault();
                    }
                    
                    // Drag left (negative deltaX) should rotate forward
                    const newAngle = dragStartAngle - deltaX * 0.8;
                    targetScrollOffsetAngle = Math.max(0, Math.min(540, newAngle));
                }
            }, { passive: false });
            
            sceneEl.addEventListener('touchend', () => {
                isDragging = false;
            });
        }
        
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

        const scrollIndicator = document.querySelector('.scroll-progress-indicator');
        const progressCircleFg = document.querySelector('.progress-circle-fg');

        let scrollDirection = 'down';
        let lastScrollY = window.scrollY;

        const getOffsets = () => {
            const windowHeight = cachedWindowHeight;
            const stackedSection = document.querySelector('.stacked-testimonials-section');
            const isFlow = stackedSection && stackedSection.classList.contains('flow-layout');
            const endOffset = isFlow ? 8.4 * windowHeight : 12.2 * windowHeight;
            if (window.hasReachedBottom) {
                // Linear offsets for scroll-up bypass mode
                return [
                    0,
                    2.0 * windowHeight,
                    4.0 * windowHeight,
                    6.0 * windowHeight,
                    8.0 * windowHeight,
                    8.4 * windowHeight,
                    endOffset
                ];
            } else {
                // Sticky-locked offsets for scroll-down mode
                return [
                    0,
                    1.0 * windowHeight,
                    3.2 * windowHeight,
                    3.7 * windowHeight,
                    4.2 * windowHeight,
                    8.4 * windowHeight,
                    endOffset
                ];
            }
        };

        const updateScrollIndicator = () => {
            if (!scrollIndicator || !progressCircleFg) return;

            const scrollY = window.scrollY;
            const windowHeight = cachedWindowHeight;

            // Update scroll direction
            if (scrollY > lastScrollY + 4) {
                scrollDirection = 'down';
            } else if (scrollY < lastScrollY - 4) {
                scrollDirection = 'up';
            }
            lastScrollY = scrollY;

            // Hide indicator when reaching FAQ/Footer bottom
            const stackedSection = document.querySelector('.stacked-testimonials-section');
            const isFlow = stackedSection && stackedSection.classList.contains('flow-layout');
            const hideThreshold = isFlow ? 8.4 * windowHeight : 12.2 * windowHeight;
            if (scrollY >= hideThreshold) {
                scrollIndicator.classList.remove('visible');
                return;
            }

            const offsets = getOffsets();
            let progress = 0;

            for (let i = 0; i < offsets.length - 1; i++) {
                if (scrollY >= offsets[i] && scrollY < offsets[i+1]) {
                    progress = (scrollY - offsets[i]) / (offsets[i+1] - offsets[i]);
                    break;
                }
            }

            progress = Math.max(0, Math.min(1, progress));

            const radius = 18;
            const circumference = 2 * Math.PI * radius; // ~113.10
            progressCircleFg.style.strokeDasharray = circumference.toFixed(2);
            const offset = circumference - progress * circumference;
            progressCircleFg.style.strokeDashoffset = offset.toFixed(2);

            // Update arrow rotation based on direction
            const arrow = scrollIndicator.querySelector('.scroll-indicator-arrow');
            if (arrow) {
                arrow.style.transform = scrollDirection === 'up' ? 'rotate(180deg)' : 'rotate(0deg)';
            }

            scrollIndicator.classList.add('visible');
        };

        // Add click listener to progress button to scroll directly to the next/prev section
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const scrollY = window.scrollY;
                const windowHeight = cachedWindowHeight;
                const offsets = getOffsets();
                
                let activeIdx = 0;
                let progress = 0;
                
                for (let i = 0; i < offsets.length - 1; i++) {
                    if (scrollY >= offsets[i] && scrollY < offsets[i+1]) {
                        activeIdx = i;
                        progress = (scrollY - offsets[i]) / (offsets[i+1] - offsets[i]);
                        break;
                    }
                }
                
                if (scrollY >= offsets[offsets.length - 1]) {
                    activeIdx = offsets.length - 1;
                }
                
                let targetScroll = scrollY;
                
                if (scrollDirection === 'down') {
                    if (activeIdx < offsets.length - 1) {
                        targetScroll = offsets[activeIdx + 1];
                    }
                } else {
                    if (progress > 0.08) {
                        targetScroll = offsets[activeIdx];
                    } else if (activeIdx > 0) {
                        targetScroll = offsets[activeIdx - 1];
                    }
                }
                
                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            });
        }

        const handleScrollTransitions = () => {
            const scrollY = window.scrollY;
            const windowHeight = cachedWindowHeight;

            // Check if user has reached bottom (FAQ/footer)
            const stackedSection = document.querySelector('.stacked-testimonials-section');
            const isFlow = stackedSection && stackedSection.classList.contains('flow-layout');
            const bottomThreshold = isFlow ? 8.35 * windowHeight : 12.15 * windowHeight;
            if (scrollY >= bottomThreshold) {
                window.hasReachedBottom = true;
            } else if (scrollY < 50) {
                window.hasReachedBottom = false;
            }

            updateScrollIndicator();

            if (window.hasReachedBottom) {
                // Map sections linearly as if they were in a normal long page
                const scaleFactor = 0.4;
                const referenceScroll = Math.min(scrollY, 7.4 * windowHeight);
                
                // Hero (0)
                sectionsState.hero.targetOpacity = 1;
                sectionsState.hero.targetScale = 1;
                sectionsState.hero.targetY = -referenceScroll * scaleFactor;
                sectionsState.hero.pointerEvents = 'auto';
                
                // Philosophy (1)
                sectionsState.philosophy.targetOpacity = 1;
                sectionsState.philosophy.targetScale = 1;
                sectionsState.philosophy.targetY = 1.0 * windowHeight - referenceScroll * scaleFactor;
                sectionsState.philosophy.pointerEvents = 'auto';
                
                // Featured (2)
                sectionsState.featured.targetOpacity = 1;
                sectionsState.featured.targetScale = 1;
                sectionsState.featured.targetY = 2.0 * windowHeight - referenceScroll * scaleFactor;
                sectionsState.featured.pointerEvents = 'auto';
                sectionsState.featured.hasEntered = true;
                
                // Cases (3)
                sectionsState.cases.targetOpacity = 1;
                sectionsState.cases.targetScale = 1;
                sectionsState.cases.targetY = 3.0 * windowHeight - referenceScroll * scaleFactor;
                sectionsState.cases.pointerEvents = 'auto';
                sectionsState.cases.hasEntered = true;
                
                // Pricing (4)
                sectionsState.pricing.targetOpacity = 1;
                sectionsState.pricing.targetScale = 1;
                sectionsState.pricing.targetY = 4.0 * windowHeight - referenceScroll * scaleFactor;
                sectionsState.pricing.pointerEvents = 'auto';
                
                // Keep pricing zoom elements fully forward
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
                
                return;
            }

            // Define scroll transition checkpoints relative to viewport height
            const heroFadeEnd = 1.0 * windowHeight;

            const philFadeInStart = 0.5 * windowHeight;
            const philFadeInEnd = 1.0 * windowHeight;
            const philSpinStart = 1.0 * windowHeight;
            const philSpinEnd = 3.2 * windowHeight;
            const philFadeOutStart = 3.2 * windowHeight;

            const featuredFadeInStart = 3.2 * windowHeight;
            const featuredFadeInEnd = 3.7 * windowHeight;
            const featuredFadeOutStart = 3.7 * windowHeight;

            const casesFadeInStart = 3.7 * windowHeight;
            const casesFadeInEnd = 4.2 * windowHeight;
            const casesFadeOutStart = 4.2 * windowHeight;

            const pricingFadeInStart = 4.2 * windowHeight;
            const pricingFadeInEnd = 4.7 * windowHeight;
            const pricingZoomStart = 4.7 * windowHeight;
            const pricingZoomEnd = 6.7 * windowHeight;
            const pricingFadeOutStart = 6.7 * windowHeight;

            // 1. Hero Section Fade & Translate (outward)
            if (heroSec) {
                sectionsState.hero.targetOpacity = 1;
                sectionsState.hero.targetScale = 1;
                sectionsState.hero.targetY = -scrollY;
                sectionsState.hero.pointerEvents = scrollY < heroFadeEnd ? 'auto' : 'none';
            }

            // 2. Philosophy Section (Entrance, Card Spin, and Exit)
            if (philosophySticky) {
                if (scrollY < philFadeInStart) {
                    sectionsState.philosophy.targetOpacity = 0;
                    sectionsState.philosophy.targetY = windowHeight;
                    sectionsState.philosophy.targetScale = 1;
                    sectionsState.philosophy.pointerEvents = 'none';
                    if (window.innerWidth > 768) {
                        targetScrollOffsetAngle = 0;
                    }
                } else if (scrollY >= philFadeInStart && scrollY <= philFadeInEnd) {
                    // Entrance Phase
                    const progress = (scrollY - philFadeInStart) / (philFadeInEnd - philFadeInStart);
                    sectionsState.philosophy.targetOpacity = progress;
                    sectionsState.philosophy.targetY = windowHeight * (1 - progress);
                    sectionsState.philosophy.targetScale = 1;
                    sectionsState.philosophy.pointerEvents = 'auto';
                    if (window.innerWidth > 768) {
                        targetScrollOffsetAngle = 0;
                    }
                } else if (scrollY > philFadeInEnd && scrollY < philFadeOutStart) {
                    // Active Spin Phase
                    sectionsState.philosophy.targetOpacity = 1;
                    sectionsState.philosophy.targetY = 0;
                    sectionsState.philosophy.targetScale = 1;
                    sectionsState.philosophy.pointerEvents = 'auto';

                    const spinProgress = (scrollY - philSpinStart) / (philSpinEnd - philSpinStart);
                    const clampedProgress = Math.max(0, Math.min(1, spinProgress));
                    if (window.innerWidth > 768) {
                        targetScrollOffsetAngle = clampedProgress * 540;
                    }
                } else {
                    // Exiting Philosophy Section (scrollY >= philFadeOutStart) - scroll up naturally
                    const progress = Math.max(0, Math.min(1, (scrollY - philFadeOutStart) / (featuredFadeInEnd - philFadeOutStart)));
                    sectionsState.philosophy.targetOpacity = 1;
                    sectionsState.philosophy.targetY = -progress * windowHeight;
                    sectionsState.philosophy.targetScale = 1;
                    sectionsState.philosophy.pointerEvents = progress < 1 ? 'auto' : 'none';
                    if (window.innerWidth > 768) {
                        targetScrollOffsetAngle = 540;
                    }
                }
            }

            // 3. Featured Section Fade & Translate (inward & outward)
            if (featuredSec) {
                if (scrollY < featuredFadeInStart) {
                    sectionsState.featured.targetOpacity = 0;
                    sectionsState.featured.targetY = windowHeight;
                    sectionsState.featured.targetScale = 1;
                    sectionsState.featured.pointerEvents = 'none';
                    sectionsState.featured.hasEntered = false;
                } else if (scrollY >= featuredFadeInStart && scrollY <= featuredFadeInEnd) {
                    // Entrance Phase
                    const progress = (scrollY - featuredFadeInStart) / (featuredFadeInEnd - featuredFadeInStart);
                    sectionsState.featured.targetOpacity = progress;
                    sectionsState.featured.targetY = windowHeight * (1 - progress);
                    sectionsState.featured.targetScale = 1;
                    sectionsState.featured.pointerEvents = 'auto';
                    sectionsState.featured.hasEntered = true;
                } else if (scrollY > featuredFadeInEnd && scrollY < featuredFadeOutStart) {
                    // Active Phase
                    sectionsState.featured.targetOpacity = 1;
                    sectionsState.featured.targetY = 0;
                    sectionsState.featured.targetScale = 1;
                    sectionsState.featured.pointerEvents = 'auto';
                    sectionsState.featured.hasEntered = true;
                } else {
                    // Exiting Featured Section (scrollY >= featuredFadeOutStart) - scroll up naturally
                    const progress = Math.max(0, Math.min(1, (scrollY - featuredFadeOutStart) / (casesFadeInEnd - featuredFadeOutStart)));
                    sectionsState.featured.targetOpacity = 1;
                    sectionsState.featured.targetY = -progress * windowHeight;
                    sectionsState.featured.targetScale = 1;
                    sectionsState.featured.pointerEvents = progress < 1 ? 'auto' : 'none';
                    sectionsState.featured.hasEntered = true;
                }
            }

            // 4. Case Studies Section Fade & Translate (inward & outward)
            if (casesSec) {
                if (scrollY < casesFadeInStart) {
                    sectionsState.cases.targetOpacity = 0;
                    sectionsState.cases.targetY = windowHeight;
                    sectionsState.cases.targetScale = 1;
                    sectionsState.cases.pointerEvents = 'none';
                    sectionsState.cases.hasEntered = false;
                } else if (scrollY >= casesFadeInStart && scrollY <= casesFadeInEnd) {
                    // Entrance Phase
                    const progress = (scrollY - casesFadeInStart) / (casesFadeInEnd - casesFadeInStart);
                    sectionsState.cases.targetOpacity = progress;
                    sectionsState.cases.targetY = windowHeight * (1 - progress);
                    sectionsState.cases.targetScale = 1;
                    sectionsState.cases.pointerEvents = 'auto';
                    sectionsState.cases.hasEntered = true;
                } else if (scrollY > casesFadeInEnd && scrollY < casesFadeOutStart) {
                    // Active Phase
                    sectionsState.cases.targetOpacity = 1;
                    sectionsState.cases.targetY = 0;
                    sectionsState.cases.targetScale = 1;
                    sectionsState.cases.pointerEvents = 'auto';
                    sectionsState.cases.hasEntered = true;
                } else {
                    // Exiting Cases Section (scrollY >= casesFadeOutStart) - scroll up naturally
                    const progress = Math.max(0, Math.min(1, (scrollY - casesFadeOutStart) / (pricingFadeInEnd - casesFadeOutStart)));
                    sectionsState.cases.targetOpacity = 1;
                    sectionsState.cases.targetY = -progress * windowHeight;
                    sectionsState.cases.targetScale = 1;
                    sectionsState.cases.pointerEvents = progress < 1 ? 'auto' : 'none';
                    sectionsState.cases.hasEntered = true;
                }
            }

            // 5. Pricing Section Fade & Translate (inward & outward)
            const pricingSec = sectionsState.pricing.el;
            if (pricingSec) {
                if (scrollY < pricingFadeInStart) {
                    sectionsState.pricing.targetOpacity = 0;
                    sectionsState.pricing.targetY = windowHeight;
                    sectionsState.pricing.targetScale = 1;
                    sectionsState.pricing.pointerEvents = 'none';
                    if (pricingState.counterTimeout) {
                        clearTimeout(pricingState.counterTimeout);
                        pricingState.counterTimeout = null;
                    }
                } else if (scrollY >= pricingFadeInStart && scrollY <= pricingFadeInEnd) {
                    // Entrance Phase
                    const progress = (scrollY - pricingFadeInStart) / (pricingFadeInEnd - pricingFadeInStart);
                    sectionsState.pricing.targetOpacity = progress;
                    sectionsState.pricing.targetY = windowHeight * (1 - progress);
                    sectionsState.pricing.targetScale = 1;
                    sectionsState.pricing.pointerEvents = 'auto';
                    
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
                } else {
                    // Exiting Pricing Section (scrollY >= pricingFadeOutStart) - scroll up naturally
                    const progress = Math.max(0, Math.min(1, (scrollY - pricingFadeOutStart) / (8.4 * windowHeight - pricingFadeOutStart)));
                    sectionsState.pricing.targetOpacity = 1;
                    sectionsState.pricing.targetY = -progress * windowHeight;
                    sectionsState.pricing.targetScale = 1;
                    sectionsState.pricing.pointerEvents = progress < 1 ? 'auto' : 'none';

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
                }
            }
        };

        window.addEventListener('scroll', handleScrollTransitions);
        handleScrollTransitions(); // Run initially
        
        // Continuous Animation Loop
        function animateSpiral() {
            if (carousel) {
                carousel.style.transform = '';
                carousel.currentX = 0;
            }

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
                    
                    // Apply subtle fade to the previous (exiting) section as it scrolls out of view
                    const isPreviousSection = (scrollDirection === 'down' && s.targetY < 0) || 
                                              (scrollDirection === 'up' && s.targetY > 0);
                    
                    let fadeMultiplier = 1.0;
                    if (isPreviousSection) {
                        const exitProgress = Math.min(Math.max(Math.abs(s.currY) / cachedWindowHeight, 0), 1);
                        // Subtle fading: minimum opacity of 0.7 (very less fading effect)
                        fadeMultiplier = 1.0 - (exitProgress * 0.3); 
                    }
                    
                    s.el.style.opacity = (s.currOpacity * fadeMultiplier).toFixed(3);
                    s.el.style.transform = `translateY(${s.currY.toFixed(2)}px) scale(${s.currScale.toFixed(3)})`;
                    s.el.style.pointerEvents = s.pointerEvents;
                    s.el.style.filter = ''; // Reset any previous filter blur
                    
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
    const totalOriginalCards = originalCardsList.length;
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
        if (cards.length > totalOriginalCards) {
            // offset of start of cloned set minus 1st card
            halfScrollWidth = cards[totalOriginalCards].offsetLeft - cards[0].offsetLeft;
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
                document.body.style.overflow = 'hidden'; // Lock background scroll
            });
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                comparisonModal.classList.remove('active');
                document.body.style.overflow = ''; // Restore background scroll
                setTimeout(() => {
                    comparisonModal.style.display = 'none';
                }, 400);
            });
        }
        
        comparisonModal.addEventListener('click', (e) => {
            if (e.target === comparisonModal) {
                comparisonModal.classList.remove('active');
                document.body.style.overflow = ''; // Restore background scroll
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

// ==========================================================================
// STACKED TESTIMONIALS 3D CAROUSEL ANIMATION (Auto-play + Manual Arrow Controls)
// ==========================================================================
function initTestimonials() {
    const stackedSection = document.querySelector('.stacked-testimonials-section');
    const stackedCards = document.querySelectorAll('.testimonial-card');
    
    if (stackedSection && stackedCards.length > 0) {
        const totalCards = stackedCards.length;
        let isHovered = false;
        let isDragging = false;
        let startX = 0;
        let dragOffsetStart = 0;
        let dragResumeTimeout = null;
        let autoScrollOffset = 0;
        let flowAnimationId = null;
        let flowLayoutActivated = false;

        // Discrete slideshow variables
        let targetCardIndex = 0;
        let targetScrollOffset = 0;
        let slideTimer = Date.now();
        let isTransitioning = false;
        let transitionStartTime = 0;
        let startScrollOffset = 0;
        
        // Track hover state for pausing auto-scroll
        stackedCards.forEach(card => {
            card.addEventListener('mouseenter', () => { isHovered = true; });
            card.addEventListener('mouseleave', () => { isHovered = false; });
        });
        
        // Get card spacing based on viewport width (Card width + Gap)
        const getCardSpacing = () => {
            const windowWidth = window.innerWidth;
            if (windowWidth <= 480) return 215; // 200px width + 15px gap
            if (windowWidth <= 768) return 260; // 240px width + 20px gap
            return 310; // 280px width + 30px gap
        };

        // Drag-to-scroll interactions (mouse and touch)
        const container = document.querySelector('.testimonials-carousel-container');
        if (container) {
            const handleDragStart = (e) => {
                if (!stackedSection.classList.contains('flow-layout')) return;
                isDragging = true;
                isHovered = true; // Pause auto-scroll
                startX = e.pageX || (e.touches && e.touches[0].pageX);
                dragOffsetStart = autoScrollOffset;
                
                if (dragResumeTimeout) {
                    clearTimeout(dragResumeTimeout);
                }
            };
            
            const handleDragMove = (e) => {
                if (!isDragging) return;
                const x = e.pageX || (e.touches && e.touches[0].pageX);
                if (!x) return;
                const deltaX = x - startX;
                
                const S = getCardSpacing();
                const L = totalCards * S;
                
                // Drag left (negative deltaX) moves cards to left (increases autoScrollOffset)
                autoScrollOffset = (dragOffsetStart - deltaX) % L;
                if (autoScrollOffset < 0) autoScrollOffset += L;
            };
            
            const handleDragEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                
                // Resume auto-scroll after 1.5 seconds of inactivity
                dragResumeTimeout = setTimeout(() => {
                    isHovered = false;
                }, 1500);
            };
            
            container.addEventListener('mousedown', (e) => {
                if (stackedSection.classList.contains('flow-layout')) {
                    e.preventDefault();
                    handleDragStart(e);
                }
            });
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            
            container.addEventListener('touchstart', handleDragStart, { passive: true });
            window.addEventListener('touchmove', handleDragMove, { passive: true });
            window.addEventListener('touchend', handleDragEnd);

            // Mouse wheel / Trackpad scrolling support
            container.addEventListener('wheel', (e) => {
                if (!stackedSection.classList.contains('flow-layout')) return;
                
                // Handle both horizontal and vertical scrolling from mouse/trackpad
                const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                
                if (Math.abs(delta) > 0) {
                    e.preventDefault();
                    isHovered = true; // Pause auto-scroll
                    
                    const S = getCardSpacing();
                    const L = totalCards * S;
                    
                    // Update offset based on delta scroll
                    autoScrollOffset = (autoScrollOffset + delta * 0.4) % L;
                    if (autoScrollOffset < 0) autoScrollOffset += L;
                    
                    if (dragResumeTimeout) {
                        clearTimeout(dragResumeTimeout);
                    }
                    dragResumeTimeout = setTimeout(() => {
                        isHovered = false;
                    }, 1500);
                }
            }, { passive: false });
        }
        
        // Initialize cards stack layout
        const setupCards = () => {
            stackedCards.forEach((card, idx) => {
                card.style.zIndex = totalCards - idx;
                const rot = (idx % 2 === 0 ? 1 : -1) * (idx * 0.8 + 0.5);
                const transY = idx * 4;
                const transZ = -idx * 8;
                card.style.transform = `translate3d(0, ${transY}px, ${transZ}px) rotate(${rot}deg)`;
                card.style.opacity = '1';
                card.style.visibility = 'visible';
                card.style.boxShadow = '';
                card.style.borderColor = '';
            });
        };
        
        const startFlowAnimation = () => {
            if (flowAnimationId) return;
            
            const animateFlow = () => {
                if (!stackedSection.classList.contains('flow-layout')) return;
                
                const S = getCardSpacing();
                const L = totalCards * S;
                const midPoint = S / 2;
                
                if (isHovered || isDragging) {
                    // Manual interactions reset play timers and snap targets
                    slideTimer = Date.now();
                    isTransitioning = false;
                    stackedSection.classList.add('show-corners');
                    
                    targetCardIndex = Math.round(autoScrollOffset / S) % totalCards;
                    if (targetCardIndex < 0) targetCardIndex += totalCards;
                    targetScrollOffset = targetCardIndex * S;
                } else {
                    const now = Date.now();
                    const elapsed = now - slideTimer;
                    
                    if (!isTransitioning) {
                        // Display the active card centered with corners visible
                        if (elapsed >= 3500) { // Stay for 3.5 seconds
                            // Fade out corners first before starting the slide animation
                            stackedSection.classList.remove('show-corners');
                            isTransitioning = true;
                            transitionStartTime = now + 400; // 400ms delay for corner brackets fade-out
                            startScrollOffset = autoScrollOffset;
                            
                            targetCardIndex = (targetCardIndex + 1) % totalCards;
                            targetScrollOffset = targetCardIndex * S;
                        }
                    } else {
                        // Interpolate the slide motion
                        if (now >= transitionStartTime) {
                            const transElapsed = now - transitionStartTime;
                            const duration = 800; // slide transition time
                            
                            if (transElapsed >= duration) {
                                autoScrollOffset = targetScrollOffset;
                                isTransitioning = false;
                                slideTimer = now;
                                
                                // Show corner brackets around new centered card
                                stackedSection.classList.add('show-corners');
                            } else {
                                const t = transElapsed / duration;
                                // Cubic ease-in-out curve
                                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                                
                                // Shortest path interpolation for circular marquee loop
                                let diff = targetScrollOffset - startScrollOffset;
                                if (diff > L / 2) diff -= L;
                                if (diff < -L / 2) diff += L;
                                
                                autoScrollOffset = (startScrollOffset + diff * ease) % L;
                                if (autoScrollOffset < 0) autoScrollOffset += L;
                            }
                        }
                    }
                }
                
                stackedCards.forEach((card, idx) => {
                    const val = (idx * S) - autoScrollOffset;
                    let wrappedPosition = ((val + L/2) % L + L) % L - L/2;
                    
                    const d = Math.abs(wrappedPosition);
                    let scale = 1.0;
                    let glow = 0;
                    if (d < midPoint) {
                        const progress = 1 - d / midPoint;
                        // Snappy cubic ease-out curve for active pop-up
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        scale = 1.0 + 0.16 * easeProgress; // Scale up to 1.16
                        glow = easeProgress;
                    }
                    
                    card.style.transform = `translate3d(${wrappedPosition.toFixed(1)}px, 0, 0) scale(${scale.toFixed(3)})`;
                    card.style.opacity = '1';
                    card.style.visibility = 'visible';
                    card.style.zIndex = d < midPoint ? '10' : '5';
                    
                    card.style.boxShadow = glow > 0.01 
                        ? `0 25px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 140, 0, ${(0.5 * glow).toFixed(2)})` 
                        : '';
                    card.style.borderColor = glow > 0.01 
                        ? `rgba(255, 140, 0, ${(0.08 + 0.55 * glow).toFixed(2)})` 
                        : '';
                });
                
                flowAnimationId = requestAnimationFrame(animateFlow);
            };
            
            flowAnimationId = requestAnimationFrame(animateFlow);
        };
        
        const transitionToFlowLayout = () => {
            if (stackedSection.classList.contains('flow-layout')) return;
            
            flowLayoutActivated = true;
            
            const currentScrollY = window.scrollY;
            const windowHeight = cachedWindowHeight;
            const oldHeight = 4.8 * windowHeight;
            const newHeight = 1.0 * windowHeight;
            const diff = oldHeight - newHeight;
            
            stackedSection.classList.add('flow-layout');
            stackedSection.classList.add('show-corners'); // Show corners initially for Card 0
            
            // Initialize slide machine values
            targetCardIndex = 0;
            targetScrollOffset = 0;
            autoScrollOffset = 0;
            slideTimer = Date.now();
            isTransitioning = false;
            
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            
            window.scrollTo(0, currentScrollY - diff);
            
            startFlowAnimation();
        };

        const handleScroll = () => {
            if (stackedSection.classList.contains('flow-layout')) return;
            
            if (window.hasReachedBottom) {
                setupCards();
                return;
            }
            
            const rect = stackedSection.getBoundingClientRect();
            const sectionHeight = rect.height;
            const windowHeight = cachedWindowHeight;
            
            const scrolled = 80 - rect.top;
            const scrollRange = sectionHeight - windowHeight;
            
            if (scrollRange <= 0) return;
            
            let progress = scrolled / scrollRange;
            progress = Math.max(0, Math.min(1, progress));
            
            if (progress >= 0.98) {
                transitionToFlowLayout();
                return;
            }
            
            const segmentCount = totalCards;
            
            stackedCards.forEach((card, idx) => {
                const startThresh = idx / segmentCount;
                const endThresh = (idx + 1) / segmentCount;
                
                if (progress <= startThresh) {
                    const rot = (idx % 2 === 0 ? 1 : -1) * (idx * 0.8 + 0.5);
                    const transY = idx * 4;
                    const transZ = -idx * 8;
                    card.style.transform = `translate3d(0, ${transY}px, ${transZ}px) rotate(${rot}deg)`;
                    card.style.opacity = '1';
                    card.style.visibility = 'visible';
                } else if (progress > startThresh && progress < endThresh) {
                    const subProgress = (progress - startThresh) / (endThresh - startThresh);
                    
                    let dirX = 1;
                    if (idx % 3 === 0) dirX = -1.2;
                    else if (idx % 3 === 1) dirX = 1.2;
                    else dirX = -0.3;
                    
                    const flyX = dirX * subProgress * 1100;
                    const flyY = -subProgress * 550;
                    const flyRot = ((idx % 2 === 0 ? 1 : -1) * 12) + (subProgress * dirX * 45);
                    
                    card.style.transform = `translate3d(${flyX}px, ${flyY}px, 0) rotate(${flyRot}deg)`;
                    card.style.opacity = (1 - subProgress).toString();
                    card.style.visibility = 'visible';
                } else {
                    card.style.opacity = '0';
                    card.style.visibility = 'hidden';
                }
            });
        };

        // Initialize state on page load (starts fresh, no sessionStorage check)
        setupCards();
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        window.addEventListener('resize', handleScroll);
    }
}

// ==========================================================================
// FAQ ACCORDION & SCROLL REVEAL EFFECT
// ==========================================================================
function initFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSection = document.getElementById('faq');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const header = item.querySelector('.faq-question-header');
            const answer = item.querySelector('.faq-answer');
            
            if (header && answer) {
                header.addEventListener('click', () => {
                    const isOpen = item.classList.contains('active');
                    
                    // Close all other FAQ items first for an accordion effect
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            if (otherAnswer) {
                                otherAnswer.style.maxHeight = '0px';
                                otherAnswer.style.opacity = '0';
                            }
                        }
                    });
                    
                    // Toggle this FAQ item
                    if (isOpen) {
                        item.classList.remove('active');
                        answer.style.maxHeight = '0px';
                        answer.style.opacity = '0';
                    } else {
                        item.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        answer.style.opacity = '1';
                    }
                });
            }
        });
    }
    
    // Scroll reveal observer (fading and sliding effect)
    if (faqSection) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px"
        };
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        revealObserver.observe(faqSection);
    }
}

// ==========================================================================
// REGULATORY DISCLOSURES ACCORDION CONTROLLER
// ==========================================================================
function initDisclosures() {
    const disclosureItems = document.querySelectorAll('.disclosure-item');
    const disclosuresSection = document.getElementById('disclosures');
    
    if (disclosureItems.length > 0) {
        disclosureItems.forEach(item => {
            const header = item.querySelector('.disclosure-header');
            const panel = item.querySelector('.disclosure-panel');
            
            if (header && panel) {
                header.addEventListener('click', () => {
                    const isOpen = item.classList.contains('active');
                    
                    // Close all other main disclosure items first for accordion effect
                    disclosureItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherPanel = otherItem.querySelector('.disclosure-panel');
                            if (otherPanel) {
                                otherPanel.style.maxHeight = '0px';
                                otherPanel.style.opacity = '0';
                            }
                        }
                    });
                    
                    // Toggle this item
                    if (isOpen) {
                        // Collapse
                        item.classList.remove('active');
                        panel.style.maxHeight = panel.scrollHeight + 'px';
                        panel.offsetHeight; // Force reflow
                        panel.style.maxHeight = '0px';
                        panel.style.opacity = '0';
                    } else {
                        // Expand
                        item.classList.add('active');
                        panel.style.maxHeight = panel.scrollHeight + 'px';
                        panel.style.opacity = '1';
                        
                        const handleTransitionEnd = (e) => {
                            if (e.propertyName === 'max-height' && item.classList.contains('active')) {
                                panel.style.maxHeight = 'none';
                            }
                            panel.removeEventListener('transitionend', handleTransitionEnd);
                        };
                        panel.addEventListener('transitionend', handleTransitionEnd);
                    }
                });
            }
            
            // Nested sub-disclosure toggles
            const subItems = item.querySelectorAll('.sub-disclosure-item');
            subItems.forEach(subItem => {
                const subHeader = subItem.querySelector('.sub-disclosure-header');
                const subPanel = subItem.querySelector('.sub-disclosure-panel');
                
                if (subHeader && subPanel) {
                    // Set initial state for items with active class on load
                    if (subItem.classList.contains('active')) {
                        subPanel.style.maxHeight = subPanel.scrollHeight + 'px';
                        subPanel.style.opacity = '1';
                    }
                    
                    subHeader.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent parent accordion click events
                        
                        const isSubOpen = subItem.classList.contains('active');
                        const parentPanel = item.querySelector('.disclosure-panel');
                        
                        if (isSubOpen) {
                            // Collapse sub item
                            subItem.classList.remove('active');
                            
                            if (parentPanel && parentPanel.style.maxHeight === 'none') {
                                parentPanel.style.maxHeight = parentPanel.scrollHeight + 'px';
                                parentPanel.offsetHeight; // Force reflow
                            }
                            
                            subPanel.style.maxHeight = '0px';
                            subPanel.style.opacity = '0';
                            
                            if (parentPanel) {
                                const newParentHeight = parentPanel.scrollHeight - subPanel.scrollHeight;
                                parentPanel.style.maxHeight = Math.max(0, newParentHeight) + 'px';
                                
                                const restoreParentNone = (evt) => {
                                    if (evt.propertyName === 'max-height' && item.classList.contains('active')) {
                                        parentPanel.style.maxHeight = 'none';
                                    }
                                    parentPanel.removeEventListener('transitionend', restoreParentNone);
                                };
                                parentPanel.addEventListener('transitionend', restoreParentNone);
                            }
                        } else {
                            // Expand sub item
                            subItem.classList.add('active');
                            
                            if (parentPanel && parentPanel.style.maxHeight === 'none') {
                                parentPanel.style.maxHeight = parentPanel.scrollHeight + 'px';
                                parentPanel.offsetHeight; // Force reflow
                            }
                            
                            subPanel.style.maxHeight = subPanel.scrollHeight + 'px';
                            subPanel.style.opacity = '1';
                            
                            if (parentPanel) {
                                const newParentHeight = parentPanel.scrollHeight + subPanel.scrollHeight;
                                parentPanel.style.maxHeight = newParentHeight + 'px';
                                
                                const restoreParentNone = (evt) => {
                                    if (evt.propertyName === 'max-height' && item.classList.contains('active')) {
                                        parentPanel.style.maxHeight = 'none';
                                    }
                                    parentPanel.removeEventListener('transitionend', restoreParentNone);
                                };
                                parentPanel.addEventListener('transitionend', restoreParentNone);
                            }
                        }
                    });
                }
            });
        });
    }
    
    // Scroll reveal observer
    if (disclosuresSection) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px"
        };
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        revealObserver.observe(disclosuresSection);
    }
}


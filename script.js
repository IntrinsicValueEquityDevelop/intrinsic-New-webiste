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

            // 1. Hero Section Fade & Translate (outward)
            if (heroSec) {
                let opacity = 1;
                let translateY = 0;
                let scale = 1;
                let pointerEvents = 'auto';

                if (scrollY <= heroFadeEnd) {
                    const progress = scrollY / heroFadeEnd;
                    opacity = 1 - progress;
                    translateY = -progress * 60;
                    scale = 1 - progress * 0.05;
                } else {
                    opacity = 0;
                    translateY = -60;
                    scale = 0.95;
                    pointerEvents = 'none';
                }

                heroSec.style.opacity = opacity.toFixed(3);
                heroSec.style.transform = `translateY(${translateY}px) scale(${scale})`;
                heroSec.style.pointerEvents = pointerEvents;
            }

            // 2. Philosophy Section (Entrance, Card Spin, and Exit)
            if (philosophySticky) {
                let opacity = 0;
                let translateY = 60;
                let scale = 0.95;
                let pointerEvents = 'none';

                if (scrollY >= philFadeInStart && scrollY <= philFadeInEnd) {
                    // Fade In Phase
                    const progress = (scrollY - philFadeInStart) / (philFadeInEnd - philFadeInStart);
                    opacity = progress;
                    translateY = 60 * (1 - progress);
                    scale = 0.95 + 0.05 * progress;
                    pointerEvents = opacity > 0.5 ? 'auto' : 'none';
                    targetScrollOffsetAngle = 0;
                } else if (scrollY > philFadeInEnd && scrollY < philFadeOutStart) {
                    // Active Spin Phase
                    opacity = 1;
                    translateY = 0;
                    scale = 1;
                    pointerEvents = 'auto';

                    const spinProgress = (scrollY - philSpinStart) / (philSpinEnd - philSpinStart);
                    const clampedProgress = Math.max(0, Math.min(1, spinProgress));
                    targetScrollOffsetAngle = clampedProgress * 540;
                } else if (scrollY >= philFadeOutStart && scrollY <= philFadeOutEnd) {
                    // Fade Out Phase
                    const progress = (scrollY - philFadeOutStart) / (philFadeOutEnd - philFadeOutStart);
                    opacity = 1 - progress;
                    translateY = -progress * 60;
                    scale = 1 - progress * 0.05;
                    pointerEvents = opacity > 0.5 ? 'auto' : 'none';
                    targetScrollOffsetAngle = 540;
                } else if (scrollY > philFadeOutEnd) {
                    // Past Exit
                    opacity = 0;
                    translateY = -60;
                    scale = 0.95;
                    pointerEvents = 'none';
                    targetScrollOffsetAngle = 540;
                }

                philosophySticky.style.opacity = opacity.toFixed(3);
                philosophySticky.style.transform = `translateY(${translateY}px) scale(${scale})`;
                philosophySticky.style.pointerEvents = pointerEvents;
            }

            // 3. Featured Section Fade & Translate (inward & outward)
            if (featuredSec) {
                let opacity = 0;
                let translateY = 60;
                let scale = 0.95;
                let pointerEvents = 'none';

                if (scrollY >= featuredFadeInStart && scrollY <= featuredFadeInEnd) {
                    // Fade In Phase
                    const progress = (scrollY - featuredFadeInStart) / (featuredFadeInEnd - featuredFadeInStart);
                    opacity = progress;
                    translateY = 60 * (1 - progress);
                    scale = 0.95 + 0.05 * progress;
                    pointerEvents = opacity > 0.5 ? 'auto' : 'none';
                    featuredSec.classList.add('entered');
                } else if (scrollY > featuredFadeInEnd && scrollY < featuredFadeOutStart) {
                    // Active Phase
                    opacity = 1;
                    translateY = 0;
                    scale = 1;
                    pointerEvents = 'auto';
                    featuredSec.classList.add('entered');
                } else if (scrollY >= featuredFadeOutStart && scrollY <= featuredFadeOutEnd) {
                    // Fade Out Phase
                    const progress = (scrollY - featuredFadeOutStart) / (featuredFadeOutEnd - featuredFadeOutStart);
                    opacity = 1 - progress;
                    translateY = -progress * 60;
                    scale = 1 - progress * 0.05;
                    pointerEvents = opacity > 0.5 ? 'auto' : 'none';
                    featuredSec.classList.add('entered');
                } else if (scrollY > featuredFadeOutEnd) {
                    // Past Exit
                    opacity = 0;
                    translateY = -60;
                    scale = 0.95;
                    pointerEvents = 'none';
                    featuredSec.classList.remove('entered');
                } else {
                    featuredSec.classList.remove('entered');
                }

                featuredSec.style.opacity = opacity.toFixed(3);
                featuredSec.style.transform = `translateY(${translateY}px) scale(${scale})`;
                featuredSec.style.pointerEvents = pointerEvents;
            }

            // 4. Case Studies Section Fade & Translate (inward)
            if (casesSec) {
                let opacity = 0;
                let translateY = 60;
                let scale = 0.95;
                let pointerEvents = 'none';

                if (scrollY >= casesFadeInStart && scrollY <= casesFadeInEnd) {
                    // Fade In Phase
                    const progress = (scrollY - casesFadeInStart) / (casesFadeInEnd - casesFadeInStart);
                    opacity = progress;
                    translateY = 60 * (1 - progress);
                    scale = 0.95 + 0.05 * progress;
                    pointerEvents = opacity > 0.5 ? 'auto' : 'none';
                    casesSec.classList.add('entered');
                } else if (scrollY > casesFadeInEnd) {
                    // Active Phase
                    opacity = 1;
                    translateY = 0;
                    scale = 1;
                    pointerEvents = 'auto';
                    casesSec.classList.add('entered');
                } else {
                    casesSec.classList.remove('entered');
                }

                casesSec.style.opacity = opacity.toFixed(3);
                casesSec.style.transform = `translateY(${translateY}px) scale(${scale})`;
                casesSec.style.pointerEvents = pointerEvents;
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
            
            // Position each card along the helix track coordinates
            spiralCards.forEach((card, idx) => {
                const angle = baseAngle + idx * spacing;
                
                // Wrap the angle to stay within the repeating track range [-270, 270)
                let wrapped = (angle - startAngle) % totalRange;
                if (wrapped < 0) wrapped += totalRange;
                const trackAngle = startAngle + wrapped;
                
                const rotY = trackAngle;
                const y = -trackAngle * ySpacingFactor; // Negative to make increasing angle translate card upward
                
                // Apply 3D transform settings
                card.style.transform = `rotateY(${rotY}deg) translateZ(${radius}px) translateY(${y}px)`;
                
                // 1. Fade out cards near boundaries to make wrapping jumps invisible
                let boundaryOpacity = 1.0;
                const fadeWidth = 80; // degrees
                if (trackAngle < startAngle + fadeWidth) {
                    boundaryOpacity = (trackAngle - startAngle) / fadeWidth;
                } else if (trackAngle > (startAngle + totalRange - fadeWidth)) {
                    boundaryOpacity = (startAngle + totalRange - trackAngle) / fadeWidth;
                }
                boundaryOpacity = Math.max(0, Math.min(1, boundaryOpacity));
                
                // 2. Dim and blur background cards (facing away, 90 to 270 deg world rotation) for depth depth
                let normAngle = rotY % 360;
                if (normAngle < 0) normAngle += 360;
                
                const isBackside = (normAngle > 90 && normAngle < 270);
                let finalOpacity = boundaryOpacity;
                let blurAmount = 0;
                
                if (isBackside) {
                    finalOpacity = boundaryOpacity * 0.22; // Dim background cards
                    blurAmount = 3.5;                      // Blur background cards
                }
                
                card.style.opacity = finalOpacity.toFixed(3);
                card.style.filter = blurAmount > 0 ? `blur(${blurAmount}px)` : 'none';
                
                // Hide cards from screen reader/clicks only when fully faded out
                if (boundaryOpacity < 0.08) {
                    card.style.visibility = 'hidden';
                    card.style.pointerEvents = 'none';
                } else {
                    card.style.visibility = 'visible';
                    card.style.pointerEvents = isBackside ? 'none' : 'auto';
                }
            });
            
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
    window.addEventListener('load', initScrollMetrics);
    
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


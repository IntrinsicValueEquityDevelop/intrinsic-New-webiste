/**
 * Intrinsic Value Equity Advisors
 * Core Interactivity & Animations Script (Velvet Marigold Theme)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. SCROLL-SENSITIVE HEADER EFFECT
    // ==========================================================================
    const header = document.querySelector('.main-header');
    const philosophySection = document.getElementById('philosophy');
    
    const checkScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide navigation header when inside philosophy section
        if (philosophySection) {
            const rect = philosophySection.getBoundingClientRect();
            // Hide header if philosophy section is active in the viewport
            if (rect.top <= 80 && rect.bottom >= 0) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
        }
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
    // 3. CONTACT FORM POPUP MODAL
    // ==========================================================================
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const closeBtn = document.querySelector('.modal-close');
    const openBtns = document.querySelectorAll('.open-contact-modal');
    
    const openModal = (e) => {
        if (e) e.preventDefault();
        
        // Close mobile menu if it is open
        if (menuTrigger && menuTrigger.classList.contains('open')) {
            menuTrigger.classList.remove('open');
            navMenu.classList.remove('open');
            document.body.style.overflow = '';
        }
        
        modalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    
    const closeModal = () => {
        modalBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    };
    
    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside contents
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // ==========================================================================
    // 4. FORM SUBMISSION INTERACTION
    // ==========================================================================
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get inputs
            const submitBtn = contactForm.querySelector('.form-submit-btn');
            const originalText = submitBtn.textContent;
            
            // Simulate sending progress
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending Message...';
            submitBtn.style.opacity = '0.7';
            
            setTimeout(() => {
                // Success feedback
                submitBtn.textContent = 'Message Sent Successfully!';
                submitBtn.style.background = '#28a745';
                submitBtn.style.color = '#ffffff';
                submitBtn.style.borderColor = '#28a745';
                submitBtn.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.4)';
                
                // Reset form
                contactForm.reset();
                
                // Close modal and revert button state after feedback delay
                setTimeout(() => {
                    closeModal();
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.style.color = '';
                        submitBtn.style.borderColor = '';
                        submitBtn.style.boxShadow = '';
                        submitBtn.style.opacity = '';
                    }, 400);
                }, 2000);
            }, 1500);
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
        
        // Track page scroll to map to clockwise fast rotation
        window.addEventListener('scroll', () => {
            const rect = philosophySection.getBoundingClientRect();
            const sectionHeight = rect.height;
            const windowHeight = window.innerHeight;
            
            const scrolled = -rect.top;
            const scrollRange = sectionHeight - windowHeight;
            
            if (scrollRange > 0) {
                let progress = scrolled / scrollRange;
                progress = Math.max(0, Math.min(1, progress));
                
                // Scroll down revolves cards upward by exactly one 540-deg cycle
                targetScrollOffsetAngle = progress * 540;
            }
        });
        
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

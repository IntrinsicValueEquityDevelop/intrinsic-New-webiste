/**
 * Intrinsic Value Equity Advisors
 * Core Interactivity & Animations Script (Velvet Marigold Theme)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. SCROLL-SENSITIVE HEADER EFFECT
    // ==========================================================================
    const header = document.querySelector('.main-header');
    
    const checkScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
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
});

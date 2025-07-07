// ===========================================
// EFLOOD² DOCUMENTATION INTERACTIONS
// ===========================================

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize documentation features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDocsAnimations();
    setupDocsInteractivity();
    setupTableOfContents();
    setupCodeCopyButtons();
});

// Initialize documentation animations
function initializeDocsAnimations() {
    // Set initial states
    gsap.set('.docs-section', { opacity: 0, y: 30 });
    gsap.set('.docs-sidebar', { x: -20, opacity: 0 });
    gsap.set('.docs-toc', { x: 20, opacity: 0 });

    // Animate sidebar entrance
    gsap.to('.docs-sidebar', {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
    });

    // Animate table of contents entrance
    gsap.to('.docs-toc', {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.4
    });

    // Animate sections on scroll
    gsap.to('.docs-section', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.docs-content',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        }
    });

    // Animate feature items
    gsap.to('.feature-item', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.feature-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Animate info boxes
    gsap.to('.info-box, .warning-box', {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: '.info-box, .warning-box',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });
}

// Setup documentation interactivity
function setupDocsInteractivity() {
    // Smooth scrolling for sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Update active state
                updateActiveSidebarLink(this);

                // Smooth scroll to target
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: targetElement,
                        offsetY: 100
                    },
                    ease: 'power3.inOut'
                });
            }
        });
    });

    // Smooth scrolling for TOC links
    document.querySelectorAll('.toc-list a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Update active state
                updateActiveTocLink(this);

                // Smooth scroll to target
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: targetElement,
                        offsetY: 100
                    },
                    ease: 'power3.inOut'
                });
            }
        });
    });

    // Feature item hover effects
    document.querySelectorAll('.feature-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            gsap.to(this, {
                y: -5,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        item.addEventListener('mouseleave', function() {
            gsap.to(this, {
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

// Setup table of contents scroll spy
function setupTableOfContents() {
    const sections = document.querySelectorAll('.docs-section[id]');
    const tocLinks = document.querySelectorAll('.toc-list a');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    // Create intersection observer for scroll spy
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;

                // Update TOC active state
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });

                // Update sidebar active state
                sidebarLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0.1
    });

    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Setup code copy buttons
function setupCodeCopyButtons() {
    document.querySelectorAll('.copy-code-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const codeBlock = this.closest('.code-block');
            const code = codeBlock.querySelector('code');
            const text = code.textContent;

            navigator.clipboard.writeText(text).then(() => {
                // Visual feedback
                const originalText = this.textContent;
                this.textContent = '✓';

                gsap.to(this, {
                    scale: 0.9,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                });

                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
            });
        });
    });
}

// Update active sidebar link
function updateActiveSidebarLink(activeLink) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Update active TOC link
function updateActiveTocLink(activeLink) {
    document.querySelectorAll('.toc-list a').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Search functionality (placeholder for future implementation)
function initializeSearch() {
    // TODO: Implement search functionality
    console.log('Search functionality will be implemented in future versions');
}

// Mobile menu toggle (for responsive design)
function toggleMobileMenu() {
    const sidebar = document.querySelector('.docs-sidebar');
    const isVisible = sidebar.style.display !== 'none';

    if (isVisible) {
        gsap.to(sidebar, {
            x: -280,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
                sidebar.style.display = 'none';
            }
        });
    } else {
        sidebar.style.display = 'block';
        gsap.fromTo(sidebar,
            { x: -280 },
            {
                x: 0,
                duration: 0.3,
                ease: 'power2.inOut'
            }
        );
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // ESC key to close mobile menu
    if (e.key === 'Escape') {
        const sidebar = document.querySelector('.docs-sidebar');
        if (window.innerWidth <= 768 && sidebar.style.display !== 'none') {
            toggleMobileMenu();
        }
    }

    // Arrow keys for section navigation
    if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        navigateToNextSection();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        navigateToPreviousSection();
    }
});

// Navigate to next section
function navigateToNextSection() {
    const sections = Array.from(document.querySelectorAll('.docs-section[id]'));
    const currentSection = getCurrentSection();
    const currentIndex = sections.indexOf(currentSection);

    if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        gsap.to(window, {
            duration: 0.8,
            scrollTo: {
                y: nextSection,
                offsetY: 100
            },
            ease: 'power3.inOut'
        });
    }
}

// Navigate to previous section
function navigateToPreviousSection() {
    const sections = Array.from(document.querySelectorAll('.docs-section[id]'));
    const currentSection = getCurrentSection();
    const currentIndex = sections.indexOf(currentSection);

    if (currentIndex > 0) {
        const prevSection = sections[currentIndex - 1];
        gsap.to(window, {
            duration: 0.8,
            scrollTo: {
                y: prevSection,
                offsetY: 100
            },
            ease: 'power3.inOut'
        });
    }
}

// Get current section based on scroll position
function getCurrentSection() {
    const sections = document.querySelectorAll('.docs-section[id]');
    let currentSection = sections[0];

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
            currentSection = section;
        }
    });

    return currentSection;
}

// Refresh ScrollTrigger on window resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

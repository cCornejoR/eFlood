// ===========================================
// EFLOOD² DOCUMENTATION ANIMATIONS
// ===========================================

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSplitTextAnimations();
    initializeAnimations();
    setupInteractivity();
});

// Initialize Split Text Animations - EXACTLY like the example
function initializeSplitTextAnimations() {
    document.fonts.ready.then(() => {
        gsap.set(".split", { opacity: 1 });

        let split = SplitText.create(".split", {
            type: "chars, words",
            mask: "chars"
        });

        let tween = gsap.from(split.chars, {
            duration: 2.2,
            yPercent: "random([-150, 150])",
            xPercent: "random([-150, 150])",
            stagger: {
                from: "random",
                amount: 1.5,
            },
            ease: "power3.out"
        });
    });
}

// Main animation initialization
function initializeAnimations() {
    // Set initial states
    gsap.set('.hero-content', { opacity: 0, y: 50 });
    gsap.set('.hero-visual', { opacity: 0, x: 50 });
    gsap.set('.hero-background', { opacity: 0 });
    gsap.set('.feature-item', { opacity: 0, y: 30 });
    gsap.set('.nav', { y: -100 });

    // Navigation entrance
    gsap.to('.nav', {
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
    });

    // Hero background animation
    gsap.to('.hero-background', {
        opacity: 0.9,
        duration: 2,
        ease: 'power2.out'
    });

    // Hero content animation
    const heroTl = gsap.timeline({ delay: 0.5 });

    heroTl.to('.hero-content', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
    })
    .to('.hero-visual', {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.5');

    // Split text animations are handled by initializeSplitTextAnimations()

    // Feature items scroll animation
    gsap.to('.feature-item', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        }
    });

    // Download section animation
    gsap.to('.download-container', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.download',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Parallax effect for hero background
    gsap.to('.hero', {
        backgroundPosition: '50% 100px',
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });

    // Hero image sequence animation
    initHeroImageSequence();
}

// Hero image sequence animation
function initHeroImageSequence() {
    const images = document.querySelectorAll('.app-interface');
    const totalImages = images.length;
    let currentIndex = 0;

    if (totalImages <= 1) return;

    // Create scroll trigger for image sequence
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom center',
        scrub: 1,
        onUpdate: (self) => {
            // Calculate which image should be active based on scroll progress
            const progress = self.progress;
            const newIndex = Math.floor(progress * (totalImages - 1));

            if (newIndex !== currentIndex && newIndex < totalImages) {
                // Animate out current image
                gsap.to(images[currentIndex], {
                    opacity: 0,
                    scale: 0.95,
                    rotationY: -10,
                    duration: 0.4,
                    ease: 'power2.out'
                });

                // Animate in new image
                gsap.to(images[newIndex], {
                    opacity: 1,
                    scale: 1,
                    rotationY: 0,
                    duration: 0.4,
                    ease: 'power2.out',
                    delay: 0.1
                });

                // Update classes
                images[currentIndex].classList.remove('active');
                images[newIndex].classList.add('active');

                currentIndex = newIndex;
            }
        }
    });

    // Auto-cycle images when not scrolling (optional)
    let autoInterval = setInterval(() => {
        if (!ScrollTrigger.isScrolling()) {
            const nextIndex = (currentIndex + 1) % totalImages;

            gsap.to(images[currentIndex], {
                opacity: 0,
                scale: 0.95,
                rotationY: 10,
                duration: 0.6,
                ease: 'power2.inOut'
            });

            gsap.to(images[nextIndex], {
                opacity: 1,
                scale: 1,
                rotationY: 0,
                duration: 0.6,
                ease: 'power2.inOut',
                delay: 0.2
            });

            images[currentIndex].classList.remove('active');
            images[nextIndex].classList.add('active');

            currentIndex = nextIndex;
        }
    }, 4000);

    // Clear interval when scrolling
    ScrollTrigger.addEventListener('scrollStart', () => {
        clearInterval(autoInterval);
    });

    ScrollTrigger.addEventListener('scrollEnd', () => {
        autoInterval = setInterval(() => {
            if (!ScrollTrigger.isScrolling()) {
                const nextIndex = (currentIndex + 1) % totalImages;

                gsap.to(images[currentIndex], {
                    opacity: 0,
                    scale: 0.95,
                    rotationY: 10,
                    duration: 0.6,
                    ease: 'power2.inOut'
                });

                gsap.to(images[nextIndex], {
                    opacity: 1,
                    scale: 1,
                    rotationY: 0,
                    duration: 0.6,
                    ease: 'power2.inOut',
                    delay: 0.2
                });

                images[currentIndex].classList.remove('active');
                images[nextIndex].classList.add('active');

                currentIndex = nextIndex;
            }
        }, 4000);
    });
}

// Split text animations are handled by SplitText plugin

// Setup interactive features
function setupInteractivity() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: target,
                    ease: 'power3.inOut'
                });
            }
        });
    });

    // Copy to clipboard functionality
    const copyBtn = document.getElementById('copyInstall');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const command = 'curl -fsSL https://eflood2.dev/install | bash';
            navigator.clipboard.writeText(command).then(() => {
                // Visual feedback
                gsap.to(copyBtn, {
                    scale: 0.9,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                });

                // Change icon temporarily
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                `;

                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
            });
        });
    }

    // Button hover animations
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            gsap.to(this, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', function() {
            gsap.to(this, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    // Feature content hover effects
    document.querySelectorAll('.feature-content').forEach(content => {
        content.addEventListener('mouseenter', function() {
            gsap.to(this, {
                y: -8,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        content.addEventListener('mouseleave', function() {
            gsap.to(this, {
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    // Navigation scroll effect
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            if (currentScrollY > lastScrollY) {
                // Scrolling down - hide nav
                gsap.to('.nav', {
                    y: -100,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                // Scrolling up - show nav
                gsap.to('.nav', {
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        }

        lastScrollY = currentScrollY;
    });

    // Button click handlers
    const getStartedBtn = document.getElementById('getStartedBtn');
    const docsBtn = document.getElementById('docsBtn');

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            gsap.to(window, {
                duration: 1,
                scrollTo: '#download',
                ease: 'power3.inOut'
            });
        });
    }

    if (docsBtn) {
        docsBtn.addEventListener('click', function() {
            window.location.href = 'docs/index.html';
        });
    }
}

// Utility function for creating stagger animations
function createStaggerAnimation(selector, options = {}) {
    const defaults = {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
    };

    const config = { ...defaults, ...options };

    return gsap.to(selector, config);
}

// Utility function for scroll-triggered animations
function createScrollAnimation(trigger, target, options = {}) {
    const defaults = {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: trigger,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    };

    const config = { ...defaults, ...options };

    return gsap.to(target, config);
}

// Performance optimization: Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(0.5);
    ScrollTrigger.config({ ignoreMobileResize: true });
}

// Split text animations replace scramble effect

// Refresh ScrollTrigger on window resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// TRAE AI - Professional Minimal GSAP Animations
// =============================================

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Global animation settings
gsap.defaults({
    ease: "power2.out",
    duration: 1.2
});



// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    setupScrollTriggers();
    setupInteractivity();
    setupNavigation();
    setupMobileMenu();
});

// Main initialization function
function initializeAnimations() {
    // Set initial states for eFlood² theme - optimized for faster loading
    gsap.set('.title-line', { opacity: 0, y: 50 });
    gsap.set('.hero-description', { opacity: 0, y: 20 });
    gsap.set('.hero-actions', { opacity: 0, y: 20 });
    gsap.set('.program-preview', { opacity: 0, y: 50, scale: 0.9 });
    gsap.set('.hero-scroll', { opacity: 0 });
    
    // Hero entrance animation with hydraulic theme - faster and smoother
    const heroTl = gsap.timeline({ delay: 0.2 });
    
    heroTl
        .to('.title-line', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        })
        .to('.hero-description', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.6")
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.4")
        .to('.program-preview', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out"
        }, "-=0.6")
        .to('.hero-scroll', {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.3");
    
    // Animate scroll indicator with water flow effect - optimized
    gsap.to('.scroll-line', {
        scaleY: 0.3,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });
    
    // Program image hover effect
    const programImage = document.querySelector('.program-image');
    if (programImage) {
        programImage.addEventListener('mouseenter', () => {
            gsap.to(programImage, { scale: 1.02, duration: 0.3, ease: "power2.out" });
        });
        programImage.addEventListener('mouseleave', () => {
            gsap.to(programImage, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
    }
}

// Setup scroll-triggered animations for eFlood² - optimized for speed
function setupScrollTriggers() {
    // Set initial states for scroll animations
    gsap.set('.about .label-text, .features .label-text, .contact .label-text', { opacity: 0, y: 20 });
    gsap.set('.about .section-title, .features .section-title, .contact .section-title', { opacity: 0, y: 30 });
    gsap.set('.about .section-description', { opacity: 0, y: 20 });
    gsap.set('.stat-item', { opacity: 0, y: 30, scale: 0.9 });
    gsap.set('.feature-item', { opacity: 0, y: 30 });
    gsap.set('.contact-item', { opacity: 0, y: 20, scale: 0.95 });
    
    // About section - faster animations
    gsap.timeline({
        scrollTrigger: {
            trigger: '.about',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    })
    .to('.about .label-text', { opacity: 1, y: 0, duration: 0.5 })
    .to('.about .section-title', { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
    .to('.about .section-description', { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
    .to('.stat-item', { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.3");
    
    // Features section - optimized stagger
    gsap.timeline({
        scrollTrigger: {
            trigger: '.features',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    })
    .to('.features .label-text', { opacity: 1, y: 0, duration: 0.5 })
    .to('.features .section-title', { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
    .to('.feature-item', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }, "-=0.4");
    
    // Contact section animation - simple and clean
    gsap.timeline({
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    })
    .to('.contact .label-text', {
        opacity: 1,
        y: 0,
        duration: 0.5
    })
    .to('.contact .section-title', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.3")
    .to('.contact-item', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
    }, "-=0.4");
    
    // Parallax effects for water simulation
    gsap.to('.water-container', {
        y: -50,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
        }
    });
    
    // Grid pattern parallax
    gsap.to('.grid-pattern', {
        y: -80,
        rotation: 5,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 2
        }
    });
    
    // Navigation background on scroll with eFlood² branding
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: {
            className: 'nav-scrolled',
            targets: '.nav'
        }
    });
}

// Setup interactive elements
function setupInteractivity() {
    // Button hover animations
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
    
    // Feature item hover effects
    document.querySelectorAll('.feature-item').forEach(item => {
        const icon = item.querySelector('.icon-shape');
        
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                y: -10,
                duration: 0.4,
                ease: "power2.out"
            });
            
            gsap.to(icon, {
                scale: 1.1,
                rotation: 5,
                duration: 0.4,
                ease: "back.out(1.7)"
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                y: 0,
                duration: 0.4,
                ease: "power2.out"
            });
            
            gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });
    
    // Grid item hover effects
    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.1,
                rotationY: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                rotationY: 5,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });
    
    // Stat number counter animation
    ScrollTrigger.create({
        trigger: '.stats-grid',
        start: 'top 80%',
        onEnter: () => {
            document.querySelectorAll('.stat-number').forEach(stat => {
                const text = stat.textContent;
                const isNumber = /\d/.test(text);
                
                if (isNumber) {
                    const endValue = parseInt(text.replace(/\D/g, ''));
                    const suffix = text.replace(/\d/g, '');
                    
                    gsap.fromTo(stat, {
                        textContent: 0
                    }, {
                        textContent: endValue,
                        duration: 2,
                        ease: "power2.out",
                        snap: { textContent: 1 },
                        onUpdate: function() {
                            stat.textContent = Math.round(this.targets()[0].textContent) + suffix;
                        }
                    });
                }
            });
        }
    });
}

// Setup smooth navigation
function setupNavigation() {
    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: {
                        y: targetSection,
                        offsetY: 80
                    },
                    ease: "power2.inOut"
                });
            }
        });
    });
    
    // Active navigation highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    ScrollTrigger.batch(sections, {
        onEnter: (elements) => {
            const id = elements[0].getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        },
        onLeave: (elements) => {
            const id = elements[0].getAttribute('id');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.remove('active');
                }
            });
        }
    });
}

// Advanced mouse tracking for hero section
function setupMouseTracking() {
    const hero = document.querySelector('.hero');
    const visualGrid = document.querySelector('.visual-grid');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && visualGrid && heroContent) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            gsap.to(visualGrid, {
                x: x * 20,
                y: y * 20,
                rotationY: x * 10,
                rotationX: -y * 10,
                duration: 1,
                ease: "power2.out"
            });
            
            gsap.to(heroContent, {
                x: x * 10,
                y: y * 10,
                duration: 1,
                ease: "power2.out"
            });
        });
        
        hero.addEventListener('mouseleave', () => {
            gsap.to([visualGrid, heroContent], {
                x: 0,
                y: 0,
                rotationY: 0,
                rotationX: 0,
                duration: 1,
                ease: "power2.out"
            });
        });
    }
}

// Initialize mouse tracking after DOM load
document.addEventListener('DOMContentLoaded', () => {
    setupMouseTracking();
});

// Refresh ScrollTrigger on window resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// Add CSS for navigation scrolled state
const style = document.createElement('style');
style.textContent = `
    .nav-scrolled {
        background: rgba(10, 10, 10, 0.95) !important;
        backdrop-filter: blur(30px) !important;
    }
    
    .nav-link.active {
        color: var(--text-primary) !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(style);

// Mobile Menu Setup
function setupMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navToggle || !navMenu) return;
    
    // Toggle mobile menu
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Performance optimization
gsap.config({
    force3D: true,
    nullTargetWarn: false
});

// Export functions for external use
window.TraeAnimations = {
    initializeAnimations,
    setupScrollTriggers,
    setupInteractivity,
    setupNavigation,
    setupMobileMenu,
    setupMouseTracking,
    initWaterSimulation,
    animateWater
};

console.log('🚀 Trae AI animations initialized successfully!');

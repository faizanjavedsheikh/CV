// Initialize Locomotive Scroll with optimized settings
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    lerp: 0.03,              // Increased for faster response
    multiplier: 0.5,         // Increased for faster scrolling
    reloadOnContextChange: true,
    touchMultiplier: 2.5,    // Increased for faster touch scrolling
    smoothMobile: true,
    resetNativeScroll: true,
    smartphone: {
        smooth: true,
        multiplier: 1.5,     // Increased for faster scrolling
        lerp: 0.1,           // Increased for faster response
        touchMultiplier: 3.5 // Increased for faster touch scrolling
    },
    tablet: {
        smooth: true,
        multiplier: 1.5,     // Increased for faster scrolling
        lerp: 0.1,           // Increased for faster response
        touchMultiplier: 3.5, // Increased for faster touch scrolling
        breakpoint: 1024
    }
});

// Menu functionality
const menuBtn = document.querySelector('.menu-btn');
const navOverlay = document.querySelector('.nav-overlay');
const navLinks = document.querySelectorAll('.nav-overlay__link');

// Toggle menu
menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navOverlay.classList.toggle('active');
});

// Handle navigation clicks
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Close menu
        menuBtn.classList.remove('active');
        navOverlay.classList.remove('active');

        // Smooth scroll to target section
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            scroll.scrollTo(targetSection, {
                offset: 0,
                duration: 1500,
                easing: [0.25, 0.00, 0.35, 1.00],
                disableLerp: true
            });
        }
    });
});

// Magnetic dots functionality
function initializeMagneticDots() {
    // Get the first section
    const firstSection = document.querySelector('#about');
    if (!firstSection) return;
    
    // Remove existing container if it exists
    const existingContainer = document.querySelector('.magnetic-dots');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // Create new container
    const container = document.createElement('div');
    container.className = 'magnetic-dots';
    firstSection.insertBefore(container, firstSection.firstChild);
    
    // Create dots
    const spacing = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--dot-spacing'));
    const sectionRect = firstSection.getBoundingClientRect();
    
    // Calculate number of dots needed with padding
    const padding = spacing;
    const numCols = Math.ceil((sectionRect.width + padding) / spacing);
    const numRows = Math.ceil((sectionRect.height + padding) / spacing);
    
    // Create dots
    for (let i = 0; i < numCols; i++) {
        for (let j = 0; j < numRows; j++) {
            const dot = document.createElement('div');
            dot.className = 'magnetic-dot';
            dot.style.left = `${i * spacing}px`;
            dot.style.top = `${j * spacing}px`;
            container.appendChild(dot);
        }
    }
}

// Initialize dots immediately
initializeMagneticDots();

// Also initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeMagneticDots();
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
        // Small delay to ensure fonts are loaded
        setTimeout(() => {
            aboutSection.classList.add('visible');
        }, 100);
    }
});

// Handle window resize with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initializeMagneticDots();
    }, 250);
});

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
let isAnimating = false;
let isScrolling = false;
let scrollTimeout;

// Magnetic effect configuration
const magneticConfig = {
    strength: 0.1,      // How strongly dots are attracted to mouse (0.05 to 0.3)
    maxDistance: 500,    // Maximum distance for magnetic effect in pixels (100 to 500)
    smoothing: 0.2,     // How smoothly dots follow mouse (0.05 to 0.2)
    fps: 60             // Animation frames per second (20 to 60)
};

// Track mouse movement with throttling
let lastMouseUpdate = 0;
const mouseThrottle = 1000 / magneticConfig.fps;

// Performance optimizations
let ticking = false;
let lastScrollTop = 0;

// Optimize scroll performance
scroll.on('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const currentScrollTop = scroll.scroll.instance.scroll.y;
            
            // Only update if scroll position has changed significantly
            if (Math.abs(currentScrollTop - lastScrollTop) > 1) {
                lastScrollTop = currentScrollTop;
                
                // Update magnetic dots only when not scrolling fast
                if (Math.abs(scroll.scroll.instance.delta.y) < 4) {
                    updateDots();
                }
            }
            
            ticking = false;
        });
        
        ticking = true;
    }
});

// Optimize magnetic dots update
function updateDots() {
    if (isScrolling) return;
    
    const dots = document.querySelectorAll('.magnetic-dot');
    const container = document.querySelector('.magnetic-dots');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerLeft = containerRect.left;
    
    // Only update dots that are in or near the viewport
    dots.forEach(dot => {
        const rect = dot.getBoundingClientRect();
        const dotTop = rect.top;
        const dotLeft = rect.left;
        
        // Check if dot is in viewport (with some padding)
        if (dotTop > -100 && dotTop < window.innerHeight + 100 &&
            dotLeft > -100 && dotLeft < window.innerWidth + 100) {
            
            const dx = currentX - (dotLeft - containerLeft + rect.width / 2);
            const dy = currentY - (dotTop - containerTop + rect.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < magneticConfig.maxDistance) {
                const force = (1 - distance / magneticConfig.maxDistance) * magneticConfig.strength;
                const moveX = dx * force;
                const moveY = dy * force;
                
                dot.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
            } else {
                dot.style.transform = 'translate(-50%, -50%)';
            }
        }
    });
}

document.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastMouseUpdate >= mouseThrottle) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        lastMouseUpdate = now;
        if (!isAnimating && !isScrolling) {
            isAnimating = true;
            requestAnimationFrame(updateDots);
        }
    }
});

function updateDots() {
    // Skip animation if scrolling
    if (isScrolling) {
        isAnimating = false;
        return;
    }

    const dots = document.querySelectorAll('.magnetic-dot');
    
    // Smooth interpolation of current position
    currentX += (mouseX - currentX) * magneticConfig.smoothing;
    currentY += (mouseY - currentY) * magneticConfig.smoothing;
    
    dots.forEach(dot => {
        const rect = dot.getBoundingClientRect();
        const dotX = rect.left + rect.width / 2;
        const dotY = rect.top + rect.height / 2;
        
        // Simplified distance calculation
        const dx = currentX - dotX;
        const dy = currentY - dotY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < magneticConfig.maxDistance) {
            // Simplified force calculation
            const force = (1 - distance / magneticConfig.maxDistance) * magneticConfig.strength;
            const moveX = dx * force;
            const moveY = dy * force;
            
            // Apply transformation
            dot.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        } else {
            // Return to original position
            dot.style.transform = 'translate(-50%, -50%)';
        }
    });
    
    isAnimating = false;
}

// Reset dots when mouse leaves
document.addEventListener('mouseleave', () => {
    const dots = document.querySelectorAll('.magnetic-dot');
    dots.forEach(dot => {
        dot.style.transform = 'translate(-50%, -50%)';
    });
    currentX = mouseX;
    currentY = mouseY;
});

// Update scroll on page load and resize
window.addEventListener('load', () => {
    scroll.update();
    document.documentElement.classList.add('is-loaded');
});

window.addEventListener('resize', () => {
    scroll.update();
}); 
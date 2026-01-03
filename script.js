// ===================================
// Smooth Scroll for Navigation Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// Intersection Observer for Scroll Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// ===================================
// Active Navigation Link Highlighting
// ===================================
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ===================================
// Mouse Spotlight Effect
// ===================================
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    
    document.body.style.setProperty('--mouse-x', `${x}%`);
    document.body.style.setProperty('--mouse-y', `${y}%`);
    
    // Add class to show the effect
    document.body.classList.add('mouse-moved');
});

// Hide effect when mouse leaves the window
document.addEventListener('mouseleave', () => {
    document.body.classList.remove('mouse-moved');
});



// ===================================
// Parallax Effect on Scroll (Subtle)
// ===================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===================================
// Email Copy to Clipboard
// ===================================
const emailLink = document.querySelector('.email-link a');
if (emailLink) {
    emailLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailLink.textContent;
        
        navigator.clipboard.writeText(email).then(() => {
            // Create temporary tooltip
            const tooltip = document.createElement('div');
            tooltip.textContent = '¡Copiado!';
            tooltip.style.cssText = `
                position: fixed;
                bottom: 120px;
                right: 40px;
                background: var(--green);
                color: var(--navy);
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                z-index: 1000;
                animation: fadeInUp 0.3s ease;
            `;
            document.body.appendChild(tooltip);
            
            setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.transition = 'opacity 0.3s ease';
                setTimeout(() => tooltip.remove(), 300);
            }, 2000);
        });
    });
}

// ===================================
// Project Card Tilt Effect
// ===================================
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// ===================================
// Typing Effect for Hero Section (Optional)
// ===================================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Uncomment to enable typing effect
// const heroTagline = document.querySelector('.hero-tagline');
// if (heroTagline) {
//     const originalText = heroTagline.textContent;
//     typeWriter(heroTagline, originalText, 30);
// }

// ===================================
// Loading Animation
// ===================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===================================
// Console Easter Egg
// ===================================
console.log('%c¡Hola! 👋', 'color: #64ffda; font-size: 24px; font-weight: bold;');
console.log('%c¿Buscando algo interesante?', 'color: #8892b0; font-size: 16px;');
console.log('%cEste portfolio fue construido con HTML, CSS y JavaScript vanilla.', 'color: #8892b0; font-size: 14px;');
console.log('%c¡Contáctame si quieres colaborar!', 'color: #64ffda; font-size: 14px; font-weight: bold;');

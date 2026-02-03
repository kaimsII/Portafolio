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
// Project Detail Modal Logic
// ===================================
const projectModal = document.getElementById('project-modal');

const projectsData = {
    "deep-thinking": {
        title: "Deep Thinking",
        subtitle: "Global Nominee - NASA Space Apps 2022",
        problem: "Monitorear correctamente las velocidades máximas del viento solar tolerable en la tierra y poder predecir un posible evento catastrofico en el futuro.",
        solution: "Red neuronal artificial que extrae mediciones del campo magnético y parámetros de iones de los satelites DSCVR y WIND.",
        achievement: "Global Nominee y Regional Champions (Perú) en el NASA Space Apps Challenge 2022."
    },
    "chaska-nawi": {
        title: "Ch'aska ñawi",
        subtitle: "Global Nominee - NASA Space Apps 2020",
        problem: "Necesidad de monitorear, reconocer y predecir inundaciones en Peru junto a sus posibles costos economicos para la toma de decisiones.",
        solution: "Metodología que incorpora imágenes satelitales y recolección de datos para crear un modelo predictivo.",
        achievement: "Global Nominee y Regional Champions en el NASA Space Apps Challenge 2020."
    }
};

function openProjectModal(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    // Populate Modal
    document.getElementById('project-modal-title').textContent = project.title;
    document.getElementById('project-modal-subtitle').textContent = project.subtitle;
    document.getElementById('project-modal-problem').textContent = project.problem;
    document.getElementById('project-modal-solution').textContent = project.solution;
    document.getElementById('project-modal-achievement').textContent = project.achievement;

    // Show Modal
    projectModal.style.display = 'flex';
    // Small delay for transition
    setTimeout(() => {
        projectModal.classList.add('show');
    }, 10);

    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    projectModal.classList.remove('show');

    setTimeout(() => {
        projectModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === projectModal) {
        closeProjectModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectModal.classList.contains('show')) {
        closeProjectModal();
    }
});
// ===================================
// Certification Modal Logic
// ===================================
const certModal = document.getElementById('cert-modal');

function openCertModal(card) {
    // Get data from the clicked card
    const logoSrc = card.querySelector('.cert-visible .cert-logo img').src;
    const logoAlt = card.querySelector('.cert-visible .cert-logo img').alt;
    const issuer = card.querySelector('.cert-visible .cert-issuer').textContent;
    const title = card.querySelector('.cert-visible .cert-name').textContent;

    // Get hidden details
    const description = card.querySelector('.cert-details-hidden .cert-description').textContent;
    const tags = card.querySelector('.cert-details-hidden .cert-tags').innerHTML; // Get innerHTML to preserve <li> structure
    const date = card.querySelector('.cert-details-hidden .cert-date').textContent;

    // Populate Modal
    document.getElementById('modal-logo').innerHTML = `<img src="${logoSrc}" alt="${logoAlt}">`;
    document.getElementById('modal-issuer').textContent = issuer;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-description').textContent = description.trim();
    document.getElementById('modal-tags').innerHTML = tags;
    document.getElementById('modal-date').textContent = date;

    // Show Modal
    certModal.style.display = 'flex';
    // Small delay to allow display:flex to apply before adding show class for transition
    setTimeout(() => {
        certModal.classList.add('show');
    }, 10);

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function closeCertModal() {
    certModal.classList.remove('show');

    // Wait for transition to finish before hiding
    setTimeout(() => {
        certModal.style.display = 'none';
        // Clear content logic optional, but good practice
        document.body.style.overflow = 'auto'; // Restore scrolling
    }, 300);
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === certModal) {
        closeCertModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && certModal.classList.contains('show')) {
        closeCertModal();
    }
});

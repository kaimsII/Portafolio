document.addEventListener('DOMContentLoaded', () => {
    // Minimalist Lazy Loader
    const lazyIframes = document.querySelectorAll('.lazy-iframe');

    // Intersection Observer for loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const wrapper = entry.target;
                const src = wrapper.dataset.src;

                if (src && !wrapper.querySelector('iframe')) {
                    const iframe = document.createElement('iframe');
                    iframe.src = src;
                    // FIX: Desactivar scroll explícitamente en el atributo del iframe
                    iframe.setAttribute('scrolling', 'no');
                    iframe.setAttribute('frameborder', '0');
                    iframe.style.overflow = 'hidden';

                    iframe.onload = () => {
                        iframe.style.opacity = '1';
                        // Clean up placeholder
                        const placeholder = wrapper.querySelector('.loading-placeholder');
                        if (placeholder) placeholder.style.display = 'none';
                    };
                    wrapper.appendChild(iframe);
                    console.log(`Loaded: ${src}`);
                }
            }
        });
    }, { rootMargin: '200px' }); // Load a bit earlier

    lazyIframes.forEach(el => observer.observe(el));
});

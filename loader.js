/**
 * MeetBase - Loading Screen & Seamless Page Transitions
 */
(function () {
    const LOADER_ID = 'meetbase-loader';
    const MIN_INITIAL_LOAD_MS = 450;
    const TRANSITION_DELAY_MS = 260;
    const startTime = Date.now();

    const LOADER_HTML = `
        <div class="mb-loader-aura"></div>
        <div class="mb-loader-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
        </div>
        <div class="mb-loader-brand">
            <span class="mb-loader-title">MeetBase</span>
            <span class="mb-loader-badge">Workspace</span>
        </div>
        <div class="mb-loader-progress-track">
            <div class="mb-loader-progress-bar"></div>
        </div>
        <div class="mb-loader-status" id="meetbase-loader-text">Menyiapkan ruang kerja...</div>
    `;

    function getOrCreateLoader() {
        let loader = document.getElementById(LOADER_ID);
        if (!loader) {
            loader = document.createElement('div');
            loader.id = LOADER_ID;
            loader.innerHTML = LOADER_HTML;
            if (document.body) {
                document.body.insertAdjacentElement('afterbegin', loader);
            } else {
                document.documentElement.appendChild(loader);
            }
        }
        return loader;
    }

    function showLoader(message) {
        const loader = getOrCreateLoader();
        const textEl = document.getElementById('meetbase-loader-text');
        if (textEl && message) {
            textEl.textContent = message;
        }
        loader.classList.remove('loader-hidden');
        loader.classList.add('loader-active');
    }

    function hideLoader() {
        const loader = document.getElementById(LOADER_ID);
        if (loader) {
            loader.classList.remove('loader-active');
            loader.classList.add('loader-hidden');
        }
    }

    function showPageTransition(targetUrl, message) {
        if (!targetUrl) return;
        showLoader(message || 'Memuat halaman...');
        setTimeout(() => {
            window.location.href = targetUrl;
        }, TRANSITION_DELAY_MS);
    }

    // Expose helpers globally
    window.MeetBaseLoader = {
        show: showLoader,
        hide: hideLoader,
        navigate: showPageTransition
    };
    window.showPageTransition = showPageTransition;

    // Handle initial page load
    function handleInitialLoad() {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_INITIAL_LOAD_MS - elapsed);
        setTimeout(hideLoader, remaining);
    }

    if (document.readyState === 'complete') {
        handleInitialLoad();
    } else {
        window.addEventListener('load', handleInitialLoad);
        // Fallback safety timeout (3.5s)
        setTimeout(hideLoader, 3500);
    }

    // Handle browser back/forward cache
    window.addEventListener('pageshow', function (event) {
        hideLoader();
    });
    window.addEventListener('popstate', function () {
        hideLoader();
    });

    // Intercept navigation link clicks for smooth page transitions
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip non-navigational links
        if (href.startsWith('#') || 
            href.startsWith('javascript:') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') || 
            href.startsWith('blob:')) {
            return;
        }

        // Skip new tab or download
        if (link.target === '_blank' || link.hasAttribute('download')) {
            return;
        }

        // Skip if modifier keys pressed (user wants new tab/window)
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
            return;
        }

        // Compare current page vs target page
        try {
            const currentPath = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
            const targetPath = href.split('#')[0].split('?')[0].split('/').pop().toLowerCase();

            if (targetPath && targetPath === currentPath) {
                // If it's the exact same page, let standard handling or hash scroll occur
                if (href.includes('#')) return;
            }

            // Check if link points to internal HTML page
            const isInternal = !href.includes('://') || href.includes(window.location.hostname);
            if (!isInternal) return;

            // Determine friendly transition message
            let transitionMessage = 'Memuat halaman...';
            const lowerHref = href.toLowerCase();
            if (lowerHref.includes('dashboard')) {
                transitionMessage = 'Menyiapkan Dashboard...';
            } else if (lowerHref.includes('register')) {
                transitionMessage = 'Membuka Halaman Daftar...';
            } else if (lowerHref.includes('login')) {
                transitionMessage = 'Membuka Halaman Masuk...';
            } else if (lowerHref.includes('index')) {
                transitionMessage = 'Membuka Pengenalan MeetBase...';
            }

            e.preventDefault();
            showPageTransition(href, transitionMessage);
        } catch (err) {
            console.error('Transition error:', err);
        }
    });
})();

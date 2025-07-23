// ==UserScript==
// @name         Marktplaats; enkel de zoekresultaten
// @version      2.0.0
// @namespace    Marktplaats
// @description  - Verbergt bedrijf/webshop advertenties.
// @description  - Verbergt betaalde advertenties.
// @description  - Schoont pagina's op door nutteloze onderdelen te verbergen.
// @description  - Voegt een OSM-link toe naar de ongelinkte locatie van de adverteerder.
// @description  - Maakt navigatie gemakkelijker met sneltoetsen.
// @description  - Biedt een in-code mogelijkheid om eenvoudig een blacklist samen te stellen.
// @description  - Toont volledige gebruikersnamen in het overzicht van biedingen.
// @description  - Zoomt in op originele resolutie van advertentieafbeeldingen.
// @include      https://www.marktplaats.nl/*
// @license      MIT
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
    const blacklistedSellers = [
        'Example Name 123',
    ];

    const hideAds = () => {
        document.querySelectorAll('[class*="Listing--list-item"]').forEach(item => {
            const text = item.textContent;
            const seller = item.querySelector('[class*="Listing-seller-name"]');
            const sellerName = seller?.textContent?.trim() ?? '';
            const keywords = [
                'Bezorgt in',
                'Topadvertentie',
                'Dagtopper',
                'Heel Nederland',
                'Bezoek website'
            ];
            const shouldHide =
                keywords.some(k => text.includes(k)) ||
                blacklistedSellers.some(name => sellerName.includes(name)) ||
                item.querySelector('[class*="Listing-sub-images"]') ||
                item.querySelector('[class*="Listing-Opvalsticker-wrapper"]');

            if (shouldHide) item.style.display = 'none';
        });

        document.querySelectorAll('[class*="Listing--other-seller"]').forEach(el => {
            el.style.display = 'none';
        });
    };

    const enhanceLocationLink = () => {
        const icon = document.querySelector('[class*="SvgIconLocation"]');
        const span = icon?.closest('div')?.querySelector('span');
        if (!span || !span.textContent.trim()) return;

        const locationText = span.textContent.trim();
        const link = document.createElement('a');
        link.href = `https://www.openstreetmap.org/search?query=${encodeURIComponent(locationText)}`;
        link.target = '_blank';
        link.textContent = locationText;
        span.replaceWith(link);
    };

    const setupKeyboardShortcuts = () => {
        document.body.addEventListener('keydown', (e) => {
            const activeTag = document.activeElement.tagName.toLowerCase();
            const isTyping = ['input', 'textarea'].includes(activeTag);

            // Use Shift + / (aka "?") instead of just "/" to avoid Firefox blocking
            if (e.key === '?' && !isTyping) {
                e.preventDefault();
                const input = document.querySelector('input[name="query"]');
                if (input) {
                    input.focus();
                    input.select();
                }
            }

            // Arrows for navigation
            if (!isTyping) {
                if (e.key === 'ArrowRight') {
                    document.querySelector('[class*="PaginationControls-pagination"] [class*="Button"]:last-child')?.click();
                } else if (e.key === 'ArrowLeft') {
                    document.querySelector('[class*="PaginationControls-pagination"] [class*="Button"]:first-child')?.click();
                }
            }
        });
    };

    const loadThumbnails = () => {
        document.querySelectorAll('[class*="Listing-image-item"] img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    };

    const addCustomStyles = () => {
        const css = `
      .ellipsis { white-space: normal !important; }
      [class*="Banner--fluid"],
      [class*="Listings__container--cas"],
      #adsense-container,
      #sustainability-visibility-tracker,
      #login-nudge-root {
        display: none !important;
      }
      .BiddingList-content div:first-child { white-space: normal !important; }
      /* Zoom mode */
      .oo .Gallery-dialogContent { padding: 0 !important; }
      .oo .Carousel-dialogCarousel { display: flex; overflow: visible; text-align: center; }
      .oo .Carousel-dialogContainer { display: block; width: 100%; height: 100%; overflow: auto; }
      .oo .Carousel-dialogContainer > img { z-index: 5; object-fit: none; user-select: none; }
      .oo .Carousel-navigationContainer { position: absolute; z-index: 5; margin: 0 50px; display: block; }
      .oo .Carousel-navigationContainer:first-child { left: 0; }
      .oo .Carousel-navigationContainer:last-child { right: 0; }
      .oo .Carousel-image { max-width: none !important; max-height: none !important; }
      .Carousel-dialogContainer img { cursor: zoom-in; user-select: none; pointer-events: auto; }
      .oo .Carousel-dialogContainer img { cursor: zoom-out; }
    `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    const observeImageZoom = () => {
        const attachZoomHandler = () => {
            const portal = document.querySelector('.ReactModalPortal');
            if (!portal || portal.dataset.zoomBound === '1') return;

            portal.dataset.zoomBound = '1'; // prevent rebinding
            portal.addEventListener('click', function(e) {
                if (e.target.classList.contains('Carousel-dialogImage')) {
                    portal.classList.toggle('oo');
                }
            });
        };

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    [...mutation.addedNodes].some(
                        node => node.nodeType === 1 && node.classList.contains('ReactModalPortal')
                    )
                ) {
                    attachZoomHandler();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial check (in case modal already exists)
        attachZoomHandler();
    };


    // Run on all content changes
    const contentObserver = new MutationObserver(() => {
        hideAds();
        enhanceLocationLink();
        loadThumbnails();
    });

    contentObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial run
    hideAds();
    enhanceLocationLink();
    loadThumbnails();
    setupKeyboardShortcuts();
    addCustomStyles();
    observeImageZoom();
})();
// ==UserScript==
// @name         Marktplaats; enkel de zoekresultaten
// @version      2.0.1
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

        const hideElements = ['Listing--other-seller', 'PopularSearchesBlock-root'];
        document.querySelectorAll(hideElements.map(p => `[class*="${p}"]`).join(', ')).forEach(el => el.style.display = 'none');
    };

    const enhanceLocationLink = () => {
        const locationName = document.querySelector(
            '[class*="SellerLocationSection-locationText"] [class*="SellerLocationSection-locationName"], [class*="SellerLocationSection-locationText"] .hz-Text--bodyLargeStrong'
        );
        if (!locationName || locationName.tagName === 'A') return;

        const text = locationName.textContent.trim();
        const a = document.createElement('a');
        a.href = `https://www.openstreetmap.org/search?query=${encodeURIComponent(text)}`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = locationName.className || '';
        a.textContent = text;

        locationName.replaceWith(a);
    };

    const enhanceLocationEmbed = () => {
        const mapContainer = document.querySelector('[class*="Map-root"]');
        if (!mapContainer) return;
        if (mapContainer.querySelector('iframe')) return;

        const locationName = document.querySelector(
            '[class*="SellerLocationSection-locationText"] [class*="SellerLocationSection-locationName"], [class*="SellerLocationSection-locationText"] .hz-Text--bodyLargeStrong'
        );
        const text = locationName.textContent.trim();

         embedOSMByName(text, '[class*="Map-root"]', { width: '400', height: '200' })
             .catch(err => console.error('embed failed:', err));
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
        enhanceLocationEmbed();
        loadThumbnails();
    });

    contentObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial run
    hideAds();
    enhanceLocationLink();
    enhanceLocationEmbed();
    loadThumbnails();
    setupKeyboardShortcuts();
    addCustomStyles();
    observeImageZoom();
})();

function embedOSMByName(name, containerSelector, opts) {
  opts = opts || {};
  var width = opts.width || '600';
  var height = opts.height || '450';
  var layer = encodeURIComponent(opts.layer || 'mapnik');
  var zoomFallback = opts.zoom || 12;

  var q = encodeURIComponent(name);
  var url = 'https://nominatim.openstreetmap.org/search?q=' + q + '&format=json&limit=1';

  return fetch(url, {
    headers: { 'Accept': 'application/json' /* Browsers set User-Agent; consider server-side proxy for heavy use */ }
  })
  .then(function(res) {
    if (!res.ok) throw new Error('Nominatim request failed: ' + res.status);
    return res.json();
  })
  .then(function(results) {
    if (!results || results.length === 0) throw new Error('Place not found: ' + name);
    var r = results[0];
    var lat = parseFloat(r.lat);
    var lon = parseFloat(r.lon);

    var bboxStr;
    if (r.boundingbox && r.boundingbox.length === 4) {
      // Nominatim boundingbox: [south, north, west, east]
      var south = parseFloat(r.boundingbox[0]);
      var north = parseFloat(r.boundingbox[1]);
      var west  = parseFloat(r.boundingbox[2]);
      var east  = parseFloat(r.boundingbox[3]);
      bboxStr = [west, south, east, north].map(encodeURIComponent).join('%2C');
    } else {
      var delta = 0.05 * Math.pow(2, (12 - zoomFallback));
      bboxStr = [lon - delta, lat - delta, lon + delta, lat + delta].map(encodeURIComponent).join('%2C');
    }

    var marker = encodeURIComponent(lat + ',' + lon);
    var embedUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bboxStr + '&layer=' + layer + '&marker=' + marker;

    var container = document.querySelector(containerSelector);
    if (!container) throw new Error('Container not found: ' + containerSelector);

    container.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.width = width;
    iframe.height = height;
    iframe.frameBorder = '0';
    iframe.style.border = '1px solid black';
    iframe.src = embedUrl;
    container.appendChild(iframe);

    return { iframe: iframe, embedUrl: embedUrl, nominatim: r };
  });
}
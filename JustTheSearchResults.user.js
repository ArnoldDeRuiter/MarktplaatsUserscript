// ==UserScript==
// @name           Marktplaats; enkel de zoekresultaten.
// @version        1.4
// @namespace      Marktplaats
// @description    * Verbergt bedrijf/webshop advertenties
// @description    * Verbergt betaalde advertenties
// @description    * Schoont pagina's op door verbergen van nutteloze onderdelen
// @description    * Voegt een link toe naar de locatie van de adverteerder
// @description    * Navigeer gemakkelijker doormiddel van sneltoetsen
// @description    * eBay style zoekveld focus op Home
// @description    * In-code mogelijkheid om gemakkelijk een blacklist samen te stellen
// @description    * Toont volledige gebruikersnamen in overzicht van biedingen
// @include        http://www.marktplaats.nl/z.html?*
// @include        http://www.marktplaats.nl/z/*.html?*
// @include        http://www.marktplaats.nl/*
// @include        https://www.marktplaats.nl/*
// @copyright      2021 Arnold de Ruiter
// @license        MIT License
// @require        https://code.jquery.com/jquery-3.5.1.slim.min.js
// @require        https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @grant          GM_addStyle
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements */
/* - The @grant directive is needed for GreaseMonkey users.
    A work around for a design change introduced in GM 1.0. It restores the sandbox.
*/

function alterHome () {
  // Toon altijd de zoek filters, niet pas wanneer je op het zoekveld zelf klikt
  $('.mp-SearchFieldset-advanced').css('max-height', 'unset')
}
waitForKeyElements('.u-stickyHeader', alterHome)

function preventLoginNudge () {
  $('#login-nudge-root').remove()
}
waitForKeyElements('#login-nudge-root', preventLoginNudge)

function alterElsewhere () {
  // Laat elders de checkbox "Zoek in titel en beschrijving" zien als optie.
  $('header.u-stickyHeader').attr('data-expanded', 'true')
  $('div.mp-Header.mp-text-paragraph.mp-cloak').addClass('mp-Header--expandSearchBar')
}
waitForKeyElements('header.u-stickyHeader div.mp-Header.mp-text-paragraph.mp-cloak', alterElsewhere)

function alterSearchResults () {
  // Verberg betaalde advertenties en bedrijven
  $('.mp-Listing--list-item').filter(':contains(Bezorgt in)').hide()
  $('.mp-Listing--list-item').filter(':contains(Topadvertentie)').hide()
  $('.mp-Listing--list-item').filter(':contains(Dagtopper)').hide()
  $('.mp-Listing--list-item').filter(':contains(Heel Nederland)').hide()
  $('.mp-Listing--list-item').filter(':contains(Bezoek website)').hide()

  // In plaats van gewoon "Nieuwe voorraad" te controleren en verbergen, verberg de verkoper hiermee op de huidige pagina
  const badSellersWithStock = $('.mp-Listing-Opvalsticker-wrapper').parents('.mp-Listing--list-item').find('.mp-Listing-seller-name')
  badSellersWithStock.each(function (i, el) {
    $('.mp-Listing--list-item').filter(':contains(' + el.textContent + ')').hide()
  })

  // In plaats van gewoon een advertentie met sub afbeeldingen te controleren en verbergen, verberg de verkoper hiermee op de huidige pagina
  const badSellersWithSubImages = $('.mp-Listing-sub-images').parents('.mp-Listing--list-item').find('.mp-Listing-seller-name')
  badSellersWithSubImages.each(function (i, el) {
    $('.mp-Listing--list-item').filter(':contains(' + el.textContent + ')').hide()
  })

  // Nutteloze "Deze adverteerder heeft meer advertenties" elementen verbergen
  $('.mp-Listing--other-seller').hide()

  // Adverteerders blokkeren
  $('.mp-Listing--list-item').filter(':contains(Example Name 123)').hide()

  // Clean up overview
  $('.mp-Listing .mp-Attribute--micro-tip').parent().append($('.mp-Listing .mp-Attribute--micro-tip'))
  $('.mp-Listing .mp-Attribute--micro-tip').addClass('mp-Attribute--default')
  $('.mp-Listing .mp-Attribute--micro-tip').removeClass('mp-Attribute--micro-tip')
  addGlobalStyle('.mp-Listing .mp-Attribute--micro-tip { padding: 0; background: none }')
  addGlobalStyle('.mp-Listing--list-item .mp-Listing-group--price-date-feature { max-width: 25% }')

  setUnsetListingThumbnails()
}
waitForKeyElements('.mp-Listing--list-item', alterSearchResults)

function setUnsetListingThumbnails () {
  $('.mp-Listing-image-item img').each(function () {
    $(this).attr('src', $(this).data('src'))
  })
}

function improveSellerAdPage () {
  // Maak locatie klikbaar, met OpenStreetMaps
  const osmUrl = 'https://www.openstreetmap.org/search?query=' + $('#vip-seller-location span.name').text()
  $('#vip-seller-location .heading span').replaceWith('<a target="_blank" href="' + osmUrl + '">' + $('#vip-seller-location span.name').text() + '</a>')

  // Vervang nutteloze 'Meer advertenties' scroll knop, met de daadwerkelijke directe link naar de advertenties va
  const sellerProfile = $('.top-info a').attr('href')
  $('#vip-seller-all-ads').append('<a href="' + sellerProfile + '">Bekijk alle advertenties</a>')
  $('.do_scroll').remove()
}
waitForKeyElements('#vip-seller-location .heading span', improveSellerAdPage)

function hideDetailCluter () {
  // Opschonen van pagina, waar een ad blocker ruimtes achterlaat.
  $('.cas-other-items').hide()
  $('.banner-viptop').hide()
}
waitForKeyElements('.cas-other-items', hideDetailCluter)

function hideResultCluter () {
  // Opschonen van pagina, waar een ad blocker ruimtes achterlaat.
  $('.mp-Banner').hide()
  $('.mp-Listings__admarktTitle').parent('div').hide()
  $('#adsense-container').hide()
}
waitForKeyElements('.mp-Listings__admarktTitle', hideResultCluter)

function buttonEvents () {
  // Functies binden aan toetsen; volgende, vorige, zoekveld focus.
  $('body').keyup(function (event) {
    // Naar de volgende pagina, met de rechter pijltoets
    if (event.which === 39) {
      $('.mp-PaginationControls-pagination .mp-Button').last()[0].click()
      // Naar de vorige pagina, met de linker pijltoets
    } else if (event.which === 37) {
      $('.mp-PaginationControls-pagination .mp-Button').first()[0].click()
    }
  })
}
waitForKeyElements('.mp-PaginationControls-pagination .mp-Button', buttonEvents)

function hideAds () {
  $('.mp-Listings--gallery-view').parent('.mp-Listings-bottomBlockGallery').hide()
}
waitForKeyElements('.mp-Listings--gallery-view', hideAds)

function addGlobalStyle (css) {
  let head, style
  head = document.getElementsByTagName('head')[0]
  if (!head) { return }
  style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = css
  head.appendChild(style)
}
addGlobalStyle('.ellipsis { white-space: normal; }')
addGlobalStyle('.mp-Banner.mp-Banner--fluid { display: none }')

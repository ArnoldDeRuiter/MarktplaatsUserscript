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

  // Nutteloze "Deze adverteerder heeft meer advertenties" elementen verbergen
  $('.mp-Listing--other-seller').hide()

  // Adverteerders blokkeren
  $('.mp-Listing--list-item').filter(':contains(Example Name 123)').hide()

  setUnsetListingThumbnails()
}
waitForKeyElements('.mp-Listing--list-item', alterSearchResults)

function setUnsetListingThumbnails () {
  $('.mp-Listing-image-item img').each(function () {
    $(this).attr('src', $(this).data('src'))
  })
}

function addMaps () {
// Maak locatie klikbaar, met OpenStreetMaps
  const osmUrl = 'https://www.openstreetmap.org/search?query=' + $('#vip-seller-location span.name').text()
  $('#vip-seller-location .heading span').replaceWith('<a target="_blank" href="' + osmUrl + '">' + $('#vip-seller-location span.name').text() + '</a>')
}
waitForKeyElements('#vip-seller-location .heading span', addMaps)

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

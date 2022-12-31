// ==UserScript==
// @name           Marktplaats; enkel de zoekresultaten.
// @version        1.5.0
// @namespace      Marktplaats
// @description    * Verbergt bedrijf/webshop advertenties
// @description    * Verbergt betaalde advertenties
// @description    * Schoont pagina's op door verbergen van nutteloze onderdelen
// @description    * Voegt een OSM link toe naar de locatie van de adverteerder
// @description    * Navigeer gemakkelijker doormiddel van sneltoetsen
// @description    * In-code mogelijkheid om gemakkelijk een blacklist samen te stellen
// @description    * Toont volledige gebruikersnamen in overzicht van biedingen
// @include        http://www.marktplaats.nl/z.html?*
// @include        http://www.marktplaats.nl/z/*.html?*
// @include        http://www.marktplaats.nl/*
// @include        https://www.marktplaats.nl/*
// @license        MIT License
// @require        https://code.jquery.com/jquery-3.6.2.slim.min.js
// @require        https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @grant          GM_addStyle
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements */
/* - The @grant directive is needed for GreaseMonkey users.
    A work around for a design change introduced in GM 1.0. It restores the sandbox.
*/
function alterSearchResults() {
  // Verberg betaalde advertenties en bedrijven
  $('[class*=Listing--list-item]').filter(':contains(Bezorgt in)').hide()
  $('[class*=Listing--list-item]').filter(':contains(Topadvertentie)').hide()
  $('[class*=Listing--list-item]').filter(':contains(Dagtopper)').hide()
  $('[class*=Listing--list-item]').filter(':contains(Heel Nederland)').hide()
  $('[class*=Listing--list-item]').filter(':contains(Bezoek website)').hide()

  // In plaats van "Nieuwe voorraad" te controleren en verbergen, verberg de verkoper hiermee op de huidige pagina
  const badSellersWithStock = $('[class*=Listing-Opvalsticker-wrapper]').parents('[class*=Listing--list-item]').find('[class*=Listing-seller-name]')
  badSellersWithStock.each(function (i, el) {
    $('[class*=Listing--list-item]').filter(':contains(' + el.textContent + ')').hide()
  })

  // In plaats van een advertentie met sub afbeeldingen te controleren en verbergen, verberg de verkoper hiermee op de huidige pagina
  const badSellersWithSubImages = $('[class*=Listing-sub-images]').parents('[class*=Listing--list-item]').find('[class*=Listing-seller-name]')
  badSellersWithSubImages.each(function (i, el) {
    $('[class*=Listing--list-item]').filter(':contains(' + el.textContent + ')').hide()
  })

  // Nutteloze "Deze adverteerder heeft meer advertenties" elementen verbergen
  $('[class*=Listing--other-seller]').hide()

  // Adverteerders blokkeren
  $('[class*=Listing--list-item]').filter(':contains(Example Name 123)').hide()

  setUnsetListingThumbnails()
}
waitForKeyElements('[class*=Listing--list-item]', alterSearchResults, false)

function setUnsetListingThumbnails() {
  $('[class*=Listing-image-item]').each(function () {
    $(this).find('img').attr('src', $(this).find('img').data('src'))
  })
}

function improveSellerAdPage() {
  // Maak locatie klikbaar, met OpenStreetMaps
  const locationSpan = $('[class*=SvgIconLocation]').parent().find('span')
  const osmUrl = 'https://www.openstreetmap.org/search?query=' + locationSpan.text()
  locationSpan.replaceWith('<a target="_blank" href="' + osmUrl + '">' + locationSpan.text() + '</a>')
}
waitForKeyElements('[class*=SvgIconLocation]', improveSellerAdPage)

function buttonEvents() {
  // Functies binden aan toetsen; volgende, vorige, zoekveld focus.
  $('body').keyup(function (event) {
    // Naar de volgende pagina, met de rechter pijltoets
    if (event.which === 39) {
      $('[class*=PaginationControls-pagination]').find('[class*=Button]').last()[0].click()
      // Naar de vorige pagina, met de linker pijltoets
    } else if (event.which === 37) {
      $('[class*=PaginationControls-pagination]').find('[class*=Button]').first()[0].click()
    }
  })
}
waitForKeyElements('[class*=PaginationControls-pagination]', buttonEvents)

function addGlobalStyle(css) {
  const head = document.getElementsByTagName('head')[0]
  if (!head) {
    return
  }
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = css
  head.appendChild(style)
}
addGlobalStyle('.ellipsis { white-space: normal; }')
addGlobalStyle('[class*="Banner--fluid"]{ display: none }')
addGlobalStyle('[class*="Listings__container--cas"]{ display: none }')
addGlobalStyle('#adsense-container{ display: none }')
addGlobalStyle('#sustainability-visibility-tracker{ display: none }')
addGlobalStyle('#login-nudge-root{ display: none }')
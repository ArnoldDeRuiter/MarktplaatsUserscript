// ==UserScript==
// @name           Marktplaats; enkel de zoekresultaten.
// @version        1.0
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
// @copyright      2019 Arnold de Ruiter (Arndroid)
// @license        MIT License
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements */
/*- The @grant directive is needed for GreaseMonkey users.
    A work around for a design change introduced in GM 1.0. It restores the sandbox.
*/

function alterHome() {
    // Laat op Home de checkbox "Zoek in titel en beschrijving" zien als optie.
    $("mp-header.x-scope.mp-header-0.u-stickyHeader").addClass("expandSearchBar mp-Header--expandSearchBar");

    // Automatische focus op de zoekblak, zoals eBay dit heeft
    $('.mp-SearchForm-query #input').focus();
}
waitForKeyElements("mp-header.x-scope.mp-header-0.u-stickyHeader", alterHome);

function preventLoginNudge() {
    localStorage.SeenLoginGate = true;
    var dt = new Date();
    date = dt.getDate();
    dt.setMonth(dt.getMonth() + 1, 1);
    dt.setHours(dt.getHours() -1, 1);
    var date = dt.getFullYear() + "-" + dt.getMonth() + "-" + date + "T";
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + "." + dt.getMilliseconds() + "Z";
    localStorage.MpLoginNudgeDismissDate = '["'+date+time+'"]';
}
if (localStorage.getItem("SeenLoginGate") === null) {
    preventLoginNudge();
}

function alterElsewhere() {
    // Laat elders de checkbox "Zoek in titel en beschrijving" zien als optie.
    $('header.u-stickyHeader').attr("data-expanded","true");
    $("div.mp-Header.mp-text-paragraph.mp-cloak").addClass("mp-Header--expandSearchBar");
}
waitForKeyElements("header.u-stickyHeader div.mp-Header.mp-text-paragraph.mp-cloak", alterElsewhere);

function alterSearchResults() {
    // Verberg betaalde advertenties en bedrijven
    $('.mp-Listing--list-item').filter(":contains(Bezorgt in)").hide();
    $('.mp-Listing--list-item').filter(":contains(Topadvertentie)").hide();
    $('.mp-Listing--list-item').filter(":contains(Dagtopper)").hide();
    $('.mp-Listing--list-item').filter(":contains(Heel Nederland)").hide();
    $('.mp-Listing--list-item').filter(":contains(Bezoek website)").hide();

    // Nutteloze "Deze adverteerder heeft meer advertenties" elementen verbergen
    $(".mp-Listing--other-seller").hide();

    // Adverteerders blokkeren
    $('.mp-Listing--list-item').filter(":contains(Example Name 123)").hide();

    // Geef het zoekveld voorrang op functie toetsen hierna
    $('.mp-SearchForm-query #input').on('keyup', function (e) {
        if (e.keyCode == 13) {
            $("button.mp-SearchForm-search").click();
        }
    });

    // Functies binden aan toetsen; volgende, vorige, zoekveld focus.
    $("body").keyup(function(event) {
        // Negeer wanneer er een veld in gebruik is
        if ($(event.target).is('input, textarea')) {
            return;
        }

        // Naar de volgende pagina, met de rechter pijltoets
        if (event.which == '39') {
            $('a.mp-Button--round .mp-svg-arrow-right-white').click();

        // Naar de vorige pagina, met de linker pijltoets
        } else if (event.which == '37') {
            $('a.mp-Button--round .mp-svg-arrow-left-white').click();

        // Focus en selecteer direct het zoekveld door op '\' te drukken (want '/' is in gebruik door Firefox)
        } else if (event.which == '220' ) {
            $('.mp-SearchForm-query #input').select();
        }
    });
}
waitForKeyElements(".mp-Listing--list-item", alterSearchResults);

function addMaps() {
    // Maak locatie klikbaar, met OpenStreetMaps
    var osmUrl = "https://www.openstreetmap.org/search?query="+$("#vip-seller-location span.name").text();
    $("#vip-seller-location .heading span").replaceWith('<a target="_blank" href="'+osmUrl+'">'+$("#vip-seller-location span.name").text()+'</a>');
}
waitForKeyElements("#vip-seller-location .heading span", addMaps);

function hideDetailCluter() {
    // Opschonen van pagina, waar een ad blocker ruimtes achterlaat.
    $(".cas-other-items").hide();
    $(".banner-viptop").hide();
}
waitForKeyElements(".cas-other-items", hideDetailCluter);

function hideResultCluter() {
    // Opschonen van pagina, waar een ad blocker ruimtes achterlaat.
    $(".mp-Banner").hide();
    $(".mp-Listings__admarktTitle").hide()
}
waitForKeyElements(".mp-Banner", hideResultCluter);

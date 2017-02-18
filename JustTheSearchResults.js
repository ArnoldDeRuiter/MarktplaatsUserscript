// ==UserScript==
// @name           Just the search results
// @version        0.3
// @namespace      Marktplaats
// @description    * Removes commercial ads 
// @description    * Removes a lot of clutter ads, and ads in between the results
// @description    * Removes paid ads from users
// @description    * Removes companies/webstores which place ads
// @description    * Quick scroll through result pages by pressing the left and right arrow keys
// @description    * Auto focus on searchbar
// @description    * Quick focus on searchbar by pressing the "/" key
// @description    * Contains in-code, easy to modify, seller blacklist functionality
// @include        http://www.marktplaats.nl/z.html?*
// @include        http://www.marktplaats.nl/z/*.html?*
// @include        http://www.marktplaats.nl/*
// @include        https://www.marktplaats.nl/*
// @copyright      2017 Arnold de Ruiter (Arndroid)
// @license        MIT License
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

//Remove paid ads and companies
$('article.search-result').filter(":contains(Bezorgt in)").hide();
$('article.search-result').filter(":contains(Topadvertentie)").hide();
$('article.search-result').filter(":contains(Dagtopper)").hide();
$('article.search-result').filter(":contains(Heel Nederland)").hide();
$('article.search-result').filter(":contains(Bezoek website)").hide();

//Seller blacklist:
$('article.search-result').filter(":contains(Example Name 123)").hide();

//Removing the "Meer advertenties van deze verkoper" clutter/ad bar in the search results:
$('.listing-extension').hide();

//Thumbs system filter:
$('article.search-result .icon-thumb-up').closest('.search-result').hide();
$('article.search-result .icon-thumb-down').closest('.search-result').hide();

//Add auto focus on searchbar, like on Ebay
$('input#query').focus();

//Remove ads on Marktplaats Home:
$('div.aanbieding-widget-container').hide();

//Uncluttering Marktplaats:
$("#footer").hide();
$(".bottom-listing").hide();
$("#adsenceContainer").hide();
$("#adsenceContainerTop").hide();
$("#bottom-listings-divider").hide();

//Arrow key binding, to easily scroll through the results & quick focus the searchbar with the slash "/" key.
$("body").keyup(function(event) {
    // leave the keys alone while typing text
    if ($(event.target).is('input, textarea'))
        return;

    // next page with results
    if (event.which == '39') {
        var href = $('a.pagination-next').attr('href');
        if (href!=null) window.location.href = href;
        
    // previous page
    } else if (event.which == '37') {
        var href = $('a.pagination-previous').attr('href');
        if (href != null) window.location.href = href;
        
    // type '/' to go to the search field
    } else if (event.which == '191' ) {
      $("#input").focus();
    }
});

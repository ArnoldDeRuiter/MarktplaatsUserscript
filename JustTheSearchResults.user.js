// ==UserScript==
// @name           Just the search results
// @version        0.6
// @namespace      Marktplaats
// @description    * Removes commercial ads
// @description    * Removes a lot of clutter ads, and ads in between the results
// @description    * Removes paid ads from users
// @description    * Removes companies/webstores which place ads
// @description    * Quick scroll through result pages by pressing the left and right arrow keys
// @description    * Auto focus on searchbar
// @description    * Quick focus on searchbar by pressing the "/" key
// @description    * Contains in-code, easy to modify, seller blacklist functionality
// @description    * Replacing the indirect clickable "Bekijk meer advertenties" functionality, that scrolls you down to the "Bekijk alle advertenties" with directly going to that actual page. (Like it used to be)
// @include        http://www.marktplaats.nl/z.html?*
// @include        http://www.marktplaats.nl/z/*.html?*
// @include        http://www.marktplaats.nl/*
// @include        https://www.marktplaats.nl/*
// @copyright      2017 Arnold de Ruiter (Arndroid)
// @license        MIT License
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
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

//Uncluttering Marktplaats:
$("#footer").hide();
$(".bottom-listing").hide();
$("#adsenceContainer").hide();
$("#adsenceContainerTop").hide();
$("#bottom-listings-divider").hide();
$("#banner-viptop").hide();
$("#banner-top").hide(); // Waisted space at top of results
$("#banner-bottom").hide(); // Waisted space at bottom of results
$("#top-banner-wrapper").hide(); // Waisted space at top of category page
$(".premium-content").hide(); // Blue boxes on ad page
$(".mp-Listing-banner").hide(); // Messages from MP within search results

//Remove ads on Marktplaats Home:
$(".main-banners").hide(); //cleaner code, seems to work fine.
$("#stage").hide();

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

// Re-enable the "Bekijk alle advertenties" functionality, this time with cleaner code.
$("#vip-header-soi-juiceless-link").text("Bekijk alle advertenties");
$("#vip-header-soi-juiceless-link").removeClass("do_scroll"); //to avoid the default event
$( "#vip-header-soi-juiceless-link" ).on("click", function(){
    $("#vip-left-soi-link a").trigger("click");
});

//Marktplaats blocks thumbnails when this script is used, or it is a freak bug... but here is a solution:
$('.listing-image img').each(function() {
    $(this).attr("src", $(this).data("img-src"));
});

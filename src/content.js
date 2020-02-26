import $ from 'jquery';
import Utils from './Components/Utils';

console.log("Ready");
console.log("Netflix Ratings Tab Loaded.");
console.log(Utils.getPlatform());


let runtime = Utils.getAPI().runtime;

console.log(runtime.getURL("/test"));

// showRatingsTab()
//
// Scrape info from imdb and rotten tomatos to put in the ratings tab
//
let showRatingsTab = (parentContainerClass) => {

    console.log("showing ratings tab test");
    

    $(parentContainerClass + ' #pane-Ratings').html(`<div style="padding-top:2em;">
        <div style="position:absolute; top: 30%; left: 60px;">
            <div>
                <a href="" class="imdb_link" target="_blank" >
                    <span class="imdb-score" style="color:#46D369;font-weight:bold;font-size: 2.5em;"></span>
                    <span class="imdb_logo" style="margin-left: 1em;"></span>
                </a>
            </div>
            <div style="margin-top: 12px;">
                <a href="" class="tomato_link" target="_blank">
                    <span class="tomato-score" style="color:#46D369;font-weight:bold;font-size: 2.5em;"></span>
                    <span class="tomato-logo" style="margin-left: 1em;"></span>
                </a>
            </div>
        </div>
        <div style="position:absolute;top:6%;left: 30%; bottom: 12%; right: 12px; max-width: 750px; overflow:auto;font-size:1.6em;" class="reviews">
            <div class="reviews-loading" style="display:flex; justify-content:center;align-items:center;margin: 200px;">
                <img src="` + runtime.getURL('images/loading.svg') + `" style="width:50px;height:50px;" />
            </div>
            <div class="reviews-inner" style="max-width: 700px;">
                <h1>IMDB Reviews</h1>
            </div>
        </div>
    </div>`);

    let title = $( parentContainerClass + ' .logo').attr('alt');

    //console.log("test");
    
    Utils.sendMessage({
        action : "fetch", 
        type : "text",
        url : "https://www.imdb.com/find?q=" + title.replace(/ /g, '+')
    }).then((result) => {

       // console.log("got response");
       // console.log(result);

        let body = $(result);
        let results = body.find('.result_text a');

        // If a result was found let's go ahead and fetch it
        if(results[0]) {
            let href = $(results[0]).attr('href');
            href = href.substring(0, href.indexOf('?'));
           // console.log(href);

            // Fetch the imdb rating
            Utils.sendMessage({
                action : "fetch", 
                type : "text",
                url : "https://www.imdb.com" + href
            }).then((p) => {

                let page = $(p);

                let rating = page.find('.ratingValue').text();

                // Append the rating and the logo
                $(parentContainerClass + ' #pane-Ratings').find('.imdb-score').text(rating);
                $(parentContainerClass + ' #pane-Ratings').find('.imdb_logo').append(
                    $('<img src="'+runtime.getURL('images/imdb.svg')+'" width="32" height="16" />')
                );

                // Set the imdb link
                $(parentContainerClass + ' #pane-Ratings').find('.imdb_link').attr('href', "https://www.imdb.com" + href);


           });


           // Fetch the imdb reviews
           
           Utils.sendMessage({
                action : "fetch", 
                type : "text",
                url : "https://www.imdb.com" + href + "reviews"
            }).then((p) => {

                let page = $(p);

                let parent = $(parentContainerClass + ' #pane-Ratings').find('.reviews-inner');

                let reviews = page.find('.review-container');

                // loop thru each review and add it
                reviews.each((i,review) => {

                    var r = $(review);

                    var rev = $('<div style="padding-bottom: 30px; border-bottom: 1px solid #666;margin-bottom: 30px;"/>')
                        .append('<h2 style="color:#fff;margin-bottom:0px;">' + r.find('.title').text() + '</h2>' );

                    if(r.find('.ipl-ratings-bar').html()) {
                        rev.append('<div style="margin-bottom: 10px;color: #fff;">' + r.find('.ipl-ratings-bar').html() + '</div>' );
                    }

                    rev
                        .append('<small style="color: #ddd;">' + r.find('.display-name-date').text() + '</small>' )
                        .append('<div style="margin-top:6px;color: #999;">' + r.find('.text').html() + '</div>' );

                    parent.append(rev);

                });

                // Hide the reviews-loading spinner
                $(parentContainerClass + ' #pane-Ratings').find('.reviews-loading').css('display','none');

            });

        }



    });


    // Query Rotten Tomatos for ratings
    Utils.sendMessage({
        action : "fetch", 
        type : "json",
        url : "https://www.rottentomatoes.com/napi/search/?offset=0&query=" + title.replace(/ /g, '+')
    }).then((result) => {


        // Determine the show's content type (tv or movie) - needed for scraping
        let contentType = "movie";
        if($(parentContainerClass + ' ul.menu .Episodes')[0] ) {
            contentType = "tv";
        }
        console.log(contentType);


        //console.log(result);
        // let body = $(result);
        // let results = {};

        let item = {};
        
        // Just grab the first result of movie or tvseries
        if(contentType == 'tv' && result.tvSeries) {
            item = result.tvSeries[0];
        }
        else if(contentType == 'movie' && result.movies) {
            item = result.movies[0];
        }

        if(item && item.meterScore) {
            //console.log(item);
            // append meterscore
            $(parentContainerClass + ' #pane-Ratings').find('.tomato-score').text(item.meterScore + "%");

            // append logo
            let meterImg = $('<img/>').css({width: 16, height: 16});

            if(item.meterClass=="fresh") {
                meterImg.attr('src',runtime.getURL('images/tomato_fresh.svg')); // fresh
                meterImg.attr('title', 'Fresh');
            }
            else if(item.meterClass=="rotten") {
                meterImg.attr('src',runtime.getURL('images/tomato_rotten.svg'));
                meterImg.attr('title', 'Rotten');
            }
            else if(item.meterClass=="certified_fresh") {
                meterImg.attr('src',runtime.getURL('images/tomato_certified_fresh.svg'));
                meterImg.attr('title', 'Certified Fresh');
            }
            

            $(parentContainerClass + ' #pane-Ratings').find('.tomato-logo').append(meterImg);

            // Set the imdb link
            $(parentContainerClass + ' #pane-Ratings').find('.tomato_link').attr('href', "https://www.rottentomatoes.com" + item.url);

        }

    }); // end rottentomatoes fetch


} // end ratings tab modifiers



// showOverviewTabExtras()
//
// Show the imdb and rotten tomatoes ratings on the overview tab
//
let showOverviewTabExtras = (parentContainerClass) => {
   

    let title = $( parentContainerClass + ' .logo').attr('alt');
    //console.log("show overview tab extras. " + parentContainerClass);


    // insert a new video-meta <span> after the one that already exists, to put our content
    let videoMeta = $('<span class="meta video-meta metaflix-video-meta" style="margin-top: 1em;"></span>');
    $(parentContainerClass + ' #pane-Overview .video-meta').after(videoMeta);

    

    Utils.sendMessage({
        action : "fetch", 
        type : "text",
        url : "https://www.imdb.com/find?q=" + title.replace(/ /g, '+')
    }).then((result) => {

        let body = $(result);
        let results = body.find('.result_text a');

        // If a result was found let's go ahead and fetch it
        if(results[0]) {
            let href = $(results[0]).attr('href');
            href = href.substring(0, href.indexOf('?'));
           // console.log(href);


            // Fetch the imdb rating
            Utils.sendMessage({
                action : "fetch", 
                type : "text",
                url : "https://www.imdb.com" + href
            }).then((p) => {

                let page = $(p);

                let rating = page.find('.ratingValue').text();

                $(parentContainerClass + ' #pane-Overview .metaflix-video-meta').append('<span>'+rating+'</span>');

                $(parentContainerClass + ' #pane-Overview .metaflix-video-meta').append(
                    $('<img src="'+runtime.getURL('images/imdb.svg')+'" width="30" height="14" style="margin-right:12px;" />')
                );


           });

        }
    }); // end imdb fetch


    // Query Rotten Tomatos for ratings
    Utils.sendMessage({
        action : "fetch", 
        type : "json",
        url : "https://www.rottentomatoes.com/napi/search/?offset=0&query=" + title.replace(/ /g, '+')
    }).then((result) => {

        // Determine the show's content type (tv or movie) - needed for scraping
        let contentType = "movie";
        if($(parentContainerClass + ' ul.menu .Episodes')[0] ) {
            contentType = "tv";
        }

        let item = {};
        
        // Just grab the first result of movie or tvseries
        if(contentType == 'tv' && result.tvSeries) {
            item = result.tvSeries[0];
        }
        else if(contentType == 'movie' && result.movies) {
            item = result.movies[0];
        }

        if(item && item.meterScore) {
            //console.log(item);
            // append meterscore
           
            $(parentContainerClass + ' #pane-Overview .metaflix-video-meta').append('<span>'+ item.meterScore + "%</span>");

            // append logo
            let meterImg = $('<img/>').css({width: 14, height: 14, marginRight: 12});

            if(item.meterClass=="fresh") {
                meterImg.attr('src',runtime.getURL('images/tomato_fresh.svg')); // fresh
                meterImg.attr('title', 'Fresh');
            }
            else if(item.meterClass=="rotten") {
                meterImg.attr('src',runtime.getURL('images/tomato_rotten.svg'));
                meterImg.attr('title', 'Rotten');
            }
            else if(item.meterClass=="certified_fresh") {
                meterImg.attr('src',runtime.getURL('images/tomato_certified_fresh.svg'));
                meterImg.attr('title', 'Certified Fresh');
            }

            $(parentContainerClass + ' #pane-Overview .metaflix-video-meta').append(meterImg);

        }

    }); // end rottentomatoes fetch

} // end overview tab modifiers

// createRatingsTab()
//
// Function to create the tab that displays ratings
//
let initMoreInfo = (parentContainerClass) => {
   
    // If the container does not exist, go ahead and stop
    if($(parentContainerClass).length == 0) {
        return;
    }

    // Mark the existing menu list elements as default so we can differentiate them from the ones we're about to add
    $(parentContainerClass + ' ul.menu li').addClass("defaultBtn");

    // Create our "Ratings & Reviews" tab
    let menuItem = $('<li class="ratingsBtn"><a role="link" tabindex="0">RATINGS & REVIEWS</a><span></span></li>');
    $(parentContainerClass + ' ul.menu').append(menuItem);



    // Any Other Default Tab was clicked
    $(parentContainerClass + ' ul.menu .defaultBtn').on('click', (el) => {

        // remove the ratings pane if it exists
        $(parentContainerClass + ' #pane-Ratings').remove();

        // Restore the details pane if it was hidden
        $(parentContainerClass + ' #pane-ShowDetails').css({display:'block'});
        $(parentContainerClass + ' .ratingsBtn').removeClass('current');


        // The Overview Tab was clicked lets modify it
        if($(el.target).text() == "OVERVIEW") {
            //console.log("overview clicked");
            setTimeout(()=>{
                showOverviewTabExtras(parentContainerClass);
            }, 400);
           
        }
    });


    // Our "Ratings & Reviews" tab was clicked
    $(parentContainerClass + ' ul.menu .ratingsBtn').on('click', (e) => {

        // Click on the details pane tab to force the jawbonepane into the "paused" state
        $(parentContainerClass + ' .ShowDetails a')[0].click();
         // Hide details pane content
        $(parentContainerClass + ' #pane-ShowDetails').css({display:'none'});
        // Append our custom pane
        $(parentContainerClass + ' .jawBone').append('<div id="pane-Ratings" class="jawBonePane" style="opacity:1"></div>');
        // highlighte the ratings button
        $(parentContainerClass + ' ul.menu li').removeClass('current');
        $(parentContainerClass + ' .ratingsBtn').addClass('current');
        // Populate the ratings tab with content
        showRatingsTab(parentContainerClass);
        //  console.log("ratings button clicked");
        // console.log('item clicked');
    });

    // Since the Overview tab is open by default, the first thing we need to always do is modify it
    showOverviewTabExtras(parentContainerClass);
                  
}




// Entry Points //
// When certain actions occur or things are performed by the user,
// we use our functions to add in our ratings tab.

// Add Tab for the header container if one exists
$('.jawBoneContainer').addClass('jawBoneHeaderContainer');
initMoreInfo('.jawBoneHeaderContainer');

// When a container is clicked and expanded for more info, add a ratings tab there as well
$('body').on('click', (e) => {
    if(e.target && (e.target.className.indexOf("bob-jaw") != -1 || e.target.className.indexOf("boxart") != -1 ) ) {
            setTimeout(() => {
                initMoreInfo('.jawBoneOpenContainer');
        }, 10);
    }
});
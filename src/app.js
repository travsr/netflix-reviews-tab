

// console.log(jQuery('a.slider-refocus'));

// jQuery('a.slider-refocus').each((i, obj) => {

//     console.log( jQuery(obj).attr('aria-label')  )
// })
// console.log(fetch);
// fetch("https://netflix.com").then(resp => resp.text()).then((text) => {
//     console.log(text);
// });


// Hook into click events on the main body element and then do our stuff

    MetaStream.log("Ready");
    MetaStream.log("MetaStream Extension Loaded.");


    // showRatingsTab()
    //
    // Scrape info from imdb and rotten tomatos to put in the ratings tab
    //
    let showRatingsTab = (parentContainerClass) => {

        jQuery(parentContainerClass + ' #pane-Ratings').html('<div style="padding-top:2em;">\
            <div>\
                <span class="imdb-score" style="color:#46D369;font-weight:bold;font-size: 2.5em;"></span>\
                <span class="imdb_logo" style="margin-left: 1em;"></span>\
            </div>\
            <div style="margin-top: 10px;">\
                <span class="tomato-score" style="color:#46D369;font-weight:bold;font-size: 2.5em;"></span>\
                <span class="tomato-logo" style="margin-left: 1em;"></span>\
            </div>\
            <div style="position:absolute;top:0;right:12px;padding-right: 12px;max-height:300px;width:70%;overflow:auto;font-size:1.6em;" class="reviews"></div>\
        </div>');

        let title = jQuery( parentContainerClass + ' .logo').attr('alt');

        // Query IMDB for ratings info by using their search
        fetch("https://www.imdb.com/find?q=" + title.replace(/ /g, '+')).then(resp => resp.text()).then((result) => {

            let body = jQuery(result);
            let results = body.find('.result_text a');

            // If a result was found let's go ahead and fetch it
            if(results[0]) {
                let href = jQuery(results[0]).attr('href');
                href = href.substring(0, href.indexOf('?'));
               // console.log(href);


                // Fetch the imdb rating
               fetch("https://www.imdb.com" + href).then(resp => resp.text()).then((p) => {

                    let page = jQuery(p);

                    let rating = page.find('.ratingValue').text();
                    let logo = page.find('#home_img');
                    logo.attr('width',32);
                    logo.attr('height', 16);

                    jQuery(parentContainerClass + ' #pane-Ratings').find('.imdb-score').text(rating);
                    jQuery(parentContainerClass + ' #pane-Ratings').find('.imdb_logo').append(logo);


               });


               // Fetch the imdb reviews
               fetch("https://www.imdb.com" + href + "reviews").then(resp => resp.text()).then((p) => {

                    let page = jQuery(p);

                    let parent = jQuery(parentContainerClass + ' #pane-Ratings').find('.reviews');

                    let reviews = page.find('.review-container');

                    // loop thru each review and add it
                    reviews.each((i,review) => {

                        var r = jQuery(review);

                        var rev = jQuery('<div style="padding-bottom: 30px; border-bottom: 1px solid #666;margin-bottom: 30px;"/>')
                            .append('<h2 style="color:#fff;margin-bottom:0px;">' + r.find('.title').text() + '</h2>' );

                        if(r.find('.ipl-ratings-bar').html()) {
                            rev.append('<div style="margin-bottom: 10px;color: #fff;">' + r.find('.ipl-ratings-bar').html() + '</div>' );
                        }

                        rev
                            .append('<small style="color: #ddd;">' + r.find('.display-name-date').text() + '</small>' )
                            .append('<div style="margin-top:6px;">' + r.find('.text').html() + '</div>' );

                        parent.append(rev);

                    });
                });

            }
        }); // end imdb fetch


        // Query Rotten Tomatos for ratings
        fetch("https://www.rottentomatoes.com/napi/search/?offset=0&query=" + title.replace(/ /g, '+')).then(resp => resp.json()).then((result) => {


            // Determine the show's content type (tv or movie) - needed for scraping
            let contentType = "movie";
            if(jQuery(parentContainerClass + ' ul.menu .Episodes')[0] ) {
                contentType = "tv";
            }
            console.log(contentType);
    

            //console.log(result);
            // let body = jQuery(result);
            // let results = {};

            let item = {};
            
            // Just grab the first result of movie or tvseries
            if(contentType == 'tv' && result.tvSeries) {
                item = result.tvSeries[0];
            }
            else if(contentType == 'movie' && result.movies) {
                item = result.movies[0];
            }

            if(item) {
                console.log(item);
                // append meterscore
                jQuery(parentContainerClass + ' #pane-Ratings').find('.tomato-score').text(item.meterScore + "%");

                // append logo
                let meterImg = jQuery('<img/>').css({width: 16, height: 16});

                if(item.meterClass=="fresh") {
                    meterImg.attr('src','https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-fresh.149b5e8adc3.svg'); // fresh
                    meterImg.attr('title', 'Fresh');
                }
                else if(item.meterClass=="rotten") {
                    meterImg.attr('src',' https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-rotten.f1ef4f02ce3.svg');
                    meterImg.attr('title', 'Rotten');
                }
                else if(item.meterClass=="certified_fresh") {
                    meterImg.attr('src','https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/certified_fresh.75211285dbb.svg');
                    meterImg.attr('title', 'Certified Fresh');
                }
                

                jQuery(parentContainerClass + ' #pane-Ratings').find('.tomato-logo').append(meterImg);

            }

        }); // end rottentomatoes fetch


    } // end ratings tab modifiers



    // showOverviewTabExtras()
    //
    // Show the imdb and rotten tomatoes ratings on the overview tab
    //
    let showOverviewTabExtras = (parentContainerClass) => {
       

        let title = jQuery( parentContainerClass + ' .logo').attr('alt');
        console.log("show overview tab extras. " + parentContainerClass);


        // insert a new video-meta <span> after the one that already exists, to put our content
        let videoMeta = jQuery('<span class="meta video-meta metaflix-video-meta" style="margin-top: 1em;"></span>');
        jQuery(parentContainerClass + ' #pane-Overview .video-meta').after(videoMeta);
   
        



        // Query IMDB for ratings info by using their search
        fetch("https://www.imdb.com/find?q=" + title.replace(/ /g, '+')).then(resp => resp.text()).then((result) => {

            let body = jQuery(result);
            let results = body.find('.result_text a');

            // If a result was found let's go ahead and fetch it
            if(results[0]) {
                let href = jQuery(results[0]).attr('href');
                href = href.substring(0, href.indexOf('?'));
               // console.log(href);


                // Fetch the imdb rating
               fetch("https://www.imdb.com" + href).then(resp => resp.text()).then((p) => {

                    let page = jQuery(p);

                    let rating = page.find('.ratingValue').text();
                    let logo = page.find('#home_img');
                    logo.attr('width',30);
                    logo.attr('height', 14);
                    logo.css('margin-right', '12px');

                    jQuery(parentContainerClass + ' #pane-Overview .metaflix-video-meta').append('<span>'+rating+'</span>');
                    jQuery(parentContainerClass + ' #pane-Overview .metaflix-video-meta').append(logo);


               });

            }
        }); // end imdb fetch


        // Query Rotten Tomatos for ratings
        fetch("https://www.rottentomatoes.com/napi/search/?offset=0&query=" + title.replace(/ /g, '+')).then(resp => resp.json()).then((result) => {


            // Determine the show's content type (tv or movie) - needed for scraping
            let contentType = "movie";
            if(jQuery(parentContainerClass + ' ul.menu .Episodes')[0] ) {
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

            if(item) {
                console.log(item);
                // append meterscore
                jQuery(parentContainerClass + ' #pane-Overview .metaflix-video-meta').append('<span>'+ item.meterScore + "%</span>");

                // append logo
                let meterImg = jQuery('<img/>').css({width: 14, height: 14, marginRight: 12});

                if(item.meterClass=="fresh") {
                    meterImg.attr('src','https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-fresh.149b5e8adc3.svg'); // fresh
                    meterImg.attr('title', 'Fresh');
                }
                else if(item.meterClass=="rotten") {
                    meterImg.attr('src',' https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-rotten.f1ef4f02ce3.svg');
                    meterImg.attr('title', 'Rotten');
                }
                else if(item.meterClass=="certified_fresh") {
                    meterImg.attr('src','https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/certified_fresh.75211285dbb.svg');
                    meterImg.attr('title', 'Certified Fresh');
                }

                jQuery(parentContainerClass + ' #pane-Overview .metaflix-video-meta').append(meterImg);

            }

        }); // end rottentomatoes fetch

    } // end overview tab modifiers

    // createRatingsTab()
    //
    // Function to create the tab that displays ratings
    //
    let initMoreInfo = (parentContainerClass) => {

        // Mark the existing menu list elements as default so we can differentiate them from the ones we're about to add
        jQuery(parentContainerClass + ' ul.menu li').addClass("defaultBtn");

        // Create our "Ratings & Reviews" tab
        let menuItem = jQuery('<li class="ratingsBtn"><a role="link" tabindex="0">RATINGS & REVIEWS</a><span></span></li>');
        jQuery(parentContainerClass + ' ul.menu').append(menuItem);

        // Any Other Default Tab was clicked
        jQuery(parentContainerClass + ' ul.menu .defaultBtn').on('click', (el) => {
            //console.log(el.target);
            // remove the ratings pane if it exists
            jQuery(parentContainerClass + ' #pane-Ratings').remove();
            // Restore the details pane if it was hidden
            jQuery(parentContainerClass + ' #pane-ShowDetails').css({display:'block'});
            jQuery(parentContainerClass + ' .ratingsBtn').removeClass('current');


            // The Overview Tab was clicked lets modify it
            if(jQuery(el.target).text() == "OVERVIEW") {
                console.log("overview clicked");
                setTimeout(()=>{
                    showOverviewTabExtras(parentContainerClass);
                }, 400);
               
            }
        });


        // Our "Ratings & Reviews" tab was clicked
        jQuery(parentContainerClass + ' ul.menu .ratingsBtn').on('click', (e) => {
 
            // Click on the details pane tab to force the jawbonepane into the "paused" state
            jQuery(parentContainerClass + ' .ShowDetails a')[0].click();
             // Hide details pane content
            jQuery(parentContainerClass + ' #pane-ShowDetails').css({display:'none'});
            // Append our custom pane
            jQuery(parentContainerClass + ' .jawBonePanes').append('<div id="pane-Ratings" class="jawBonePane" style="opacity:1"></div>');
            // highlighte the ratings button
            jQuery(parentContainerClass + ' ul.menu li').removeClass('current');
            jQuery(parentContainerClass + ' .ratingsBtn').addClass('current');
            // Populate the ratings tab with content
            showRatingsTab(parentContainerClass);
          //  console.log("ratings button clicked");
            // console.log('item clicked');
        });


        // Since the Overview tab is open by default, the first thing we need to always do is modify it
        showOverviewTabExtras(parentContainerClass);
                      
    }





    // Add Tab for header container if one exists
    jQuery('.jawBoneContainer').addClass('jawBoneHeaderContainer');
    initMoreInfo('.jawBoneHeaderContainer');

    // When a container is clicked and expanded for more info, add a ratings tab there as well
    jQuery('body').on('click', (e) => {
        if(e.target && (e.target.className.indexOf("bob-jaw") != -1 || e.target.className.indexOf("boxart") != -1 ) ) {

    
                setTimeout(() => {
                    initMoreInfo('.jawBoneOpenContainer');
            }, 10);
            
        }
    });
    console.log("event added");







var sliderApplet;

jQuery(document).ready(function($){

    if(window.location.href.includes("product/social-signals")) {


        class SocialSliderApplet
        {

            constructor()
            {
                this.totalSignals = 0;
                this.urlSet = [];
                this.physicalSlider = new PhysicalSlider(this);
                this.physicalSlider.loadStepList(); //Load the step list.
                console.log("Slider applet can be loaded");
            }


            getSignalsForOrder()
            {
                return parseInt(this.totalSignals);
            }


            getSlider()
            {
                return this.physicalSlider;
            }


            /**
             * Whether div is usable
             * @param jqueryDiv - div to target
             * @param disable - to disable or enable
             */
            divAccessable(jqueryDiv, disable)
            {
                let pointerVal = disable ? 'none' : 'auto';
                let opacity = disable ? 0.5 : 1;
                jqueryDiv.css('pointer-events', pointerVal);
                jqueryDiv.css('opacity', opacity);
            }


            /**
             * Get the url boxes.
             * @returns {[]|Array} of type URLBox
             */
            getUrlSet()
            {
                return this.urlSet;
            }


            /**
             * This method highlights why I
             * hate JS and it's horrible internal functions.
             * Anyways checks if the URL is already there essentially.
             * @param url url to check
             * @returns {boolean} to create the box.
             */
            shouldCreateURLBox(url)
            {
                let create = true; //Because it won't break out a loop returning.
                //in ES6 for loops ¬_¬
                for(let i = 0 ; i < this.getUrlSet().length ; i++)
                {
                    let current = this.getUrlSet()[i];
                    let boxURL = current.getURL();
                    if(boxURL.trim() === url.trim()) {
                        create = false;
                        break; //cut out of loop.
                    }
                }
                return create;
            }


            incrementTotalSignals(val)
            {
                this.totalSignals += parseInt(val);
            }


            decrementTotalSignals(val)
            {
                this.totalSignals -= parseInt(val);
            }


            /**
             * Remmove Box URL instance
             * (non physical)
             * @param urlBoxId id of box.
             */
            removeUrlBox(urlBoxId)
            {
                let index = -1;
                for(let i = 0 ; i < this.getUrlSet().length ; i++)
                {
                    let currentBox = this.getUrlSet()[i];
                    let currentID = currentBox.getDivID();
                    if(currentID === urlBoxId) {
                        index = i; //Set the index to remove.
                    }
                }
                if(index > -1) {
                    this.getUrlSet().splice(index, 1); //remove the element from list.
                } else {
                    alert("Error, couldn't find box to remove, please contact DFY Support");
                    console.error("COULDN'T FIND BOX TO REMOVE");
                }
            }


            /**
             * Ok so there was a severe
             * issue with rounding text values that I noticed during testing
             * as their actual float vals were different, the #toFixed method was acting up.
             * Saved us a lot of money here...
             * @param num - number to scale.
             * @param scale - decimal places etc.
             * @returns rounded number to scale
             */
            roundNumber(num, scale)
            {
                if(!("" + num).includes("e")) { //isn't 'e' number
                    let ret = +(Math.round(num + "e+" + scale)  + "e-" + scale);
                    let decPlaces = ("" + ret).split("."); //bc JS is weird
                    if(decPlaces.length > 1) {
                        ret = decPlaces[1].length === 1 ? ret + "0" : ret; //Add 0 on the end so not to get confused for user.
                    }
                    return ret;
                }
                else {
                    var arr = ("" + num).split("e"); //Lack of being typestrong strikes again.
                    var sig = "";
                    if(+arr[1] + scale > 0) {
                        sig = "+";
                    }
                    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
                }
            }


            generatePostData()
            {
                let data = "\n"; //Start off with a new line as the formatting is nicer.
                for(let i = 0 ; i < this.getUrlSet().length ; i++)
                {
                    let current = this.getUrlSet()[i];
                    let currentURL = current.getURL();
                    let currentSignals = current.getSignalQuantity();
                    let valueToAdd = currentURL + " : " + currentSignals + " Signals \n";
                    data += valueToAdd;
                }
                return data;
            }


        }

        /**
         * Class that represents the physical slider
         * Itself, makes it easier to manage
         */

        class PhysicalSlider {

            constructor(sliderApplet)
            {
                this.applet = sliderApplet;
                this.stepList = null;
            }


            /**
             * Get the list of <option> steps on the slider
             * @returns list of pseudo steps.
             */
            getStepList()
            {
                return this.stepList;
            }


            /*
                Loads step list for the slider
                50 a time up to 6k.
                Generates pseudo list
                and option list.
             */
            loadStepList()
            {
                console.log("Step list method was called");
                let htmlToGenerate = '';
                let newStepList =  [];
                let steps = 6000 / 50; // 6000 split into 50.
                for(let k = 1 ; k <= steps ; k++)
                {
                    let value = k * 50;
                    newStepList.push(value); //pseudo list generation
                    let toAppend = "<option>" + value + "</option>\n"; //phyiscal option generation
                    //console.log(toAppend);
                    htmlToGenerate += toAppend;
                }
                this.stepList = newStepList;
                $('.steplist').html(htmlToGenerate);
                console.log("step list loaded");
            }


            /*
                Snaps the slider to given positions
                along with the colour and span.

            */
            snap(slider)
            {
                console.log(this.getStepList().length + "<- length of step list");
                let closest = this.getClosest(this.getStepList(), slider.value);
                console.log(closest);
                slider.value = closest;

                let percentage = ( closest / 6000) * 100; //percentage of fill.

                let backgroundValue = 'linear-gradient(90deg, rgba(250,182,19,1) ' + percentage + '%, rgba(187,187,187,1) ' + 0 + '%)';

                slider.style.background = backgroundValue; //update the gradient value.
            }


           /**
            * CALL EVERY TIME
            * URL IS REMOVED, ADDED.
            * OR SOCIAL SLIDER IS MOVED
            *
            * CURRENTLY PATCHED FOR THE PRICING ISSUE
            */
            calculateOrderPrice(additionalValue)
            {
                let comparisonValue = this.getApplet().getSignalsForOrder() + parseInt(additionalValue); //value including current + slider query.
                let pricePerUnit;
                if (comparisonValue >= 0 && comparisonValue <= 999){
                    pricePerUnit = 50 / 500;
                } else if(comparisonValue >= 1000 && comparisonValue <= 1999) {
                    pricePerUnit = 75 / 1000;
                } else {
                    pricePerUnit = 100 / 2000; //minimum PPU is $0.05
                }

                return pricePerUnit * comparisonValue;
            }


            /*
                Get the closest value in the array to a value.
                Nice clean
               */
            getClosest(arr, val) {
                return arr.reduce(function (prev, curr) {
                    return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
                });
            }

            /**
             * Get instance of the applet itself
             * @returns SliderApplet instance
             */
            getApplet() {
                return this.applet;
            }

        }


        /**
         * Actual and pseudo URL Box handling
         * when user adds specific URL & Signal
         */
        class URLBox {

            constructor(signalUrl, signalQuantity)
            {
                this.url = signalUrl;
                this.quantity = signalQuantity;
                this.physicalDiv = null;
                this.physicalCrossButton = null;
                this.divID = signalUrl + "~" + signalQuantity;
                sliderApplet.getUrlSet().push(this);
            }

            /**
             * Build the physical div to track.
             * Doing this in vanilla JS to be safe.
             */
            build()
            {
                let parentContainer = document.getElementById('url-container'); //Append to this at the end.


                let urlContainer = document.createElement('div');
                urlContainer.setAttribute('id', this.getDivID());
                urlContainer.setAttribute('class', 'url-item');

                parentContainer.appendChild(urlContainer);

                let actualURLContainer = document.createElement('div');
                actualURLContainer.setAttribute('class', 'actual-url');
                let actualURLH4 = document.createElement('h4');
                let h4TextNode = document.createTextNode(this.getURL());

                actualURLH4.appendChild(h4TextNode); //set h4 text
                actualURLContainer.appendChild(actualURLH4); //append to the wrapper
                urlContainer.appendChild(actualURLContainer); //append the first component.


                let urlQuantityContainer = document.createElement('div');
                urlQuantityContainer.setAttribute('class', 'actual-url-quantity');

                urlContainer.appendChild(urlQuantityContainer);


                let clickableElement = document.createElement('a');
                clickableElement.setAttribute('href', '#');
                clickableElement.setAttribute('class', 'remove-url-box');
                clickableElement.setAttribute('id', this.getDivID() + "_remove");
                let removeImage = document.createElement('img');
                removeImage.setAttribute('src', '../../wp-content/themes/whitero/dfy/img/close.svg');

                clickableElement.appendChild(removeImage);
                urlQuantityContainer.appendChild(clickableElement);


                let actualQuantityH5 = document.createElement('h5');
                let actualQuantityText = document.createTextNode(this.getSignalQuantity());
                actualQuantityH5.appendChild(actualQuantityText);

                urlQuantityContainer.appendChild(actualQuantityH5);

            }

            /**
             * Get physical div
             * @returns The URL box itself
             */
            getPhysicalDiv()
            {
                return this.physicalDiv;
            }

            /**
             * Get the cross button, used for removal.
             * @returns the remove button.
             */
            getBoxRemoveButton()
            {
                return this.physicalCrossButton;
            }

            /**
             * Get the ID of the dix box
             * (used for identifying and targetting)
             * @returns the div id of the box
             */
            getDivID()
            {
                return this.divID;
            }

            /**
             * Get the url for social signals
             * @returns the actual URL.
             */
            getURL()
            {
                return this.url;
            }

            /**
             * Get the amount of signals for
             * that URL.
             * @returns the total of signals.
             */
            getSignalQuantity()
            {
                return parseInt(this.quantity);
            }

        }


        sliderApplet = new SocialSliderApplet();


        const addURLButton = $('#add-url');

        var portrait = isPortrait();
        var forceMobile = false;

        var range = $('.input-range'),
            totalSignals = $('.signal-total'),
            actualTotal = $('.actual-total'),
            value = $('.range-value');

        const urlInput = $('#hero-url-input');

        var priceDiv = $('.woocommerce-Price-amount');
        var cartDiv = $('form.cart');

        var addCartButton = $('.button.single_add_to_cart_button.button.alt');

        addCartButton.css('display', 'none !important');
        cartDiv.hide();


        /**
         * Handle the initiation of
         * Setting the app up for mobile usage.
         * ANYTHING < IPHONE 6 OR 6S WILL NOT WORK.
         */
        const width = screen.width;
        if(parseInt(width) < parseInt(652)) { //needs to be rotated
            forceMobile = true;
            let hero = $('.social_hero');
            hero.css('display', 'none');
            let mobile = $('.social-mobile-alert');
            mobile.css('display', 'block');
        }


        /**
         * Handling enabling and disabling
         * the app during the resize event on mobile
         */
        window.addEventListener("resize", handleSliderFrameResize);

        /**
         * Event handler for the resize event
         * Shows the message for users in portrait mode.
         */
        function handleSliderFrameResize()
        {
            console.log("Resize fired");
            let hero = $('.social_hero');
            let mobileAlert = $('.social-mobile-alert');
            if(forceMobile) {
                console.log("Forced mobile view");
                if(isPortrait()) {
                    console.log("It's portrait");
                    portrait = true;
                    hero.fadeOut();
                    mobileAlert.css('display', 'block');
                    //make the person turn it over.
                } else {
                    console.log("Now horizontal");
                    portrait = false;
                    mobileAlert.css('display', 'none');
                    hero.fadeIn();
                }

            } else {
                console.log("Mobile version is not forced.");
            }

            /*
                Check if the screen is portrait
             */


        }

        /**
         * Check for if the device is portrait
         * Safe for portrait monitors due to the inital
         * width check, just compares width and height.
         * @returns boolean if the device is portrait.
         */
        function isPortrait()
        {
            return window.innerHeight > window.innerWidth;
        }


        value.html(range.attr('value'));
        actualTotal.html('$5.00');
        totalSignals.html('50');

        range.on('input', function()
        {
            sliderApplet.getSlider().snap(this);
            value.html(formatString(this.value));
            totalSignals.html(formatString(parseInt(this.value) + parseInt(sliderApplet.getSignalsForOrder())));
            let price = sliderApplet.roundNumber(sliderApplet.getSlider().calculateOrderPrice(this.value), 2);
            actualTotal.html("$" + price);
        });

        /*
            URL button add click
         */
        addURLButton.on('click', function(e) {

            let currentURL = urlInput.val();


            if(validateIsURL(currentURL))
            {
                let shouldCreate = sliderApplet.shouldCreateURLBox(currentURL);
                if(shouldCreate)
                {
                    executeAddURLTasks();
                } else {
                    urlInput.css('border', '1px solid');
                    urlInput.css('border-color', 'rgb(255,8,0)');
                    showAlert(alertType.URL_EXISTS);
                }
            } else {
                urlInput.css('border', '1px solid');
                urlInput.css('border-color', 'rgb(255, 0, 0)');
                showAlert(alertType.INVALID_URL);
            }


            /**
             * Internal method to event listener
             * to sort out front end displayed value.
             */
            function executeAddURLTasks()
            {
                //check if should fade in container.
                if(sliderApplet.getUrlSet().length <= 0) {
                    $('.url-slider').fadeIn();
                    $('.url-slider').css('display', 'inline-flex');
                }

                var box = new URLBox(currentURL, range.attr('value'));
                sliderApplet.incrementTotalSignals(range.attr('value'));
                box.build(); //Build the physical div.
                let percentage = ( 50 / 6000) * 100; //percentage of fill.
                let slider = $('.input-range');
                let value = $('.range-value');
                let orderTotal = $('.actual-total');
                let signalTotal = $('.signal-total');
                orderTotal.html("$" + sliderApplet.getSlider().calculateOrderPrice(0));
                signalTotal.html(sliderApplet.getSignalsForOrder());
                slider.css('background', 'linear-gradient(90deg, rgba(250,182,19,1) ' + percentage + '%, rgba(187,187,187,1) ' + 0 + '%)'); //update the gradient value.
                slider.val(0);
                value.html(0);
                urlInput.val(' ');
                urlInput.css('border', 'none');
            }


        });


        /**
         * Handle when the user clicks the input
         * box and set certain colours.
         *
         * Also setting the default value to 0
         * after the box is clicked AFTER adding
         * a URL box.
         */
        urlInput.click(function(e) {
           if(urlInput.css('border-color') === 'rgb(17, 17, 17)'){
               urlInput.css('border', '1px solid');
               urlInput.css('border-color', 'rgb(250, 182, 19)');
           }


            let slider = $('.input-range');
            let value = $('.range-value');
            let orderTotal = $('.actual-total');
            let signalTotal = $('.signal-total');
            if(value.html() === '0') {
                orderTotal.html("$" + sliderApplet.getSlider().calculateOrderPrice(50));
                signalTotal.html(sliderApplet.getSignalsForOrder() + parseInt(50));
                slider.val(50);
                value.html(50);
            }
        });


        /**
         * Handle the click of the "BUY NOW" button, emulates the
         * action of the actual buy now button.
         */
        $(document).on('click', '.socialbutton', (function(e) {
            //e.preventDefault(); //Stop the ting.
            if (sliderApplet.getSignalsForOrder() > 0)
            {
                //validate

                let ajaxPrice = sliderApplet.getSlider().calculateOrderPrice(0); //Final price.

                let actualAddCartButton = $('.single_add_to_cart_button');
                let buttonValue = actualAddCartButton.attr('value');

                var $thisbutton = $(this),
                    $form = $thisbutton.closest('form.cart'),
                    id = buttonValue,
                    product_qty = $form.find('input[name=quantity]').val() || 1,
                    product_id = $form.find('input[name=product_id]').val() || id,
                    variation_id = $form.find('input[name=variation_id]').val() || 0;

                //possibly continue to ajax part

                let orderData = sliderApplet.generatePostData();
                console.log("Order DATA: " + orderData);

                /**
                 * Ajax data dictionary to be sent to the back end.
                 * @type {{product_sku: string, quantity: *, data: *, variation_id: *, price: *, product_id: *, action: string}}
                 */
                var ajaxData = {
                    action: 'send_social_signals',
                    product_id: product_id,
                    product_sku: '',
                    quantity: product_qty,
                    variation_id: variation_id,
                    price: ajaxPrice,
                    data: orderData,
                };

                $(document.body).trigger('adding_to_cart', [$thisbutton, ajaxData]); //Trigger the adding to cart.


                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: slider_object.sliderurl,
                    data: ajaxData,
                    beforeSend: function (response) {
                        console.log("Preparing SEND");
                        $thisbutton.removeClass('added').addClass('loading');
                    },
                    complete: function (response) {
                        $thisbutton.addClass('added').removeClass('loading');
                    },
                    success: function (data) {
                        console.log("Tried to add to cart, this is the response:");
                        //let response = JSON.stringify(data);
                        //console.log(response);
    //                          let signals = response.totalSignals;
    //                            let prices = response.price;
    //                        console.log("Signals: " + signals);
                        //                      console.log("Prices: " + prices);
                    },
                    error: function (xhr, ajaxOptions, thrownData) {
                        console.log(xhr);
                        console.log(ajaxOptions);
                        console.log(thrownData);
                    },
                });

                $('.social_hero').fadeOut();

            } else {
                showAlert(alertType.MUST_HAVE_URL); //display the error.
            }


        }));


        /**
         * Let's handle the removal of
         * boxes
         */
        $(document).on('click', '.remove-url-box', (function(e) {
            let jqueryElement = $(this);
            let closest = jqueryElement.closest('.url-item');
            let closestID = closest.attr('id');
            let splitID = closestID.split("~");
            let targetedURLQuantity = parseInt(splitID[1]); //The quantity of divs

            sliderApplet.removeUrlBox(closestID);
            sliderApplet.decrementTotalSignals(targetedURLQuantity);
            closest.remove(); //Actually Remove physical element

            //Check if there's nothing in the list any more.

            if(sliderApplet.getUrlSet().length <= 0) {
                $('.url-slider').fadeOut();
            }

            let slider = $('.input-range');
            let value = $('.range-value');
            let orderTotal = $('.actual-total');
            let signalTotal = $('.signal-total');
            orderTotal.html("$" + sliderApplet.getSlider().calculateOrderPrice(0));
            signalTotal.html(sliderApplet.getSignalsForOrder());
            slider.val(0);
            value.html(0);
            urlInput.val(' ');
            urlInput.css('border', 'none');
        }));


        /*
            Had to re write this again,
            previous regex didn't allow slugs.

         */
        function validateIsURL(string) {
            var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
            return (res !== null);
        }


        const alertType = {
            INVALID_URL: "That isn't a URL!",
            NO_SIGNALS: "You need to add some signals first!",
            URL_EXISTS: "That URL already exists, to change the signal quantity remove it",
            MUST_HAVE_URL: "You haven't chosen any URLS yet!",
        };

        /**
         * Show a specific alert type popup.
         * @param alertType alert type enum.
         */
        function showAlert(alertType)
        {
            let alertTag = $('.alert');
            alertTag.html(alertType);
            alertTag.fadeIn();
            setTimeout(function(){
                alertTag.fadeOut();
            }, 3600);
        }

        /**
         * Method for converting an XXXX => X,XXX etc
         * @param x string
         * @returns converted string.
         */
        function formatString(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }



    }



});







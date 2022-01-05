"use strict"

 /**
  * Event-listener that listens to a leaflet draw event. The function gets called
  * every time the event (new marker or polygon drawn) happens.
  */
 map.on('draw:created', function(event) {

    console.log(event.layerType)
    // add a temporal marker or polygon to that map
    var tempMarker = event.layer.addTo(map);
    
    // html-form, used for marker-/polygon-popup (Name, Beschreibung, URL)
    var popupContent =      '<form id="popup-form" style="font-size: 11pt">\
                                <form id="myForm">\
                                <div>\
                                    <br>Parameter für den Einfluss der Ladestation:</br><br>\
                                    <input type="radio" id="L" name="transportationType" value="L">\
                                    <label for="L">Zu Fuß</label><br>\
                                    <input type="radio" id="F" name="transportationType" value="F">\
                                    <label for="F">Auto</label>\
                                </div>\
                                <form id="myForm">\
                                <div class="slidecontainer">\
                                <br>Zeitspanne (in min):</br><br>\
                                    <input type="range" min="1" max="20" value="10" class="slider" id="zeitspanne" oninput="this.nextElementSibling.value = this.value">\
                                    <output>10</output>\
                                </div><br>\
                                <div>\
                                    <br>Ladestationstyp:</br><br>\
                                    <input type="radio" id="NL" name="stationType" value="NL">\
                                    <label for="NL">Normalladestation</label><br>\
                                    <input type="radio" id="SL" name="stationType" value="SL">\
                                    <label for="SL">Schnellladestation</label>\
                                </div>\
                                <div class="slidecontainer">\
                                <br>Anzahl Ladestationen:</br><br>\
                                    <input type="range" min="1" max="40" value="20" class="slider" id="anzahlLadestation" oninput="this.nextElementSibling.value = this.value">\
                                    <output>20</output>\
                                </div><br>\
                                <div style="height: 25px;">\
                                    <button id="send" type="button">Send</button>\
                                </div>\
                            </form>';
 

    // binds a popup to every drawn marker or polygon         
    tempMarker.bindPopup(popupContent,{
        keepInView: false,
        closeButton: true
    }).openPopup();
     
    // Event-listener, that listens to a leaflet 'click' event. The function that gets called removes the current tempMarker.
    map.on('click', function(e){
         tempMarker.remove();
    })
 
    // variable that contains the "send"-button HTML-object
    let sendButton = document.getElementById("send");
    /**
     * Event-listener that listens to a 'click'-event on the send-button. The function that gets called when the event happens,
     * takes all the values of the popup-form, validates the entries, builds a geojson-string and sends it to the server.
     * Validation:  - Check if there is a name entry
     *              - Check if the url entry contains a wikipedia url. 
     *                  -> If yes, the wikipedia-API is used to get the first 3 sentences of the wikipedia article and sets it as sights description.
     *                  -> If not, use the entered description or set 'Keine Informationen vorhanden' as description, if no description was given. 
     */ 
    sendButton.addEventListener('click', function(){
        // var name = document.getElementById("name").value;
        // var url = document.getElementById("url").value;
        // var beschreibung = document.getElementById("beschreibung").value;
        // var type = event.layerType;

        // LayerType validation
        if(event.layerType == "marker") {
            var transportationType = $('#myForm input').on('change', function() {alert($('input[name=transportationType]:checked', '#myForm').val()); });
            var minutes = document.getElementById("zeitspanne").value;
            //var stationType = document.getElementById("beschreibung").value;
            var numberStaions = document.getElementById("anzahlLadestation").value;
            var coords = event.layer._latlng;
            console.log(minutes)
            const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
            const profile = 'driving'; // Set the default routing profile
            //const minutes = 20; // Set the default duration
            var coords = event.layer._latlng;
            console.log(coords);
            async function getIso() {
                const query = await fetch(
                  `${urlBase}${profile}/${coords.lng},${coords.lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxToken}`,
                  { method: 'GET' }
                );
                const data = await query.json();
                console.log(data.features[0]);
                L.geoJSON(data.features[0]).addTo(map);
                var isoGeometry = data.features[0].geometry.coordinates[0];
                console.log(ladebedarfsSzenarienLayer[0]);
                console.log(isoGeometry);
              }
            getIso();
        }

        // else {
        //     var coords = event.layer._latlngs[0];
        // }

        // // Name, Beschreibung and URL validation
        // if (name == "") {
        //     alert("Bitte geben Sie der Sehenswürdigkeit einen Namen.")
        // }
        // else {
        //     var wikiSightName = getSightNameFromURL(url);
        //     if (url.includes('wikipedia')) {
        //         // Ajax request to wikipedia API
        //         $.ajax({
        //             async: false,
        //             url: 'http://de.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&exsentences=3&explaintext=true&titles=' + wikiSightName + '&origin=*',
        //             method: "GET",
        //             success: function(data){
        //                 console.log(data);
        //                 var key = Object.keys(data.query.pages)[0];
        //                 var article = data.query.pages[key].extract;
        //                 console.log(article);
        //                 beschreibung = article;
        //             },
        //             error: function () {
        //                 alert('error')
        //             }
        //         })
        //         .done()
        //     }
        //     else {
        //         if (beschreibung == "") {
        //             beschreibung = "Keine Informationen vorhanden" //möglicherweise Sync-Problem, teilw. wird der String gesetzt und teilw. nicht
        //         } 
        //     }
                
        //     // variable, that contains all necessary information about a sight as geojson string
        //     let objectDataString = createGeoJSONString(name, url, beschreibung, coords, type);

        //     // Ajax request to send sight data to server to upload it to the database
        //     $.ajax({
        //         type: "POST",
        //         url: "/edit/addSight",
        //         data: {
        //             o: objectDataString
        //         },
        //         success: function (data) {
        //             window.location.href = "/edit";
        //         },
        //         error: function () {
        //             alert('error')
        //         }
        //     })
        //     .done()
        // }
    }) 
 })
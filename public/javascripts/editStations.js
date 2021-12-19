"use strict"

 /**
  * Event-listener that listens to a leaflet draw event. The function gets called
  * every time the event (new marker or polygon drawn) happens.
  */
 map.on('draw:created', function(event) {
    getIso();
    console.log("Isochrone");

    console.log(event.layerType)
    // add a temporal marker or polygon to that map
    var tempMarker = event.layer.addTo(map);
    
    // html-form, used for marker-/polygon-popup (Name, Beschreibung, URL)
    var popupContent =      '<form id="popup-form" style="font-size: 11pt">\
                                <div>\
                                    <br>Ladestationstyp:</br><br>\
                                    <input type="radio" id="NL" name="station_type" value="NL">\
                                    <label for="NL">Normalladestation</label><br>\
                                    <input type="radio" id="SL" name="station_type" value="SL">\
                                    <label for="SL">Schnellladestation</label>\
                                </div>\
                                <div class="slidecontainer">\
                                <br>Anzahl Ladestationen:</br><br>\
                                    <input type="range" min="1" max="100" value="50" class="slider" id="myRange">\
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
        var name = document.getElementById("name").value;
        var url = document.getElementById("url").value;
        var beschreibung = document.getElementById("beschreibung").value;
        var type = event.layerType;

        // LayerType validation
        if(event.layerType == "marker") {
            var coords = event.layer._latlng;
        }
        else {
            var coords = event.layer._latlngs[0];
        }

        // Name, Beschreibung and URL validation
        if (name == "") {
            alert("Bitte geben Sie der Sehenswürdigkeit einen Namen.")
        }
        else {
            var wikiSightName = getSightNameFromURL(url);
            if (url.includes('wikipedia')) {
                // Ajax request to wikipedia API
                $.ajax({
                    async: false,
                    url: 'http://de.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&exsentences=3&explaintext=true&titles=' + wikiSightName + '&origin=*',
                    method: "GET",
                    success: function(data){
                        console.log(data);
                        var key = Object.keys(data.query.pages)[0];
                        var article = data.query.pages[key].extract;
                        console.log(article);
                        beschreibung = article;
                    },
                    error: function () {
                        alert('error')
                    }
                })
                .done()
            }
            else {
                if (beschreibung == "") {
                    beschreibung = "Keine Informationen vorhanden" //möglicherweise Sync-Problem, teilw. wird der String gesetzt und teilw. nicht
                } 
            }
                
            // variable, that contains all necessary information about a sight as geojson string
            let objectDataString = createGeoJSONString(name, url, beschreibung, coords, type);

            // Ajax request to send sight data to server to upload it to the database
            $.ajax({
                type: "POST",
                url: "/edit/addSight",
                data: {
                    o: objectDataString
                },
                success: function (data) {
                    window.location.href = "/edit";
                },
                error: function () {
                    alert('error')
                }
            })
            .done()
        }
    }) 
 })
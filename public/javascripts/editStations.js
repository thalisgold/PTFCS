"use strict"
// const APIIURL = "http://localhost:3000"
/**
 * Event-listener that listens to a leaflet draw event. The function gets called
 * every time the event (new marker or polygon drawn) happens.
 */
map.on('draw:created', function(event) {

    // console.log(event.layerType)
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
                                <div style="height: 25px;">\
                                    <button id="showIso" type="button">Show Isochrone</button>\
                                </div>\
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
    sendButton.addEventListener('click', async function(){
        if(event.layerType == "marker") {
    
            //STATION
            // station type
            var stationType = $("input[name='stationType']:checked").val();
            console.log(stationType)
            // minutes
            var minutes = await document.getElementById("zeitspanne").value;
            console.log(minutes)
            // number of stations            
            var numberStations = await document.getElementById("anzahlLadestation").value;

            //ISOCHRONE
            // profile
            var transportationType = $("input[name='transportationType']:checked").val();
            if (transportationType == 'F') {
                var profile = "driving";
            }
            else if (transportationType == 'L') {
                profile = "walking";
            }
            console.log("transportationType:"+ profile);
            // marker
            var coords = await event.layer._latlng;
            console.log(coords);
            // isochrone as GeoJSON
            var data = await getIso(profile, coords, minutes);
            console.log(data)
            var isochrone = await data.features[0];
            console.log(isochrone);
            var isochroneGeoJSON = L.geoJSON(isochrone)
            //var isochroneGeom = data.features[0].geometry.coordinates[0];
            // console.log(isochroneGeom);


            let objectDataString = createGeoJSONString(profile, coords, isochrone, stationType, minutes, numberStations);
            console.log(objectDataString);
            let jsonData = {};
            jsonData.o = objectDataString;
            
            // send POST to start calculations
            this.http.post(APIURL + '/addStation', jsonData).subscribe({
                next: async (data) => {
                    console.log(data);
                },
                error: (error) => {
                    console.error('There was an error!', error);
                },
            });
  
  
            // Ajax request to send sight data to server to upload it to the database
            //  $.ajax({
            //     type: "POST",
            //     url: "/addStation",
            //     data: {
            //         o: objectDataString
            //     },
            //     success: function (data) {
            //         // window.location.href = "/";
            //     },
            //     error: function () {
            //         alert('error')
            //     }
            // })
            // .done()
            
        }
    }) 

    let showIsoButton = document.getElementById("showIso");

    showIsoButton.addEventListener('click', async function(){
        if(event.layerType == "marker") {
            var transportationType = $("input[name='transportationType']:checked").val();
            if (transportationType == 'F') {
                var profile = "driving";
            }
            else if (transportationType == 'L') {
                profile = "walking";
            }
            console.log("transportationType:"+ profile);
            var coords = await event.layer._latlng;
            console.log(coords)
            var minutes = await document.getElementById("zeitspanne").value;
            console.log(minutes)
            var data = await getIso(profile, coords, minutes);
            console.log(data)
            var isochrone = await data.features[0];
            var isochroneGeoJSON = await L.geoJSON(isochrone)
            await isochroneGeoJSON.addTo(map);
            // var isochroneGeom = data //.features[0].geometry.coordinates[0];
            // console.log(isochroneGeom);
        }
    })

 })

async function getIso(profile, coords, minutes) {
    const query = await fetch(
        `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${coords.lng},${coords.lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxToken}`,
        { method: 'GET' }
    );
    let data = await query.json();
    return data;
}

/**
 * This function creates a GeoJSON string from informations about a sight
 * @param {String} name - name of a sight
 * @param {String} url  - URL of a sight
 * @param {String} beschreibung  - short description of a sight
 * @param {Object} coords - coordinates of a sight {"lat":, "lng":}
 * @param {String} type - type of a sight
 * @returns - GeoJSON string
 */
 function createGeoJSONString(profile, coords, isochrone, stationType, minutes, numberStations) {
    // LayerType validation
    let geoJSON =`{
        "type": "FeatureCollection",
        "features": [
        {
            "type": "Feature", 
            "properties": {
                "Profile": "${profile}",
                "Coords": "${coords}",
                "Isochrone": "${isochrone}",
                "StationType": "${stationType}",
                "Minutes": "${minutes}",
                "NumberStations": "${numberStations}",
                
            },
            "geometry": {
                "type": "Point",
                "coordinates": 
                    [${coords.lng}, ${coords.lat}]
            }
        }]
    }`
    return geoJSON;
 }
"use strict"

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
                                </div><br>\
                                <div style="height: 25px;">\
                                    <button id="delete" type="button">Delete</button>\
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

    sendButton.addEventListener('click', async function(){
        if(event.layerType == "marker") {
            // get infos from form:
            var coords = await event.layer._latlng;
            console.log("Coordinates:" + coords)
            var transportationType = $("input[name='transportationType']:checked").val();
            if (transportationType == 'F') {
                var profile = "driving";
            }
            else if (transportationType == 'L') {
                profile = "walking";
            }
            console.log("transportationType:"+ profile);
            var minutes = await document.getElementById("zeitspanne").value;
            console.log("minutes:" + minutes)
            var stationType = $("input[name='stationType']:checked").val();
            console.log("Station Type:"+ stationType);
            var numberStations = await document.getElementById("anzahlLadestation").value;
            console.log("numberof stations:"+ numberStations);

            // get and show isochrone
            var data = await getIso(profile, coords, minutes);
            console.log(data)
            var isochrone = await data.features[0];
            var isochroneGeoJSON = await L.geoJSON(isochrone)
            await isochroneGeoJSON.addTo(map);
            // var isochroneGeom = data //.features[0].geometry.coordinates[0];
            // console.log(isochroneGeom);

            // variable that contains the "delete"-button HTML-object
    let deleteButton = document.getElementById("delete");

    deleteButton.addEventListener('click', async function(){
        // map.removeLayer(isochroneGeoJSON);
        L.geoJSON().clearLayers(isochroneGeoJSON);
        
    })
        }
    })

    

 })


 


async function getIso(profile, coords, minutes) {
    const query = await fetch(
        `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${coords.lng},${coords.lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxToken}`,
        { method: 'GET' }
    );
    let data = await query.json();
    // console.log(data);
    return data;

    // console.log(data.features[0]);
    // let isochrone = data.features[0];
    // var isochroneGeoJSON = L.geoJSON(isochrone)
    // isochroneGeoJSON.addTo(map);
    // var isochroneGeom = data //.features[0].geometry.coordinates[0];
    // console.log(isochroneGeom);
    // console.log(ladebedarfsSzenarienLayer[0]);
}

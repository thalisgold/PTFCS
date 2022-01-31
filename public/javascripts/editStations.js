"use strict"


$(document).on({
    ajaxStart: function() { $("body").addClass("loading"); },
    ajaxStop: function() { $("body").removeClass("loading"); }    
});


//const APIIURL = "http://localhost:3000"
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
                                    <label for="L">Laufen</label><br>\
                                    <input type="radio" id="F" name="transportationType" value="F">\
                                    <label for="F">Fahren</label>\
                                </div>\
                                <form id="myForm">\
                                <div class="slidecontainer">\
                                <br>Zeitspanne (in min):</br><br>\
                                    <input type="range" min="1" max="20" value="10" class="slider" id="zeitspanne" oninput="this.nextElementSibling.value = this.value">\
                                    <output>10</output>\
                                </div><br>\
                                <div style="height: 25px;">\
                                    <button class="btn btn-primary" id="showIso" type="button">Zeige Einflussgebiet</button>\
                                </div>\
                                <div>\
                                    <br>Ladestationstyp:</br><br>\
                                    <input type="radio" id="NL" name="stationType" value="Normalladestation">\
                                    <label for="NL">Normalladestation</label><br>\
                                    <input type="radio" id="SL" name="stationType" value="Schnellladestation">\
                                    <label for="SL">Schnellladestation</label>\
                                </div>\
                                <div class="slidecontainer">\
                                <br>Anzahl Ladestationen:</br><br>\
                                    <input type="range" min="1" max="10" value="5" class="slider" id="anzahlLadestation" oninput="this.nextElementSibling.value = this.value">\
                                    <output>5</output>\
                                </div><br>\
                                <div style="height: 25px;">\
                                    <button class="btn btn-success" id="send" type="button">Berechne neuen Ladebedarf</button>\
                                    <br>\
                                    <br>\
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
         isochroneGroup.clearLayers()
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
                var profil = "Fahren"
            }
            else if (transportationType == 'L') {
                var profile = "walking";
                var profil = "Laufen"
            }
            console.log("transportationType:"+ profile);
            // marker
            var coords = await event.layer._latlng;
            console.log(coords);
            // isochrone as GeoJSON
            var data = await getIso(profile, coords, minutes);
            console.log(data)
            var isochrone = await data.features[0].geometry.coordinates[0];
            console.log(isochrone);
            let isochroneString = JSON.stringify(isochrone)


            let objectDataString = createGeoJSONString(profil, coords, isochroneString, stationType, minutes, numberStations);
            console.log(objectDataString)
  
  
            // Ajax request to send sight data to server to upload it to the database
            $.ajax({
                type: "POST",
                url: "/addStation",
                dataType: "text",
                data: {
                    o: objectDataString
                },
                success: function (data) {
                    console.log(data);
                    $.ajax({
                        type: "GET",
                        url: "/calculateRaster",
                        dataType: "text",
                        success: function (data) {
                            console.log(data);
                            window.location.href = "/"
                        },
                        error: function () {
                            alert('error')
                        }
                    })
                },
                error: function () {
                    alert('error')
                }
            })
        }
    }) 
    

    let showIsoButton = document.getElementById("showIso");
    let isochroneGroup = new L.FeatureGroup()
    var isochroneGeoJSON;

    showIsoButton.addEventListener('click', async function(){
        isochroneGroup.clearLayers()
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
            isochroneGeoJSON = L.geoJSON(isochrone)
            isochroneGroup.addLayer(isochroneGeoJSON);
            isochroneGroup.addTo(map)
        }
    })
 })


/**
  * The function iterates through all HTML-objects from type input:checkbox
  * and puts all ids of the checked boxes into one array which is stored as an js object. Only one box can be checked at the same time, so 
  * the length of the array is <=1.
  * 
  * @returns {object} the object that contains an array with the ids of all the checked boxes in the HTML-document
  */
 function getCheckedScenario() {
    var obj = {};
    
    $('input[class=chbd]').each(function(){
        var $this = $(this);

        if($this.is(":checked")){
            obj.scenarioChecked = $this.attr("id");
        }
    });
    return obj;
 }

 var stationsArray = [];
 var isochroneArray = []
 var stationsIDs = []

 $('input[class=chb]').change(function() {
    if (this.checked) {
        for (let i = 0; i < stations.length; i++) {
            if(stations[i]._id === this.id) {
                var exteriorStyle = {
                    "fillOpacity": 0
                };
                console.log(stations[i])
                let station = L.geoJSON(stations[i].geometry.geometries[0], {style: exteriorStyle, stationId: this.id})
                station.bindPopup("Hier")
                stationsArray.push(station)

                let isochrone = L.geoJSON(stations[i].geometry.geometries[1], {style: exteriorStyle, stationId: this.id})
                isochroneArray.push(isochrone)

                station.addTo(map)
                isochrone.addTo(map)

                station.openPopup()
                stationsIDs.push(this.id)
            }   
        }
    } else {
        for (let i = 0; i < stationsArray.length; i++) {
            if (stationsArray[i].options.stationId == this.id) {
                map.removeLayer(stationsArray[i])
                map.removeLayer(isochroneArray[i])
                stationsArray.splice(i,1)
                isochroneArray.splice(i,1)
                stationsIDs.splice(i,1)
            } 
        } 
    }
    console.log(stationsArray)
});

let scenarios = new L.FeatureGroup();

$('input[class=chbd]').change(async function() {
    $('input[class=chbd]').not(this).prop('checked', false);
    scenarios.eachLayer(function (layer) {
        scenarios.removeLayer(layer);
    });
    if (this.checked) {
        if (this.id == "2022"){
            let url = "http://localhost:3000/outcome/outcomeRaster_2022.tif"
            let layer_2022 = await createLayerFromURL(url)
            scenarios.addLayer(layer_2022)
        }
        else if (this.id == "2025"){
            let url = "http://localhost:3000/outcome/outcomeRaster_2025.tif"
            let layer_2025 = await createLayerFromURL(url)
            scenarios.addLayer(layer_2025)
        }
        else if (this.id == "2030"){
            let url = "http://localhost:3000/outcome/outcomeRaster_2030.tif"
            let layer_2030 = await createLayerFromURL(url)
            scenarios.addLayer(layer_2030)
        }
        if (this.id == "Karte") {
            scenarios.removeLayer(layer)
        }
    }
    map.addLayer(scenarios);
});


// variables that store the delete-Button HTML-object
var deleteButton = document.getElementById('deleteButton');

/**
 * Event-listener that listens for a click event on the deleteButton. 
 * If the button is clicked the callback function is executed which sends 
 * an ajax-POST-request to the express server. 
 * The data sent to the server contains the id's of the routes which should be deleted from the database.
 * After the ajax-request is done the page gets refreshed.
 */
deleteButton.addEventListener('click', function(){
    if (stationsIDs.length != 0){
        // Ajax request that sends information about the sights that should be deleted from the database to the server.
        var obj = {}
        obj.stationsIDs = stationsIDs
        var objectDataString = JSON.stringify(obj)
        $.ajax({
            type: "POST",
            url: "/delete",
            dataType: "text",
            data: {
                o: objectDataString
            },
            success: function (data) {
                console.log(data)
                $.ajax({
                    type: "GET",
                    url: "/calculateRaster",
                    dataType: "text",
                    success: function (data) {
                        console.log(data);
                        window.location.href = "/"
                    },
                    error: function () {
                        alert('error')
                    }
                })
            },
            error: function () {
                alert('error')
            }
        })
    }
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
    let geoJSON = `{
            "type": "Feature",
            "properties": {
                "Profile": "${profile}",
                "StationType": "${stationType}",
                "Minutes": "${minutes}",
                "NumberStations": "${numberStations}"
            },
            "geometry": {
                "type": "GeometryCollection",
                "geometries": [{
                    "type": "Point",
                    "coordinates": [${coords.lng}, ${coords.lat}]
                }, {
                    "type": "Polygon",
                    "coordinates": [${isochrone}]
                }]  
            }
        }`
    return geoJSON;
 }



var tablerows = document.getElementsByClassName("tablerow");
console.log(tablerows)
for (let i = 0; i < tablerows.length; i++) {
    tablerows[i].addEventListener('mouseover', function(e) {
        console.log(stationsArray);
        markerFunctionOpen(this.id);
    })
}  
for (let i = 0; i < tablerows.length; i++) {
    tablerows[i].addEventListener('mouseout', function(e) {
        //console.log(this.id);
        markerFunctionClose(this.id);
    })
}  



/**
 * The function opens the marker-popup of the sight with the given id.
 * 
 * @param {String} id - DB
 */
 function markerFunctionOpen(id){
    for (var i in stationsArray){
        var markerID = stationsArray[i].options.stationId;
        if (markerID == id){
            console.log(id)
            console.log(stationsArray[i])
            stationsArray[i].openPopup();
        };
    }
}


/**
 * The function closes the marker-popup of the sight with the given id.
 * 
 * @param {String} id 
 */
function markerFunctionClose(id){
    for (var i in stationsArray){
        var markerID = stationsArray[i].options.stationId;
        if (markerID == id){
            stationsArray[i].closePopup();
        };
    }
}
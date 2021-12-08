/**
 * The script provides functions to create, manipulate and add things to leaflet maps.
 * @author Fabian Schumacher, Thalis Goldschmidt
 */
"use strict"

// basemap options
let mapboxTileLayerOptions = {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
};

// default map options
let mapOptionsDefault = {
    drawControl: false
}

/**
 * The function creates the leaflet map with the view set to Muensters city center.
 * 
 * @param {String} htmlID - the HTML-id of the division in which the map is displayed
 * @param {Object} mapOptionsDefault - the default map options used for the initialization
 * @returns - the leaflet map object
 */
function createMap(htmlID = 'map', mapOptions = mapOptionsDefault) {
     return L.map(htmlID, mapOptions).setView([51.9617, 7.6252], 15);
}

/**
 * The functions add a mapbox/openstreet tilelayer to the map with the osmTileLayerOptions.
 * 
 * @param {L.Map} mapObj - the Leaflet map object stored in the variable
 * @returns - the tile layer, which will be added to map
 */
function addMapboxTileLayer(mapObj) {
    return new L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`, mapboxTileLayerOptions).addTo(mapObj);
}

function addOSMTileLayer(mapObj) {
    return new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution:'&copy; <a href="http://osm.org/copyright%22%3EOpenStreetMap</a> contributors'}).addTo(mapObj);
}

// array that is filled with all the associated sight-markers to the sights in the database 
var sightsArray = [];

/**
 * This funtion loads all sights from the database to display them in the map.
 * 
 * @param {Array} sights - array of sights as geojson
 */
function addSightsFromDB(sights) {
    sightsArray = [];
    deleteCurrentMarkers();
    for (let i = 0; i <sights.length; i++) {
        if (sights[i].features[0].geometry.type == "Point") {
           var s = L.geoJSON(sights[i], {
               // swaps geojson coordinates from [lng, lat] to [lat, lng] 
               coordsToLatLng: function (coords) {
                   return new L.LatLng(coords[1], coords[0]);
               }
           });
           var id = sights[i]._id;
           var marker = L.marker([s._layers[s._leaflet_id-1]._latlng.lat, s._layers[s._leaflet_id-1]._latlng.lng], {sightsId: id});
           sightsArray.push(marker);
           // binds popup with all necessary informations to marker
           marker.bindPopup(  `<h5>Infos</h5>
                       <p><strong>Name: </strong> ${sights[i].features[0].properties.Name}</p>
                       <p><strong>Beschreibung: </strong> ${sights[i].features[0].properties.Beschreibung}</p>
                       <p><strong>URL: </strong> <a href="${sights[i].features[0].properties.URL}">${sights[i].features[0].properties.URL}</a></p> `)
           markers.addLayer(marker);
        }
        if (sights[i].features[0].geometry.type == "Polygon") {
           var s = L.geoJSON(sights[i], {
               //swaps geojson coordinates from [lng, lat] to [lat, lng] 
               coordsToLatLng: function (coords) {
                   return new L.LatLng(coords[1], coords[0]);
               }
           });
           // builds array
           console.log(s._layers[s._leaflet_id-1]._latlngs[0]);
           var coordinatesFinished = extractCoordinatesLatLngPolygon(s._layers[s._leaflet_id-1]._latlngs[0]);
           var id = sights[i]._id
           var polygon = L.polygon(coordinatesFinished, {sightsId: id});
           sightsArray.push(polygon);
           polygon.bindPopup(  `<h5>Infos</h5>
                      <p><strong>Name: </strong> ${sights[i].features[0].properties.Name}</p>
                      <p><strong>Beschreibung: </strong> ${sights[i].features[0].properties.Beschreibung}</p>
                      <p><strong>URL: </strong> <a href="${sights[i].features[0].properties.URL}">${sights[i].features[0].properties.URL}</a></p> `)
           markers.addLayer(polygon);
       }
    }
    console.log(sightsArray)
    map.addLayer(markers);
}


/**
 * The function opens the marker-popup of the sight with the given id.
 * 
 * @param {String} id - DB
 */
function markerFunctionOpen(id){
    for (var i in sightsArray){
        var markerID = sightsArray[i].options.sightsId;
        if (markerID == id){
            sightsArray[i].openPopup();
        };
    }
}


/**
 * The function closes the marker-popup of the sight with the given id.
 * 
 * @param {String} id 
 */
function markerFunctionClose(id){
    for (var i in sightsArray){
        var markerID = sightsArray[i].options.sightsId;
        if (markerID == id){
            sightsArray[i].closePopup();
        };
    }
}

/**
 * This function builds an array of coordinate arrays from an array of coordinate objects.
 * 
 * @param {array} - [{lat: ... ,lng: ...}, ...] coords 
 * @returns - array of coordinates
 */
function extractCoordinatesLatLngPolygon(coords) 
{
    var coordinates = [];
    for (let i = 0; i < coords.length; i++) 
    {
        var coord = [coords[i].lat, coords[i].lng];
        coordinates.push(coord);
    }
    coordinates.push([coords[0].lat, coords[0].lng]); 
    return coordinates;
}


/**
 * Function, that removes current markers or polygons and resets the markers featuregroup.
 */
function deleteCurrentMarkers() 
{
    map.removeLayer(markers);
    markers = new L.FeatureGroup();
 }


 /**
  * The function iterates through all HTML-objects from type input:checkbox
  * and puts all ids of the checked boxes into one array which is stored as an js object.
  * 
  * @returns {object} the object that contains an array with the ids of all the checked boxes in the HTML-document
  */
  function getCheckedSights() {
    var obj = {};
    obj.sightsChecked=[];
    
    $("input:checkbox").each(function(){
        var $this = $(this);

        if($this.is(":checked")){
            obj.sightsChecked.push($this.attr("id"));
        }
    });
    return obj;
 }
"use strict"

// get a first map into the HTML-document and store the map object in the variable
var map = createMap();

// get the tilelayer for the map and store it into a variable
//var osmLayer = addOSMTileLayer(map);
var mapboxLayer = addMapboxTileLayer(map);

// variable for the items drawn with the leaflet tool. Uses a feature group to store the editable layers
var drawnItems = new L.FeatureGroup();

// featureGroup to store drawn markers and polygons
let markers = new L.FeatureGroup();

// featureGroup to store 

// new draw control for the given map, in which only the reactangle tool is provided
var drawControl = new L.Control.Draw({
    draw: {
        rectangle: false,
        polygon: false,
        polyline: false,
        circle: false,
        circlemarker: false
    },
});

// adds the draw control to the map
map.addControl(drawControl);

// adds the layer with drawn items to the map
map.addLayer(drawnItems);

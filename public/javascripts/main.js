/**
 * Main script that calls the function, which provides the map divison with necessary data
 * @author Fabian Schumacher, Thalis Goldschmidt
 */

 "use strict"

 // get a first map into the HTML-document and store the map object in the variable
 var map = createMap();
 
 // get the tilelayer for the map and store it into a variable
 var osmLayer = addOSMTileLayer(map);
 var mapboxLayer = addMapboxTileLayer(map);
 
 // variable for the items drawn with the leaflet tool. Uses a feature group to store the editable layers
 var drawnItems = new L.FeatureGroup();
 
 // featureGroup to store drawn markers and polygons
 let markers = new L.FeatureGroup();


 // new draw control for the given map, in which only the reactangle tool is provided
 var drawControl = new L.Control.Draw({
     draw: {
         rectangle: false,
         polyline: false,
         circle: false,
         circlemarker: false
     },
 });
 
 // adds the layer with drawn items to the map
 map.addLayer(drawnItems);
 
 // variables used for handling the layer control
 var baseMap = { "OSM": osmLayer,
                 "Mapbox": mapboxLayer};
 
 // adds the layer control to the map
 L.control.layers(baseMap).addTo(map);

 // adds the draw control and all sights to the map if currently on the '/edit' route
 // in addition a change-event-listener is added to each input of type 'checkbox' that opens/closes the marker-popup when the sight gets checked/unchecked
 if (window.location.pathname == "/edit") {
    map.addControl(drawControl);
    // load all sights from database 
    addSightsFromDB(sights);
    $('input[type=checkbox]').change(function() {
        if (this.checked) {
            markerFunctionOpen(this.id);
        }
        else{
            markerFunctionClose(this.id);
        }
    })
 }
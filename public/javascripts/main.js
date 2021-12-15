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




var url_to_geotiff_file = "http://localhost:3000/ladebedarf/ladebedarf_rasterized_2022_EPSG_4326.tif";

fetch(url_to_geotiff_file)
    .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
                console.log("georaster:", georaster);

                /*
                    GeoRasterLayer is an extension of GridLayer,
                    which means can use GridLayer options like opacity.
                    Just make sure to include the georaster option!
                    http://leafletjs.com/reference-1.2.0.html#gridlayer
                */
                var layer = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.7,
                    pixelValuesToColorFn: values => (values[0] > 0 && values[0] <= 1) ? '#eb3434' :
                                                    (values[0] > 1 && values[0] <= 2) ? '#eb9e34' :
                                                    (values[0] > 2 && values[0] <= 3) ? '#dbeb34' :
                                                    (values[0] > 3 && values[0] <= 4) ? '#61eb34' :
                                                    (values[0] > 4 && values[0] <= 5) ? '#34eba1' :
                                                    (values[0] > 5 && values[0] <= 6) ? '#34baeb' :
                                                    (values[0] > 6 && values[0] <= 7) ? '#3455eb' :
                                                    (values[0] > 7 && values[0] <= 8) ? '#a134eb' :
                                                    null,
                });
                //layer.addTo(map);
                map.addLayer(layer);


                map.fitBounds(layer.getBounds());

            });
        });


// variables used for handling the layer control
// var baseMap = { "OSM": osmLayer,
//                 "Mapbox": mapboxLayer};

// adds the layer control to the map
L.control.layers(baseMap).addTo(map);

//var layer = L.leafletGeotiff('http://localhost:3000/ladebedarf/ladebedarf_rasterized_2022_EPSG_4326.tif').addTo(map);
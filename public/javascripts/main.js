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

var url_to_geotiff_file_1 = "http://localhost:3000/ladebedarf/ladebedarf_rasterized_2022_EPSG_4326.tif";
var url_to_geotiff_file_2 = "http://localhost:3000/ladebedarf/ladebedarf_rasterized_2025_EPSG_4326.tif";
var url_to_geotiff_file_3 = "http://localhost:3000/ladebedarf/ladebedarf_rasterized_2030_EPSG_4326.tif";
var url_array = [url_to_geotiff_file_1, url_to_geotiff_file_2, url_to_geotiff_file_3]
//console.log(url_array);

async function createLayersFromURL(url_array) {
    var array =[];
    for (let i = 0; i < url_array.length; i++) {
        try {
            var response = await fetch(url_array[i]);
            var arrayBuffer = await response.arrayBuffer();
            var georaster = await parseGeoraster(arrayBuffer);
            //console.log("georaster:", georaster);      
            /*
            GeoRasterLayer is an extension of GridLayer,
            which means can use GridLayer options like opacity.
            Just make sure to include the georaster option!
            http://leafletjs.com/reference-1.2.0.html#gridlayer
            */
            var layer = new GeoRasterLayer({
                georaster: georaster,
                opacity: 0.7,
                pixelValuesToColorFn: values => values[0] === -3.3999999521443642e+38 ? null :  (values[0] > 0 && values[0] <= 1) ? '#00FF00' :
                                                                                                (values[0] > 1 && values[0] <= 2) ? '#55FF00' :
                                                                                                (values[0] > 2 && values[0] <= 3) ? '#AAFF00' :
                                                                                                (values[0] > 3 && values[0] <= 4) ? '#FFFF00' :
                                                                                                (values[0] > 4 && values[0] <= 5) ? '#FFCC00' :
                                                                                                (values[0] > 5 && values[0] <= 6) ? '#FF8800' :
                                                                                                (values[0] > 6 && values[0] <= 7) ? '#FF5500' :
                                                                                                (values[0] > 7 && values[0] <= 8) ? '#FF2200' :
                                                                                                (values[0] > 8 && values[0] <= 9) ? '#FF0000' :
                                                                                                '#FFC0CB',
            });
            //console.log(georaster);
            //return layer;     
            //layer.addTo(map);
            //map.addLayer(layer);
            //map.fitBounds(layer.getBounds());
            array.push(layer);
        }
        catch (error) {
            console.log(error)
        }
    }
    // console.log(array);
    var ladebedarfs_szenarien =   { "Ladebedarf 2022": array[0],
                                    "Ladebedarf 2025": array[1],
                                    "Ladebedarf 2030": array[2]}
    L.control.layers(ladebedarfs_szenarien).addTo(map);
    
}

createLayersFromURL(url_array);
//[[PromiseResult]]
//ladebedarf_2022.addTo(map);
// console.log(ladebedarf_2022);
//console.log(Promise.resolve(ladebedarf_2022));
// var ladebedarf_2025 = createGeorasterFromURL(url_to_geotiff_file_2);
// var ladebedarf_2030 = createGeorasterFromURL(url_to_geotiff_file_3);

//console.log(ladebedarf_2030);

// console.log(ladebedarf_2030);

//variables used for handling the layer control
// var ladebedarfs_szenarien =   { "Ladebedarf 2022": ladebedarf_2022,
//                                 "Ladebedarf 2025": ladebedarf_2025}

// adds the layer control to the map
//L.control.layers(ladebedarfs_szenarien).addTo(map);

//var layer = L.leafletGeotiff('http://localhost:3000/ladebedarf/ladebedarf_rasterized_2022_EPSG_4326.tif').addTo(map);
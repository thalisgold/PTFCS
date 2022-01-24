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
     return L.map(htmlID, mapOptions).setView([51.9617, 7.6252], 13);
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

/**
 * Function, that fetches all urls of the tifs to generate the three default scenarios as layers
 * @param {Array} url_array - array that contains all urls to the necessary tif files.
 */
 async function createLayerFromURL(url) {
    var scale = chroma.scale("RdYlGn") // choose color scale
    // set default variables (for all scenarios we want the same color scale to make it comparable, so we take the min and max of all scenarios)
    var min = 0;
    var max = 3.716505
    var range = max - min;
    try {
        var response = await fetch(url);
        var arrayBuffer = await response.arrayBuffer();
        var georaster = await parseGeoraster(arrayBuffer);
        var layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.7,
            pixelValuesToColorFn: function(pixelValues) {
                var pixelValue = pixelValues[0]; // there's just one band in this raster
                if (isNaN(pixelValue)) 
                    return null; // if NaN is the value, don't return any colour
                else if (pixelValue == -3.3999999521443642e+38) 
                    return null; // or if not data value is = -3.3999999521443642e+38 , don't return any colour
                var scaledPixelValue = 1 - ((pixelValue - min) / range); // our color scale is Red-Yellow-Green. Since we want low values to be green, we have to substract the calculated value from 1.
                var color = scale(scaledPixelValue).hex();
                return color;
                },
        });
        return layer
    }
    catch (error) {
        console.log(error)
    }
}

    // if(document.getElementById('radio1').checked) {
    //     map.addLayer(ladebedarfsSzenarienLayer[0]);
    //   }
    // else if(document.getElementById('radio2').checked) {
    //     map.addLayer(ladebedarfsSzenarienLayer[1]);
    //   }
    // else if(document.getElementById('radio3').checked) {
    //     map.addLayer(ladebedarfsSzenarienLayer[2]);
    //   }
    // map.addLayer(ladebedarfsSzenarienLayer[0]);
    // var ladebedarfs_szenarien =   { "Ladebedarf 2022": ladebedarfsSzenarienLayer[0],
    //                                 "Ladebedarf 2025": ladebedarfsSzenarienLayer[1],
    //                                 "Ladebedarf 2030": ladebedarfsSzenarienLayer[2]}
    // L.control.layers(ladebedarfs_szenarien).addTo(map);
    //console.log(ladebedarfs_szenarien)

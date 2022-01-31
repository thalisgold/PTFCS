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

// create array with the colours to be used for the classification
const usedColours = [];
var scale = chroma.scale("RdYlGn") // choose color scale
var min = 0;
var max = 0.4129451*9;
var range = max - min
for (let index = min; index <= max;) {
       var scaledPixelValueForLegend = 1 - ((index - min) / range);
       usedColours.push(scale(scaledPixelValueForLegend).hex());
       index += 0.4129451;
}
console.log(usedColours)
const classesArray = [0, 0.41, 0.83, 1.24, 1.66, 2.06, 2.48, 2.89, 3.30, 3.72]
console.log(classesArray)

/**
 * Function that generates HTML code to dynamically add a legend to the result page
 * @param colourArray - Array of the colours
 * @param classesArray - Array of the classes
 * @returns an HTML String of all necessary elements for the legend and the matching style sheet
 */
function makeLegendHTML(colourArray, classesArray) {
    
  var result = '';
  for (let index = 0; index < colourArray.length; index++) {
    result += `<li><span style='background: ${colourArray[index]};'></span>${classesArray[index]}</li>`;
  }
  result +=
    "<style type='text/css'>\
  .my-legend .legend-title {\
    text-align: left;\
    margin-bottom: 5px;\
    font-weight: bold;\
    font-size: 90%;\
    }\
  .my-legend .legend-scale ul {\
    margin: 0;\
    margin-bottom: 5px;\
    padding: 0;\
    float: left;\
    list-style: none;\
    }\
  .my-legend .legend-scale ul li {\
    font-size: 80%;\
    list-style: none;\
    margin-left: 0;\
    line-height: 18px;\
    margin-bottom: 2px;\
    }\
  .my-legend ul.legend-labels li span {\
    display: block;\
    float: left;\
    height: 16px;\
    width: 30px;\
    margin-right: 5px;\
    margin-left: 0;\
    border: 1px solid #999;\
    }\
  .my-legend .legend-source {\
    font-size: 70%;\
    color: #999;\
    clear: both;\
    }\
  .my-legend a {\
    color: #777;\
    }\
</style>";
  return result;
}

// insert the created html code in the right position to display the legend
document.getElementById('legend').innerHTML = makeLegendHTML(
  usedColours,
  classesArray
);




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
        var response = await fetch(url).catch((error) => {console.log(error)});
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
        return null;
    }
}


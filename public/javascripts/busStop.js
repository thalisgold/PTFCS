"use strict"

// JS-object that stores all the queried busstops
var busStopObj;

//  variable that stores a FeatureCollection with all busstops as turf points
var turfPoints;

// variable that stores a FeatureGroup with all busstop markers
var haltestellenMarker = new L.FeatureGroup();
// variable that stores the current busstop marker
var haltestelleMarker;

// html-buttons
var haltestelleButton = document.getElementById("haltestelleButton");
var weatherButton = document.getElementById("weatherButton");


// Icon that is used as leaflet marker
var haltestelleIcon = L.icon({
    iconUrl: 'http://localhost:3000/images/haltestelle.png',
    // iconUrl: 'http://localhost:4000/images/haltestelle.png',
    iconSize:     [35, 35], // size of the icon
})

// Ajax call to retrieve information about all busstops via conterra haltestellen-api
$.ajax({
    url: 'https://rest.busradar.conterra.de/prod/haltestellen',
    method: "GET",
    success: function(data) {
        busStopObj = data;
        var points = [];
        for (let i = 0; i < busStopObj.features.length; i++) {
            points.push(turf.point(busStopObj.features[i].geometry.coordinates));
            
        }
        //console.log(points);
        turfPoints = turf.featureCollection(points);
        console.log(turfPoints);
    },
    error: function () {
        alert('error')
    }
})
.done()


/**
  * Event-listener that listens for a click event on the haltestellenButton. 
  * If the button is clicked the callback function is executed which gets validates if there is only one id checked and gets its id (otherwise: throw alert).
  * Then it searches the whole sight in the sights-array to get the coordinates. The coordinates get converted to turf-points to be able 
  * to compare to the busstops. If the right busstop is found the function searches the right busstop object in busstop object by matching coordinates.
  * After that a marker and popup is created for the nearest busstop. The popup gets filled with the current weather information
  * through the getWeatherData()-function, but does not get opened.
  * 
  */
haltestelleButton.addEventListener("click", function(e) {

    var checkedSights = getCheckedSights();
    console.log(checkedSights);
    map.removeLayer(haltestellenMarker);
    haltestellenMarker = new L.FeatureGroup();
    var polygonCenter;
    var targetPoint;
    var nearest;

    if (checkedSights.sightsChecked.length == 1) {      // more than one sight checked?

        for (let i = 0; i < sights.length; i++) {       // find the right sight by...

            if (sights[i]._id == checkedSights.sightsChecked[0]) {  // ...comparing the ids 

                if (sights[i].features[0].geometry.type == "Point") {  // if the sight is of type point 

                    targetPoint = turf.point(sights[i].features[0].geometry.coordinates);
                    console.log(targetPoint);
                    nearest = turf.nearestPoint(targetPoint, turfPoints);   // calculate nearest busstop turf-point
                    // console.log(nearest);

                }
                else if (sights[i].features[0].geometry.type == "Polygon"){    // if the sight is of type point       

                    console.log([[sights[i].features[0].geometry.coordinates]]);
                    var polygon = turf.polygon(sights[i].features[0].geometry.coordinates); 
                    polygonCenter = turf.centroid(polygon);             // calculate Polygon centroid as turf-point
                    console.log(polygonCenter);
                    nearest = turf.nearestPoint(polygonCenter, turfPoints); // calculate nearest busstop turf-point
                    // console.log(nearest);

                }
            }
        }

        var nearestCoordinates = nearest.geometry.coordinates; // variable that only stores the coordinates of the nearest busstop
        console.log(nearestCoordinates);

        for (let j = 0; j < busStopObj.features.length; j++) {  // find the whole busstop-object by...

            if (JSON.stringify(busStopObj.features[j].geometry.coordinates) == JSON.stringify(nearestCoordinates)) { // ...comparing the coordinates

                var haltestelle = busStopObj.features[j];
                console.log(haltestelle);
                haltestelleMarker = L.marker([haltestelle.geometry.coordinates[1], haltestelle.geometry.coordinates[0]], {icon: haltestelleIcon});
                getWeatherData(haltestelle.geometry.coordinates[1], haltestelle.geometry.coordinates[0], haltestelleMarker, haltestelle),
                haltestellenMarker.addLayer(haltestelleMarker);
                haltestellenMarker.addTo(map);

            }     
        }
    }
    else if (checkedSights.sightsChecked.length > 1) {

        alert("Bitte nur eine Sehenswürdigkeit auswählen.");

        }
        else {

            alert("Bitte wähle eine Sehenswürdigkeit aus.");

        }
})

/**
  * Event-listener that listens for a click event on the weatherButton. 
  * If the button is clicked the callback function is executed which opens the popup of the busstop marker
  * if one was created. If there was no busstop marker created before, the functions throws an alert and requests the user
  * to first show a nearby busstop.
  * 
  */
weatherButton.addEventListener('click', function() {
    if (haltestelleMarker != null) {

        haltestelleMarker.openPopup();

    }
    else {

        alert('Bitte zuerst Sehenswürdigkeit auswählen und Haltestelle anzeigen lassen.');

    }   
})


 /**
 * The function makes an asynchronous HTTP request (ajax) to the openWeatherAPI and gets the weather
 * for the coordinates of the intersection(the marker). If the request was successfull it calls the createWeatherMarkerPopup()-function
 * and provides it with the marker and the requested weatherData.
 * 
 * @param {float} latitude - latitude coordinate of the intersection
 * @param {float} longitude - longitude coordinate of the intersection
 * @param {L.Marker} marker - the marker currently "working" on
 */
function getWeatherData(latitude, longitude, marker, haltestelle) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${openweatherAPIKey}`,
        method: "GET"
    })
    .done(function(weatherData) {                                        // if the request was successfull
        createWeatherMarkerPopup(marker, weatherData, haltestelle);
    })
    .fail(function(xhr, status, errorThrown) {                           // if the request fails
        alert("error");
        console.dir(xhr)
        console.log(status)
        console.log(errorThrown)
    })
}


/**
 * The function creates a leaflet Popup for the marker and fills it with the weather information and
 * a date and the busstop name.
 * 
 * @param {object} result 
 * @param {L.Marker} marker 
 */
 function createWeatherMarkerPopup(marker, weatherData, haltestelle) {

    // create weather Image
    let weatherImage = new Image();
    weatherImage.src = `http://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png`

    // craete date-object and define the 
    let date = new Date(weatherData.current.dt*1000)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};

    // create Popup with the weather and location<s information
    marker.bindPopup(  `<h5>${haltestelle.properties.lbez}</h5>
                        <p style="text-align: center">${date.toLocaleDateString('de-DE', options)} Uhr</p>
                        <p style="text-align: center"><img src = ${weatherImage.src}></img></p>
                        <p style="text-align: center">${"Temperatur: " + Math.round(weatherData.current.temp) + "°C"}<br>
                        ${"Windgeschwindigkeit: " + weatherData.current.wind_speed + " m/s"}<br>
                        ${"Windrichtung: " + weatherData.current.wind_deg + "°"}<br>
                        ${"Luftfeuchtigkeit: " + weatherData.current.humidity + " %"}<br>
                        ${"Bewölkung: " + weatherData.current.clouds + " %"}</p>`)
}
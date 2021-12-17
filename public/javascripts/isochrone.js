"use strict"

// Create constants to use in getIso()
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
const lon = 7.62544;
const lat = 51.96204;
const profile = 'walking'; // Set the default routing profile
const minutes = 10; // Set the default duration

// Create a function that sets up the Isochrone API query then makes an fetch call
async function getIso() {
  const query = await fetch(
    `${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxToken}`,
    { method: 'GET' }
  );
  const data = await query.json();
  console.log(data.features[0]);
  L.geoJSON(data.features[0]).addTo(map);
}
//getIso();
// Call the getIso function
// You will remove this later - it's just here so you can see the console.log results in this step
//getIso();

// map.on('load', () => {
//     // When the map loads, add the source and layer
//     map.addSource('iso', {
//       type: 'geojson',
//       data: {
//         type: 'FeatureCollection',
//         features: []
//       }
//     });
  
//     map.addLayer(
//       {
//         id: 'isoLayer',
//         type: 'fill',
//         // Use "iso" as the data source for this layer
//         source: 'iso',
//         layout: {},
//         paint: {
//           // The fill color for the layer is set to a light purple
//           'fill-color': '#5a3fc0',
//           'fill-opacity': 0.3
//         }
//       },
//       'poi-label'
//     );
  
//     // Make the API call
//     getIso();
//   });
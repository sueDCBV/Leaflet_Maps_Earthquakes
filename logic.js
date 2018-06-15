////////////////////////////////////////////
///////// This code doesn't work ///////////
////////////////////////////////////////////

// d3.json(queryUrl, function(data) {
//    // Loop through our data...
//    console.log(data)
//    for (var i = 0; i < response.length; i++) {
//     //console.log(response.length)

//     var earthquakeMarker = L.marker([features.geometry.coordinates])
//       .bindPopup("<h3>" + features.properties.place + "<h3><h3>Capacity: " + features.properties.time + "<h3>")
//       .addTo(myMap);
//    } 
// });

// Store our API endpoint inside queryUrl
//var queryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

  var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

  var earthquakes = []
  var magnitudes =[]

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
 
  features = data.features
  features.forEach(function (feature) {
      longitude = feature.geometry.coordinates[0]
      latitude = feature.geometry.coordinates[1]
      place = feature.properties.place
      magnitude = feature.properties.mag
      earthquake = { place: place, magnitude: magnitude, location: [latitude, longitude] }
      earthquakes.push(earthquake)
      magnitudes.push(magnitude)
  })
  var max_magnitude= Math.max(...magnitudes)

  createFeatures(earthquakes,max_magnitude);
});

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function gradientRgb(minimum, maximum, value){
    var minimum = parseFloat(minimum);
    var maximum = parseFloat(maximum);
    ratio = 2 * (value-minimum) / (maximum - minimum)
    b = parseInt(Math.max(0, 255*(1 - ratio)))
    r = parseInt(Math.max(0, 255*(ratio - 1)))
    g = 255 - b - r
    return "#"+componentToHex(r)+componentToHex(g)+componentToHex(b)
}

function getColor(d) {
  return d > 5  ? '#ff0000' :
         d > 4  ? '#ff7e42' :
         d > 3   ? '#ffb121' :
         d > 2   ? '#f3ff1c' :
         d > 1   ? '#76ff1c' :
         d > 0   ? '#1a9b06' :
                    '#000000';
}

earthquake_markers = []

function createFeatures(earthquakes,max_magnitude) {

  
  earthquakes.forEach(function (earthquake) {

    earthquake_marker = L.circle(earthquake.location, {
      fillOpacity: 0.8,
      fillColor: getColor(earthquake.magnitude),//getColor(earthquake.magnitude),
      color: getColor(earthquake.magnitude),//getColor(earthquake.magnitude),
      radius: (earthquake.magnitude*10000)});

    earthquake_marker.bindPopup("<h3>Place: " + earthquake.place + "</h3> <h3>Magnitude: " + earthquake.magnitude + "</h3>")

    earthquake_markers.push(earthquake_marker)      

  });

  var earthquake_layer = L.layerGroup(earthquake_markers);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquake_layer);
}

function createMap(earthquake_layer) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic3VlZGNidiIsImEiOiJjamkyZzR3YTYxMDkyM2tsa2VhZ2ZmMmM2In0." +
    "aeeG9yD9dcaJowPLQCZqSg");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic3VlZGNidiIsImEiOiJjamkyZzR3YTYxMDkyM2tsa2VhZ2ZmMmM2In0." +
    "aeeG9yD9dcaJowPLQCZqSg");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquake_layer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      34.0522, -118.2437
    ],
    zoom: 7,
    layers: [streetmap, earthquake_layer]
  });
  
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) 
  {
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5],
    labels = [];

    div.innerHTML +=
      '<strong>Magnitude</strong><br>'; 
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) 
    {
      div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

legend.addTo(myMap);

   // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
  }).addTo(myMap);
  



 
}




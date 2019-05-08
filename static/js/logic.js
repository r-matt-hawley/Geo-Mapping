function createMap(earthquakes, legend) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap
    };

    // Create an overlayMaps object to hold the earthquakes layer
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create the map object with options
    var map = L.map("map-id", {
        center: [0, 0],//[40.73, -100],
        zoom: 2,
        layers: [lightmap, earthquakes]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    legend.addTo(map);
}

function createMarkers(response) {
    console.log(response);

    var quakeData = response.features;

    // Initialize an array to hold earthquake markers.
    var quakeMarkers = [];

    // Sort the earthquakes by magnitude, so that smaller markers 
    // are rendered above larger markers.
    quakeData = quakeData.sort((a, b) => {
        if (a.properties.mag < b.properties.mag) { return 1; }
        else { return -1; }
    });

    // Define choropleth colors
    // legendColors = ["#bd0026", "#f03b20", "#fd8d3c", "#feb24c", "#fed976", "#ffffb2"];
    legendColors = ["#68E500", "#ABE501", "#E6DE02", "#E79E04", "#E85D05", "#E91D07"];
    var color;

    // Loop through the earthquakes array.
    for (var index = 0; index < quakeData.length; index++) {
        var quake = quakeData[index];
        var quakeLon = quake.geometry.coordinates[0];
        var quakeLat = quake.geometry.coordinates[1];
        var mag = quake.properties.mag;
        var radius = 10000 * (mag + 1);

        if (mag > 5) { color = 5; }
        else { color = Math.floor(mag); }

        // For each earthquake, create a marker and bind a popup with the earthquakes's location.
        var quakeMarker = L.circle([quakeLat, quakeLon], {
            weight: 0.25,
            color: "black",
            fillColor: legendColors[color],
            fillOpacity: 0.4,
            radius: radius
        }).bindPopup(`<h3>${quake.properties.place}</h3>
            <hr><h3>Magnitude: ${quake.properties.mag}</h3>
            <h3>Coordinates: (${quakeLat}, ${quakeLon})</h3>`);

        // Add the marker to the bikeMarkers array
        quakeMarkers.push(quakeMarker);
    }

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var labels = [];
        var limits;

        for (magColor = 0; magColor < (legendColors.length - 1); magColor++) {
            limits += `<div>${magColor} - ${magColor}</div>`
        }
        var legendInfo = "<h1>Magnitude</h1>" +
            "<div class=\"labels\">" +
            limits +
            `<div>${magColor + 1}+</div>` +
            "</div>";

        div.innerHTML = legendInfo;

        legendColors.forEach(function (color, index) {
            labels.push("<li style=\"background-color: " + legendColors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Create a layer group made from the bike markers array, pass it into the createMap function
    let markerLayerGroup = L.layerGroup(quakeMarkers)

    createMap(markerLayerGroup, legend);
}

// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url, createMarkers);
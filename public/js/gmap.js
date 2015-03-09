var map;
var markers = [];

function initialize() {
  var mapOptions = {
    zoom: 18,
    draggableCursor: 'crosshair'
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

 // Add a marker to the map and push to the array.
function addMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markers.push(marker);
}

// Try HTML5 geolocation
if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
	addMarker(pos);
      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }


function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}
///end geolocation

google.maps.event.addListener(map, 'click', function(event) {
    addMarker(event.latLng);
});
}

google.maps.event.addDomListener(window, 'load', initialize);

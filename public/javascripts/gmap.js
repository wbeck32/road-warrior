var markers = {};
var map;
var markerCount = 0;

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyBr6dZhzQB3XGxJHYbXR2jGOusupVyas1E&callback=getLocation';
  document.body.appendChild(script);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function locationAllowed(position) {
	var pos = new google.maps.LatLng(position.coords.latitude,
					 position.coords.longitude);
	initialize(pos);
      },
      function locationDenied() {
	initialize();
      });
  } else{
    initialize();
  }
}

function initialize(position) {
  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: position || {lat: 45.5227, lng: -122.6731}
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addListener(map, 'click', function(event) {
    addMarker(event.latLng);
  });

  
}

// Add a marker to the map and push to the array.
function addMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    zIndex: markerCount
  });
  map.panTo(location);
  google.maps.event.addListener(marker, 'rightclick', function(event){
    marker.setMap(null);
    delete markers[marker.zIndex];
  });
  markers[marker.zIndex] = marker;
  markerCount++;
}

window.onload = loadScript;



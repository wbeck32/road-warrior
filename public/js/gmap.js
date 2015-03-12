var markers = {};
var map;
var waypts = [];

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
    waypts.push({
      location: event.latLng
    });
  });
}

function addMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map,
  });
  map.panTo(location);
  
//delete markers
  google.maps.event.addListener(marker, 'dblclick', function(event){
    marker.setMap(null);    
    delete markers[marker.zIndex];
    var tmpWaypoints = [];  
    waypts.forEach(function(e, i, a){
      if(e.location.k !== marker.position.k && e.location.D !== marker.position.D) {
        tmpWaypoints.push(e);
      }
    });
    waypts = tmpWaypoints;
  });
  markers[marker.zIndex] = marker;
}

window.onload = loadScript;



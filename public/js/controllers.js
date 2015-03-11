
var module = angular.module('roadWarrior.controllers', [])

module.controller('MapCtrl', function(RouteService){

  
  this.currentPosition = {lat: 45.5227, lng: -122.6731};
 
  var self = this;
  var elevator = new google.maps.ElevationService();
  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: this.currentPosition
  };

  this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  getLocation();

  google.maps.event.addListener(this.map, 'click', function(event) {
    addMarker(event.latLng);
  });

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
  function locationAllowed(position) {
    self.currentPosition = new google.maps.LatLng(position.coords.latitude,
             position.coords.longitude);
    self.map.panTo(self.currentPosition);
  });
    } 
  }

  function addMarker(latLng) {
    var marker = new google.maps.Marker({
      position: latLng,
      map: self.map
    });
    self.map.panTo(latLng);
    google.maps.event.addListener(marker, 'dblclick', function(event){
      marker.setMap(null);
    });
    getElevation(latLng, marker);
    RouteService.addMarker(marker);
  };

  function getElevation(latLng, marker) {

    var position = {
      'locations': [latLng]
    };

    elevator.getElevationForLocations(position, function(results, status) {
      if (status == google.maps.ElevationStatus.OK){
  if (results[0]){
          marker.elevation = results[0].elevation;
  } else {
          marker.elevation = null;
  }
      } else {
  marker.elevation = null;
      }
    });  
  }
});

module.controller('RouteCtrl', function(RouteService) {
  var self = this
  this.currentMarkers;
  this.click = function() {
    self.currentMarkers = RouteService.getMarkers();
  }
  this.save = function() {
    RouteService.createRoute(self.currentMarkers);
  }

})

module.controller('CompletedRouteCtrl', function(RouteService) {
  var self = this
  this.completedRoute;
  this.click = function() {
    self.completedRoute = RouteService.getRoute();
  }
})


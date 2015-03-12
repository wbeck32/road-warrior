// this is controllers.js

// Route Controller

roadWarrior.controller('RouteCtrl', function(routeFactory){

  this.showEdit = [];
  this.showDetails = [];

  this.update = function(){
    this.route = routeFactory.getCurrent();
    for (var i = 0; i < this.route.markers.length; i++){
      this.showEdit[i] = false;
      this.showDetails[i] = false;
    }
  };

  this.update();
  
  this.toggleEdit = function(index){
    this.showEdit[index] = !this.showEdit[index];
  };

  this.toggleDetails = function(index){
    this.showDetails[index] = !this.showDetails[index];
  };

});

// Map Controller

roadWarrior.controller('MapCtrl', function(routeFactory, mapStyles){
  
  this.currentPosition = {lat: 45.5227, lng: -122.6731};

  var self = this;
  var elevator = new google.maps.ElevationService();
  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: this.currentPosition,
    styles: mapStyles
  };

  this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var renderersArray = [];
  var directionsService = new google.maps.DirectionsService();
  var renderOptions = {suppressMarkers: true, preserveViewport: true};
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
    google.maps.event.addListener(marker, 'click', function(event){
      marker.setMap(null);
      routeFactory.removeMarker(marker);
    });
    getElevation(latLng, marker);
    var directionsDisplay = new google.maps.DirectionsRenderer(renderOptions);
    renderersArray.push(directionsDisplay);
    directionsDisplay.setMap(self.map);
    if (routeFactory.getLatestMarker()) {
      var request = {
        origin: routeFactory.getLatestMarker().getPosition(),
        destination: latLng,
        travelMode: google.maps.TravelMode.WALKING
      };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      });
    }
    routeFactory.addMarker(marker);
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

roadWarrior.controller('CompletedRouteCtrl', function(routeFactory) {
  this.click = function() {
    routeFactory.saveRoute();
  };
});


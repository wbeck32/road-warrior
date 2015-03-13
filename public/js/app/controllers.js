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

  function renderRoute(markersArray) {
    // Clear everything from map 
    var legs = [];

    markersArray.forEach(function(marker, index, array){

      // add marker
      // line
      if (index > 0){
        var renderer = new google.maps.DirectionsRenderer(renderOptions);
        renderer.setMap(self.map);
        // getDirections(markersArray[index-1].getPosition(), marker.getPosition(), renderer);
      } 
    })
  }

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
      directionsDisplay.setMap(null);
      var neighbors = routeFactory.getNeighbors(marker);
      routeFactory.removeMarker(marker);
      if (routeFactory.getLatestMarker() !== marker){
	var reRenderer = new google.maps.DirectionsRenderer(renderOptions);
	reRenderer.setMap(self.map);
	getDirections(neighbors[0].getPosition(), neighbors[1].getPosition(), reRenderer);
      }
    });

    getElevation(latLng, marker);

    // renderersArray.push(directionsDisplay);

    if (routeFactory.getLatestMarker()) {
      getDirections(routeFactory.getLatestMarker().getPosition(), marker.getPosition(), directionsDisplay);
    }
    routeFactory.addMarker(marker);
  };

  function getDirections(origin, dest, renderer){
    var request = {
      origin: origin,
      destination: dest,
      travelMode: google.maps.TravelMode.WALKING
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        renderer.setDirections(response);
      }
    });
  }


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


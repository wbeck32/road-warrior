// this is factories.js

roadWarrior.service('trekService', function(mapFactory){

  var renderOptions = {suppressMarkers: true, preserveViewport: true, draggable: true};
  var directionsService = new google.maps.DirectionsService();
  this.trek = [];
  var markerIndex = 65;
  var trekOrigin = null;
  var self = this;

  this.createMarker = function(latLng) {
    var marker = new google.maps.Marker({
      position: latLng,
      map: mapFactory,
      draggable: true
    });

    google.maps.event.addListener(marker, 'click', function(event){
      self.removeMarker(marker);
    });

    google.maps.event.addListener(marker, 'dragend', function(event){
      self.moveMarker(marker);
    });
    return marker;
  },

  this.getTrek = function() {
    return this.trek;
  },

  this.resetOrigin = function() {
    trekOrigin = null;
  },

  this.addLeg = function(dest){
    dest.name = String.fromCharCode(markerIndex);
    markerIndex++;
    var leg;
    if (this.trek.length > 0){
      var lastLeg = this.trek[this.trek.length - 1];
      leg = new Leg(lastLeg.dest, dest);
      getDirections(leg);
      this.trek.push(leg);
    } else if (!trekOrigin){
      trekOrigin = dest;
    } else { 
      leg = new Leg(trekOrigin, dest);
      getDirections(leg);
      this.trek.push(leg);
    }
  },  

  this.removeMarker = function(marker){
    marker.setMap(null);
    var neighbors = getNeighbors(marker);
    if (!neighbors.prevLeg && !neighbors.nextLeg) {
      this.resetOrigin();
    } else if (!neighbors.prevLeg && neighbors.nextLeg) {
      trekOrigin = neighbors.nextLeg.dest;
      this.trek.shift().rend.setMap(null);

    } else if (neighbors.prevLeg && !neighbors.nextLeg) {
      this.trek.pop().rend.setMap(null);
    } else {
      neighbors.prevLeg.rend.setMap(null);
      neighbors.nextLeg.rend.setMap(null);
      var newLeg = new Leg(neighbors.prevLeg.origin, neighbors.nextLeg.dest);
      getDirections(newLeg);
      var prevIndex = this.trek.indexOf(neighbors.prevLeg);
      this.trek.splice(prevIndex, 2, newLeg);
    }
  },

  this.moveMarker = function (marker){
    var neighbors = getNeighbors(marker);
    getDirections(neighbors.prevLeg);
    getDirections(neighbors.nextLeg);
  };

  function Leg(origin, dest){
    var legSelf = this;
    this.origin = origin;
    this.dest = dest;
    this.rend = new google.maps.DirectionsRenderer(renderOptions);
    getDirections(legSelf);
    this.rend.setMap(mapFactory);

    google.maps.event.addListener(this.rend, 'directions_changed', function(){
      if (this.getDirections().routes[0].legs[0].via_waypoints.length > 0){
	var newMarker = self.createMarker(this.getDirections().routes[0].legs[0].via_waypoints.pop());
	newMarker.name = String.fromCharCode(markerIndex);
	markerIndex++;
	var newLeg = new Leg(newMarker, legSelf.dest);
	self.trek.splice(self.trek.indexOf(legSelf) + 1, 0, newLeg);
	legSelf.dest = newMarker;
	getDirections(legSelf);
      }
    });

    this.getOriginName = function(){
      return this.origin.name;
    };
    this.getDestName = function(){
      return this.dest.name;
    };
  }

  function getDirections(leg){

    if (leg) {
      var request = {
	origin: leg.origin.getPosition(),
	destination: leg.dest.getPosition(),
	travelMode: google.maps.TravelMode.WALKING
      };
      directionsService.route(request, function(response, status) {
	if (status == google.maps.DirectionsStatus.OK) {
          leg.rend.setDirections(response);
	  mapFactory.panTo(leg.dest.getPosition());
	}
      });
    }
  }
  
  function getNeighbors (marker) {
    var currentLeg = self.trek[0];
    var prevLeg;
    var nextLeg;
    var counter = 0;
    if (self.trek.length > 0) {
      while (!prevLeg || !nextLeg) {
	if(marker === currentLeg.origin) {
          nextLeg = currentLeg;
	} if (marker === currentLeg.dest) {
          prevLeg = currentLeg;
	} 
	counter++;
	if(counter > self.trek.length -1) break;
	currentLeg = self.trek[counter];

      }
    }
    return {prevLeg: prevLeg, nextLeg: nextLeg};
  };

});

roadWarrior.factory('mapFactory', function(mapStyles){

  this.currentPosition = {lat: 45.5227, lng: -122.6731};

  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: this.currentPosition,
    styles: mapStyles
  };

  return new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

});

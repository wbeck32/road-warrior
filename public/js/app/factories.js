// this is factories.js

angular.module('roadWarrior').service('legService', ['$rootScope', 'mapFactory', 'markerFactory', 'neighborsService', function($rootScope, mapFactory, markerFactory, neighborsService){
  
  this.legs = [];
  var trekOrigin = null;
  var renderOptions = {suppressMarkers: true, preserveViewport: true, draggable: true};
  var directionsService = new google.maps.DirectionsService();

  var self = this;

  this.createLeg = function(org, des){
    
    function Leg(origin, dest){
      this.origin = origin;
      this.dest = dest;
      this.rend = new google.maps.DirectionsRenderer(renderOptions);
      this.rend.setMap(mapFactory);
      var thisLeg = this;

      google.maps.event.addListener(thisLeg.rend, 'directions_changed', function(){
	$rootScope.$apply(function(){ 
	  if (thisLeg.rend.getDirections().routes[0].legs[0].via_waypoints.length > 0){
	    var newMarker = markerFactory.create(thisLeg.rend.getDirections().routes[0].legs[0].via_waypoints.pop(), self);
	    var newLeg = self.createLeg(newMarker, thisLeg.dest);
	    self.legs.splice(self.legs.indexOf(thisLeg) + 1, 0, newLeg);
	    thisLeg.dest = newMarker;
	    thisLeg.getDirections();
	  }
	});
      });
      
      this.getDirections = function(){
	var request = {
	  origin: this.origin.getPosition(),
	  destination: this.dest.getPosition(),
	  travelMode: google.maps.TravelMode.WALKING
	};
	directionsService.route(request, function(response, status) {
	  if (status == google.maps.DirectionsStatus.OK) {
            thisLeg.rend.setDirections(response);
	  }
	});
      };
      this.getDirections();
    }

    return new Leg(org, des);
  };

  this.addLeg = function(dest){
    var leg;
    if (this.legs.length > 0){
      var lastLeg = this.legs[this.legs.length - 1];
      leg = this.createLeg(lastLeg.dest, dest);
    } else if (!trekOrigin){
      trekOrigin = dest;
    } else { 
      leg = this.createLeg(trekOrigin, dest);
    }
    if (leg){
      this.legs.push(leg);
    }
  };  

  google.maps.event.addListener(mapFactory, 'click', function(event) {
    var newMarker = markerFactory.create(event.latLng, self);
    self.addLeg(newMarker);
  });

  this.moveMarker = function(marker){
    var neighbors = neighborsService(marker, this.legs);
    if(neighbors.prevLeg) neighbors.prevLeg.getDirections();
    if(neighbors.nextLeg) neighbors.nextLeg.getDirections();
  };

  this.removeMarker = function(marker){
    marker.setMap(null);
    var neighbors = neighborsService(marker, this.legs);
    if (!neighbors.prevLeg && !neighbors.nextLeg) {
      trekOrigin = null;
    } else if (!neighbors.prevLeg && neighbors.nextLeg) {
      trekOrigin = neighbors.nextLeg.dest;
      this.legs.shift().rend.setMap(null);

    } else if (neighbors.prevLeg && !neighbors.nextLeg) {
      this.legs.pop().rend.setMap(null);
    } else {
      neighbors.prevLeg.rend.setMap(null);
      neighbors.nextLeg.rend.setMap(null);
      var newLeg = this.createLeg(neighbors.prevLeg.origin, neighbors.nextLeg.dest);
      var prevIndex = this.legs.indexOf(neighbors.prevLeg);
      this.legs.splice(prevIndex, 2, newLeg);
    }
  };
  
  this.removeLeg = function(index) {
    if(this.legs.length === 1) {
      this.legs[0].origin.setMap(null);
      this.removeMarker(this.legs[0].dest);
      trekOrigin = null;
    } else if (index === 0){
      this.removeMarker(this.legs[0].origin);
    } else {
      this.removeMarker(this.legs[index].dest);
    }          
  };

}]);

angular.module('roadWarrior').factory('markerFactory', ['$rootScope', 'mapFactory', function($rootScope, mapFactory){
 
  var markerIndex = 65;

  return {

    create : function(latLng, thisObj) {
      var marker = new google.maps.Marker({
	position: latLng,
	map: mapFactory,
	draggable: true
      });

      marker.name = String.fromCharCode(markerIndex);
      markerIndex++;

      mapFactory.panTo(latLng);

      google.maps.event.addListener(marker, 'click', function(event){
	$rootScope.$apply(function(){
	  thisObj.removeMarker(marker);
	});
      });

      google.maps.event.addListener(marker, 'dragend', function(event){
	$rootScope.$apply(function(){
	  thisObj.moveMarker(marker);
	});
      });

      return marker;
    }
  }; 

}]);

angular.module('roadWarrior').factory('mapFactory', ['mapStyles', function(mapStyles){

  var currentPosition = {lat: 45.5227, lng: -122.6731};

  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: currentPosition,
    styles: mapStyles
  };

  return new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

}]);

// this is legService.js

angular.module('roadWarrior').service('legService', ['$rootScope', 'mapFactory', 'markerFactory', 'neighborsService', 'pathElevationService', 'elevationProfileFactory', function($rootScope, mapFactory, markerFactory, neighborsService, pathElevationService, elevationProfileFactory){
  
  this.legs = [];
  var trekOrigin = null;
  var renderOptions = {suppressMarkers: true, preserveViewport: true, draggable: true};
  var directionsService = new google.maps.DirectionsService();

  var self = this;

  function unRenderLeg(leg) {
    leg.rend.setMap(null);
    leg.rend.setPanel(null);
  }

  this.unRenderAll = function(){
    markerFactory.resetIndex();
    if (trekOrigin) {
      trekOrigin.setMap(null);
    }
    trekOrigin = null;
    if (this.legs.length > 0){
      this.legs.forEach(function(leg){
	leg.dest.setMap(null);
        unRenderLeg(leg);
      });
      this.legs = [];
    }
  };

  this.renderAll = function(){
    markerFactory.markerIndex = 66 + this.legs.length;
    trekOrigin = this.legs[0].origin;
    this.legs[0].origin.setMap(mapFactory);
    this.legs.forEach(function(leg){
      leg.dest.setMap(mapFactory);
      leg.rend.setMap(mapFactory);
      leg.rend.setPanel(document.getElementById('directions'));
    });
    elevationProfileFactory(this.legs);
  };

  this.createLeg = function(org, des, dontRenderNow){
    
    function Leg(origin, dest){
      this.origin = origin;
      this.dest = dest;
      this.rend = new google.maps.DirectionsRenderer(renderOptions);
      if (!dontRenderNow) {
        this.rend.setMap(mapFactory);
        this.rend.setPanel(document.getElementById('directions'));
      }
      this.elevationProfile = [];
      this.travelMode = "WALKING";

      var thisLeg = this;
      google.maps.event.addListener(thisLeg.rend, 'directions_changed', function(){
      	$rootScope.$apply(function(){ 
      	  if (thisLeg.rend.getDirections().routes[0].legs[0].via_waypoints.length > 0){
      	    var newMarker = markerFactory.create(thisLeg.rend.getDirections().routes[0].legs[0].via_waypoints.pop(), self);
      	    var newLeg = self.createLeg(newMarker, thisLeg.dest);
            newLeg.travelMode = thisLeg.travelMode;
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
      	  travelMode: this.travelMode
      	};
      	directionsService.route(request, function(response, status) {
      	  if (status == google.maps.DirectionsStatus.OK) {
            thisLeg.rend.setDirections(response);
            pathElevationService(thisLeg, self.legs);
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
      markerFactory.resetIndex();
    } else if (!neighbors.prevLeg && neighbors.nextLeg) {
      trekOrigin = neighbors.nextLeg.dest;
      trekOrigin.setIcon("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + trekOrigin.index + "|009900|000000");
      unRenderLeg(this.legs.shift());
      elevationProfileFactory(this.legs);
    } else if (neighbors.prevLeg && !neighbors.nextLeg) {
      unRenderLeg(this.legs.pop());
      elevationProfileFactory(this.legs);
    } else {
      unRenderLeg(neighbors.prevLeg);
      unRenderLeg(neighbors.nextLeg);
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
      markerFactory.resetIndex();
    } else if (index === 0){
      this.removeMarker(this.legs[0].origin);
    } else {
      this.removeMarker(this.legs[index].dest);
    }     
  };

  function totalDistanceUpdater(){
    this.totalDistance = 0;
    for (var i = 0; i < this.legs.length; i++){
      this.totalDistance += this.legs[i].rend.directions.routes[0].legs[0].distance.value;
    }
  }

}]);

// this is legService.js

angular.module('roadWarrior').service('legService', ['$rootScope', 'mapFactory', 'markerFactory', 'neighborsService', 'pathElevationService', 'elevationProfileFactory', 'distanceService', function($rootScope, mapFactory, markerFactory, neighborsService, pathElevationService, elevationProfileFactory, distanceService){
  
  this.legs = [];
  var trekOrigin = null;

  var polylineOptions = {
    strokeColor: '#00ffff',
    strokeWeight: 8,
    strokeOpacity: 0.8,
    geodesic: true,
    draggable: true
  };

  var renderOptions = {
    suppressMarkers: true, 
    preserveViewport: true, 
    draggable: true,
    polylineOptions: { strokeColor: '#00ffff', strokeWeight: 8, strokeOpacity: 0.8 }
  };
  
  var directionsService = new google.maps.DirectionsService();

  var self = this;

  function unRenderLeg(leg) {
    leg.rend.setMap(null);
    leg.rend.setPanel(null);
    leg.polyline.setMap(null);
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
    
    markerFactory.markerIndex = markerFactory.reverseAsciiIndex(this.legs[this.legs.length - 1].dest.index.charCodeAt(0));
    trekOrigin = this.legs[0].origin;
    mapFactory.panTo(trekOrigin.getPosition());
    mapFactory.setZoom(14);
    this.legs[0].origin.setMap(mapFactory);
    this.legs.forEach(function(leg){
      leg.dest.setMap(mapFactory);
      leg.drawLeg();
    });
    elevationProfileFactory(this.legs);
  };

  this.createLeg = function(org, des, travelMode){
    
    function Leg(origin, dest){
      this.origin = origin;
      this.dest = dest;
      this.rend = new google.maps.DirectionsRenderer(renderOptions);
      this.polyline = new google.maps.Polyline(polylineOptions);
      this.elevationProfile = [];
      this.travelMode = travelMode || "WALKING";

      var thisLeg = this;
      google.maps.event.addListener(thisLeg.rend, 'directions_changed', function(){
      	$rootScope.$apply(function(){ 
      	  if (thisLeg.rend.getDirections().routes[0].legs[0].via_waypoints.length > 0){
      	    var newMarker = markerFactory.create(thisLeg.rend.getDirections().routes[0].legs[0].via_waypoints.pop(), self);
      	    var newLeg = self.createLeg(newMarker, thisLeg.dest);
            newLeg.travelMode = thisLeg.travelMode;
            newLeg.drawLeg();
      	    self.legs.splice(self.legs.indexOf(thisLeg) + 1, 0, newLeg);
      	    thisLeg.dest = newMarker;
      	    thisLeg.getDirections();
      	  }
      	});
      });
      
      google.maps.event.addListener(thisLeg.polyline, 'drag', function(event){
        thisLeg.polyline.setVisible(false);
      });
      google.maps.event.addListener(thisLeg.polyline, 'dragend', function(event){
        $rootScope.$apply(function(){ 
          var newMarker = markerFactory.create(event.latLng, self);
          var newLeg = self.createLeg(newMarker, thisLeg.dest, "CROW");
          newLeg.drawLeg();
      	  self.legs.splice(self.legs.indexOf(thisLeg) + 1, 0, newLeg);
      	  thisLeg.dest = newMarker;
      	  thisLeg.getDirections();
          thisLeg.polyline.setVisible(true);
        });
      });

      this.drawLeg = function() {
        if (this.travelMode === "CROW"){
          this.polyline.setMap(mapFactory);
          this.rend.setMap(null);
        } else {
          this.rend.setMap(mapFactory);
          this.polyline.setMap(null);
          this.rend.setPanel(document.getElementById('directions'));
        }
      };

      this.switchMode = function() {
        this.getDirections();
        this.drawLeg();
      };

      this.getDirections = function(){
        if (this.travelMode !== "CROW"){
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
        } else {
          this.polyline.setPath([this.origin.getPosition(), this.dest.getPosition()]);
          this.directDistance = distanceService(this.origin.getPosition(), this.dest.getPosition());
          pathElevationService(thisLeg, self.legs);
        }
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
      leg.drawLeg();
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
      newLeg.drawLeg();
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

}]);

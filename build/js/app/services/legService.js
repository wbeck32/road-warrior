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
    leg.polyline.setMap(null);
  }

  this.unRenderAll = function(signout){
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
      if (signout === true) {
        this.legs.splice(0,this.legs.length);
      } else {
        this.legs = [];
      }
    }
    elevationProfileFactory(this.legs);
  };

  this.renderAll = function(){
    if(this.legs.length > 0) {
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
    }
  };

  this.Leg = function(origin, dest, travelMode){
    this.origin = origin;
    this.dest = dest;
    this.rend = new google.maps.DirectionsRenderer(renderOptions);
    this.polyline = new google.maps.Polyline(polylineOptions);
    this.elevationProfile = [];
    this.travelMode = travelMode || "WALKING";
    this.showDetails = false;

    google.maps.event.addListener(this.rend, 'directions_changed', function(){
      $rootScope.$apply(dragRenderer.call(this));
    }.bind(this));
    google.maps.event.addListener(this.polyline, 'drag', function(){
      this.polyline.setVisible(false);
    }.bind(this));
    google.maps.event.addListener(this.polyline, 'dragend', function(event){
      $rootScope.$apply(dragPolyline.call(this,event));
    }.bind(this));

    this.getDirections();
    
  };
    
  function dragRenderer(){
    if (this.rend.getDirections().routes[0].legs[0].via_waypoints.length > 0){
      var newMarker = markerFactory.create(this.rend.getDirections().routes[0].legs[0].via_waypoints.pop(), self);
      var newLeg = new self.Leg(newMarker, this.dest, this.travelMode);
      newLeg.drawLeg();
      self.legs.splice(self.legs.indexOf(this) + 1, 0, newLeg);
      this.dest = newMarker;
      this.getDirections();
    }
  }
  
  function dragPolyline(event){
    var newMarker = markerFactory.create(event.latLng, self);
    var newLeg = new self.Leg(newMarker, this.dest, "CROW");
    newLeg.drawLeg();
    self.legs.splice(self.legs.indexOf(this) + 1, 0, newLeg);
    this.dest = newMarker;
    this.getDirections();
    this.polyline.setVisible(true);
  }

  this.Leg.prototype.drawLeg = function() {
    if (this.travelMode === "CROW"){
      this.polyline.setMap(mapFactory);
      this.rend.setMap(null);
    } else {
      this.rend.setMap(mapFactory);
      this.polyline.setMap(null);
    }
  };

  this.Leg.prototype.switchMode = function() {
    this.getDirections();
    this.drawLeg();
  };

  this.Leg.prototype.toggleDetails = function() {
    this.showDetails = !this.showDetails;
  };

  this.Leg.prototype.remove = function() {
    self.removeLeg(this);
  };

  this.Leg.prototype.getDistance = function() {
    if (this.travelMode !== 'CROW'){
      if (this.rend.directions){
        return this.rend.directions.routes[0].legs[0].distance.value * 0.0006214;
      } else return 0;
    } else return this.directDistance * 0.0006214;
  };
  
  this.Leg.prototype.getDirections = function(){
    if (this.travelMode !== "CROW"){
      var request = {
      	origin: this.origin.getPosition(),
      	destination: this.dest.getPosition(),
      	travelMode: this.travelMode
      };
      directionsService.route(request, function(response, status) {
      	if (status == google.maps.DirectionsStatus.OK) {
          this.rend.setDirections(response);
          pathElevationService(this, self.legs);
      	} else {
          this.travelMode = "CROW";
          this.switchMode();
        } 
      }.bind(this));
    } else {
        this.polyline.setPath([this.origin.getPosition(), this.dest.getPosition()]);
        this.directDistance = distanceService(this.origin.getPosition(), this.dest.getPosition());
        pathElevationService(this, self.legs);
    }
  };

  this.addLeg = function(dest){
    var leg;
    if (this.legs.length > 0){
      var lastLeg = this.legs[this.legs.length - 1];
      leg = new this.Leg(lastLeg.dest, dest, lastLeg.travelMode);
    } else if (!trekOrigin){
      trekOrigin = dest;
    } else { 
      leg = new this.Leg(trekOrigin, dest);
    }
    if (leg){
      this.legs.push(leg);
      leg.drawLeg();
    }
  };  

  google.maps.event.addListener(mapFactory, 'click', function(event) {
    var newMarker = markerFactory.create(event.latLng, this);
    this.addLeg.call(this, newMarker);
    if(this.legs.length > 0 && this.legs[this.legs.length-1].travelMode === "CROW") $rootScope.$digest();
  }.bind(this));

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
      trekOrigin.setIcon("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + trekOrigin.index + "|608040|000000");
      unRenderLeg(this.legs.shift());
      elevationProfileFactory(this.legs);
    } else if (neighbors.prevLeg && !neighbors.nextLeg) {
      unRenderLeg(this.legs.pop());
      elevationProfileFactory(this.legs);
    } else {
      unRenderLeg(neighbors.prevLeg);
      unRenderLeg(neighbors.nextLeg);
      var newLeg = new this.Leg(neighbors.prevLeg.origin, neighbors.nextLeg.dest);
      newLeg.drawLeg();
      var prevIndex = this.legs.indexOf(neighbors.prevLeg);
      this.legs.splice(prevIndex, 2, newLeg);
    }
  };
  
  this.removeLeg = function(leg) {
    var index = this.legs.indexOf(leg);
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

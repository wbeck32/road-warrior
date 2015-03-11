var module = angular.module('roadWarrior.services', [])



module.service('RouteService', function(){
  var self = this;
  this.currentMarkers = [];
  this.routeToSave;
  this.addMarker = function(marker) {
    self.currentMarkers.push(marker);
  }

  this.getMarkers = function() {
    return self.currentMarkers;
  }

  this.createRoute = function(markers) {
    self.routeToSave = markers;
  }

  this.getRoute = function() {
    return self.routeToSave;
  }
})
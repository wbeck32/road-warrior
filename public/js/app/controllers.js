// this is controllers.js

// Trek Controller

angular.module('roadWarrior').controller('TrekController', ['legService', 'neighborsService', 'mapFactory', 'markerFactory', function(legService, neighborsService, mapFactory, markerFactory){

  this.legs = legService.legs;
  this.showEdit = []; 
  this.showDetails = [];
  var self = this;

  this.hideFields = function(){
    for (var i = 0; i < self.legs.length; i++){
      self.showEdit[i] = false;
      self.showDetails[i] = false;
    }
  };

  this.removeLeg = function(index){
    legService.removeLeg(index);
    this.hideFields();
  };

  this.toggleEdit = function(index){
    this.showEdit[index] = !this.showEdit[index];
  };
  this.toggleDetails = function(index){
    this.showDetails[index] = !this.showDetails[index];
  };
}]);

/*
 // Map Controller

 roadWarrior.controller('MapCtrl', function(mapFactory, trekFactory){

 var elevator = new google.maps.ElevationService();  
 
 // getLocation();

 function getLocation() {
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 function locationAllowed(position) {
 mapFactory.panTo(position);
 });
 } 
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

 */

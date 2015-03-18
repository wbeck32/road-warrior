// this is controllers.js

// Trek Controller

angular.module('roadWarrior').controller('TrekController', ['legService', 'pathElevationService', 'neighborsService', 'mapFactory', 'markerFactory', function(legService, pathElevationService, neighborsService, mapFactory, markerFactory){

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

angular.module('roadWarrior').controller('geolocationController', function(mapFactory){

  this.getLocation = function(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
    	function locationAllowed(position) {
    	  mapFactory.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
    	});
    } 
  };
  this.getLocation();
});

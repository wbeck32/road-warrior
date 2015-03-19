// this is controllers.js

// Trek Controller

angular.module('roadWarrior').controller('TrekController', [ 'trekService', 'legService', 'pathElevationService', 'neighborsService', 'mapFactory', 'markerFactory', function(trekService, legService, pathElevationService, neighborsService, mapFactory, markerFactory){

  this.legs = legService.legs;
  this.showEdit = []; 
  this.showDetails = [];
  this.showEditName = false;
  this.name = legService.name;

  var self = this;

  this.saveTrek = function(){
    trekService.allTreks.push({
      name: this.name,
      legs: this.legs
    });
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = legService.name;
  };

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

  this.editName = function(){
    this.showEditName = !this.showEditName;
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

angular.module('roadWarrior').controller('AllTreksController', ['legService', 'trekService', function(legService, trekService){

  this.treks = trekService.allTreks;

  this.renderTrek = function(index){
    legService.unRenderAll();
    legService.legs = this.treks[index].legs;
    legService.name = this.treks[index].name;
    legService.renderAll();
  };

}]);

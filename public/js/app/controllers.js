// this is controllers.js

// Trek Controller

angular.module('roadWarrior').controller('TrekController', [ 'trekService', 'legService', 'pathElevationService', 'neighborsService', 'mapFactory', 'markerFactory', function(trekService, legService, pathElevationService, neighborsService, mapFactory, markerFactory){

  this.legs = legService.legs;
  this.showEdit = []; 
  this.showDetails = [];
  this.showEditName = false;
  this.name = legService.name;
  this.treks = trekService.allTreks;
  this.currentTrekIndex = trekService.allTreks.length;

  this.markerName = function(marker){
    if(marker.name){
      return ": " + marker.name;
    } else return "";
  };

  var self = this;
  
  this.renderTrek = function(index){
    legService.unRenderAll();
    legService.legs = this.treks[index].legs;
    legService.name = this.treks[index].name;
    legService.renderAll();
    this.currentTrekIndex = index;
    this.legs = legService.legs;
    this.name = legService.name;
    this.hideFields();
  };


  this.saveTrek = function(){
    trekService.allTreks[this.currentTrekIndex] = {
      name: this.name,
      legs: this.legs
    };
    legService.unRenderAll();
    this.currentTrekIndex = trekService.allTreks.length;
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

angular.module('roadWarrior').controller('ElevationProfileController', function(){
  this.show = true;
  this.slide = function(){
    this.show = !this.show;
  }
})

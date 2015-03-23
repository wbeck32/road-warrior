// this is controllers.js

// Trek Controller

angular.module('roadWarrior').controller('TrekController', [ 'trekService', 'legService', 'pathElevationService', 'neighborsService', 'mapFactory', 'markerFactory', function(trekService, legService, pathElevationService, neighborsService, mapFactory, markerFactory){

  this.legs = legService.legs;
  this.name = legService.name;

  this.treks = trekService.allTreks;

  this.showEdit = []; 
  this.showDetails = [];
  this.showEditName = false;

  var loadedTrek = null;
  
  this.markerName = function(marker){
    if(marker.name){
      return ": " + marker.name;
    } else return "";
  };

  var self = this;
  
  this.renderTrek = function(trek){
    legService.unRenderAll();
    legService.legs = trek.legs;
    legService.name = trek.name;
    legService.renderAll();
    this.legs = legService.legs;
    this.name = legService.name;
    this.hideFields();
    loadedTrek = trek;
  };

  this.deleteTrek = function(trek){
    trekService.delete(trek);
    if (trek.legs === this.legs) {
      this.clearTrek();
    }
  };

  this.clearTrek = function(){
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = legService.name;
    loadedTrek = null;
  };
    
  this.saveTrek = function(){
    if (!loadedTrek){
      if(this.legs.length > 0){
	trekService.allTreks.push({
	  name: this.name,
	  legs: this.legs
	});
      }
    } else {
      loadedTrek.name = this.name;
    }
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = legService.name;
    loadedTrek = null;
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

  this.trekSearch = function(query) {
    for (var i = 0; i < trekService.allTreks.length; i++){
      if (trekService.allTreks[i].name.indexOf(query) > -1){
        console.log(trekService.allTreks[i].name);
      }
    }
  }

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

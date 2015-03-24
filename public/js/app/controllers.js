// this is controllers.js

// Trek Controller

// 5511ec05bad818c26b8f3785 angels and bunnies id

angular.module('roadWarrior').controller('TrekController', [ 'trekService', 'legService', 'pathElevationService', 'neighborsService', 'mapFactory', 'markerFactory', '$http', function(trekService, legService, pathElevationService, neighborsService, mapFactory, markerFactory, $http){

  this.legs = legService.legs;
  this.name = legService.name;

  this.treks = trekService.allTreks;

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
        loadedTrek = {
        name: this.name,
        legs: this.legs
        }
	      trekService.allTreks.push(loadedTrek);
      }
    } 
    else {
      loadedTrek.name = this.name;
    }
    $http({
      method: 'POST',
      url:'/api/saveatrek', 
      data: {trek: parseTrek()},
      headers: {'Content-Type': 'application/json'}
    }).
      success(function(data, status, headers, config){
      loadedTrek.id = data;
      console.log(loadedTrek);
      loadedTrek = null;
    }).error(function(data, status, headers, config){
      console.log('failure');
      loadedTrek = null;
    });
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = legService.name;
  };

  function parseTrek() {
    var latLngArray = [];
    latLngArray.push(self.legs[0].origin.getPosition());
    for (var i = 0; i < self.legs.length; i++) {
      latLngArray.push(self.legs[i].dest.getPosition());
    }
    return {markers: latLngArray,
            name: self.name,
            id: loadedTrek.id
    };
  }

  this.hideFields = function(){
    for (var i = 0; i < self.legs.length; i++){
      self.showDetails[i] = false;
    }
  };

  this.removeLeg = function(index){
    legService.removeLeg(index);
    this.hideFields();
  };

  this.toggleDetails = function(index){
    this.showDetails[index] = !this.showDetails[index];
  };

  this.editName = function(){
    this.showEditName = !this.showEditName;
  };

}]);
